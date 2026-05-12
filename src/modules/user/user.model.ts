import { Knex } from "knex";

import db from "../../db/connection";

import config from "../../config/config";
import { ICreateUserInput, IPublicUser, IUpdateUserInput, IUser } from "./user.types";

const TB_USERS = config.tables.TB_USERS;

const PUBLIC_COLUMNS = [
    'id',
    'username',
    'phone',
    'role',
    'status',
    'created_at',
    'updated_at'
];

class UserModel {

    createUser = async (data: ICreateUserInput, trx?: Knex.Transaction): Promise<IPublicUser> => {

        const query = trx || db;

        const [id] = await query(TB_USERS).insert(data);

        return this.getUserById(id, trx) as Promise<IPublicUser>;

    };

    getUserById = async (id: number, trx?: Knex.Transaction): Promise<IPublicUser | null> => {

        const query = trx || db;

        return query(TB_USERS)
        .select(PUBLIC_COLUMNS)
        .where({ id })
        .first();

    };

    getUsers = async (): Promise<IPublicUser[]> => {

        return db(TB_USERS)
        .select(PUBLIC_COLUMNS)
        .orderBy('id', 'desc');

    };

    getUserByUsername = async (username: string): Promise<IPublicUser | null> => {

        return db(TB_USERS)
        .select(PUBLIC_COLUMNS)
        .where({ username })
        .first();

    };

    getUserByPhone = async (phone: string): Promise<IPublicUser | null> => {

        return db(TB_USERS)
        .select(PUBLIC_COLUMNS)
        .where({ phone })
        .first();

    };

    getByIdWithPassword = async (id: number): Promise<IUser> => {

        return db(TB_USERS)
        .select([...PUBLIC_COLUMNS, 'password_hash'])
        .where({ id })
        .first();

    };

    getByPhoneWithPassword = async (phone: string): Promise<IUser | null> => {

        return db(TB_USERS)
        .select([...PUBLIC_COLUMNS, 'password_hash'])
        .where({ phone })
        .first();

    };

    updateUser = async (id: number, data: IUpdateUserInput, trx?: Knex.Transaction): Promise<IPublicUser> => {
        
        const query = trx || db;

        await query(TB_USERS)
        .where({ id })
        .update({
            ...data,
            updated_at: query.fn.now()
        });

        return this.getUserById(id) as Promise<IPublicUser>;

    };

    changeUserPassword = async (id: number, password_hash: string, trx?: Knex.Transaction): Promise<IPublicUser> => {

        const query = trx || db;

        await query(TB_USERS)
        .where({ id })
        .update({
            password_hash,
            updated_at: query.fn.now()
        });

        return this.getUserById(id, trx) as Promise<IPublicUser>;

    };

    deactivateUser = async (id: number, trx?: Knex.Transaction): Promise<IPublicUser> => {
        
        const query = trx || db;

        await query(TB_USERS)
        .where({ id })
        .update({
            status: 'inactive',
            updated_at: query.fn.now()
        });

        return this.getUserById(id) as Promise<IPublicUser>;

    };

}

export default new UserModel();