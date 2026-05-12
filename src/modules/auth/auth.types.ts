import { UserRole } from "../user/user.types";

//Enums
export enum OtpPurpose {
    REGISTER = 'register',
    RESET_PASSWORD = 'reset_password'
}

export enum TicketStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    EXPIRED = 'expired',
    CONSUMED = 'consumed'
}

//Entity
export interface ITicket {
    id: number,
    type: OtpPurpose,
    username: string | null,
    phone: string,
    code_hash: string,
    password_hash: string | null,
    attempts: number,
    max_attempts: number,
    expires_at: Date,
    status: TicketStatus,
    created_at: Date
}

//Input
export interface ICreateTicketInput {
    type: OtpPurpose,
    username?: string | null,
    phone: string,
    code_hash: string,
    password_hash?: string,
    expires_at: Date
}

//DTO
export interface IRegisterStartDto {
    phone: string,
    password: string,
    username: string
}

export interface IVerifyDto {   
    ticket_id: number,
    code: string
}

export interface ILoginDto {
    phone: string,
    password: string
}

export interface IChangePasswordDto {
    old_password: string,
    new_password: string
}

export interface IForgotPasswordStartDto {
    phone: string
}

export interface IForgotPasswordVerifyDto {
    ticket_id: number,
    code: string,
    new_password: string
}

//JWT
export interface ITokenPayload {
    id: number,
    phone: string,
    role: UserRole
}

//Service return types
export interface ITicketResult {
    ticket_id: number,
    expires_at: Date
}

export interface IInvalidCodeResult {
    attempts_left: number
}

export interface IAuthResult {
    user: ITokenPayload,
    token: string
}