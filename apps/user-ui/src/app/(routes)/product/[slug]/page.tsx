import ProductDetails from "@/shared/modules/product/product-details";
import axiosInstance from "@/utils/axiosInstance";
import { Metadata } from "next";
import React from "react";

async function fetchProductDetails(slug: string) {
  try {
    const response = await axiosInstance.get(`product/api/get-product/${slug}`);
    return response.data.product;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductDetails(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | Bhanu's Marketplace",
      description: "Sorry, this product could not be found.",
    };
  }

  return {
    title: `${product.title} | Bhanu's Marketplace`,
    description:
      product?.short_description ||
      "Discover high-quality products on Bhanu's Marketplace.",
    openGraph: {
      title: product?.title,
      description: product.short_description || "",
      images: [product.images?.[0]?.url || "/default-image.jpg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
    },
  };
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const productDetails = await fetchProductDetails(params.slug);

  if (!productDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-2xl font-semibold mb-3 text-gray-800">
          Product Not Found
        </h1>
        <p className="text-gray-500">
          Sorry, we couldn’t find the product you’re looking for.
        </p>
      </div>
    );
  }

  return <ProductDetails productDetails={productDetails} />;
};

export default Page;
