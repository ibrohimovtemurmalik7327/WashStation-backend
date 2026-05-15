import authModel from "./auth.model";
import db from "../../db/connection";
import config from "../../config/config";
import bcrypt from "bcryptjs";
import { 
    IAuthResult, 
    IChangePasswordDto, 
    IForgotPasswordStartDto, 
    IForgotPasswordVerifyDto, 
    ILoginDto, 
    IRegisterStartDto, 
    ITicketResult, 
    IVerifyDto, 
    OtpPurpose, 
    TicketStatus } from "./auth.types";
import { IServiceResponse } from "../../types/common.types";
import userModel from "../user/user.model";
import { generateAccessToken, generateOtp, isExpired } from "../../helpers/authHelper";
import { IPublicUser, UserStatus } from "../user/user.types";

const BCRYPT_COST = config.bcrypt.cost || 10;

const OTP_TTL_MS = config.otp.ttl || 5 * 60 * 1000;

class AuthService {
    registerStart = async (data: IRegisterStartDto): Promise<IServiceResponse<ITicketResult>> => {
        try {
            return db.transaction(async(trx) => {

                const { username, phone, password } = data;

                const existingUsername = await userModel.getUserByUsername(username);
                if (existingUsername) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT'
                    };
                }

                const existingPhone = await userModel.getUserByPhone(phone);
                if (existingPhone) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT'
                    };
                }

                const activeTicket = await authModel.getPendingTicketByTypeAndPhone(OtpPurpose.REGISTER, phone, trx);
                if (activeTicket) {
                    if (isExpired(activeTicket.expires_at)) {
                        await authModel.expireTicket(activeTicket.id);
                    } else {
                        return {
                            success: false,
                            error: 'ACTIVE_TICKET_EXISTS',
                            data: {
                                ticket_id: activeTicket.id,
                                expires_at: activeTicket.expires_at
                            }
                        };
                    }
                }

                const otp = generateOtp();
                const code_hash = await bcrypt.hash(otp, BCRYPT_COST);
                const password_hash = await bcrypt.hash(password, BCRYPT_COST);
                const expires_at = new Date(Date.now() + OTP_TTL_MS);

                const ticket = await authModel.createTicket({
                    type: OtpPurpose.REGISTER,
                    username,
                    phone,
                    code_hash,
                    password_hash,
                    expires_at
                }, trx);

                console.log(`Register OTP for ${ phone }: ${ otp }`);
                
                return {
                    success: true,
                    data: {
                        ticket_id: ticket.id,
                        expires_at: ticket.expires_at
                    }
                };
            });
        } catch (error: any) {
            console.error('AuthService.registerStart error:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message?.includes('username')) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT'
                    };
                }

                if (error.message?.includes('phone')) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT'
                    };
                }

                return {
                    success: false,
                    error: 'CONFLICT'
                };
            }

            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    registerVerify = async (data: IVerifyDto): Promise<IServiceResponse<IAuthResult>> => {
        try {
            return db.transaction(async(trx) => {

                const { ticket_id, code } = data;

                const ticket = await authModel.getTicketById(ticket_id, trx);
                if (!ticket) {
                    return {
                        success: false,
                        error: 'TICKET_NOT_FOUND'
                    };
                }

                if (ticket.type !== OtpPurpose.REGISTER) {
                    return {
                        success: false,
                        error: 'BAD_REQUEST'
                    };
                }

                if (ticket.status !== TicketStatus.PENDING) {
                    return {
                        success: false,
                        error: 'TICKET_NOT_PENDING'
                    };
                }

                if (isExpired(ticket.expires_at)) {
                    await authModel.expireTicket(ticket.id, trx);

                    return {
                        success: false,
                        error: 'TICKET_EXPIRED'
                    };
                }

                if (ticket.attempts >= ticket.max_attempts) {
                    await authModel.expireTicket(ticket.id, trx);

                    return {
                        success: false,
                        error: 'TOO_MANY_ATTEMPTS'
                    };
                }

                const isMatch = await bcrypt.compare(code, ticket.code_hash);
                if (!isMatch) {
                    await authModel.incrementAttempts(ticket.id, trx);

                    const nextAttempts = ticket.attempts + 1;
                    if (nextAttempts >= ticket.max_attempts) {
                        await authModel.expireTicket(ticket.id, trx);
                    }

                    return {
                        success: false,
                        error: 'INVALID_CODE'
                    };
                }

                const existingPhone = await userModel.getUserByPhone(ticket.phone);
                if (existingPhone) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT'
                    };
                } 

                if (ticket.username) {
                    const existingUsername = await userModel.getUserByUsername(ticket.username);

                    if (existingUsername) {
                        return {
                            success: false,
                            error: 'USERNAME_CONFLICT'
                        };
                    }
                }

                const user = await userModel.createUser({
                    username: ticket.username!,
                    phone: ticket.phone,
                    password_hash: ticket.password_hash!
                }, trx);

                const consumed = await authModel.consumeTicket(ticket.id, trx);
                if (!consumed) {
                    throw new Error('Failed to consume register ticket');
                }

                const authResult = generateAccessToken(user);

                return {
                    success: true,
                    data: authResult
                };
            });
        } catch (error: any) {
            console.error('AuthService.registerVerify error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message?.includes('phone')) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT',
                    };
                }

                if (error.message?.includes('username')) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT',
                    };
                }

                return {
                    success: false,
                    error: 'CONFLICT',
                };
            }

            return {
                success: false,
                error: 'INTERNAL_ERROR',
            };
        }
    };

    login = async (data: ILoginDto): Promise<IServiceResponse<IAuthResult>> => {
        try {
                const { phone, password } = data;

                const user = await userModel.getByPhoneWithPassword(phone);
                if (!user) {
                    return {
                        success: false,
                        error: 'USER_NOT_FOUND'
                    };
                }

                if (user.status !== UserStatus.ACTIVE) {
                    return {
                        success: false,
                        error: 'USER_INACTIVE'
                    };
                }

                const isMatch = await bcrypt.compare(password, user.password_hash);
                if (!isMatch) {
                    return {
                        success: false,
                        error: 'INVALID_CREDENTIALS'
                    };
                }

                const authResult = generateAccessToken(user);

                return {
                    success: true,
                    data: authResult
                };

        } catch (error) {
            console.error('AuthService.login error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    changePassword = async (user_id: number, data: IChangePasswordDto): Promise<IServiceResponse<IPublicUser>> => {
        try {
            const user = await userModel.getByIdWithPassword(user_id);
            if (!user) {
                return { success: false, error: 'USER_NOT_FOUND' };
            }

            if (user.status !== UserStatus.ACTIVE) {
                return { success: false, error: 'USER_INACTIVE' };
            }

            const { old_password, new_password } = data;

            const isMatch = await bcrypt.compare(old_password, user.password_hash);
            if (!isMatch) {
                return { success: false, error: 'INCORRECT_PASSWORD' };
            }

            const isSame = await bcrypt.compare(new_password, user.password_hash);
            if (isSame) {
                return { success: false, error: 'SAME_PASSWORD' };
            }

            const newPasswordHash = await bcrypt.hash(new_password, BCRYPT_COST);
            const updated = await userModel.changeUserPassword(user_id, newPasswordHash);

            if (!updated) {
                return { success: false, error: 'INTERNAL_ERROR' };
            }

            return { success: true, data: updated };

        } catch (error) {
            console.error('AuthService.changePassword error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

    forgotPasswordStart = async (data: IForgotPasswordStartDto): Promise<IServiceResponse<ITicketResult>> => {
        try {
            return db.transaction(async(trx) => {
                const { phone } = data;

                const user = await userModel.getUserByPhone(phone);
                if (!user) {
                    return {
                        success: false,
                        error: 'USER_NOT_FOUND'
                    };
                }

                if (user.status !== UserStatus.ACTIVE) {
                    return {
                        success: false,
                        error: 'USER_INACTIVE'
                    };
                }

                const activeTicket = await authModel.getPendingTicketByTypeAndPhone(OtpPurpose.RESET_PASSWORD, phone, trx);
                if (activeTicket) {
                    if (isExpired(activeTicket.expires_at)) {
                        await authModel.expireTicket(activeTicket.id, trx);
                    } else {
                        return {
                            success: false,
                            error: 'ACTIVE_TICKET_EXISTS'
                        };
                    }
                }

                const otp = generateOtp();
                const code_hash = await bcrypt.hash(otp, BCRYPT_COST);
                const expires_at = new Date(Date.now() + OTP_TTL_MS);

                const ticket = await authModel.createTicket({
                    type: OtpPurpose.RESET_PASSWORD,
                    phone,
                    code_hash,
                    expires_at,
                }, trx);

                console.log(`RESET PASSWORD OTP for ${ phone }: ${ otp }`);
                
                return {
                    success: true,
                    data: {
                        ticket_id: ticket.id,
                        expires_at: ticket.expires_at
                    }
                };
            });
        } catch (error) {
            console.error('AuthService.forgotPasswordStart error:', error);
            
            return {
                success: false,
                error: 'INTERNAL_ERROR'
            };
        }
    };

    forgotPasswordVerify = async (data: IForgotPasswordVerifyDto): Promise<IServiceResponse<IPublicUser>> => {
        try {
            return db.transaction(async(trx) => {
                const { ticket_id, code, new_password } = data;
            
                const ticket = await authModel.getTicketById(ticket_id, trx);
                if (!ticket) {
                    return { success: false, error: 'TICKET_NOT_FOUND' };
                }

                if (ticket.type !== OtpPurpose.RESET_PASSWORD) {
                    return { success: false, error: 'BAD_REQUEST' };
                }

                if (ticket.status !== TicketStatus.PENDING) {
                    return { success: false, error: 'TICKET_NOT_PENDING' };
                }

                if (isExpired(ticket.expires_at)) {
                    await authModel.expireTicket(ticket.id, trx);
                    return { success: false, error: 'TICKET_EXPIRED' };
                }

                if (ticket.attempts >= ticket.max_attempts) {
                    await authModel.expireTicket(ticket.id, trx);
                    return { success: false, error: 'TOO_MANY_ATTEMPTS' };
                }

                // OTP tekshiruvi
                const isMatch = await bcrypt.compare(code, ticket.code_hash);
                if (!isMatch) {
                    await authModel.incrementAttempts(ticket.id, trx);

                    const nextAttempts = ticket.attempts + 1;
                    if (nextAttempts >= ticket.max_attempts) {
                        await authModel.expireTicket(ticket.id, trx);
                    }

                    return { success: false, error: 'INVALID_CODE' };
                }

                // OTP to'g'ri — faqat shu yerdan keyin user ma'lumotlari olinadi
                const user = await userModel.getByPhoneWithPassword(ticket.phone);
                if (!user) {
                    return { success: false, error: 'USER_NOT_FOUND' };
                }

                if (user.status !== UserStatus.ACTIVE) {
                    return { success: false, error: 'USER_INACTIVE' };
                }

                const isSame = await bcrypt.compare(new_password, user.password_hash);
                if (isSame) {
                    return { success: false, error: 'SAME_PASSWORD' };
                }

                const newPasswordHash = await bcrypt.hash(new_password, BCRYPT_COST);

                // consumeTicket OLDIN, keyin password update
                const consumed = await authModel.consumeTicket(ticket.id, trx);
                if (!consumed) {
                    throw new Error('Failed to consume reset password ticket');
                }

                const updated = await userModel.changeUserPassword(user.id, newPasswordHash, trx);
                if (!updated) {
                    throw new Error('Failed to update password');
                }

                return { success: true, data: updated };
            });
            
        } catch (error) {
            console.error('AuthService.forgotPasswordVerify error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };
}

export default new AuthService();