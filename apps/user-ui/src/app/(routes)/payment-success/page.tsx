"use client"

import React, { useEffect } from "react"
import { CheckCircle, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useStore } from "@/store";
import confetti from "canvas-confetti";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionDId = searchParams.get("sessionId");
  const router = useRouter();

  // Clear cart and trigger confetti
  useEffect(() => {
    useStore.setState({ cart: [] });

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    })
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-md">
        <div className="text-green-500 mb-4">
          <CheckCircle className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful 🎉</h2>
        <div className="px-6 pb-6"> 
          <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-gray-500" />
            Your order is on the way.
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Payment session Id: <span className="font-medium text-gray-800">{sessionDId ?? "N/A"}</span>
          </p>

          <div className="flex justify-end">
            <button
              onClick={() => router.push("/profile?active=My+Orders")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              aria-label="View My Orders"
            >
              <Truck className="w-4 h-4" />
              View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage;