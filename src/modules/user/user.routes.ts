import { Router } from "express";
import userController from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { roleRequired } from "../../middlewares/auth.middleware";
import { idParamSchema, createUserSchema, updateUserSchema } from "./user.val";
import { UserRole } from "./user.types";

const router = Router();

router.post(
    '/',
    roleRequired(UserRole.ADMIN),
    validate(createUserSchema),
    userController.createUser
);

router.get(
    '/',
    roleRequired(UserRole.ADMIN),
    userController.getUsers
);

router.get(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(idParamSchema, 'params'),
    userController.getUser
);

router.patch(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(idParamSchema, 'params'),
    validate(updateUserSchema),
    userController.updateUser
);

router.delete(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(idParamSchema, 'params'),
    userController.deactivateUser
);

export default router;