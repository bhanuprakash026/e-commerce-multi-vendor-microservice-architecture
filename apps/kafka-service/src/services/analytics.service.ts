import prisma from "../../../../packages/libs/prisma/index";

export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      }
    });

    let udpatedActions: any = existingData?.actions || [];

    const actionExists = udpatedActions.some((entry: any) => entry.productId === event.id && event.action === event.action);

    // Always strore `product_view` for recommendations
    if (event.action === "product_view") {
      udpatedActions.push({
        productId: event?.productId,
        shopId: event.shopId,
        action: "product_view",
        timeStamp: new Date()
      })
    }

    else if (["add_to_cart", "add_to_wishlist"].includes(event.action) && !actionExists) {
      udpatedActions.push({
        productId: event?.productId,
        shopId: event.shopId,
        action: event.action,
        timeStamp: new Date()
      })
    }

    // Remove `add_to_cart` when `remove_from_cart` is triggered
    else if (event.action === "remove_from_cart") {
      udpatedActions.filter((entry: any) =>
        !(
          entry.id === event.productId && event.action === "add_to_cart"
        )
      )
    }

    // Remove `add_to_wishlist` when `remove_from_wishlist` is triggered
    else if (event.action === "remove_from_wishlist") {
      udpatedActions.filter((entry: any) =>
        !(
          entry.id === event.productId && event.action === "add_to_wishlist"
        )
      )
    }

    // Keep only the last 100 actions ( prevent storage overload)
    if (udpatedActions.length > 100) {
      udpatedActions.shift();
    }

    const extraFields: Record<string, any> = {};

    if (event.country) {
      extraFields.country = event.country
    }

    if (event.city) {
      extraFields.city = event.city;
    };

    if (event.device) {
      extraFields.device = event.device;
    }

    // update or create user anlytics
    await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: {
        lastVisited: new Date(),
        actions: udpatedActions,
        ...extraFields,
      },
      create: {
        userId: event?.userId,
        lastVisited: new Date(),
        actions: udpatedActions,
        ...extraFields
      }
    });

    // Also update product analytics
    await updateProductAnalystics(event);
  } catch (error) {
    console.log("error Storing user analytics:", error)
  }
};

export const updateProductAnalystics = async (event: any) => {
  try {
    if (!event.productId) return; // Changed from `if (event.productId) return;`

    // update fields dynamically
    const updateFields: any = {};

    if (event.action === "product_view") updateFields.views = { increment: 1 };
    if (event.action === "add_to_cart") updateFields.cartAdds = { increment: 1 };
    if (event.action === "remove_from_cart") updateFields.cartAdds = { decrement: 1 };
    if (event.action === "add_to_wishlist") updateFields.wishlistAdds = { increment: 1};
    if(event.action === "remove_from_wishlist") updateFields.wishlistAdds = { decrement: 1};
    if(event.action === "purchase") updateFields.purchases = { increment: 1};

    // Update or create Product analytics asynchronously
    await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: {
        lastViewedAt: new Date(),
        ...updateFields
      },
      create: {
        productId: event.productId,
        shopId: event.shopId || null,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishlistAdds: event.action === "add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchase" ? 1 : 0,
        lastViewedAt: new Date()
      }
    });

  } catch (error) {
    console.log("Error Storing product analytics:", error);
  }
};