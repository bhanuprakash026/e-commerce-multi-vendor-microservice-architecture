"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";

export default function OrderDetailsPage() {
  const { id } = useParams(); // orderId
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch Order Details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/order/get-order-details/${id}`);
        setOrder(res.data.order);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-60 text-xl text-white">
        Loading Order Details...
      </div>
    );

  if (!order)
    return (
      <div className="text-center text-red-500 font-semibold mt-10">
        Failed to load order details.
      </div>
    );

  // Timeline Steps
  const steps = ["Ordered", "Packed", "Shipped", "Out For Delivery", "Delivered"];
  const currentStep = steps.indexOf(order.deliveryStatus);

  const { items, shippingAddress, couponCode } = order;

  return (
    <div className="p-6 flex justify-center text-white bg-[#0f1115] min-h-screen">
      <div className="w-full lg:w-[60%]">

        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-4 px-4 py-2 bg-[#1f2329] border border-[#2a2d33] rounded-lg hover:bg-[#242830] transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-semibold mb-6">Order #{id?.slice(0, 6)}</h1>

        {/* ===== Update Status + Timeline ===== */}
        <div className="mb-10">
          <label className="text-gray-300 text-sm">Update Delivery Status:</label>

          <div className="flex items-center gap-3 mt-1">
            <select
              value={order.deliveryStatus}
              onChange={(e) => setOrder({ ...order, deliveryStatus: e.target.value })}
              className="bg-[#1f2329] border border-[#2a2d33] px-3 py-2 rounded-lg text-white"
            >
              {steps.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* UPDATE BUTTON */}
            <button
              disabled={updating}
              onClick={async () => {
                try {
                  setUpdating(true);
                  await axiosInstance.put(
                    `/order/update-delivery-status/${id}`, 
                    { deliveryStatus: order.deliveryStatus }
                  );

                  alert("Delivery status updated!");
                } catch (error) {
                  console.error(error);
                  alert("Failed to update status");
                } finally {
                  setUpdating(false);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition"
            >
              {updating ? "Updating..." : "Update"}
            </button>
          </div>

          {/* ===== Timeline ===== */}
          <div className="mt-8">
            {/* Labels */}
            <div className="flex justify-between text-sm text-gray-400 mb-2 px-1">
              {steps.map((step, i) => (
                <span
                  key={i}
                  className={i <= currentStep ? "text-blue-400 font-medium" : ""}
                >
                  {step}
                </span>
              ))}
            </div>

            {/* Lines */}
            <div className="relative mt-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 rounded"></div>

              <div
                className="absolute top-1/2 left-0 h-1 bg-blue-500 rounded transition-all"
                style={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
              ></div>

              {/* Dots */}
              <div className="relative flex justify-between">
                {steps.map((_, i) => {
                  const isActive = i <= currentStep;
                  return (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        isActive
                          ? "bg-blue-500 border-blue-400 scale-110"
                          : "bg-[#0f1115] border-gray-600"
                      }`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== ORDER SUMMARY ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="bg-[#1a1d23] p-5 rounded-xl border border-[#2a2d33] shadow">
            <h2 className="text-xl font-semibold mb-4">Order Information</h2>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize bg-blue-200 text-blue-800 px-3 py-1 rounded">
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span className="font-medium text-green-400">
                  ${order.total?.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-red-400">${order.discountAmount}</span>
              </div>

              <div className="flex justify-between">
                <span>Date:</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {couponCode && (
                <div className="flex justify-between">
                  <span>Coupon Code:</span>
                  <span className="text-blue-400">
                    {couponCode.discountCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#1a1d23] p-5 rounded-xl border border-[#2a2d33] shadow">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {shippingAddress ? (
              <div className="space-y-1 text-gray-300">
                <p className="font-medium text-white">{shippingAddress.name}</p>
                <p>{shippingAddress.street}</p>
                <p>{shippingAddress.city}</p>
                <p>{shippingAddress.country}</p>
                <p>ZIP: {shippingAddress.zip}</p>
              </div>
            ) : (
              <p className="text-gray-400">No shipping address found.</p>
            )}
          </div>
        </div>

        {/* ===== ORDER ITEMS ===== */}
        <h2 className="text-2xl font-semibold mt-10 mb-4">Order Items</h2>

        <div className="bg-[#1a1d23] p-5 rounded-xl border border-[#2a2d33] shadow">
          {items?.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No items found.</p>
          ) : (
            items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2f3238] py-4"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src={item.product?.images?.[0]?.url || "/placeholder.png"}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                    alt=""
                  />

                  <div>
                    <h3 className="font-semibold text-white">
                      {item.product?.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Price:{" "}
                      <span className="text-green-400">${item.price}</span>
                    </p>

                    {item.selectedOptions &&
                      Object.entries(item.selectedOptions).length > 0 && (
                        <div className="mt-1 text-xs text-gray-400">
                          Options:{" "}
                          {Object.entries(item.selectedOptions).map(
                            ([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {String(value)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 text-center text-gray-500">
          <p>End of Order Details</p>
        </div>
      </div>
    </div>
  );
}
