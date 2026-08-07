import { sessionSecret } from './env';
import { randomUUID } from 'crypto';
import express from 'express';
import cors from 'cors';
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
import auditLogRoutes from './routes/auditLogRoutes';
import chartSettingsRoutes from './routes/chartSettingsRoutes';
import reviewRequestRoutes from './routes/reviewRequestRoutes';
import noticeRoutes from './routes/noticeRoutes';
import cron from 'node-cron';
import { processRecurringTransactions } from './services/recurringService';
import connectPgSimple from 'connect-pg-simple';
import { errorHandler } from './middleware/errorHandler';
import { UnauthorizedError, BadRequestError, ForbiddenError } from './utils/errors';
import { asyncHandler } from './utils/asyncHandler';
import { assertStrongPassword, assertTrustedMutationOrigin, loginAttemptLimiter } from './security/authSecurity';

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigins = (process.env.CLIENT_ORIGIN || 'https://my-budget-app-client.vercel.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
  clientOrigins.push('http://localhost:3000');
}

const PgSession = connectPgSimple(session);

// Render의 프록시 설정을 신뢰하여 쿠키 전달
app.set('trust proxy', 1);

app.use((req, res, next) => {
  const requestId = randomUUID();
  (req as typeof req & { requestId?: string }).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string | string[]) => void) => {
    if (!origin || clientOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new ForbiddenError('Origin is not allowed by CORS.', 'UNTRUSTED_ORIGIN'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, _res, next) => {
  try {
    assertTrustedMutationOrigin(
      req.method,
      req.get('origin'),
      clientOrigins,
      process.env.NODE_ENV === 'production',
    );
    next();
  } catch (error) {
    next(error);
  }
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '64kb', extended: true }));

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session'
  }),
  secret: sessionSecret || 'development-only-session-secret',
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

const isAdmin = (req: any, res: any, next: any) => {
  if (req.session?.role === 'admin') {
    return next();
  }
  next(new UnauthorizedError('Admin role required'));
};

app.post('/api/login', asyncHandler(async (req: any, res: any) => {
  const { username, password } = req.body;
  const loginName = typeof username === 'string' ? username : '';
  const ipAddress = req.ip || 'unknown';

  loginAttemptLimiter.assertAllowed(ipAddress, loginName);

  if (username !== 'admin' && username !== 'viewer') {
    loginAttemptLimiter.recordFailure(ipAddress, loginName);
    throw new UnauthorizedError('Invalid ID or Password');
  }

  if (typeof password !== 'string') {
    loginAttemptLimiter.recordFailure(ipAddress, loginName);
    throw new UnauthorizedError('Invalid ID or Password');
  }

  const auth = await prisma.auth.findUnique({ where: { role: username } });
  if (!auth) {
    throw new UnauthorizedError('Authentication data not initialized');
  }

  const isMatch = await bcrypt.compare(password, auth.passwordHash);
  if (isMatch) {
    loginAttemptLimiter.clear(ipAddress, loginName);
    req.session.authenticated = true;
    req.session.role = username as 'admin' | 'viewer';
    res.json({ success: true, role: username });
  } else {
    loginAttemptLimiter.recordFailure(ipAddress, loginName);
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
  assertStrongPassword(newPassword);

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

app.use('/api/review-requests', reviewRequestRoutes);
app.use('/api/notices', noticeRoutes);

app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.path === '/logout' || req.path === '/change-password') return next();
    isAdmin(req, res, next);
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
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/chart-statistics-settings', chartSettingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Automation API is running' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await initDb();

    cron.schedule('0 0 * * *', () => {
      processRecurringTransactions().catch((error) => {
        console.error('Recurring transaction processing failed:', error);
      });
    });

    await processRecurringTransactions();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Routes registered: /api/rules, /api/categories, /api/recurring, /api/payment-rules, /api/transactions`);
    });
  } catch (error) {
    console.error('Failed to initialize database. Server startup aborted:', error);
    process.exit(1);
  }
};

startServer();
