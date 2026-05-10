import { Router } from "express";

import userController from "./user.controller";
import { validate } from "../../middlewares/validate";
import { idParamSchema, createUserSchema, updateUserSchema } from "./user.val";

const router = Router();

router.post('/', validate(createUserSchema), userController.createUser);

router.get('/:id', validate(idParamSchema, 'params'), userController.getUser);

router.get('/', userController.getUsers);

router.patch('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), userController.updateUser);

router.delete('/:id', validate(idParamSchema, 'params'), userController.deactivateUser);

export default router;  