'use client'
import Link from 'next/link'
import React from 'react'
import { Search } from "lucide-react"
import { UserProfileIcon } from '@/assests/svgs/profile-icon'
import AddToCartIcon from '@/assests/svgs/cart-icon'
import HeartIcon from '@/assests/svgs/heart-icon'
import HeaderBottom from './header-bottom'
import { useStore } from '@/store';
import useUser from '@/hooks/useUser'

const Header: React.FC = () => {
  const {user, isLoading} = useUser();
  const selectWishlist = React.useCallback((state: any) => state.wishlist ?? [], []);
  const selectCart = React.useCallback((state: any) => state.cart ?? [], []);
  const wishlist = useStore(selectWishlist);
  const cart = useStore(selectCart);
  

  return (
    <div className="w-full bg-white">
      {/* Top Header */}
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        {/* Logo */}
        <div>
          <Link href="/">
            <span className="text-2xl font-[500]">Eshop</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0">
            <Search color="#fff" />
          </div>
        </div>

        {/* User & Cart/Wishlist */}
        <div className="flex items-center gap-8 pb-2">
          {/* User Profile */}
          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                <Link href="/profile">
                  <UserProfileIcon />
                </Link>
                <Link href="/profile">
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">{user.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <UserProfileIcon />
                </Link>
                <Link href="/login">
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">{isLoading ? '. . . .' : 'Sign in'}</span>
                </Link>
              </>
            )}
          </div>

          {/* Wishlist & Cart */}
          <div className="flex items-center gap-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <HeartIcon
                width={28}
                height={28}
                stroke="#EF4444"
                className="hover:fill-red-500 hover:stroke-red-500 transition-all"
              />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">{wishlist.length}</span>
              </div>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <AddToCartIcon
                width={38}
                height={38}
                stroke="#1D4ED8"
                className="hover:scale-110 transition-transform"
              />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">{cart.length}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-b-[#99999938]" />

      {/* Bottom Header / Navigation */}
      <HeaderBottom />
    </div>
  );
};

export default Header;
