import { Request, Response } from "express";
import branchService from "./branch.service";
import sendResponse from "../../helpers/sendResponse";

class BranchController {
    createBranch = async (req: Request, res: Response) => {
        const result = await branchService.createBranch(req.body);
        return sendResponse(res, result, 201);
    };

    getBranch = async (req: Request, res: Response) => {
        const result = await branchService.getBranch(Number(req.params.id));
        return sendResponse(res, result);
    };

    getBranches = async (req: Request, res: Response) => {
        const result = await branchService.getBranches();
        return sendResponse(res, result);
    };

    getActiveBranches = async (req: Request, res: Response) => {
        const result = await branchService.getActiveBranches();
        return sendResponse(res, result);
    };

    updateBranch = async (req: Request, res: Response) => {
        const result = await branchService.updateBranch(Number(req.params.id), req.body);
        return sendResponse(res, result);
    };

    deactivateBranch = async (req: Request, res: Response) => {
        const result = await branchService.deactivateBranch(Number(req.params.id));
        return sendResponse(res, result);
    };
}

export default new BranchController();