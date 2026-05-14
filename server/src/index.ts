import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import prisma, { initDb } from './db';
import transactionRoutes from './routes/transactionRoutes';
import ruleRoutes from './routes/ruleRoutes';
import categoryRoutes from './routes/categoryRoutes';
import recurringRoutes from './routes/recurringRoutes';
import paymentRoutes from './routes/paymentRoutes';
import assetRoutes from './routes/assetRoutes';
import suggestionRoutes from './routes/suggestionRoutes';
import ignoredRuleRoutes from './routes/ignoredRuleRoutes';
import exclusionRuleRoutes from './routes/exclusionRuleRoutes';
import cron from 'node-cron';
import { processRecurringTransactions } from './services/recurringService';
import connectPgSimple from 'connect-pg-simple';
import { errorHandler } from './middleware/errorHandler';
import { UnauthorizedError, BadRequestError } from './utils/errors';
import { asyncHandler } from './utils/asyncHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const PgSession = connectPgSimple(session);

// Render의 프록시 설정을 신뢰하여 쿠키 전달
app.set('trust proxy', 1);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string | string[]) => void) => {
    if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:3000') {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  name: 'budget-app-session',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

declare module 'express-session' {
  interface SessionData {
    authenticated: boolean;
    role: 'admin' | 'viewer';
  }
}

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  next(new UnauthorizedError());
};

app.post('/api/login', asyncHandler(async (req: any, res: any) => {
  const { username, password } = req.body;

  if (username !== 'admin' && username !== 'viewer') {
    throw new UnauthorizedError('Invalid ID or Password');
  }

  const auth = await prisma.auth.findUnique({ where: { role: username } });
  if (!auth) {
    throw new UnauthorizedError('Authentication data not initialized');
  }

  const isMatch = await bcrypt.compare(password, auth.passwordHash);
  if (isMatch) {
    req.session.authenticated = true;
    req.session.role = username as 'admin' | 'viewer';
    res.json({ success: true, role: username });
  } else {
    throw new UnauthorizedError('Invalid ID or Password');
  }
}));

app.get('/api/auth-status', (req: any, res: any) => {
    if (req.session.authenticated) {
        res.json({ isAuthenticated: true, role: req.session.role || 'viewer' });
    } else {
        res.status(401).json({ isAuthenticated: false });
    }
});

app.post('/api/logout', (req: any, res: any) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.post('/api/change-password', asyncHandler(async (req: any, res: any) => {
  const { current, newPassword } = req.body;
  const role = req.session.role;

  if (!role) throw new UnauthorizedError();
  if (!newPassword) throw new BadRequestError('New password is required');

  const auth = await prisma.auth.findUnique({ where: { role } });
  if (!auth) throw new UnauthorizedError();

  const isMatch = await bcrypt.compare(current, auth.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Wrong current password');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.auth.update({
    where: { role },
    data: { passwordHash: newHash }
  });

  res.json({ success: true });
}));

app.use('/api', (req, res, next) => {
    if (req.path === '/login' || req.path === '/health' || req.path === '/auth-status') return next();
    isAuthenticated(req, res, next);
});

initDb().then(() => {
    cron.schedule('0 0 * * *', () => {
      processRecurringTransactions();
    });

    processRecurringTransactions();
});

app.use('/api/rules', ruleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/payment-rules', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/ignored-rules', ignoredRuleRoutes);
app.use('/api/exclusion-rules', exclusionRuleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Automation API is running' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📌 API Routes registered: /api/rules, /api/categories, /api/recurring, /api/payment-rules, /api/transactions`);
});
