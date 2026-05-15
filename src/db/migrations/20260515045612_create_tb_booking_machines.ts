import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
    await knex.schema.createTable('tb_booking_machines', table => {
        table.bigIncrements('id').primary();

        table
            .bigInteger('booking_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('tb_bookings')
            .onDelete('CASCADE');

        table
            .bigInteger('machine_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('tb_machines')
            .onDelete('CASCADE');

        table.integer('capacity_kg').unsigned().notNullable();
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists('tb_booking_machines');
};