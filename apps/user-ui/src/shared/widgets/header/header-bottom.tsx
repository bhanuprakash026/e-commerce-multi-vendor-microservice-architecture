'use client'
import AddToCartIcon from '@/assests/svgs/cart-icon';
import { UserProfileIcon } from '@/assests/svgs/profile-icon';
import { navItems } from '@/configs/constants';
import { AlignLeft, ChevronDown, HeartIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';

const HeaderBottom = () => {

  const [isSticky, setIsSticky] = useState(false);
  const [show, setShow] = useState(false);
  const { user, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);
  const wishlist = useStore((state: any) => state.wishlist);


  // Track scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      };
    };

    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [])

  return (
    <div className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}>
      <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? "pt-3" : "py-0"}`}>
        {/* All Dropdowns */}
        <div
          className={`w-[260px] ${isSticky && "-mb-2"} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color='white' />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDown color='white' />
        </div>

        {/* Dropdown menu */}
        {show && (
          <div className={`z-50 absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px]"} w-[260px] h-[400px] bg-[#f5f5f5]`}>

          </div>
        )}

        {/* Navigation links */}
        <div className="flex items-center">
          {navItems.map((i, index: number) => (
            <Link
              className='px-5 font-medium text-lg'
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>

        <div className="">
          {isSticky && (
            <div className='flex items-center gap-8 pb-2'>
              <div className='flex items-center gap-2'>
                {!isLoading && user ?
                  (<>
                    <Link href={"/profile"}><UserProfileIcon /></Link>
                    <Link href={"/profile"}>
                      <span className='block font-medium'>Hello,</span>
                      <span className='font-semibold '>{user?.name}</span>
                    </Link>
                  </>
                  ) : (
                    <>
                      <Link href={"/login"}><UserProfileIcon /></Link>
                      <Link href={"/login"}>
                        <span className='block font-medium'>Hello,</span>
                        <span className='font-semibold '>{isLoading ? ". . . ." : "Sign in"}</span>
                      </Link>
                    </>
                  )}


              </div>

              <div className='flex items-center gap-4'>
                <Link href={"/wishlist"} className='relative'>
                  <HeartIcon
                    width={28}
                    height={28}
                    stroke="#EF4444" // Tailwind red-500
                    className="hover:fill-red-500 hover:stroke-red-500 transition-all"
                  />

                  <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                    <span className='text-white font-medium text-sm'>{wishlist?.length}</span>
                  </div>
                </Link>

                <Link href={"/cart"} className='relative'>
                  <AddToCartIcon
                    width={38}
                    height={38}
                    stroke="#1D4ED8" // Tailwind blue-700
                    className="hover:scale-110 transition-transform"
                  />

                  <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                    <span className='text-white font-medium text-sm'>{cart?.length}</span>
                  </div>
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeaderBottom