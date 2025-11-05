"use client";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import useUser from "@/hooks/useUser";
import ProductCard from "@/shared/components/cards/product-card";
import Ratings from "@/shared/components/ratings";
import { useStore } from "@/store";
import axiosInstance from "@/utils/axiosInstance";
import { Heart, MapPin, MessageSquareText, Package, ShoppingBagIcon, WalletMinimal } from "lucide-react";
import Link from "next/link";
import React, { useState, useRef } from "react";



const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const [currentImage, setCurrentImage] = useState(productDetails?.images?.[0]?.url || "");
  const [isSelected, setIsSelected] = useState(productDetails?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(productDetails?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([productDetails?.sale_price, 1199]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === productDetails.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFormWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === productDetails.id);

  const { user, isLoading } = useUser();
  const [location] = useLocationTracking();
  const deviceInfo = useDeviceTracking()

  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const zoom = 2.8;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { top, left, width, height } =
      imgRef.current?.getBoundingClientRect() || {};
    if (!width || !height) return;

    const x = e.pageX - left! - window.scrollX;
    const y = e.pageY - top! - window.scrollY;

    if (x < 0 || y < 0 || x > width || y > height) {
      setShowMagnifier(false);
      return;
    }

    setShowMagnifier(true);
    setMagnifierPos({ x, y });
  };

  const dosicountPercentage = Math.round(
    ((productDetails.regular_price - productDetails.sale_price) / productDetails.regular_price) * 100
  );

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();

      
      query.set("priceRange", priceRange.join(","));
      query.set("page", "1");
      query.set("limit", "5");
      
      console.log("query:--", typeof priceRange.join(","));
      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`
      );

      console.log(`/product/api/get-filtered-products?${query.toString()}`);
      console.log("res:--", res);

      setRecommendedProducts(res.data.products);
    } catch (error) {
      console.error("Failed to fetch filtered products", error);
    }
  }

  React.useEffect(() => {
    fetchFilteredProducts();
  }, [priceRange])

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">

        {/* Left Column — Product Images */}
        <div className="p-4">
          {/* Main Image with Zoom */}
          <div
            className="relative w-full flex justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowMagnifier(false)}
          >
            <img
              ref={imgRef}
              src={currentImage}
              alt={productDetails?.name || "Product"}
              className="w-full h-auto rounded-md shadow-md cursor-crosshair"
            />

            {/* Magnifier Lens */}
            {showMagnifier && (
              <div
                className="absolute border border-gray-400 rounded-full"
                style={{
                  pointerEvents: "none",
                  width: "360px",
                  height: "360px",
                  top: `${magnifierPos.y - 180}px`,
                  left: `${magnifierPos.x - 180}px`,
                  backgroundImage: `url(${currentImage})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${imgRef.current!.width * zoom}px ${imgRef.current!.height * zoom
                    }px`,
                  backgroundPosition: `-${magnifierPos.x * zoom - 60}px -${magnifierPos.y * zoom - 60
                    }px`,
                }}
              />
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-3 mt-5 justify-center flex-wrap">
            {productDetails?.images?.map((img: any, idx: number) => (
              <img
                key={idx}
                src={img.url as string}
                alt={`thumbnail-${idx}`}
                className={`w-20 h-20 object-cover rounded-md border cursor-pointer transition-all duration-300 ${currentImage === img.url
                  ? "border-blue-500 scale-105"
                  : "border-gray-300 hover:scale-105"
                  }`}
                onClick={() => setCurrentImage(img.url)}
              />
            ))}
          </div>
        </div>

        { /* Midlle column */}
        <div className="p-4">
          <h1 className="text-xl mb-2 font-medium">{productDetails?.title as string}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings rating={productDetails?.rating || 3} />
              <Link href={"#reviews"} className="text-blue-500 hover:underline">Reviews</Link>
            </div>
            <div>
              <Heart
                size={25}
                fill={isWishlisted ? "red" : "transparent"}
                className="cursor-pointer"
                color={isWishlisted ? "transparent" : "#777"}
                onClick={() => (
                  isWishlisted ? removeFromWishlist(
                    productDetails?.id,
                    user,
                    location,
                    deviceInfo
                  ) : addToWishlist(
                    {
                      ...productDetails,
                      quantity,
                      selectedOptions: {
                        color: isSelected,
                        size: isSizeSelected
                      }
                    },
                    user,
                    location,
                    deviceInfo
                  )
                )}
              />
            </div>
          </div>
          <div className="py-2 border-b border-gray-200">
            <span className="text-gray-500">Brand: {" "} <span className="text-blue-500">{productDetails?.brand || "No Brand"}</span></span>
          </div>

          <div className="mt-3">
            <span className="text-3xl font-bold text-orange-500">${productDetails?.sale_price}</span>
            <div className="flex gap-2 text-lg border-b border-b-slate-200">
              <span className="text-gray-400 line-through">
                ${productDetails?.regular_price}
              </span>
              <span className="text-gray-500">-{dosicountPercentage}%</span>
            </div>
            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                { /* Color Options */}
                {productDetails?.colors?.length > 0 && (
                  <div>
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.colors?.map((color: string, index: number) => (
                        <button
                          key={index}
                          className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${isSelected === color ? "border-gray-400 scale-125 shadow-md" : "border-transparent"} `}
                          onClick={() => setIsSelected(color)}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {productDetails?.sizes?.length > 0 && (
                  <div>
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.sizes?.map((size: string, index: number) => (
                        <button
                          key={index}
                          className={`px-4 py-1 cursor-pointer rounded-md transition ${isSizeSelected === size ? "bg-gray-800 text-white" : "bg-gray-300 text-black"} `}
                          onClick={() => setIsSizeSelected(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center rounded-md">
                <div className="flex items-center rounded-md">
                  <button
                    className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 bg-gray-100 py-1">{quantity}</span>
                  <button
                    className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md mr-3"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>
                {productDetails?.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    In Stock {" "}
                    <span className="text-gray-500 font-medium">
                      (Stock {productDetails?.stock})
                    </span>
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stcok</span>
                )}
              </div>

              <button
                className={`flex mt-6 items-center gap-2 px-5 py-[10px] bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition-shadow ${isInCart ? "cursor-not-allowed" : "cursor-pointer"} `}
                disabled={isInCart || productDetails?.stock === 0}
                onClick={() => {
                  addToCart({
                    ...productDetails,
                    quantity,
                    selectedOptions: {
                      color: isSelected,
                      size: isSizeSelected,
                    }
                  },
                    user,
                    location,
                    deviceInfo
                  )
                }}
              >
                <ShoppingBagIcon size={18} /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-[#fafafa] -mt-6">
          <div className="mb-1 p-3 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Delivery Option</span>
            <div className="flex items-center text-gray-600g gap-1">
              <MapPin size={18} className="ml-[-5px]" />
              <span className="text-lg font-normal">{location?.city + ", " + location?.country}</span>
            </div>
          </div>
          <div className="mb-1 px-3 pb-1 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Return & Warranty</span>
            <div className="flex items-center text-gray-600 gap-1">
              <Package size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">7 Days Returns</span>
            </div>
            <div className="flex items-center py-2 text-gray-600 gap-1">
              <WalletMinimal size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">Warranty not available</span>
            </div>
          </div>
          <div className="px-3 py-1">
            <div className="w-[85%] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600 font-light">Sold by</span>
                  <span className="block max-w-[150px] truncate font-medium text-lg">{productDetails?.Shop?.name}</span>
                </div>
                <Link
                  href={"#"}
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <MessageSquareText /> Chat Now
                </Link>
              </div>

              {/* Seller Perfomance stats */}
              <div className="grid grid-cols-3 gap-3 border-t border-t-gray-200 mt-3 pt-3">
                <div>
                  <p className="text-[12px] text-gray-500">Positive Seller Ratings</p>
                  <p className="text-lg font-semibold">88%</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">Ship on Time</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">Chat Response Rate</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
              </div>

              { /* Go to Store */}
              <div className="text-center mt-4 border-t border-t-gray-200 pt-2">
                <Link href={`/shop/${productDetails?.Shop.id}`} className="text-blue-500 font-medium text-sm hover:underline">GO TO STORE</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto .w-[90%] lg:w-[80%] mt-5">
        <div className="bg-white h-full min-h-[60vh] p-5">
          <h3 className="text-lg font-semibold">
            Product details of {productDetails?.title}
          </h3>
          <div
            className="prose prose-sm text-slate-900 max-w-none"
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailed_description,
            }}
          />
        </div>
      </div>
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="bg-white min-h-[50vh] h-full mt-5 p-5">
          <h3 className="text-lg font-semibold">Ratings & Reviews of {productDetails?.title}</h3>
          <p className="text-center">No Reviews available yet!</p>
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="w-full h-full my-5 py-5">
          <h3 className="text-xl font-semibold mb-2">You may also like</h3>
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {recommendedProducts?.map((i: any) => (
              <ProductCard key={i.id} product={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
