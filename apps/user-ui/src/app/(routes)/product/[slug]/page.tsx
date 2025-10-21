import ProductDetails from '@/shared/modules/product/product-details';
import axiosInstance from '@/utils/axiosInstance'
import { Metadata } from 'next';
import React from 'react'

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`product/api/get-product/${slug}`);
  return response.data.product;
};

export async function generateMetadata({
  params
} : {
  params: {slug: string}
}) : Promise<Metadata> {
  const product = await fetchProductDetails(params.slug);

  return {
    title: `${product?.title} | Bhanu's Marketplace`,
    description: product?.short_description || "Discover high quality on Bhanu's Marketplace",
    openGraph: {
      title: product?.title,
      description: product?.short_descritption || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
    }
  }
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const productDetails = await fetchProductDetails(params?.slug);
  return <ProductDetails productDetails={productDetails}/>
}

export default Page