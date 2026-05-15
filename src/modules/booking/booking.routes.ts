import express from "express";
import bookingController from "./booking.controller";
import { validate } from "../../middlewares/validate.middleware";
import { roleRequired } from "../../middlewares/auth.middleware";
import {
    getSlotsSchema,
    createBookingSchema,
    bookingIdParamSchema,
    branchIdParamSchema,
    dateQuerySchema
} from "./booking.val";
import { UserRole } from "../user/user.types";

const router = express.Router();

// User
router.post(
    '/slots',
    roleRequired(UserRole.USER, UserRole.ADMIN),
    validate(getSlotsSchema),
    bookingController.getSlots
);

router.post(
    '/',
    roleRequired(UserRole.USER, UserRole.ADMIN),
    validate(createBookingSchema),
    bookingController.createBooking
);

router.get(
    '/my',
    roleRequired(UserRole.USER, UserRole.ADMIN),
    bookingController.getMyBookings
);

router.get(
    '/my/:id',
    roleRequired(UserRole.USER, UserRole.ADMIN),
    validate(bookingIdParamSchema, 'params'),
    bookingController.getMyBookingById
);

router.delete(
    '/my/:id',
    roleRequired(UserRole.USER, UserRole.ADMIN),
    validate(bookingIdParamSchema, 'params'),
    bookingController.cancelBooking
);

// Admin
router.get(
    '/branch/:branch_id',
    roleRequired(UserRole.ADMIN),
    validate(branchIdParamSchema, 'params'),
    validate(dateQuerySchema, 'query'),
    bookingController.getBookingsByBranch
);

router.patch(
    '/:id/complete',
    roleRequired(UserRole.ADMIN),
    validate(bookingIdParamSchema, 'params'),
    bookingController.completeBooking
);

export default router;