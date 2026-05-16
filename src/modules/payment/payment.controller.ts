import { Request, Response } from "express";
import paymentService from "./payment.service";
import sendResponse from "../../helpers/sendResponse";

class PaymentController {

    createPayment = async (req: Request, res: Response): Promise<Response> => {
        const result = await paymentService.createPayment(req.user!.id, req.body);
        return sendResponse(res, result, 201);
    };

    prepare = async (req: Request, res: Response): Promise<Response> => {
        const result = await paymentService.prepare(req.body);
        return res.status(200).json(result);
    };

    complete = async (req: Request, res: Response): Promise<Response> => {
        const result = await paymentService.complete(req.body);
        return res.status(200).json(result);
    };

    getMyPayments = async (req: Request, res: Response): Promise<Response> => {
        const result = await paymentService.getMyPayments(req.user!.id);
        return sendResponse(res, result);
    };

}

export default new PaymentController();