import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
    await knex.schema.createTable('tb_tickets', (table) => {
        table.bigIncrements('id').primary();
        table.enu('type', ['register', 'reset_password']).notNullable();
        table.string('username', 50).nullable();
        table.string('phone', 30).notNullable().index();
        table.string('code_hash', 255).notNullable();
        table.string('password_hash', 255).nullable();
        table.integer('attempts').unsigned().notNullable().defaultTo(0);
        table.integer('max_attempts').unsigned().notNullable().defaultTo(5);
        table.dateTime('expires_at').notNullable().index();
        table.enu('status', ['pending', 'verified', 'expired', 'consumed']).notNullable().defaultTo('pending');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists('tb_tickets');
};