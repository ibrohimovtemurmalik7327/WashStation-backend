import db from "../../db/connection";
import config from "../../config/config";
import { Knex } from "knex";
import { 
    BookingStatus, 
    IBooking, 
    IBookingDetail,
    IBookedSlot,
    ICreateBookingInput,
    ICreateBookingMachineInput
} from "./booking.types";

const TB_BOOKINGS         = config.tables.TB_BOOKINGS;
const TB_BOOKING_MACHINES = config.tables.TB_BOOKING_MACHINES;

class BookingModel {

    createBooking = async (data: ICreateBookingInput, trx: Knex.Transaction): Promise<IBooking> => {

        const [id] = await trx(TB_BOOKINGS).insert(data);
        return this.getBookingById(id, trx) as Promise<IBooking>;

    };

    createBookingMachines = async (data: ICreateBookingMachineInput[], trx: Knex.Transaction): Promise<void> => {

        await trx(TB_BOOKING_MACHINES).insert(data);

    };

    getBookingById = async (id: number, trx?: Knex.Transaction): Promise<IBookingDetail | null> => {

        const query = trx || db;

        const booking = await query(TB_BOOKINGS).where({ id }).first();
        if (!booking) return null;

        const machines = await query(TB_BOOKING_MACHINES).where({ booking_id: id });

        return { ...booking, machines };

    };

    getBookingsByUser = async (user_id: number): Promise<IBooking[]> => {

        return db(TB_BOOKINGS)
            .where({ user_id })
            .orderBy('date', 'desc')
            .orderBy('start_time', 'desc');

    };

    getBookingsByBranch = async (branch_id: number, date?: string): Promise<IBooking[]> => {

        const query = db(TB_BOOKINGS).where({ branch_id });

        if (date) query.where({ date });

        return query.orderBy('date', 'desc').orderBy('start_time', 'asc');

    };

    updateBookingStatus = async (id: number, status: BookingStatus, trx?: Knex.Transaction): Promise<IBookingDetail | null> => {

        const query = trx || db;

        await query(TB_BOOKINGS).where({ id }).update({
            status,
            updated_at: query.fn.now()
        });

        return this.getBookingById(id, trx);

    };

    getBookedSlotsByDate = async (branch_id: number, date: string, trx?: Knex.Transaction): Promise<IBookedSlot[]> => {

        const query = trx || db;

        return query(TB_BOOKINGS)
            .join(TB_BOOKING_MACHINES, `${TB_BOOKINGS}.id`, `${TB_BOOKING_MACHINES}.booking_id`)
            .where(`${TB_BOOKINGS}.branch_id`, branch_id)
            .where(`${TB_BOOKINGS}.date`, date)
            .whereIn(`${TB_BOOKINGS}.status`, [BookingStatus.PENDING, BookingStatus.ACTIVE])
            .select(
                `${TB_BOOKING_MACHINES}.machine_id`,
                `${TB_BOOKINGS}.start_time`,
                `${TB_BOOKINGS}.end_time`
            );

    };

}

export default new BookingModel();