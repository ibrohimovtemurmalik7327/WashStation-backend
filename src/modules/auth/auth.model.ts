import db from "../../db/connection";
import config from "../../config/config";
import { ICreateTicketInput, ITicket, OtpPurpose, TicketStatus } from "./auth.types";
import { Knex } from "knex";

const TB_TICKETS = config.tables.TB_TICKETS;

class AuthModel {

    createTicket = async(data: ICreateTicketInput, trx?: Knex.Transaction): Promise<ITicket> => {
        const query = trx || db;

        const [id] = await query(TB_TICKETS).insert(data);

        return this.getTicketById(id, trx) as Promise<ITicket>;
    };

    getTicketById = async(id: number, trx?: Knex.Transaction): Promise<ITicket | null> => {
        const query = trx || db;

        return query(TB_TICKETS).where({ id }).first();
    };

    getPendingTicketByTypeAndPhone = async(type: OtpPurpose, phone: string, trx?: Knex.Transaction): Promise<ITicket | null> => {
        const query = trx || db;

        return query(TB_TICKETS).where({
            type,
            phone,
            status: TicketStatus.PENDING
        }).orderBy('id', 'desc')
        .first();

    };

    incrementAttempts = async(id: number, trx?: Knex.Transaction): Promise<boolean> => {
        const query = trx || db;

        const affected = await query(TB_TICKETS).where({ id }).increment('attempts', 1);

        return affected > 0;
    };

    expireTicket = async(id: number, trx?: Knex.Transaction): Promise<boolean> => {
        const query = trx || db;

        const affected = await query(TB_TICKETS).where({ id }).update({
            status: TicketStatus.EXPIRED
        });

        return affected > 0;
    };

    consumeTicket = async(id: number, trx?: Knex.Transaction): Promise<boolean> => {
        const query = trx || db;

        const affected = await query(TB_TICKETS)
        .where({
            id,
            status: TicketStatus.PENDING
        }).update({
            status: TicketStatus.CONSUMED
        });

        return affected > 0;
    };

}

export default new AuthModel();