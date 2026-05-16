import db from "../../db/connection";
import config from "../../config/config";
import { Knex } from "knex";
import { 
    IPayment, 
    ICreatePaymentInput, 
    PaymentStatus 
} from "./payment.types";

const TB_PAYMENTS = config.tables.TB_PAYMENTS;

class PaymentModel {

    createPayment = async (data: ICreatePaymentInput, trx?: Knex.Transaction): Promise<IPayment> => {
        const query = trx || db;

        const [id] = await query(TB_PAYMENTS).insert(data);
        return this.getPaymentById(id, trx) as Promise<IPayment>;
    };

    getPaymentById = async (id: number, trx?: Knex.Transaction): Promise<IPayment | null> => {
        const query = trx || db;

        return query(TB_PAYMENTS).where({ id }).first() || null;
    };

    getPaymentByMerchantTransId = async (merchant_trans_id: string, trx?: Knex.Transaction): Promise<IPayment | null> => {
        const query = trx || db;

        return query(TB_PAYMENTS).where({ merchant_trans_id }).first() || null;
    };

    getPaymentsByUser = async (user_id: number): Promise<IPayment[]> => {
        return db(TB_PAYMENTS)
            .where({ user_id })
            .orderBy('created_at', 'desc');
    };

    updatePaymentStatus = async (id: number, status: PaymentStatus, trx?: Knex.Transaction): Promise<IPayment | null> => {
        const query = trx || db;

        await query(TB_PAYMENTS).where({ id }).update({
            status,
            updated_at: query.fn.now()
        });

        return this.getPaymentById(id, trx);
    };

    setClickTransId = async (id: number, click_trans_id: string, trx?: Knex.Transaction): Promise<IPayment | null> => {
        const query = trx || db;

        await query(TB_PAYMENTS).where({ id }).update({
            click_trans_id,
            updated_at: query.fn.now()
        });

        return this.getPaymentById(id, trx);
    };

    setBookingId = async (id: number, booking_id: number, trx?: Knex.Transaction): Promise<IPayment | null> => {
        const query = trx || db;

        await query(TB_PAYMENTS).where({ id }).update({
            booking_id,
            updated_at: query.fn.now()
        });

        return this.getPaymentById(id, trx);
    };

}

export default new PaymentModel();