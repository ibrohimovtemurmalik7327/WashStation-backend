import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
    await knex.schema.createTable('tb_bookings', table => {
        table.bigIncrements('id').primary();

        table
            .bigInteger('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('tb_users')
            .onDelete('CASCADE');

        table
            .bigInteger('branch_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('tb_branches')
            .onDelete('CASCADE');

        table.date('date').notNullable().index();

        table.time('start_time').notNullable();

        table.time('end_time').notNullable();

        table.integer('total_kg').unsigned().notNullable();

        table
            .enu('status', ['pending', 'active', 'completed', 'cancelled'])
            .notNullable()
            .defaultTo('pending');

        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists('tb_bookings');
};