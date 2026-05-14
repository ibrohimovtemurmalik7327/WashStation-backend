import db from "../../db/connection";
import config from "../../config/config";
import { Knex } from "knex";
import { 
    ICreateMachineDto, 
    IMachine, 
    IUpdateMachineDto, 
    MachineAvailability, 
    MachineStatus 
} from "./machine.types";

const TB_MACHINES = config.tables.TB_MACHINES || 'tb_machines';

class MachineModel {
    createMachine = async (data: ICreateMachineDto, trx?: Knex.Transaction): Promise<IMachine> => {

        const query = trx || db;

        const [id] = await query(TB_MACHINES).insert(data);

        return this.getMachineById(id, trx);

    };

    getMachineById = async (id: number, trx?: Knex.Transaction): Promise<IMachine> => {

        const query = trx || db;

        return query(TB_MACHINES).where({ id }).first();

    };

    getActiveMachinesByBranch = async (branch_id: number, trx?: Knex.Transaction): Promise<IMachine[]> => {

        const query = trx || db;

        return query(TB_MACHINES).where({ 
            branch_id,
            status: MachineStatus.ACTIVE 
        }).orderBy('capacity_kg', 'desc')
        .orderBy('id', 'asc');

    };

    getMachinesByBranch = async (branch_id: number): Promise<IMachine[]> => {

        return db(TB_MACHINES).where({ branch_id }).orderBy('id', 'desc');

    };

    getMachineByBranchAndName = async (branch_id: number, name: string, trx?: Knex.Transaction): Promise<IMachine> => {

        const query = trx || db;

        return query(TB_MACHINES).where({
            branch_id,
            name
        }).first();

    };

    updateMachine = async (id: number, data: IUpdateMachineDto, trx?: Knex.Transaction): Promise<IMachine> => {

        const query = trx || db;

        await query(TB_MACHINES).where({ id }).update({
            ...data,
            updated_at: query.fn.now()
        });

        return this.getMachineById(id, trx);

    };

    deactivateMachine = async (id: number, trx?: Knex.Transaction): Promise<IMachine> => {

        const query = trx || db;

        await query(TB_MACHINES).where({ id }).update({
            status: MachineStatus.INACTIVE,
            updated_at: query.fn.now()
        });

        return this.getMachineById(id, trx);

    };

    makeMachineInUse = async (id: number, trx?: Knex.Transaction): Promise<IMachine> => {

        const query = trx || db;

        await query(TB_MACHINES).where({ id }).update({
            availability: MachineAvailability.IN_USE,
            updated_at: query.fn.now()
        });

        return this.getMachineById(id, trx);

    };

    makeMachineIdle = async (id: number, trx?: Knex.Transaction): Promise<IMachine> => {

        const query = trx || db;

        await query(TB_MACHINES).where({ id }).update({
            availability: MachineAvailability.IDLE,
            updated_at: query.fn.now()
        });

        return this.getMachineById(id, trx);

    };
}

export default new MachineModel();