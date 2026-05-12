import express, { Application } from 'express';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import { authRequired } from './middlewares/auth.middleware';

const app: Application = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', authRequired, userRoutes);

export default app;