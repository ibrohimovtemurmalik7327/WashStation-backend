import { Request, Response } from "express";
import machineService from "./machine.service";
import sendResponse from "../../helpers/sendResponse";

class MachineController {
    createMachine = async (req: Request, res: Response): Promise<Response> => {
        const result = await machineService.createMachine(req.body);
        return sendResponse(res, result, 201);
    };

    getMachine = async (req: Request, res: Response): Promise<Response> => {
        const result = await machineService.getMachine(Number(req.params.id));
        return sendResponse(res, result);
    };

    getActiveMachinesByBranch = async (req: Request, res: Response): Promise<Response> => {
        const result = await machineService.getActiveMachinesByBranch(Number(req.params.branch_id));
        return sendResponse(res, result);
    };

    getMachinesByBranch = async (req: Request, res: Response): Promise<Response> => {
        const result = await machineService.getMachinesByBranch(Number(req.params.branch_id));
        return sendResponse(res, result);
    };

    updateMachine = async (req: Request, res: Response): Promise<Response> => {
        const result = await machineService.updateMachine(Number(req.params.id), req.body);
        return sendResponse(res, result);
    };

    deactivateMachine = async (req: Request, res: Response): Promise<Response> => {
        const result = await machineService.deactivateMachine(Number(req.params.id));
        return sendResponse(res, result);
    };
}

export default new MachineController();