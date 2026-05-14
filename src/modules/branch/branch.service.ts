import db from "../../db/connection";
import { IServiceResponse } from "../../types/common.types";
import branchModel from "./branch.model";
import { IBranch, ICreateBranchDto, IUpdateBranchDto } from "./branch.types";

class BranchService {
    createBranch = async (data: ICreateBranchDto): Promise<IServiceResponse<IBranch>> => {
        try {
            return db.transaction(async(trx) => {
                const { phone } = data;

                const existingPhone = await branchModel.getBranchByPhone(phone);
                if (existingPhone) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT'
                    };
                }

                const result = await branchModel.createBranch(data, trx);
                if (!result) {
                    return {
                        success: false,
                        error: 'INTERNAL_ERROR'
                    };
                }

                return {
                    success: true,
                    data: result
                };
            });
        } catch (error: any) {
            console.error('BranchService.createBranch error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    getBranch = async (id: number): Promise<IServiceResponse<IBranch>> => {
        try {
            const branch = await branchModel.getBranchById(id);
            if (!branch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND'
                };
            }

            return {
                success: true,
                data: branch
            };
        } catch (error) {
            console.error('BranchService.getBranch error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    getBranches = async (): Promise<IServiceResponse<IBranch[]>> => {
        try {
            const branches = await branchModel.getBranches();

            return {
                success: true,
                data: branches
            };
        } catch (error) {
            console.error('BranchService.getBranches error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    getActiveBranches = async (): Promise<IServiceResponse<IBranch[]>> => {
        try {
            const activeBranches = await branchModel.getActiveBranches();

            return {
                success: true,
                data: activeBranches
            };
        } catch (error) {
            console.error('BranchService.getActiveBranches error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    updateBranch = async (id: number, data: IUpdateBranchDto): Promise<IServiceResponse<IBranch>> => {
        try {
            return db.transaction(async(trx) => {

                const branch = await branchModel.getBranchById(id, trx);
                if (!branch) {
                    return {
                        success: false,
                        error: 'BRANCH_NOT_FOUND'
                    };
                }

                if (data.phone) {
                    const existingPhone = await branchModel.getBranchByPhone(data.phone);

                    if (existingPhone && existingPhone.id !== id) {
                        return {
                            success: false,
                            error: 'PHONE_CONFLICT'
                        };
                    }
                }

                const result = await branchModel.updateBranch(id, data, trx);
                if (!result) {
                    return {
                        success: false,
                        error: 'INTERNAL_ERROR'
                    };
                }

                return {
                    success: true, 
                    data: result
                };
            });
        } catch (error) {
            console.error('BranchService.updateBranch error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    deactivateBranch = async (id: number): Promise<IServiceResponse<IBranch>> => {
        try {
            return db.transaction(async(trx) => {

                const branch = await branchModel.getBranchById(id, trx);
                if (!branch) {
                    return {
                        success: false,
                        error: 'BRANCH_NOT_FOUND'
                    };
                }

                const result = await branchModel.deactivateBranch(id, trx);
                if (!result) {
                    return {
                        success: false,
                        error: 'INTERNAL_ERROR'
                    };
                }

                return {
                    success: true,
                    data: result
                };
            });
        } catch (error) {
            console.error('BranchService.deactivateBranch error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };
}

export default new BranchService();