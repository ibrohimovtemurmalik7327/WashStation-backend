// ========================
// ENUMS
// ========================

export enum PaymentStatus {
    PENDING   = 'pending',
    PAID      = 'paid',
    FAILED    = 'failed',
    CANCELLED = 'cancelled',
}

// ========================
// ENTITY
// ========================

export interface IPayment {
    id:                number;
    user_id:           number;
    booking_id:        number | null;
    branch_id:         number;
    date:              string;
    start_time:        string;
    total_kg:          number;
    amount:            number;
    click_trans_id:    string | null;
    merchant_trans_id: string;
    status:            PaymentStatus;
    created_at:        Date;
    updated_at:        Date;
}

// ========================
// DTO — Request body
// ========================

export interface ICreatePaymentDto {
    branch_id:  number;
    date:       string;
    start_time: string;
    total_kg:   number;
}

// ========================
// INPUT — Model layer
// ========================

export interface ICreatePaymentInput {
    user_id:           number;
    branch_id:         number;
    date:              string;
    start_time:        string;
    total_kg:          number;
    amount:            number;
    merchant_trans_id: string;
}

// ========================
// CLICK SHOP API — Request body lar
// ========================

// Click → bizga (action=0)
export interface IClickPrepareDto {
    click_trans_id:    number;
    service_id:        number;
    click_paydoc_id:   number;
    merchant_trans_id: string;
    amount:            number;
    action:            0;
    error:             number;
    error_note:        string;
    sign_time:         string;
    sign_string:       string;
}

// Click → bizga (action=1)
export interface IClickCompleteDto {
    click_trans_id:         number;
    service_id:             number;
    click_paydoc_id:        number;
    merchant_trans_id:      string;
    merchant_prepare_id:    number;
    amount:                 number;
    action:                 1;
    error:                  number;
    error_note:             string;
    sign_time:              string;
    sign_string:            string;
}

// ========================
// CLICK SHOP API — Response lar
// ========================

export interface IClickPrepareResponse {
    click_trans_id:      number;
    merchant_trans_id:   string;
    merchant_prepare_id: number;
    error:               number;
    error_note:          string;
}

export interface IClickCompleteResponse {
    click_trans_id:    number;
    merchant_trans_id: string;
    merchant_confirm_id: number;
    error:             number;
    error_note:        string;
}

// ========================
// SERVICE RETURN TYPES
// ========================

export interface IPaymentCreateResult {
    payment_id:        number;
    amount:            number;
    merchant_trans_id: string;
    payment_url:       string;
}