import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('tb_users', (table) => {
    table.increments('id').primary();
    table.string('phone', 20).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('username', 100).notNullable();
    table.enum('role', ['admin', 'user']).notNullable().defaultTo('user');
    table.enum('status', ['active', 'inactive', 'blocked']).notNullable().defaultTo('active');
    table.timestamps(true, true);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists('tb_users');
};