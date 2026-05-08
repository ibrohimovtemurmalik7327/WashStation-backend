import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import config from '../../config/config';

export const seed = async (knex: Knex): Promise<void> => {
  await knex(config.tables.TB_USERS)
    .where({ role: 'admin' })
    .delete();

  const hashedPassword = await bcrypt.hash('Never7327@', config.bcrypt.cost);

  await knex(config.tables.TB_USERS).insert({
    phone:    '+998945717327',
    password: hashedPassword,
    username: 'ibrohimov7327',
    role:     'admin',
    status:   'active',
  });
};