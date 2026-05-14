import { Knex } from "knex";

export const up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('tb_machines', table => {
    table.bigIncrements('id').primary();

    table
      .bigInteger('branch_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tb_branches')
      .onDelete('CASCADE');

    table.string('name', 50).notNullable();

    table.integer('capacity_kg').unsigned().notNullable();

    table
      .enu('status', ['active', 'inactive'])
      .notNullable()
      .defaultTo('active');

    table
      .enu('availability', ['idle', 'in_use'])
      .notNullable()
      .defaultTo('idle');

    table.timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());

    table.timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now());

    table.unique(['branch_id', 'name']);
  });
};

export const down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tb_machines');
};