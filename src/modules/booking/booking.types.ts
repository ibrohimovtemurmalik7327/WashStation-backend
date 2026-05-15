// ========================
// ENUMS
// ========================

export enum BookingStatus {
    PENDING   = 'pending',
    ACTIVE    = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

// ========================
// ENTITY
// ========================

export interface IBooking {
    id:         number;
    user_id:    number;
    branch_id:  number;
    date:       string;
    start_time: string;
    end_time:   string;
    total_kg:   number;
    status:     BookingStatus;
    created_at: Date;
    updated_at: Date;
}

export interface IBookingMachine {
    id:          number;
    booking_id:  number;
    machine_id:  number;
    capacity_kg: number;
}

export interface IBookingDetail extends IBooking {
    machines: IBookingMachine[];
}

// ========================
// DTO — Request body
// ========================

export interface IGetSlotsDto {
    branch_id: number;
    date:      string;  // 'YYYY-MM-DD'
    total_kg:  number;
}

export interface ICreateBookingDto {
    branch_id:  number;
    date:       string;
    start_time: string;
    total_kg:   number;
}

// ========================
// INPUT — Model layer
// ========================

export interface ICreateBookingInput {
    user_id:    number;
    branch_id:  number;
    date:       string;
    start_time: string;
    end_time:   string;
    total_kg:   number;
}

export interface ICreateBookingMachineInput {
    booking_id:  number;
    machine_id:  number;
    capacity_kg: number;
}

// ========================
// SLOT TYPES
// ========================

export interface ISlotMachine {
    machine_id:  number;
    name:        string;
    capacity_kg: number;
}

export interface ISlot {
    start_time: string;
    end_time:   string;
    machines:   ISlotMachine[];
}

// ========================
// BOOKED SLOT — DB dan
// ========================

export interface IBookedSlot {
    machine_id: number;
    start_time: string;
    end_time:   string;
}