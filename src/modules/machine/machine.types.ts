//Enums
export enum MachineStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum MachineAvailability {
    IDLE = 'idle',
    IN_USE = 'in_use'
}

//Entity
export interface IMachine {
    id: number,
    branch_id: number,
    name: string,
    capacity_kg: number,
    status: MachineStatus,
    availability: MachineAvailability,
    created_at: Date,
    updated_at: Date
}

//DTO
export interface ICreateMachineDto {
    branch_id: number,
    name: string,
    capacity_kg: number
}

export interface IUpdateMachineDto {
    branch_id?: number,
    name?: string
}