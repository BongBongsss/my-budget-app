import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { initDb } from './db';
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
import { UnauthorizedError } from './utils/errors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const PgSession = connectPgSimple(session);

// Render와 같은 프록시 환경에서 세션 쿠키(secure)를 전달하기 위해 필요
app.set('trust proxy', 1);

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:3000') {
      callback(null, origin); // 요청한 origin을 그대로 반영
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

// 비밀번호 설정 확인 (보안을 위해 존재 여부만 체크)
if (!process.env.ADMIN_PASSWORD) {
  console.warn("⚠️ WARNING: ADMIN_PASSWORD environment variable is NOT set!");
} else {
  console.log("✅ ADMIN_PASSWORD environment variable is detected.");
}

let currentPassword = process.env.ADMIN_PASSWORD;

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const VIEWER_PASSWORD = 'viewer123';

  if (username === 'admin' && password === currentPassword) {
    req.session.authenticated = true;
    req.session.role = 'admin';
    res.json({ success: true, role: 'admin' });
  } else if (username === 'viewer' && password === VIEWER_PASSWORD) {
    req.session.authenticated = true;
    req.session.role = 'viewer';
    res.json({ success: true, role: 'viewer' });
  } else {
    res.status(401).json({ error: 'Invalid ID or Password' });
  }
});

app.get('/api/auth-status', (req, res) => {
    if (req.session.authenticated) {
        res.json({ isAuthenticated: true, role: req.session.role || 'viewer' });
    } else {
        res.status(401).json({ isAuthenticated: false });
    }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.post('/api/change-password', (req, res) => {
  const { current, newPassword } = req.body;
  if (current === currentPassword) {
    currentPassword = newPassword;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Wrong current password' });
  }
});

app.use('/api', (req, res, next) => {
    if (req.path === '/login' || req.path === '/health') return next();
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
