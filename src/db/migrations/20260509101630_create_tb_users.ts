import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('tb_users', (table) => {
    table.bigIncrements('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('phone', 30).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table
      .enu('role', ['user', 'admin'])
      .notNullable()
      .defaultTo('user');
    table
      .enu('status', ['active', 'inactive'])
      .notNullable()
      .defaultTo('active');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists('tb_users');
};