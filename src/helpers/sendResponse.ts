import { Response } from "express";

import { IServiceResponse } from "../types/common.types";

const ERROR_STATUS: Record<string, number> = {
  // Validation
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  INCORRECT_PASSWORD: 400,

  // Auth
  UNAUTHORIZED: 401,
  TOKEN_MISSING: 401,
  TOKEN_INVALID: 401,
  TOKEN_EXPIRED: 401,

  // Forbidden
  FORBIDDEN: 403,
  USER_INACTIVE: 403,

  // Not found
  USER_NOT_FOUND: 404,

  // Conflict
  CONFLICT: 409,
  USERNAME_CONFLICT: 409,
  PHONE_CONFLICT: 409,
  USER_ALREADY_INACTIVE: 409,
  ACTIVE_TICKET_EXISTS: 409,
  TICKET_NOT_PENDING: 409,
  SAME_PASSWORD: 409,

  // Ticket errors
  TICKET_NOT_FOUND: 404,
  TICKET_EXPIRED: 410,
  INVALID_CODE: 422,
  TOO_MANY_ATTEMPTS: 429,

  // Credentials
  INVALID_CREDENTIALS: 401,

  // Server
  INTERNAL_ERROR: 500,
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