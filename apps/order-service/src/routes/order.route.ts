import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { createPaymentIntent, createPaymentSession, getOrderDetails, getSellerOrders, getUserOrderDetails, updateDeliveryStatus, verifyCouponCode, verifyingPaymentSession } from "../controllers/order.controller";
import { isSeller } from "../../../../packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/api/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/api/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/api/verifying-payment-session", isAuthenticated, verifyingPaymentSession);
router.get("/get-seller-orders", isAuthenticated, isSeller, getSellerOrders);
router.get("/get-order-details/:id", isAuthenticated, getOrderDetails);
router.put("/update-delivery-status/:orderId", isAuthenticated, updateDeliveryStatus);
router.put("/verify-coupon", isAuthenticated, verifyCouponCode);
router.get("/get-user-orders", isAuthenticated, getUserOrderDetails);


export default router;