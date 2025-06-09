// Authentication Related thing all users, sellers and admin

import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp, handleForgotPassword, verifyForgotPassword } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";

export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {

    try {
        validateRegistrationData(req.body, "user");

        const { name, email } = req.body;

        const existingUser = await prisma.users.findUnique({ where: { email } });

        if (existingUser) {
            return next(new ValidationError("User already exist with this email!"));
        };
        await checkOtpRestrictions(name, next);
        await trackOtpRequests(email, next);
        await sendOtp(name, email, "user-activation-mail");

        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        });
    } catch (error) {
        return next(error)
    }
};

// Verify user with OTP.

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name } = req.body;
        if (!name || !email || !otp || !password) {
            return next(new ValidationError("All Fields are required!"));
        };

        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return next(new ValidationError("User already exist with this email!"));
        };

        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: { name, email, password: hashedPassword },
        });

        res.status(200).json({
            success: true,
            message: "User is created Successfully"
        })

    } catch (error) {
        return next(error);
    }
};

// login user

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("All Fields Required"));
        };

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            return next(new AuthError("User not exist"));
        };

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) return next(new AuthError("Invalid email or password"));

        const accessToken = jwt.sign({ id: user.id, role: "user" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user.id, role: "user" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "15m" });

        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message: "Login successful",
            user,
        })

    } catch (error) {
        next(error)
    }
};

export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, "user")
};

// Verify forgot password otp
export const verifyUserForgotPasswordOtp = async(req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPassword(req, res, next);
};

// Reset user Password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) return next(new ValidationError("Email and password are Required"));

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) return next(new ValidationError("User is not found"));

        // compare new password with existing one
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);

        if (isSamePassword) return next(new ValidationError("New Password cannot be same as the old Password!"));

        // hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: "Password reset successfully!" });
    } catch (error) {
        next(error);
    }
};
