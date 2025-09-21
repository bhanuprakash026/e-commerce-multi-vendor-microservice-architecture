"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  const router = useRouter();

  // ✅ Static for now, dynamic later
  const bannerUrl =
    "https://t4.ftcdn.net/jpg/08/11/15/31/240_F_811153195_s2vVHpvkhXYdh35b75nBf9vQ69Fp5cAj.jpg";

  return (
    <div className="relative h-[85vh] w-full flex flex-col justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src={bannerUrl}
        alt="Watch Banner"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from 40$
          </p>
          <h1 className="text-white text-6xl font-extrabold font-Roboto leading-tight">
            The best watch <br />
            Collection 2025
          </h1>
          <p className="font-Oregano text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span> This
            week
          </p>
          <br />
          <button
            className="w-[160px] bg-white gap-2 font-semibold h-[45px] flex justify-center items-center rounded-lg hover:bg-yellow-400 hover:text-black transition"
            onClick={() => router.push("/products")}
          >
            Shop Now <MoveRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
