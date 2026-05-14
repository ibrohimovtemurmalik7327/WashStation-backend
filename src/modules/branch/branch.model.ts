import db from "../../db/connection";
import config from "../../config/config";
import { Knex } from "knex";
import { BranchStatus, IBranch, ICreateBranchDto, IUpdateBranchDto } from "./branch.types";

const TB_BRANCHES = config.tables.TB_BRANCHES || 'tb_branches';

class BranchModel {
    createBranch = async (data: ICreateBranchDto, trx?: Knex.Transaction): Promise<IBranch> => {
        const query = trx || db;

        const [id] = await query(TB_BRANCHES).insert(data);

        return this.getBranchById(id, trx);
    };

    getBranchById = async (id: number, trx?: Knex.Transaction): Promise<IBranch> => {
        const query = trx || db;

        return query(TB_BRANCHES).where({ id }).first();
    };

    getBranches = async (): Promise<IBranch[]> => {
        return db(TB_BRANCHES).orderBy('id', 'desc');
    };

    getActiveBranches = async (): Promise<IBranch[]> => {
        return db(TB_BRANCHES).where({
            status: BranchStatus.ACTIVE
        }).orderBy('id', 'desc');
    };

    updateBranch = async (id: number, data: IUpdateBranchDto, trx?: Knex.Transaction): Promise<IBranch> => {
        const query = trx || db;

        await query(TB_BRANCHES).where({ id }).update({
            ...data,
            updated_at: query.fn.now()
        });

        return this.getBranchById(id, trx);
    };

    deactivateBranch = async (id: number, trx?: Knex.Transaction): Promise<IBranch> => {
        const query = trx || db;

        await query(TB_BRANCHES).where({ id }).update({
            status: BranchStatus.INACTIVE,
            updated_at: query.fn.now()
        });

        return this.getBranchById(id, trx);
    };

    getBranchByPhone = async (phone: string): Promise<IBranch> => {
        return db(TB_BRANCHES).where({ phone }).first();
    };
}

export default new BranchModel();