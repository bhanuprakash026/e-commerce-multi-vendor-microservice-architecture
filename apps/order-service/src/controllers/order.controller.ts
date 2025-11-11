// Create Payment intent

import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import prisma from "../../../../packages/libs/prisma";
import crypto from "crypto"
import { timeStamp } from "console";
import { Prisma } from "@prisma/client";
import { sendeMail } from "../utils/sendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;
  const customerAmount = Math.round(amount * 100);
  const platformFee = Math.floor(customerAmount * 0.1);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId || ""
      },
      on_behalf_of: sellerStripeAccountId,
      metadata: {
        sessionId,
        userId: (req as any).user?.id
      }
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    next(error);
  }
};

// Create Payment session
export const createPaymentSession = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user.id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError("Cart is empty or invalid"));
    }

    const normalizedCart = JSON.stringify(
      cart.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        sale_price: item.sale_price,
        shopId: item.shopId,
        selectedOptions: item.selectedOptions || {},
      }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );
    const keys = await redis.keys("payment-session:*");
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              sale_price: item.sale_price,
              shopId: item.shopId,
              selectedOptions: item.selectedOptions || {},
            }))
              .sort((a: any, b: any) => a.id.localeCompare(b.id))
          );
          if (existingCart === normalizedCart) {
            return res.status(200).json({ sessionId: key.split(":")[1] })
          } else {
            await redis.del(key);
          }
        }
      }
    }

    // Fetch sellers and their stripe accounts
    const uniqueShops = [...new Set(cart.map((item: any) => item.shopId))];
    const shops = await prisma.shops.findMany({
      where: {
        id: { in: uniqueShops }
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true
          }
        }
      }
    });

    const sellerData = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop?.sellers?.stripeId
    }));

    // calculate total
    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.quantity * item.sale_price
    }, 0)

    // create session payload
    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`, 600, JSON.stringify(sessionData)
    );
    return res.status(201).json({ sessionId })
  } catch (error) {
    next(error)
  }
}

// Verifying payment session
export const verifyingPaymentSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." });
    }

    // fetch session from Redis
    const sessionKey = `payment-session:${sessionId}`
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({ error: "Session not found or Invalid" });
    }

    // Parse and return session
    const session = JSON.parse(sessionData);
    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    next(error)
  }
}

// Create order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  console.log("Calling createOrder route handler")
  try {
    const stripeSignature = req.headers["stripe-signature"];
    if (!stripeSignature) {
      return res.status(400).send("Missing Stripe Signature");
    }

    const rawBody = (req as any).rawBody;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error: any) {
      console.log("Webhook signature verification failed.", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log("stripe event:--", event)

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn("Session data expired or missing for", sessionId);
        return res.status(200).send("No session found, skipping order creation");
      }

      const { cart, totalAmount, shippingAddressId, coupon } = JSON.parse(sessionData);
      const user = await prisma.users.findUnique({ where: { id: userId } });
      const name = user?.name!;
      const email = user?.email!;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item)
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];

        let orderTotal = orderItems.reduce((sum: number, p: any) => sum + p.quantity * p.sale_price, 0);

        if (coupon && coupon.discountedProdectId && orderItems.some((item: any) => item.id === coupon.discountedProdectId)) {
          const discountedItem = orderItems.find((item: any) => item.id === coupon.discountedProdectId);
          if (discountedItem) {
            const discount = coupon.discountPercent > 0 ?
              (discountedItem.sale_price * discountedItem.quantity * coupon.discountPercent) / 100 :
              coupon.discountAmount;
            orderTotal -= discount;
          }
        }

        // Create order with nested order items
        const order = await prisma.orders.create({
          data: {
            userId,
            shopId,
            total: orderTotal,
            status: "Paid",
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                selectedOptions: item.selectedOptions || {}
              }))
            }
          },
          include: {
            items: true // Include items to verify creation
          }
        });

        console.log(`Created order ${order.id} with ${order.items.length} items`);

        // Update Product & analytics
        for (const item of orderItems) {
          const { id: productId, quantity } = item;

          await prisma.products.update({
            where: { id: productId },
            data: {
              stock: { decrement: quantity },
              totalSales: { increment: quantity },
            },
          });

          await prisma.productAnalytics.upsert({
            where: { productId },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: { increment: quantity },
            },
          });

          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId }
          });

          const newAction = {
            productId,
            shopId,
            action: "purchase",
            timeStamp: Date.now(),
          };

          const currentActions = Array.isArray(existingAnalytics?.actions) ? (existingAnalytics.actions as Prisma.JsonArray) : [];

          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: { userId },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            });
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId,
                lastVisited: new Date(),
                actions: [newAction],
              }
            });
          }
        }

        // Send email to user
        await sendeMail(
          email,
          {
            name,
            cart: orderItems, // Use orderItems instead of full cart
            totalAmount: orderTotal,
            trackingUrl: `https://eshop.com/order/${order.id}`,
          },
          "order-confirmation",
          "🛍️ Your Eshop Order Confirmation"
        );

        // Create notification for seller
        const shop = await prisma.shops.findUnique({
          where: { id: shopId },
          select: {
            sellerId: true,
            name: true
          }
        });

        if (shop) {
          const firstProduct = orderItems[0];
          const productTitle = firstProduct?.title || "new item";

          await prisma.notifications.create({
            data: {
              title: "🛒 New Order Received",
              message: `A customer just ordered ${productTitle} from your shop`,
              createdId: userId,
              receivedId: shop.sellerId,
              redirect_link: `https://eshop.com/order/${order.id}`
            },
          });
        }

        // Create notification for admin
        await prisma.notifications.create({
          data: {
            title: "📦 Platform Order Alert",
            message: `A new order was placed by ${name}`,
            createdId: userId,
            receivedId: "admin",
            redirect_link: `https://eshop.com/order/${order.id}`
          },
        });

        await redis.del(sessionKey);
      }
    }
    console.log("stripe event:--", event)

    res.status(200).json({ received: true });
  } catch (error) {
    console.log(error);
    return next(error)
  }
}