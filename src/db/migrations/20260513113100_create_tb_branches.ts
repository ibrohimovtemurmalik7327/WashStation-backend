import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
    await knex.schema.createTable('tb_branches', table => {
        table.bigIncrements('id').primary();

        table.string('name',120).notNullable();

        table.string('phone',30).notNullable();

        table.string('address',255).notNullable();

        table.decimal('latitude',10,7).nullable();

        table.decimal('longitude',10,7).nullable();

        table
        .enu('status',['active','inactive'])
        .notNullable()
        .defaultTo('active');

        table.timestamp('created_at')
        .notNullable()
        .defaultTo(knex.fn.now());

        table.timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.fn.now());
        }
    ); 
}

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists('tb_branches');
};