import { Response } from "express";

import { IServiceResponse } from "../types/common.types";

const ERROR_STATUS: Record<string, number> = {

  // Generic
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500,

  // Auth
  UNAUTHORIZED: 401,
  TOKEN_MISSING: 401,
  TOKEN_INVALID: 401,
  TOKEN_EXPIRED: 401,
  INVALID_CREDENTIALS: 401,
  INCORRECT_PASSWORD: 400,
  SAME_PASSWORD: 409,
  ACTIVE_TICKET_EXISTS: 409,
  TICKET_NOT_FOUND: 404,
  TICKET_NOT_PENDING: 409,
  TICKET_EXPIRED: 410,
  INVALID_CODE: 422,
  TOO_MANY_ATTEMPTS: 429,

  // User
  USER_NOT_FOUND: 404,
  USER_INACTIVE: 403,
  USER_ALREADY_INACTIVE: 409,
  USERNAME_CONFLICT: 409,
  PHONE_CONFLICT: 409,
  CONFLICT: 409,

  // Branch
  BRANCH_NOT_FOUND: 404,
  BRANCH_INACTIVE: 403,
  BRANCH_PHONE_CONFLICT: 409,

  // Machine
  MACHINE_NOT_FOUND: 404,
  MACHINE_INACTIVE: 403,
  MACHINE_NAME_CONFLICT: 409,

  // Booking
  BOOKING_NOT_FOUND: 404,
  BOOKING_ALREADY_CANCELLED: 409,
  BOOKING_ALREADY_COMPLETED: 409,
  BOOKING_ALREADY_STARTED: 409,
  NO_ACTIVE_MACHINES: 409,
  NO_AVAILABLE_COMBINATION: 409,
  INVALID_START_TIME: 400,

  // Payment
  PAYMENT_NOT_FOUND: 404,
  PAYMENT_ALREADY_PAID: 409,
  PAYMENT_CANCELLED: 409,
  PAYMENT_FAILED: 402,

  // Forbidden
  FORBIDDEN: 403,

};

const sendResponse = <T>(res: Response, result: IServiceResponse<T>, successStatus = 200) => {
    if (!result || result.success !== true) {
        const errorCode = result?.error || 'INTERNAL_ERROR';
        const status = ERROR_STATUS[errorCode] || 500;

        return res.status(status).json({
            success: false,
            error: errorCode
        });
    }

    return res.status(successStatus).json({
        success: true,
        data: result.data
    });
};

export default sendResponse;