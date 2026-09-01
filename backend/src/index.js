import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import ownersRoutes from './routes/owners.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import eventsRoutes from './routes/events.routes.js';
import blastRoutes from './routes/blast.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/owners', ownersRoutes);
app.use('/payments', paymentsRoutes);
app.use('/events', eventsRoutes);
app.use('/blast', blastRoutes);
app.use('/admin', adminRoutes);
app.use('/uploads-api', uploadsRoutes);
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

app.get('/', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend jalan di http://localhost:${port}`));
