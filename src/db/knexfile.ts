import path from 'path';
import config from '../config/config';
import { Knex } from 'knex';

const knexConfig: Record<string, Knex.Config> = {
  development: {
    client: 'mysql2',
    connection: {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};

export default knexConfig;