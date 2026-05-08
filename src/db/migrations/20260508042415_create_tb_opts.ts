import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('tb_otps', (table) => {
    table.increments('id').primary();
    table.string('phone', 20).notNullable();
    table.string('otp_code', 10).notNullable();
    table.enum('purpose', ['register', 'login', 'reset_password']).notNullable();
    table.integer('attempts').notNullable().defaultTo(0);
    table.boolean('is_used').notNullable().defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['phone', 'purpose']);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists('tb_otps');
};