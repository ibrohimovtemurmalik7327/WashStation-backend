import db from "../../db/connection";
import machineModel from "./machine.model";
import branchModel from "../branch/branch.model";
import { ICreateMachineDto, IMachine, IUpdateMachineDto, MachineStatus } from "./machine.types";
import { IServiceResponse } from "../../types/common.types";
import { BranchStatus } from "../branch/branch.types";

class MachineService {
    createMachine = async (data: ICreateMachineDto): Promise<IServiceResponse<IMachine>> => {
        try {
            return db.transaction(async(trx) => {

                const { branch_id, name } = data;

                const existingBranch = await branchModel.getBranchById(branch_id, trx);
                if (!existingBranch) {
                    return {
                        success: false,
                        error: 'BRANCH_NOT_FOUND'
                    };
                }

                if (existingBranch.status !== BranchStatus.ACTIVE) {
                    return {
                        success: false,
                        error: 'BRANCH_INACTIVE'
                    };
                }

                const existingName = await machineModel.getMachineByBranchAndName(branch_id, name, trx);
                if (existingName) {
                    return {
                        success: false,
                        error: 'MACHINE_NAME_CONFLICT'
                    };
                }

                const machine = await machineModel.createMachine(data, trx);
                if (!machine) {
                    return {
                        success: false,
                        error: 'INTERNAL_ERROR'
                    };
                }

                return {
                    success: true,
                    data: machine
                };
            })
        } catch (error) {
            console.error('MachineService.createMachine error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    getMachine = async (id: number): Promise<IServiceResponse<IMachine>> => {
        try {
            const machine = await machineModel.getMachineById(id);
            if (!machine) {
                return {
                    success: false,
                    error: 'MACHINE_NOT_FOUND'
                };
            }

            return {
                success: true,
                data: machine
            };
        } catch (error) {
            console.error('MachineService.getMachine error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    getActiveMachinesByBranch = async (branch_id: number): Promise<IServiceResponse<IMachine[]>> => {
        try {
            const existingBranch = await branchModel.getBranchById(branch_id);
            if (!existingBranch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND'
                };
            }

            if (existingBranch.status !== BranchStatus.ACTIVE) {
                return {
                    success: false,
                    error: 'BRANCH_INACTIVE'
                };
            }

            const activeMachines = await machineModel.getActiveMachinesByBranch(branch_id);
            return {
                success: true,
                data: activeMachines
            };
        } catch (error) {
            console.error('MachineService.getActiveMachinesByBranch error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    getMachinesByBranch = async (branch_id: number): Promise<IServiceResponse<IMachine[]>> => {
        try {
            const existingBranch = await branchModel.getBranchById(branch_id);
            if (!existingBranch) {
                return {
                    success: false,
                    error: 'BRANCH_NOT_FOUND'
                };
            }

            if (existingBranch.status !== BranchStatus.ACTIVE) {
                return {
                    success: false,
                    error: 'BRANCH_INACTIVE'
                };
            }

            const machines = await machineModel.getMachinesByBranch(branch_id);
            return {
                success: true,
                data: machines
            };
        } catch (error) {
            console.error('MachineService.getMachinesByBranch error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    updateMachine = async (id: number, data: IUpdateMachineDto): Promise<IServiceResponse<IMachine>> => {
        try {
            return db.transaction(async(trx) => {
                const machine = await machineModel.getMachineById(id, trx);
                if (!machine) {
                    return { 
                        success: false, 
                        error: 'MACHINE_NOT_FOUND' 
                    };
                }

                if (machine.status === MachineStatus.INACTIVE) {
                    return { 
                        success: false, 
                        error: 'MACHINE_INACTIVE' 
                    };
                }

                if (data.branch_id) {
                    const existingBranch = await branchModel.getBranchById(data.branch_id, trx);
                    if (!existingBranch) {
                        return { 
                            success: false, 
                            error: 'BRANCH_NOT_FOUND' 
                        };
                    }

                    if (existingBranch.status !== BranchStatus.ACTIVE) {
                        return {
                            success: false,
                            error: 'BRANCH_INACTIVE'
                        };
                    }
                }

                if (data.name) {
                    const branchId = data.branch_id || machine.branch_id;
                    const existingMachine = await machineModel.getMachineByBranchAndName(branchId, data.name, trx);
                    if (existingMachine && existingMachine.id !== id) {
                        return { 
                            success: false, 
                            error: 'MACHINE_NAME_CONFLICT' 
                        };
                    }
                }

                const result = await machineModel.updateMachine(id, data, trx);
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
            console.error('MachineService.updateMachine error:', error);
            return { 
                success: false, 
                error: 'INTERNAL_ERROR' 
            };
        }
    };

    deactivateMachine = async (id: number): Promise<IServiceResponse<IMachine>> => {
        try {
            return db.transaction(async(trx) => {

                const machine = await machineModel.getMachineById(id, trx);
                if (!machine) {
                    return {
                        success: false,
                        error: 'MACHINE_NOT_FOUND'
                    };
                }

                const result = await machineModel.deactivateMachine(id, trx);
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
            console.error('MachineService.deactivateMachine error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };
}

export default new MachineService();