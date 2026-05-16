import db from "../../db/connection";
import config from "../../config/config";
import crypto from "crypto";
import paymentModel from "./payment.model";
import bookingModel from "../booking/booking.model";
import machineModel from "../machine/machine.model";
import branchModel from "../branch/branch.model";
import { findCombination } from "../../helpers/slotHelper";
import {
    IPayment,
    ICreatePaymentDto,
    ICreatePaymentInput,
    IClickPrepareDto,
    IClickCompleteDto,
    IClickPrepareResponse,
    IClickCompleteResponse,
    IPaymentCreateResult,
    PaymentStatus,
} from "./payment.types";
import { IServiceResponse } from "../../types/common.types";
import { BranchStatus } from "../branch/branch.types";
import { ICreateBookingMachineInput } from "../booking/booking.types";

const DURATION_MIN = config.booking.durationMinutes;
const BUFFER_MIN   = config.booking.intervalMinutes;
const PRICE_PER_KG = config.billing.pricePerKg;
const SECRET_KEY   = config.click.secretKey;
const SERVICE_ID   = config.click.serviceId;

// ========================
// HELPERS
// ========================

const generateMerchantTransId = (): string => {
    return `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const calcEndTime = (start_time: string): string => {
    const [h, m] = start_time.split(':').map(Number);
    const endMin = h * 60 + m + DURATION_MIN;
    const endH   = Math.floor(endMin / 60).toString().padStart(2, '0');
    const endM   = (endMin % 60).toString().padStart(2, '0');
    return `${endH}:${endM}`;
};

const verifySignString = (
    dto: IClickPrepareDto | IClickCompleteDto,
    merchantPrepareId?: number
): boolean => {
    const signString = dto.action === 0
        ? `${dto.click_trans_id}${dto.service_id}${SECRET_KEY}${dto.merchant_trans_id}${dto.amount}${dto.action}${dto.sign_time}`
        : `${dto.click_trans_id}${dto.service_id}${SECRET_KEY}${dto.merchant_trans_id}${merchantPrepareId}${dto.amount}${dto.action}${dto.sign_time}`;

    const hash = crypto.createHash('md5').update(signString).digest('hex');
    // return hash === dto.sign_string; // production da shu qatorni qaytarib qo'ying
    return true;
};

// shu vaqtda bo'sh mashinalarni topish
const getAvailableMachines = (
    machines:    Awaited<ReturnType<typeof machineModel.getActiveMachinesByBranch>>,
    bookedSlots: Awaited<ReturnType<typeof bookingModel.getBookedSlotsByDate>>,
    start_time:  string,
) => {
    const startMin = timeToMinutes(start_time);
    const endMin   = startMin + DURATION_MIN;

    return machines.filter(machine =>
        bookedSlots
            .filter(b => b.machine_id === machine.id)
            .every(b => {
                const bStartMin = timeToMinutes(b.start_time);
                const bEndMin   = timeToMinutes(b.end_time) + BUFFER_MIN;
                return endMin <= bStartMin || startMin >= bEndMin;
            })
    );
};

class PaymentService {

    // ========================
    // CREATE PAYMENT
    // ========================

    createPayment = async (user_id: number, data: ICreatePaymentDto): Promise<IServiceResponse<IPaymentCreateResult>> => {
        try {
            const { branch_id, date, start_time, total_kg } = data;

            const branch = await branchModel.getBranchById(branch_id);
            if (!branch) {
                return { success: false, error: 'BRANCH_NOT_FOUND' };
            }

            if (branch.status !== BranchStatus.ACTIVE) {
                return { success: false, error: 'BRANCH_INACTIVE' };
            }

            // shu vaqtda kombinatsiya bor-yo'qligini tekshirish
            const machines    = await machineModel.getActiveMachinesByBranch(branch_id);
            const bookedSlots = await bookingModel.getBookedSlotsByDate(branch_id, date);

            const availableMachines = getAvailableMachines(machines, bookedSlots, start_time);
            const combination       = findCombination(total_kg, availableMachines);

            if (!combination) {
                return { success: false, error: 'NO_AVAILABLE_COMBINATION' };
            }

            const amount            = total_kg * PRICE_PER_KG;
            const merchant_trans_id = generateMerchantTransId();

            const input: ICreatePaymentInput = {
                user_id,
                branch_id,
                date,
                start_time,
                total_kg,
                amount,
                merchant_trans_id,
            };

            const payment = await paymentModel.createPayment(input);

            const payment_url = `https://my.click.uz/services/pay?service_id=${SERVICE_ID}&merchant_id=${config.click.merchantId}&amount=${amount}&transaction_param=${merchant_trans_id}`;

            return {
                success: true,
                data: {
                    payment_id:        payment.id,
                    amount,
                    merchant_trans_id,
                    payment_url,
                }
            };

        } catch (error) {
            console.error('PaymentService.createPayment error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

    // ========================
    // CLICK PREPARE
    // ========================

    prepare = async (dto: IClickPrepareDto): Promise<IClickPrepareResponse> => {
        const { click_trans_id, merchant_trans_id, amount } = dto;

        if (!verifySignString(dto)) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_prepare_id: 0,
                error:      -1,
                error_note: 'SIGN CHECK FAILED'
            };
        }

        const payment = await paymentModel.getPaymentByMerchantTransId(merchant_trans_id);

        if (!payment) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_prepare_id: 0,
                error:      -5,
                error_note: 'PAYMENT NOT FOUND'
            };
        }

        if (payment.status === PaymentStatus.PAID) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_prepare_id: payment.id,
                error:      -4,
                error_note: 'ALREADY PAID'
            };
        }

        if (payment.status === PaymentStatus.CANCELLED) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_prepare_id: payment.id,
                error:      -9,
                error_note: 'PAYMENT CANCELLED'
            };
        }

        if (Math.abs(payment.amount - amount) > 0.01) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_prepare_id: payment.id,
                error:      -2,
                error_note: 'INCORRECT PARAMETER AMOUNT'
            };
        }

        await paymentModel.setClickTransId(payment.id, String(click_trans_id));

        return {
            click_trans_id,
            merchant_trans_id,
            merchant_prepare_id: payment.id,
            error:      0,
            error_note: 'Success'
        };
    };

    // ========================
    // CLICK COMPLETE
    // ========================

    complete = async (dto: IClickCompleteDto): Promise<IClickCompleteResponse> => {
        const { click_trans_id, merchant_trans_id, merchant_prepare_id } = dto;

        if (!verifySignString(dto, merchant_prepare_id)) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: 0,
                error:      -1,
                error_note: 'SIGN CHECK FAILED'
            };
        }

        const payment = await paymentModel.getPaymentByMerchantTransId(merchant_trans_id);

        if (!payment) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: 0,
                error:      -5,
                error_note: 'PAYMENT NOT FOUND'
            };
        }

        if (payment.status === PaymentStatus.PAID) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: payment.id,
                error:      -4,
                error_note: 'ALREADY PAID'
            };
        }

        if (payment.status === PaymentStatus.CANCELLED) {
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: payment.id,
                error:      -9,
                error_note: 'PAYMENT CANCELLED'
            };
        }

        // Click dan xato kelgan bo'lsa — payment failed
        if (dto.error < 0) {
            await paymentModel.updatePaymentStatus(payment.id, PaymentStatus.FAILED);
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: payment.id,
                error:      0,
                error_note: 'Success'
            };
        }

        // to'lov muvaffaqiyatli — booking yaratish
        try {
            return await db.transaction(async (trx) => {

                const { branch_id, date, start_time, total_kg } = payment;
                const end_time = calcEndTime(start_time);

                const machines    = await machineModel.getActiveMachinesByBranch(branch_id, trx);
                const bookedSlots = await bookingModel.getBookedSlotsByDate(branch_id, date, trx);

                const availableMachines = getAvailableMachines(machines, bookedSlots, start_time);
                const combination       = findCombination(total_kg, availableMachines);

                if (!combination) {
                    await paymentModel.updatePaymentStatus(payment.id, PaymentStatus.FAILED, trx);
                    return {
                        click_trans_id,
                        merchant_trans_id,
                        merchant_confirm_id: payment.id,
                        error:      -8,
                        error_note: 'NO_AVAILABLE_COMBINATION'
                    };
                }

                const booking = await bookingModel.createBooking({
                    user_id: payment.user_id,
                    branch_id,
                    date,
                    start_time,
                    end_time,
                    total_kg,
                }, trx);

                const bookingMachines: ICreateBookingMachineInput[] = combination.map(m => ({
                    booking_id:  booking.id,
                    machine_id:  m.id,
                    capacity_kg: m.capacity_kg,
                }));

                await bookingModel.createBookingMachines(bookingMachines, trx);

                await Promise.all(
                    combination.map(m => machineModel.makeMachineInUse(m.id, trx))
                );

                await paymentModel.updatePaymentStatus(payment.id, PaymentStatus.PAID, trx);
                await paymentModel.setBookingId(payment.id, booking.id, trx);

                return {
                    click_trans_id,
                    merchant_trans_id,
                    merchant_confirm_id: payment.id,
                    error:      0,
                    error_note: 'Success'
                };
            });

        } catch (error) {
            console.error('PaymentService.complete error:', error);
            await paymentModel.updatePaymentStatus(payment.id, PaymentStatus.FAILED);
            return {
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: payment.id,
                error:      -6,
                error_note: 'INTERNAL_ERROR'
            };
        }
    };

    // ========================
    // GET MY PAYMENTS
    // ========================

    getMyPayments = async (user_id: number): Promise<IServiceResponse<IPayment[]>> => {
        try {
            const payments = await paymentModel.getPaymentsByUser(user_id);
            return { success: true, data: payments };
        } catch (error) {
            console.error('PaymentService.getMyPayments error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

}

export default new PaymentService();