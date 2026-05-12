import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import userModel from "../modules/user/user.model";
import { ITokenPayload } from "../modules/auth/auth.types";
import { UserRole, UserStatus } from "../modules/user/user.types";

export const authRequired = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ success: false, error: 'TOKEN_MISSING' });
            return;
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({ success: false, error: 'TOKEN_INVALID' });
            return;
        }

        const token = parts[1];

        let payload: ITokenPayload;

        try {
            payload = jwt.verify(token, config.jwt.secret) as ITokenPayload;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ success: false, error: 'TOKEN_EXPIRED' });
                return;
            }

            res.status(401).json({ success: false, error: 'TOKEN_INVALID' });
            return;
        }

        const user = await userModel.getUserById(payload.id);

        if (!user) {
            res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
            return;
        }

        if (user.status !== UserStatus.ACTIVE) {
            res.status(403).json({ success: false, error: 'USER_INACTIVE' });
            return;
        }

        req.user = {
            id:    user.id,
            phone: user.phone,
            role:  user.role
        };

        next();

    } catch (error) {
        console.error('authRequired error:', error);
        res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
};

export const roleRequired = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {

        if (!req.user) {
            res.status(401).json({ success: false, error: 'AUTH_REQUIRED' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, error: 'FORBIDDEN' });
            return;
        }

        next();
    };
};