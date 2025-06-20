'use client'
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast';

type FormData = {
  email: string;
  password: string;
}

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", "",]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          setTimer(60);
          return 0;
        };

        return prev - 1
      });
    }, 1000)
  };

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`, { email });
      return response.data;
    },

    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setCanResend(false);
      setStep("otp");
      setServerError(null);
      startResendTimer()
    },

    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message: string })?.message || "Invalid OTP. Try again!";
      setServerError(errorMessage);
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`, { email: userEmail, otp: otp.join("") });
      return response.data;
    },

    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },

    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { messsage: string })?.messsage || "Invalid OTP. Try again!";
      setServerError(errorMessage);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`, { email: userEmail, newPassword: password });
      return response.data;
    },

    onSuccess: () => {
      setStep("email");
      toast.success("Password rest successfully! please login with your new password.");
      setServerError(null);
      router.push("/login");
    },

    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message: string })?.message || "Invalid OTP. Try again!";
      setServerError(errorMessage);
    }
  });

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


  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password })
  };


  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot-Password
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white border border-gray-200 shadow rounded-lg">
          {step === "email" && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">
                Login to EShop
              </h3>
              <p className="text-center text-grey-500 mb-4">
                Go back to? {"  "}
                <Link href={"/login"} className="text-blue-500 font-semibold">Login</Link>
              </p>


              <form onSubmit={handleSubmit(onSubmitEmail)}>
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

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className='w-full text-lg cursor-pointer bg-pointer bg-black text-white py-2 rounded-lg mt-4'
                >
                  {requestOtpMutation.isPending ? "Sending OTP ..." : "Submit"}
                </button>
                {serverError && (
                  <p className="text-red-500 text-sm">{serverError}</p>
                )}
              </form>
            </>
          )}

          {step === "otp" && (
            <>
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
                  {verifyOtpMutation.isPending ? "Verifying ..." : "Verify OTP"}
                </button>
                <p className='text-center text-sm mt-4'>{canResend ? (
                  <button
                    onClick={() => requestOtpMutation.mutate({ email: userEmail! })}
                    className='text-blue-500 cursor-pointer'
                  >Resend OTP</button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
                </p>
                {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                  <p className='text-sm text-red-500 mt-2'>
                    {serverError}
                  </p>
                )}
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <h3 className='text-xl font-semibold text-center mb-4'>
                Reset Password
              </h3>

              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label className='block text-gray-700 mb-1'>New Password</label>
                <input
                  type="password"
                  placeholder='john@doe.com'
                  className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1'
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    },
                  })}
                />

                {errors.password && (
                  <p className='text-red-500 text-sm'>
                    {String(errors.password.message)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className='w-full mt-4 text-lg cursor-pointer bg-pointer bg-black text-white py-2 rounded-lg'
                >
                  {resetPasswordMutation.isPending ? "Resetting ..." : "Reset Password"}
                </button>

                {serverError && (
                  <p className='text-sm text-red-500 mt-2'>{serverError}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword;