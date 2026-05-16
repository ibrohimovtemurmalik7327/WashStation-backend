import express, { Application } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import branchRoutes from './modules/branch/branch.routes';
import machineRoutes from './modules/machine/machine.routes';
import bookingRoutes from './modules/booking/booking.routes';
import paymentRoutes from './modules/payment/payment.routes';
import { authRequired } from './middlewares/auth.middleware';

const app: Application = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', authRequired, userRoutes);
app.use('/api/branches', authRequired, branchRoutes);
app.use('/api/machines', authRequired, machineRoutes);
app.use('/api/bookings', authRequired, bookingRoutes);
app.use('/api/payments', paymentRoutes);

export default app;