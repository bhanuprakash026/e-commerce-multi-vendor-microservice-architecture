"use client"
import React, { useEffect, useState } from 'react'
import { loadStripe, Appearance } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from '@/shared/components/checkout/checkoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

const Page = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId");

  useEffect(() => {
    const fetchSessionAndClientSecret = async () => {
      if (!sessionId) {
        setError("Invalid session. Please try again");
        setLoading(false);
        return;
      }

      try {
        const verfiyRes = await axiosInstance.get(`order/api/veryfying-payment-session?sessionId=${sessionId}`);

        const { totalAmount, sellers, cart, coupon } = verfiyRes.data.session;

        if (!sellers || sellers.length === 0 || totalAmount === undefined || totalAmount === null) {
          throw new Error("Invalid Payment session data");
        }

        setCartItems(cart);
        setCoupon(coupon);
        const sellerStripeAccountId = sellers[0].stripeAccountId;

        const intentRes = await axiosInstance.post(
          "order/pai/create-payment-intent",
          {
            amount: coupon?.discountAmount ? totalAmount - coupon?.discountAmount : totalAmount,
            sellerStripeAccountId,
            sessionId,
          }
        );

        setClientSecret(intentRes.data.clientSecret);
      } catch (error) {
        console.log(error);
        setError("Something went wrong while preparing your payment.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndClientSecret();
  }, [sessionId]);

  const appearance: Appearance = {
    theme: "stripe",
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent' />
      </div>
    )
  }

  if (error) {

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <h2 className="text-2xl font-semibold text-red-600">Payment Failed</h2>
        <p className="text-center text-gray-700">{error} Please go back and try checking out again.</p>
        <button
          onClick={() => router.push('/cart')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Cart
        </button>
      </div>
    )

  }
  return (
    clientSecret && (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance }}
      >
        <CheckoutForm 
          clientSecret={clientSecret}
          cartItems={cartItems}
          coupon={coupon}
          sessionId={sessionId}

        />
      </Elements>
    )
  )
}

export default Page