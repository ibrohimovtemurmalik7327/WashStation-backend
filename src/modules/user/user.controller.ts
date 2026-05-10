import { Request, Response } from "express";

import userService from "./user.service";
import sendResponse from "../../helpers/sendResponse.helper";

class UserController {
    createUser = async (req: Request, res: Response): Promise<Response> => {
        const result = await userService.createUser(req.body);
        return sendResponse(res, result, 201);
    };

    getUser = async (req: Request, res: Response): Promise<Response> => {
        const result = await userService.getUser(Number(req.params.id));
        return sendResponse(res, result);
    };

    getUsers = async (req: Request, res: Response): Promise<Response> => {
        const result = await userService.getUsers();
        return sendResponse(res, result);
    };

    updateUser = async (req: Request, res: Response): Promise<Response> => {
        const result = await userService.updateUser(Number(req.params.id), req.body);
        return sendResponse(res, result);
    };

    deactivateUser = async (req: Request, res: Response): Promise<Response> => {
        const result = await userService.deactivateUser(Number(req.params.id));
        return sendResponse(res, result);
    };
}

export default new UserController();