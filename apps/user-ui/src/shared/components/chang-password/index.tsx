"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2, Lock } from "lucide-react";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (data: any) => {
    setErrorMessage("");
    setMessage("");

    try {
      await axiosInstance.post(
        "/api/change-password",
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        { requireAuth: true } as any
      );

      setMessage("Password changed successfully!");
      reset();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Something went wrong!";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="p-3 rounded-md bg-green-100 text-green-700 border border-green-200 text-sm">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 border border-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-md shadow-sm border border-gray-200 space-y-5"
      >
        {/* Current Password */}
        <div className="space-y-1">
          <label className="text-sm text-gray-700 font-medium">
            Current Password
          </label>
          <input
            type="password"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.currentPassword
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-300"
            }`}
            placeholder="Enter current password"
            {...register("currentPassword", {
              required: "Current password is required",
            })}
          />
          {errors.currentPassword && (
            <p className="text-xs text-red-500">
              {errors.currentPassword.message as string}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="text-sm text-gray-700 font-medium">
            New Password
          </label>

          <input
            type="password"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.newPassword
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-300"
            }`}
            placeholder="Enter new password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
              validate: {
                hasUpperCase: (value) =>
                  /[A-Z]/.test(value) ||
                  "Must contain at least one uppercase letter (A-Z)",
                hasLowerCase: (value) =>
                  /[a-z]/.test(value) ||
                  "Must contain at least one lowercase letter (a-z)",
                hasNumber: (value) =>
                  /\d/.test(value) ||
                  "Must contain at least one number (0-9)",
                hasSpecialChar: (value) =>
                  /[@$!%*?&]/.test(value) ||
                  "Must contain at least one special character (@, $, !, %, *, ?, &)",
              },
            })}
          />
          {errors.newPassword && (
            <p className="text-xs text-red-500">
              {errors.newPassword.message as string}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-sm text-gray-700 font-medium">
            Confirm Password
          </label>

          <input
            type="password"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.confirmPassword
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-300"
            }`}
            placeholder="Confirm new password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === watch("newPassword") ||
                "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {errors.confirmPassword.message as string}
            </p>
          )}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Updating...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Change Password
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
