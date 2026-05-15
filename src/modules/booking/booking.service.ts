import db from "../../db/connection";
import config from "../../config/config";
import bookingModel from "./booking.model";
import machineModel from "../machine/machine.model";
import branchModel from "../branch/branch.model";
import { findAvailableSlots, findCombination } from "../../helpers/slotHelper";
import {
    BookingStatus,
    IBooking,
    IBookingDetail,
    ICreateBookingDto,
    IGetSlotsDto,
    ISlot,
    ICreateBookingMachineInput
} from "./booking.types";
import { IServiceResponse } from "../../types/common.types";
import { BranchStatus } from "../branch/branch.types";

const DURATION_MIN = config.booking.durationMinutes;

class BookingService {

    // ========================
    // GET SLOTS
    // ========================

    getSlots = async (data: IGetSlotsDto): Promise<IServiceResponse<ISlot[]>> => {
        try {
            const { branch_id, date, total_kg } = data;

            // branch tekshiruvi
            const branch = await branchModel.getBranchById(branch_id);
            if (!branch) {
                return { success: false, error: 'BRANCH_NOT_FOUND' };
            }

            if (branch.status !== BranchStatus.ACTIVE) {
                return { success: false, error: 'BRANCH_INACTIVE' };
            }

            // o'sha kunda active mashinalar
            const machines = await machineModel.getActiveMachinesByBranch(branch_id);
            if (!machines.length) {
                return { success: false, error: 'NO_ACTIVE_MACHINES' };
            }

            // o'sha kunda band slotlar
            const bookedSlots = await bookingModel.getBookedSlotsByDate(branch_id, date);

            // mavjud slotlarni topish
            const slots = findAvailableSlots(total_kg, machines, bookedSlots);
            if (!slots.length) {
                return { success: false, error: 'NO_AVAILABLE_COMBINATION' };
            }

            return { success: true, data: slots };

        } catch (error) {
            console.error('BookingService.getSlots error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

    // ========================
    // CREATE BOOKING
    // ========================

    createBooking = async (user_id: number, data: ICreateBookingDto): Promise<IServiceResponse<IBookingDetail>> => {
        try {
            return db.transaction(async (trx) => {

                const { branch_id, date, start_time, total_kg } = data;

                // branch tekshiruvi
                const branch = await branchModel.getBranchById(branch_id, trx);
                if (!branch) {
                    return { success: false, error: 'BRANCH_NOT_FOUND' };
                }

                if (branch.status !== BranchStatus.ACTIVE) {
                    return { success: false, error: 'BRANCH_INACTIVE' };
                }

                // end_time hisoblash
                const [h, m]   = start_time.split(':').map(Number);
                const endMin   = h * 60 + m + DURATION_MIN;
                const endH     = Math.floor(endMin / 60).toString().padStart(2, '0');
                const endM     = (endMin % 60).toString().padStart(2, '0');
                const end_time = `${endH}:${endM}`;

                // o'sha kunda active mashinalar — FOR UPDATE lock bilan
                const machines = await machineModel.getActiveMachinesByBranch(branch_id, trx);
                if (!machines.length) {
                    return { success: false, error: 'NO_ACTIVE_MACHINES' };
                }

                // band slotlar — trx bilan (race condition uchun)
                const bookedSlots = await bookingModel.getBookedSlotsByDate(branch_id, date, trx);

                // shu vaqtda bo'sh mashinalarni topish
                const startMin = h * 60 + m;
                const endMins  = startMin + DURATION_MIN;

                const availableMachines = machines.filter(machine => {
                    return bookedSlots
                        .filter(b => b.machine_id === machine.id)
                        .every(b => {
                            const bStart = b.start_time.split(':').map(Number);
                            const bEnd   = b.end_time.split(':').map(Number);
                            const bStartMin = bStart[0] * 60 + bStart[1];
                            const bEndMin   = bEnd[0]   * 60 + bEnd[1] + config.booking.intervalMinutes;
                            return endMins <= bStartMin || startMin >= bEndMin;
                        });
                });

                // kombinatsiya topish
                const combination = findCombination(total_kg, availableMachines);
                if (!combination) {
                    return { success: false, error: 'NO_AVAILABLE_COMBINATION' };
                }

                // booking yaratish
                const booking = await bookingModel.createBooking({
                    user_id,
                    branch_id,
                    date,
                    start_time,
                    end_time,
                    total_kg,
                }, trx);

                // booking_machines yaratish
                const bookingMachines: ICreateBookingMachineInput[] = combination.map(m => ({
                    booking_id:  booking.id,
                    machine_id:  m.id,
                    capacity_kg: m.capacity_kg,
                }));

                await bookingModel.createBookingMachines(bookingMachines, trx);

                // mashinalarni in_use qilish
                await Promise.all(
                    combination.map(m => machineModel.makeMachineInUse(m.id, trx))
                );

                // to'liq booking qaytarish
                const result = await bookingModel.getBookingById(booking.id, trx);
                if (!result) {
                    throw new Error('Failed to fetch created booking');
                }

                return { success: true, data: result };
            });

        } catch (error) {
            console.error('BookingService.createBooking error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

    // ========================
    // GET MY BOOKINGS
    // ========================

    getMyBookings = async (user_id: number): Promise<IServiceResponse<IBooking[]>> => {
        try {
            const bookings = await bookingModel.getBookingsByUser(user_id);
            return { success: true, data: bookings };

        } catch (error) {
            console.error('BookingService.getMyBookings error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

    // ========================
    // GET MY BOOKING BY ID
    // ========================

    getMyBookingById = async (user_id: number, booking_id: number): Promise<IServiceResponse<IBookingDetail>> => {
        try {
            const booking = await bookingModel.getBookingById(booking_id);
            if (!booking) {
                return { success: false, error: 'BOOKING_NOT_FOUND' };
            }

            // faqat o'zining bookingini ko'ra oladi
            if (booking.user_id !== user_id) {
                return { success: false, error: 'FORBIDDEN' };
            }

            return { success: true, data: booking };

        } catch (error) {
            console.error('BookingService.getMyBookingById error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

    // ========================
    // CANCEL BOOKING
    // ========================

    cancelBooking = async (user_id: number, booking_id: number): Promise<IServiceResponse<IBookingDetail>> => {
        try {
            return db.transaction(async (trx) => {

                const booking = await bookingModel.getBookingById(booking_id, trx);
                if (!booking) {
                    return { success: false, error: 'BOOKING_NOT_FOUND' };
                }

                // faqat o'zining bookingini bekor qila oladi
                if (booking.user_id !== user_id) {
                    return { success: false, error: 'FORBIDDEN' };
                }

                if (booking.status === BookingStatus.CANCELLED) {
                    return { success: false, error: 'BOOKING_ALREADY_CANCELLED' };
                }

                if (booking.status === BookingStatus.COMPLETED) {
                    return { success: false, error: 'BOOKING_ALREADY_COMPLETED' };
                }

                if (booking.status === BookingStatus.ACTIVE) {
                    return { success: false, error: 'BOOKING_ALREADY_STARTED' };
                }

                // mashinalarni idle ga qaytarish
                await Promise.all(
                    booking.machines.map(m => machineModel.makeMachineIdle(m.machine_id, trx))
                );

                const result = await bookingModel.updateBookingStatus(booking_id, BookingStatus.CANCELLED, trx);
                if (!result) {
                    throw new Error('Failed to cancel booking');
                }

                return { success: true, data: result };
            });

        } catch (error) {
            console.error('BookingService.cancelBooking error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

    // ========================
    // ADMIN — GET BOOKINGS BY BRANCH
    // ========================

    getBookingsByBranch = async (branch_id: number, date?: string): Promise<IServiceResponse<IBooking[]>> => {
        try {
            const branch = await branchModel.getBranchById(branch_id);
            if (!branch) {
                return { success: false, error: 'BRANCH_NOT_FOUND' };
            }

            const bookings = await bookingModel.getBookingsByBranch(branch_id, date);
            return { success: true, data: bookings };

        } catch (error) {
            console.error('BookingService.getBookingsByBranch error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

    // ========================
    // ADMIN — COMPLETE BOOKING
    // ========================

    completeBooking = async (booking_id: number): Promise<IServiceResponse<IBookingDetail>> => {
        try {
            return db.transaction(async (trx) => {

                const booking = await bookingModel.getBookingById(booking_id, trx);
                if (!booking) {
                    return { success: false, error: 'BOOKING_NOT_FOUND' };
                }

                if (booking.status === BookingStatus.CANCELLED) {
                    return { success: false, error: 'BOOKING_ALREADY_CANCELLED' };
                }

                if (booking.status === BookingStatus.COMPLETED) {
                    return { success: false, error: 'BOOKING_ALREADY_COMPLETED' };
                }

                // mashinalarni idle ga qaytarish
                await Promise.all(
                    booking.machines.map(m => machineModel.makeMachineIdle(m.machine_id, trx))
                );

                const result = await bookingModel.updateBookingStatus(booking_id, BookingStatus.COMPLETED, trx);
                if (!result) {
                    throw new Error('Failed to complete booking');
                }

                return { success: true, data: result };
            });

        } catch (error) {
            console.error('BookingService.completeBooking error:', error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    };

}

export default new BookingService();