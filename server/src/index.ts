import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { initDb } from './db';
import transactionRoutes from './routes/transactionRoutes';
import ruleRoutes from './routes/ruleRoutes';
import categoryRoutes from './routes/categoryRoutes';
import recurringRoutes from './routes/recurringRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // 개발 환경
}));

// 인증 미들웨어
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

// 서버 실행 중 비밀번호 변경을 위해 변수로 관리
let currentPassword = process.env.ADMIN_PASSWORD;

// 로그인 라우트
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === currentPassword) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// 로그아웃 라우트
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// 비밀번호 변경 라우트
app.post('/api/change-password', (req, res) => {
  const { current, newPassword } = req.body;
  if (current === currentPassword) {
    currentPassword = newPassword;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Wrong current password' });
  }
});

// 모든 API 요청에 인증 추가
app.use('/api', (req, res, next) => {
    if (req.path === '/login') return next();
    isAuthenticated(req, res, next);
});

import cron from 'node-cron';
import { processRecurringTransactions } from './services/recurringService';

initDb();
// ... 나머지 코드 ...

// 매일 자정 실행
cron.schedule('0 0 * * *', () => {
  processRecurringTransactions();
});

// 테스트용: 서버 시작 시 바로 실행되도록 추가 (필요 시 주석 처리)
processRecurringTransactions();

// ...
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
