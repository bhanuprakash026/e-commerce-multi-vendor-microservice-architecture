import Link from 'next/link'
import React from 'react'
import { Search } from "lucide-react"
import { UserProfileIcon } from '@/assests/svgs/profile-icon'
import AddToCartIcon from '@/assests/svgs/cart-icon'
import HeartIcon from '@/assests/svgs/heart-icon'
import HeaderBottom from './header-bottom'

const Header = () => {
    return (
        <div className="w-full bg-white ">
            <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
                <div>
                    <Link href={"/"}><span className='text-2xl font-[500]'>Eshop</span></Link>
                </div>
                <div className="w-[50%] relative">
                    <input type="text"
                        placeholder="Search for products..."
                        className='w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]'
                    />
                    <div className='w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0'>
                        <Search color='#fff' />
                    </div>
                </div>

                <div className='flex items-center gap-8 pb-2'>
                    <div className='flex items-center gap-2'>
                        <Link href={"/login"}><UserProfileIcon /></Link>
                        <Link href={"/login"}>
                            <span className='block font-medium'>Hello,</span>
                            <span className='font-semibold '>Sign In</span>
                        </Link>
                    </div>

                    <div className='flex items-center gap-4'>
                        <Link href={"/whishlist"} className='relative'>
                            <HeartIcon
                                width={28}
                                height={28}
                                stroke="#EF4444" // Tailwind red-500
                                className="hover:fill-red-500 hover:stroke-red-500 transition-all"
                            />

                            <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                <span className='text-white font-medium text-sm'>0</span>
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
                                <span className='text-white font-medium text-sm'>0</span>
                            </div>
                        </Link>
                    </div>

                </div>
            </div>

            <div className='border-b border-b-[#99999938]' />
            <HeaderBottom />

        </div>
    )
}

export default Header