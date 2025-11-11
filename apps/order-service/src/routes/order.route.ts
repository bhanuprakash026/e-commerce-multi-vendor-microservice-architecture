import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { createPaymentIntent, createPaymentSession, verifyingPaymentSession } from "../controllers/order.controller";

const router: Router = express.Router();

router.post("/api/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/api/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/api/verifying-payment-session", isAuthenticated, verifyingPaymentSession);


export default router;