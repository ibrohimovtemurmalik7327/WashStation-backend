import { Request, Response } from "express";
import authService from "./auth.service";
import sendResponse from "../../helpers/sendResponse";

class AuthController {
    registerStart = async (req: Request, res: Response): Promise<Response> => {
        const result = await authService.registerStart(req.body);
        return sendResponse(res, result, 201);
    };

    registerVerify = async (req: Request, res: Response): Promise<Response> => {
        const result = await authService.registerVerify(req.body);
        return sendResponse(res, result, 201);
    };

    login = async (req: Request, res: Response): Promise<Response> => {
        const result = await authService.login(req.body);
        return sendResponse(res, result);
    };

    changePassword = async (req: Request, res: Response): Promise<Response> => {
        const result = await authService.changePassword(req.user!.id, req.body);
        return sendResponse(res, result);
    };

    forgotPasswordStart = async (req: Request, res: Response): Promise<Response> => {
        const result = await authService.forgotPasswordStart(req.body);
        return sendResponse(res, result);
    };

    forgotPasswordVerify = async (req: Request, res: Response): Promise<Response> => {
        const result = await authService.forgotPasswordVerify(req.body);
        return sendResponse(res, result);
    };
}

export default new AuthController();