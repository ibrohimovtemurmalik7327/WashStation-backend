//Enums
export enum BranchStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

//Entity
export interface IBranch {
    id: number,
    name: string,
    phone: string,
    address: string,
    latitude: number,
    longitude: number,
    status: BranchStatus,
    created_at: Date,
    updated_at: Date
}

//DTO
export interface ICreateBranchDto {
    name: string,
    phone: string,
    address: string,
    latitude?: number,
    longitude?: number
}

export interface IUpdateBranchDto {
    name?: string,
    phone?: string,
    address?: string,
    latitude?: number,
    longitude?: number
}

