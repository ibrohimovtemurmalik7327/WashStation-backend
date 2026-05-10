//Enums
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

//DB types
export interface IUser {
    id: number,
    username: string,
    phone: string,
    password_hash: string,
    role: UserRole,
    status: UserStatus,
    created_at: Date,
    updated_at: Date
}

export interface IPublicUser {
    id: number,
    username: string,
    phone: string,
    role: UserRole,
    status: UserStatus,
    created_at: Date,
    updated_at: Date
}

//Dto
export interface ICreateUserDto {
    username: string,
    phone: string,
    password: string
}

export interface IUpdateUserDto {
    username?: string,
    phone?: string
}

//Input
export interface ICreateUserInput {
    username: string,
    phone: string,
    password_hash: string
}

export interface IUpdateUserInput {
    username?: string,
    phone?: string
}
