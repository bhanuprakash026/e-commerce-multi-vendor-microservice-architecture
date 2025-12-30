// Authentication Related thing all users, sellers and admin

import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp, handleForgotPassword, verifyForgotPassword } from "../utils/auth.helper";

// Extend Express Request interface to include 'seller' and 'user'
declare global {
    namespace Express {
        interface Request {
            seller?: any;
            user?: any;
            role?: string;
        }
    }
}
import prisma from "../../../../packages/libs/prisma";
import { AuthError, NotFoundError, ValidationError } from "../../../../packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
});

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

        res.clearCookie("seller-access-token");
        res.clearCookie("seller-refresh-token");

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

export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        res.status(201).json({ success: true, user, });
    } catch (error) {
        next(error);
    }
};

// Refresh Token
export const refreshToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies["refresh_token"] || req.cookies["seller-refresh-token"] || req.headers.authorization?.split(" ")[1];

        if (!refreshToken) {
            return new ValidationError("Unauthorized! No refresh token.");
        };

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string; role: string };
        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Forbidden! Invalid refresh token.");
        };

        let account;

        if (decoded.role === "user") {
            account = await prisma.users.findUnique({ where: { id: decoded.id } });
        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({ where: { id: decoded.id }, include: { shop: true } });
        };

        if (!account) {
            return new AuthError("Forbiddeb! User/Seller not found")
        };

        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        if (decoded.role === "user") {
            setCookie(res, "access_token", newAccessToken);
        } else if (decoded.role === "seller") {
            setCookie(res, "seller-access-token", newAccessToken);
        };

        req.role = decoded.role;

        return res.status(201).json({ success: true });
    } catch (error) {
        return next(error)
    }
}

export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, "user")
};

// Verify forgot password otp
export const verifyUserForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
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


// Register a new seller
export const registerSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller");
        const { name, email } = req.body;
        const existingSeller = await prisma.sellers.findUnique({ where: { email } });

        if (existingSeller) {
            throw new ValidationError("Seller already exists with this email!");
        };

        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(name, email, "seller-activation");

        res.status(200)
            .json({ message: "OTP sent to email. Please verigy your account." });

    } catch (error) {
        next(error)
    }
};

// create strip connect account link
export const createStripeConnectLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body;

        if (!sellerId) return next(new ValidationError("Seller ID is required!"));

        const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

        if (!seller) {
            return next(new ValidationError("Seller is not available with this ID"));
        };

        const account = await stripe.accounts.create({
            type: "express",
            email: seller.email,
            country: "GB",
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        await prisma.sellers.update({
            where: {
                id: sellerId,
            },
            data: {
                stripeId: account.id,
            },
        });

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type: "account_onboarding"
        });

        res.json({ url: accountLink.url });

    } catch (error) {
        console.log("error:--", error)
        return next(error)
    };
};



// login seller
export const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("Email and password are required!"));
        };

        const seller = await prisma.sellers.findUnique({ where: { email } });
        if (!seller) return next(new ValidationError("Invalid email or password"));

        // Verify password
        const isMatch = await bcrypt.compare(password, seller.password!);
        if (!isMatch) return next(new ValidationError("Invalid email or password!"));

        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        //Generate access and refresh token
        const access_token = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        const refresh_token = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        // store refresh and refresh token.
        setCookie(res, "seller-refresh-token", refresh_token);
        setCookie(res, "seller-access-token", access_token);

        res.status(200)
            .json({
                message: "Login Successful!",
                seller: { id: seller.id, email: seller.email, name: seller.name },
            });

    } catch (error) {
        console.log("error:--", error)
        next(error);
    }
};

// get logged in seller
export const getSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller;
        res.status(201).json({
            success: true,
            seller
        });
    } catch (error) {
        next(error)
    }
}

export const addUserAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { label, name, street, city, zip, country, isDefault } = req.body;

        if (!label || !name || !street || !city || !zip || !country) {
            return next(new ValidationError("All fields are required"));
        }

        if (isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId,
                    isDefault: true
                },
                data: {
                    isDefault: false,
                }
            })
        }

        const newAddress = await prisma.address.create({
            data: {
                userId,
                label,
                name,
                street,
                city,
                zip,
                country,
                isDefault
            }
        });
        res.status(201).json({
            success: true,
            address: newAddress
        });
    } catch (error) {

    }
}

export const deleteUserAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { addressId } = req.params;
        const userId = req.user?.id;

        if (!addressId) {
            return next(new ValidationError("Address ID is Required"));
        }

        const existingAddress = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId
            }
        });

        if (!existingAddress) {
            return next(new NotFoundError("Address not found or unauthorized"));
        }

        await prisma.address.delete({
            where: {
                id: addressId,
            }
        });

        res.status(200).json({
            success: true,
            message: "Address Deleted Successfully"
        })
    } catch (error) {
        next(error)
    }
};

export const getUserAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const addresses = await prisma.address.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            success: true,
            addresses
        });
    } catch (error) {
        next(error)
    }
}

export const updateUserPassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return next(new ValidationError("All Fields are required"));
        }

        if (newPassword !== confirmPassword) {
            return next(new ValidationError("new Password do not match"));
        }

        if (currentPassword === newPassword) {
            return next(new ValidationError("New Password cannot be the same as the current password"))
        }

        const user = await prisma.users.findUnique({
            where: {
                id: userId
            }
        });

        if (!user || !user.password) {
            return next(new AuthError("User not found or password not found"));
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordCorrect) {
            return next(new AuthError("Current password is incorrect"));
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.users.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: "Password updated successfully" })

    } catch (error) {
        next(error)
    }
}

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("All Fields Required"));
        };

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            return next(new AuthError("Admin not exist"));
        };

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) return next(new AuthError("Invalid email or password"));

        // sendLog({
        //     type: "success",
        //     message: `Admin login successfull: ${email}`,
        //     source: "auth-service"
        // });


        res.clearCookie("seller-access-token");
        res.clearCookie("seller-refresh-token");

        const accessToken = jwt.sign({ id: user.id, role: "admin" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user.id, role: "admin" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email, name: user.name },
        })

    } catch (error) {
        next(error)
    }
};

export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const admin = req.admin;
        res.status(201).json({
            success: true,
            admin
        });
    } catch (error) {
        next(error)
    }
}