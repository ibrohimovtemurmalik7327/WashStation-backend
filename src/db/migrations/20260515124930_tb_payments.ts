import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
    await knex.schema.createTable('tb_payments', table => {
        table.bigIncrements('id').primary();

        table
            .bigInteger('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('tb_users')
            .onDelete('CASCADE');

        // booking yaratilishidan oldin null bo'ladi
        table
            .bigInteger('booking_id')
            .unsigned()
            .nullable()
            .references('id')
            .inTable('tb_bookings')
            .onDelete('SET NULL');

        // user tanlagan booking ma'lumotlari — to'lovdan keyin booking yaratish uchun
        table.integer('branch_id').unsigned().notNullable();
        table.date('date').notNullable();
        table.time('start_time').notNullable();
        table.integer('total_kg').unsigned().notNullable();

        // to'lov summasi
        table.decimal('amount', 12, 2).notNullable();

        // Click dan kelgan transaction id
        table.string('click_trans_id', 100).nullable();

        // bizning unique payment id — Click ga merchant_trans_id sifatida beriladi
        table.string('merchant_trans_id', 100).notNullable().unique();

        table
            .enu('status', ['pending', 'paid', 'failed', 'cancelled'])
            .notNullable()
            .defaultTo('pending');

        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists('tb_payments');
};