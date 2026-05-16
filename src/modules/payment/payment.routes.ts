import express from "express";
import paymentController from "./payment.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authRequired, roleRequired } from "../../middlewares/auth.middleware";
import { createPaymentSchema } from "./payment.val";
import { UserRole } from "../user/user.types";

const router = express.Router();

// User
router.post(
    '/',
    authRequired,
    roleRequired(UserRole.USER, UserRole.ADMIN),
    validate(createPaymentSchema),
    paymentController.createPayment
);

router.get(
    '/my',
    authRequired,
    roleRequired(UserRole.USER, UserRole.ADMIN),
    paymentController.getMyPayments
);

// Click webhook — authRequired yo'q, Click o'zi chaqiradi
router.post(
    '/prepare',
    paymentController.prepare
);

router.post(
    '/complete',
    paymentController.complete
);

export default router;