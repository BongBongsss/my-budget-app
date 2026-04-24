import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '../budget.db'));

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      vendor TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      source TEXT,
      is_recurring INTEGER DEFAULT 0,
      raw_data TEXT
    );

    CREATE TABLE IF NOT EXISTS category_rules (
      id TEXT PRIMARY KEY,
      keyword TEXT UNIQUE NOT NULL,
      assigned_category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id TEXT PRIMARY KEY,
      vendor TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      type TEXT DEFAULT 'expense',
      day_of_month INTEGER NOT NULL
    );

    -- 기본 카테고리 삽입 (없을 경우에만)
    INSERT OR IGNORE INTO categories (id, name) VALUES 
    ('1', '식비'), ('2', '교통'), ('3', '주거/통신'), 
    ('4', '의료/건강'), ('5', '문화/여가'), ('6', '기타');
  `);
};

export default db;
