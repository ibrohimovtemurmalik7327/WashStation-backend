import { Request, Response } from "express";
import bookingService from "./booking.service";
import sendResponse from "../../helpers/sendResponse";

class BookingController {

    getSlots = async (req: Request, res: Response): Promise<Response> => {
        const result = await bookingService.getSlots(req.body);
        return sendResponse(res, result);
    };

    createBooking = async (req: Request, res: Response): Promise<Response> => {
        const result = await bookingService.createBooking(req.user!.id, req.body);
        return sendResponse(res, result, 201);
    };

    getMyBookings = async (req: Request, res: Response): Promise<Response> => {
        const result = await bookingService.getMyBookings(req.user!.id);
        return sendResponse(res, result);
    };

    getMyBookingById = async (req: Request, res: Response): Promise<Response> => {
        const result = await bookingService.getMyBookingById(req.user!.id, Number(req.params.id));
        return sendResponse(res, result);
    };

    cancelBooking = async (req: Request, res: Response): Promise<Response> => {
        const result = await bookingService.cancelBooking(req.user!.id, Number(req.params.id));
        return sendResponse(res, result);
    };

    getBookingsByBranch = async (req: Request, res: Response): Promise<Response> => {
        const result = await bookingService.getBookingsByBranch(
            Number(req.params.branch_id),
            req.query.date as string | undefined
        );
        return sendResponse(res, result);
    };

    completeBooking = async (req: Request, res: Response): Promise<Response> => {
        const result = await bookingService.completeBooking(Number(req.params.id));
        return sendResponse(res, result);
    };

}

export default new BookingController();