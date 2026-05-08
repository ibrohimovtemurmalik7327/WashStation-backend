import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('tb_tickets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('token', 512).notNullable().unique();
    table.enum('purpose', ['register', 'login', 'reset_password']).notNullable();
    table.boolean('is_used').notNullable().defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('user_id').references('id').inTable('tb_users').onDelete('CASCADE');
    table.index(['token']);
    table.index(['user_id']);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists('tb_tickets');
};