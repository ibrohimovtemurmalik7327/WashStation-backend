import express, { Application } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import branchRoutes from './modules/branch/branch.routes';
import { authRequired } from './middlewares/auth.middleware';

const app: Application = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', authRequired, userRoutes);
app.use('/api/branches', authRequired, branchRoutes);

export default app;