import express from "express";
import machineController from "./machine.controller";
import { validate } from "../../middlewares/validate.middleware";
import { roleRequired } from "../../middlewares/auth.middleware";
import {
    createMachineSchema,
    updateMachineSchema,
    machineIdParamSchema,
    branchIdParamSchema
} from './machine.val';
import { UserRole } from "../user/user.types";

const router = express.Router();

router.post(
    '/',
    roleRequired(UserRole.ADMIN),
    validate(createMachineSchema),
    machineController.createMachine
);

router.get(
    '/branch/:branch_id/active',
    roleRequired(UserRole.ADMIN, UserRole.USER),
    validate(branchIdParamSchema, 'params'),
    machineController.getActiveMachinesByBranch
);

router.get(
    '/branch/:branch_id',
    roleRequired(UserRole.ADMIN),
    validate(branchIdParamSchema, 'params'),
    machineController.getMachinesByBranch
);

router.get(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(machineIdParamSchema, 'params'),
    machineController.getMachine
);

router.patch(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(machineIdParamSchema, 'params'),
    validate(updateMachineSchema),
    machineController.updateMachine
);

router.delete(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(machineIdParamSchema, 'params'),
    machineController.deactivateMachine
);

export default router;