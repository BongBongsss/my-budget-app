import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { initDb } from './db';
import transactionRoutes from './routes/transactionRoutes';
import ruleRoutes from './routes/ruleRoutes';
import categoryRoutes from './routes/categoryRoutes';
import recurringRoutes from './routes/recurringRoutes';
import cron from 'node-cron';
import { processRecurringTransactions } from './services/recurringService';
import connectPgSimple from 'connect-pg-simple';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const PgSession = connectPgSimple(session);

// Render와 같은 프록시 환경에서 세션 쿠키(secure)를 전달하기 위해 필요
app.set('trust proxy', 1);

app.use(cors({ 
  origin: (origin, callback) => {
    // 요청이 들어오는 origin을 그대로 허용 (세션 쿠키 사용 시 필수)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'Session', // Prisma 모델 이름과 일치시키거나 직접 테이블 생성
    createTableIfMissing: true // 테이블이 없으면 자동 생성
  }),
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  name: 'budget-app-session',
  cookie: { 
    secure: true, 
    sameSite: 'none', 
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7일 유지
  } 
}));

declare module 'express-session' {
  interface SessionData {
    authenticated: boolean;
  }
}

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// 비밀번호 설정 확인 (보안을 위해 존재 여부만 체크)
if (!process.env.ADMIN_PASSWORD) {
  console.warn("⚠️ WARNING: ADMIN_PASSWORD environment variable is NOT set!");
} else {
  console.log("✅ ADMIN_PASSWORD environment variable is detected.");
}

let currentPassword = process.env.ADMIN_PASSWORD;

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  // 디버깅용 로그 (나중에 삭제 권장)
  console.log(`Login attempt: Password provided? ${!!password}, Matches? ${password === currentPassword}`);

  if (password === currentPassword) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
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
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Automation API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
