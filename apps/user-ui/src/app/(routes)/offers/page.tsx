"use client"
import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Range } from 'react-range';
import ProductCard from '@/shared/components/cards/product-card';

const MIN = 0;
const MAX = 1199;

const Page = () => {
  const router = useRouter()
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

  const colors = [
    { name: "Red", code: "#FF0000" },
    { name: "Green", code: "#00FF00" },
    { name: "Blue", code: "#0000FF" },
    { name: "Yellow", code: "#FFFF00" },
    { name: "Purple", code: "#800080" },
    { name: "Orange", code: "#FFA500" },
    { name: "Cyan", code: "#00FFFF" },
    { name: "Magenta", code: "#FF00FF" },
    { name: "Black", code: "#000000" },
    { name: "White", code: "#FFFFFF" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];


  const updateURL = () => {
    const params = new URLSearchParams();

    params.set("priceRange", priceRange.join(","));
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","))
    }

    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","));
    }

    if (selectedSizes.length > 0) {
      params.set("sizes", selectedColors.join(","));
    }
    params.set("page", page.toString());
    router.replace(`/offers?${decodeURIComponent(params.toString())}`);
  }

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    try {
      const query = new URLSearchParams();

      query.set("priceRange", priceRange.join(","));
      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","))
      }

      if (selectedColors.length > 0) {
        query.set("colors", selectedColors.join(","));
      }

      if (selectedSizes.length > 0) {
        query.set("sizes", selectedColors.join(","));
      }

      query.set("page", page.toString());
      query.set("limit", "12")

      const res = await axiosInstance.get(`/product/api/get-filtered-offers?${query.toString()}`)
      setProducts(res.data.products);
      setTotalPages(res.data.pageination.totalPages);

    } catch (error) {
      console.log("Failed to fetch filtered products", error)
    } finally {
      setIsProductLoading(false);
    }
  }

  const toggleCategory = (label: string) => {
    setSelectedCategories((prevState) => prevState.includes(label) ? prevState.filter((e) => e !== label) : [...prevState, label])
  };

  const toggeleColor = (color: string) => {
    setSelectedColors((prevState) => prevState.includes(color) ? prevState.filter((e) => e !== color) : [...prevState, color]);
  };

  const toggeleSize = (size: string) => {
    setSelectedSizes((prevState) => prevState.includes(size) ? prevState.filter((e) => e !== size) : [...prevState, size]);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30
  });

  useEffect(() => {
    fetchFilteredProducts();
  }, [priceRange]);

  return (
    <div className='bg-[#f5f5f5] pb-10'>
      <div className='w-[90%] lg:w-[80%] m-auto'>
        <div className='pb-[50px]'>
          <h1 className="md:pt-[40px] font-medium text-[44px] leading-1 mb-[14px] font-jost">
            All Products
          </h1>
          <Link href="/" className='text-[#55585b] hover:underline'>Home</Link>
          <span> {">"}</span>
          <span className='text-[#55585b]'>All Products</span>
        </div>
        <div className="w-full flex flex-col lg:flex-row gap-8">
          { /* sidebar */}
          <aside className='w-full lg:w-[270px] !rounded bg-white p-4 sapce-y-6 shadow-md'>
            <h3 className="text-xl font-Poppins font-medium">Price Filter</h3>
            <div className='my-2'>
              <Range
                step={1}
                min={MIN}
                max={MAX}
                values={tempPriceRange}
                onChange={(values) => setTempPriceRange(values)}
                renderTrack={({ props, children }) => {
                  const [min, max] = tempPriceRange;
                  const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                  const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                  return (
                    <div
                      {...props}
                      className='h-[6px] bg-blue-200 rounded relative'
                      style={{ ...props.style }}
                    >
                      <div
                        className='absolute h-full bg-blue-600 rounded'
                        style={{
                          left: `${percentageLeft}%`,
                          width: `${percentageRight - percentageLeft}%`
                        }}
                      />
                      {children}
                    </div>
                  )
                }}
                renderThumb={({ props }) => {
                  const { key, ...rest } = props;
                  return (
                    <div
                      key={key}
                      {...rest}
                      className='w-[16px] h-[16px] bg-blue-600 rounded-full shadow'
                    />
                  )
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-600">
                ${tempPriceRange[0]} - ${tempPriceRange[1]}
              </div>
              <button
                onClick={() => {
                  setPriceRange(tempPriceRange)
                  setPage(1);
                  updateURL();
                }}
                className='text-sm px-4 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white transition !rounded'
              >
                Apply
              </button>
            </div>

            { /* Categories */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-2">Categories</h3>
            <ul className='space-y-2 !mt-3'>
              {isLoading ? (
                <p>Loading....</p>
              ) : (
                data?.categories?.map((category: any) => (
                  <li key={category} className='flex items-center justify-between'>
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => toggleCategory(category)}
                        className='accent-blue-600'
                      />
                      {category}
                    </label>
                  </li>
                ))
              )}
            </ul>

            { /* Colors */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-400 pb-1 mt-6">Filter by Color</h3>
            {colors.map((color) => (
              <label key={color.name} className='flex items-center gap-2 cursor-pointer text-sm'>
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color.name)}
                  onChange={() => toggeleColor(color.name)}
                  className='accent-blue-600'
                />
                <span className='w-[16px] h-[16px] rounded-full border border-gray-200' style={{ backgroundColor: color.code }}></span>
                {color.name}
              </label>
            ))}

            { /* Sizes */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-6">Filter by Sizes</h3>
            {sizes.map((size) => (
              <label key={size} className='flex items-center gap-2 cursor-pointer text-sm'>
                <input
                  type="checkbox"
                  checked={selectedColors.includes(size)}
                  onChange={() => toggeleColor(size)}
                  className='accent-blue-600'
                />
                {size}
              </label>
            ))}
          </aside>

          { /* PRoduct grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isProductLoading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-4 gap-4'>
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index}
                    className='h-[250px] bg-gray-300 animate-pulse rounded-xl'>

                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'>
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p>No Products Found!</p>
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
  )
}

export default Page