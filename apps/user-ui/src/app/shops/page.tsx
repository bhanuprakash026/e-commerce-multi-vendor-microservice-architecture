"use client"
import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { categories } from '@/configs/categories';
import ShopCard from '@/shared/components/cards/shop.card';
import { countries } from '@/utils/countries';

const Page = () => {
  const router = useRouter();
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const updateURL = () => {
    const params = new URLSearchParams();

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    if (selectedCountries.length > 0) {
      params.set("countries", selectedCountries.join(","));
    }

    params.set("page", page.toString());
    router.replace(`/shops?${params.toString()}`, { scroll: false });
  };

  const fetchFilteredProducts = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();

      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }

      if (selectedCountries.length > 0) {
        query.set("countries", selectedCountries.join(","));
      }

      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(`/product/api/get-filtered-shops?${query.toString()}`);
      setShops(res.data.shops);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.log("Failed to fetch filtered products", error);
    } finally {
      setIsShopLoading(false);
    }
  };

  const toggleCategory = (label: string) => {
    setSelectedCategories((prevState) =>
      prevState.includes(label)
        ? prevState.filter((e) => e !== label)
        : [...prevState, label]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prevState) =>
      prevState.includes(country)
        ? prevState.filter((e) => e !== country)
        : [...prevState, country]
    );
  };

  useEffect(() => {
    updateURL();
  }, [selectedCategories, selectedCountries, page]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedCategories, selectedCountries, page]);

  return (
    <div className='bg-[#f5f5f5] pb-10'>
      <div className='w-[90%] lg:w-[80%] m-auto'>
        <div className='pb-[50px]'>
          <h1 className="md:pt-[40px] font-medium text-[44px] leading-1 mb-[14px] font-jost">
            All Shops
          </h1>
          <Link href="/" className='text-[#55585b] hover:underline'>Home</Link>
          <span> {">"}</span>
          <span className='text-[#55585b]'>All Shops</span>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* sidebar */}
          <aside className='w-full lg:w-[270px] !rounded bg-white p-4 sapce-y-6 shadow-md'>
            {/* Categories */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-2">Categories</h3>
            <ul className='space-y-2 !mt-3'>
              {categories?.map((category: any, i) => (
                <li key={category.label} className='flex items-center justify-between'>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                      className='accent-blue-600'
                    />
                    {category.value}
                  </label>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-2">Countries</h3>
            <ul className='space-y-2 !mt-3'>
              {countries?.map((country: any, i) => (
                <li key={country} className='flex items-center justify-between'>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className='accent-blue-600'
                    />
                    {country}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          {/* Shop grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isShopLoading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-4 gap-4'>
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className='h-[250px] bg-gray-300 animate-pulse rounded-xl'></div>
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'>
                {shops?.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <p>No Shops Found!</p>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    className={`px-3 py-1 !rounded border border-gray-200 text-sm ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white text-black"}`}
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;