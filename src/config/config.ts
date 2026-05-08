import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const must = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }

  return value;
};

const config = {

  env: process.env.NODE_ENV || 'development',

  server: {
    port: Number(process.env.PORT || 5000)
  },

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_laundry'
  },

  jwt: {
    secret: must('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },

  bcrypt: {
    cost: Number(process.env.BCRYPT_COST || 10)
  },

  otp: {
    length: Number(process.env.AUTH_OTP_LENGTH || 6),
    ttl: Number(process.env.AUTH_OTP_TTL_MS || 300000),
    maxAttempts: Number(process.env.AUTH_OTP_MAX_ATTEMPTS || 5)
  },

  booking: {
    WASH_MINUTES: Number(process.env.BOOKING_WASH_MINUTES || 30),
    BUFFER_MINUTES: Number(process.env.BOOKING_BUFFER_MINUTES || 10)
  },

  tables: {
    TB_USERS: 'tb_users',
    TB_BRANCHES: 'tb_branches',
    TB_MACHINES: 'tb_machines',
    TB_BOOKINGS: 'tb_bookings',
    TB_BOOKING_MACHINES: 'tb_booking_machines',
    TB_PAYMENTS: 'tb_payments',
    TB_TICKETS: 'tb_tickets',
    TB_OTPS: 'tb_otps'
  }
};

export default config;