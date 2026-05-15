import jwt from "jsonwebtoken";
import config from "../config/config";
import crypto from "crypto";
import { IAuthResult, ITokenPayload } from "../modules/auth/auth.types";
import { IPublicUser } from "../modules/user/user.types";

const JWT_SECRET = config.jwt.secret || 'super_secret_key';
const JWT_EXPIRES_IN = config.jwt.expiresIn || '1h';

const OTP_LENGTH = config.otp.length || 6;

export function generateOtp () {

    const min = 10 ** (OTP_LENGTH - 1);
    const max = (10 ** OTP_LENGTH) - 1;

    return String(crypto.randomInt(min, max + 1));

};

export function generateAccessToken (user: IPublicUser): IAuthResult {
    
    const payload: ITokenPayload = {
        id: user.id,
        phone: user.phone,
        role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });

    return {
        user: payload,
        token
    };

};

export function isExpired (expires_at: Date): boolean {

    return new Date(expires_at).getTime() < Date.now();

};