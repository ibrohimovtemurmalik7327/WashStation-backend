import express from 'express'
import authController from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authRequired } from '../../middlewares/auth.middleware';
import {
    registerStartSchema,
    registerVerifySchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordStartSchema,
    forgotPasswordVerifySchema
} from './auth.val';

const router = express.Router();

router.post(
    '/register/start',
    validate(registerStartSchema),
    authController.registerStart
);

router.post(
    '/register/verify',
    validate(registerVerifySchema),
    authController.registerVerify
);

router.post(
    '/login',
    validate(loginSchema),
    authController.login
);

router.patch(
    '/change-password',
    authRequired,
    validate(changePasswordSchema),
    authController.changePassword
);

router.post(
    '/forgot-password/start',
    validate(forgotPasswordStartSchema),
    authController.forgotPasswordStart
);

router.post(
    '/forgot-password/verify',
    validate(forgotPasswordVerifySchema),
    authController.forgotPasswordVerify
);

export default router;