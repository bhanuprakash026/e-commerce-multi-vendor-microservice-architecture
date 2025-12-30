"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Input from "@packages/components/input";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type FormData = {
  email: string;
  password: string;
};

const Page = () => {

  const router = useRouter();

  const { register, handleSubmit } = useForm<FormData>();
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login-admin`, data, { withCredentials: true });
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      router.push("/dashboard");
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid Credentials"
      setServerError(errorMessage);
    },
  });

  const onSubmit = async (data: FormData) => {
    loginMutation.mutate(data);

  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="md:w-[450px] pb-8 bg-slate-800 rounded-md shadow">
        <form
          className="p-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-3xl pb-3 pt-4 font-semibold text-center text-white font-Poppins">
            Welcome Admin
          </h1>

          <Input
            label="Email"
            placeholder="Enter your Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9_%+-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,4}$/,
                message: "Invalid email address"
              },
            })}
          />
          <div className="mt-3">
            <Input
              label="Password"
              type="password"
              placeholder="********"
              {...register("password", {
                required: "Password is required",
              })}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-5 p-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
          {serverError && (
            <p className="text-red-500 text-sm mt-2">{serverError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Page;
