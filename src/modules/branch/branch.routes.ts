import express from 'express';
import branchController from './branch.controller';
import { validate } from '../../middlewares/validate.middleware';
import { roleRequired } from '../../middlewares/auth.middleware';
import { 
    idParamSchema, 
    createBranchSchema,
    updateBranchSchema
} from './branch.val';
import { UserRole } from '../user/user.types';

const router = express.Router();

router.post(
    '/',
    roleRequired(UserRole.ADMIN),
    validate(createBranchSchema),
    branchController.createBranch
);

router.get(
    '/',
    roleRequired(UserRole.ADMIN),
    branchController.getBranches
);

router.get(
    '/active',
    roleRequired(UserRole.ADMIN, UserRole.USER),
    branchController.getActiveBranches
);

router.get(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(idParamSchema, 'params'),
    branchController.getBranch
);

router.patch(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(idParamSchema, 'params'),
    validate(updateBranchSchema),
    branchController.updateBranch
);

router.delete(
    '/:id',
    roleRequired(UserRole.ADMIN),
    validate(idParamSchema, 'params'),
    branchController.deactivateBranch
);

export default router;