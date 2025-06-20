'use client'
import GoogleButton from '@/shared/components/google-button';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import axios, { AxiosError } from "axios"

type FormData = {
    name: string;
    email: string;
    password: string;
}

const Signup = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [showOtp, setShowOtp] = useState(false)
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userData, setUserData] = useState<FormData | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1
            })

        }, 1000);
    }

    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`, data);
            return response.data;
        },
        onSuccess: (_, formData) => {
            setUserData(formData);
            setShowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`http://localhost:8080/api/verify-user`, { ...userData, otp: otp.join("") });
            return response;
        },
        onSuccess: () => {
            router.push("/login");
        }
    })

    const onSubmit = (data: FormData) => {
        console.log("Clicked Sign up Button")
        console.log(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`)
        signupMutation.mutate(data);
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (! /^[0-9]?$/.test((e.target as HTMLInputElement).value)) return;
        const key = e.key;

        if (e.key === "ArrowLeft") inputRefs.current[index - 1]?.focus();
        if (e.key === "ArrowRight") inputRefs.current[index + 1]?.focus();

        if (e.key === "Backspace" && index >= 0) {
            const newOtp = [...otp];
            newOtp[index] = ""

            inputRefs.current[index - 1]?.focus();
            setOtp(newOtp)
            return
        }
        if (isNaN(Number(key))) return;

        const newOtpFields = [...otp];
        newOtpFields[index] = key;
        inputRefs.current[index + 1]?.focus();
        setOtp(newOtpFields)
    };

    const resendOTP = () => {
        if(userData) {
            signupMutation.mutate(userData);
        }
    }

    return (
        <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1">
            <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
                Signup
            </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home . Signup
            </p>

            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white border border-gray-200 shadow rounded-lg">
                    <h3 className="text-3xl font-semibold text-center mb-2">
                        Signup to EShop
                    </h3>
                    <p className="text-center text-grey-500 mb-4">
                        Already have an account? {"  "}
                        <Link href={"/login"} className="text-blue-500 font-semibold">login</Link>
                    </p>
                    <GoogleButton />
                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300" />
                        <span className='px-3'>or Sign in with Email </span>
                        <div className="flex-1 border-t border-gray-300" />
                    </div>

                    {!showOtp ? (
                        <form onSubmit={handleSubmit(onSubmit)}>

                            <label className='block text-gray-700 mb-1'>Name</label>
                            <input
                                type="text"
                                placeholder='John Doe'
                                className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1'
                                {...register("name", {
                                    required: "Name is required",
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">
                                    {String(errors.name?.message)}
                                </p>
                            )}


                            <label className='block text-gray-700 mb-1'>Email</label>
                            <input
                                type="email"
                                placeholder='john@doe.com'
                                className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1'
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">
                                    {String(errors.email.message)}
                                </p>
                            )}

                            <label className='block text-gray-700 mb-1'>Password</label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder='Min 6 Characters'
                                    className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1'
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
                                    {passwordVisible ? <Eye /> : <EyeOff />}
                                </button>

                                {errors.password && (
                                    <p className="text-red-500 text-sm">
                                        {String(errors.password.message)}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={signupMutation.isPending}
                                className='w-full mt-4 text-lg cursor-pointer bg-pointer bg-black text-white py-2 rounded-lg'
                            >
                                {signupMutation.isPending ? "Signing up ..." : "Sign Up"}
                            </button>
                        </form>
                    ) : (
                        <div>
                            <h3 className='text-xl font-semibold text-center mb-4'>
                                Enter OTP
                            </h3>
                            <div className='flex justify-center gap-6'>
                                {otp?.map((digit, index) => (
                                    <input
                                        type="text"
                                        key={index}
                                        ref={(el) => {
                                            if (el) { inputRefs.current[index] = el }
                                        }}
                                        maxLength={1}
                                        className='w-12 h-12 text-center border border-gray-300 outline-none !rounded focus:ring-2 focus:ring-blue-200'
                                        value={digit}
                                        onChange={() => { }}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                            <button
                                className='w-full mt-4 tex-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'
                                disabled={verifyOtpMutation.isPending}
                                onClick={() => verifyOtpMutation.mutate()}
                            >
                                {verifyOtpMutation.isPending ? "Verifying ...": "Verify OTP"}
                            </button>
                            <p className='text-center text-sm mt-4'>{canResend ? (
                                <button
                                    onClick={resendOTP}
                                    className='text-blue-500 cursor-pointer'
                                >Resend OTP</button>
                            ) : (
                                `Resend OTP in ${timer}s`
                            )}
                            </p>
                            {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                                <p className='text-sm text-red-500 mt-2'>
                                    {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Signup