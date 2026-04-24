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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Render와 같은 프록시 환경에서 세션 쿠키(secure)를 전달하기 위해 필요
app.set('trust proxy', 1);

app.use(cors({ 
  origin: true, // 모든 origin 허용 (credentials 사용 시 필수)
  credentials: true 
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  proxy: true, // 프록시 환경 명시
  cookie: { 
    secure: true, // HTTPS 환경이므로 true (Vercel/Render 모두 HTTPS 사용)
    sameSite: 'none', // 크로스 도메인(Vercel -> Render) 간 쿠키 전송 허용
    maxAge: 24 * 60 * 60 * 1000 // 24시간 유지
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

let currentPassword = process.env.ADMIN_PASSWORD;

app.post('/api/login', (req, res) => {
  const { password } = req.body;
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
