// ========================
// ENUM TYPES
// ========================

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum OtpPurpose {
  REGISTER = 'register',
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
}

// ========================
// DATABASE ENTITY
// ========================

export interface IUser {
  id: number;
  phone: string;
  password: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

// ========================
// DTO — Request body lar
// ========================

export interface IRegisterDto {
  phone: string;
  password: string;
  username: string;
}

export interface ILoginDto {
  phone: string;
  password: string;
}

export interface IVerifyOtpDto {
  phone: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface ISendOtpDto {
  phone: string;
  purpose: OtpPurpose;
}

export interface IChangePasswordDto {
  old_password: string;
  new_password: string;
}

export interface IResetPasswordDto {
  phone: string;
  otp: string;
  new_password: string;
}

// ========================
// JWT
// ========================

export interface ITokenPayload {
  id: number;
  phone: string;
  role: UserRole;
}

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

// ========================
// OTP
// ========================

export interface IOtp {
  id: number;
  phone: string;
  otp_code: string;
  purpose: OtpPurpose;
  attempts: number;
  is_used: boolean;
  expires_at: Date;
  created_at: Date;
}

// ========================
// SERVICE RETURN TYPES
// ========================

export interface IAuthResult {
  user: Omit<IUser, 'password'>;
  tokens: ITokens;
}

export interface IOtpResult {
  message: string;
  expires_in: number;  // seconds
}