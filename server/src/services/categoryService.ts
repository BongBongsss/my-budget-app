import db from '../db';
import { randomUUID } from 'crypto';

export interface CategoryRule {
  id: string;
  keyword: string;
  assigned_category: string;
}

export const getCategoryRules = (): CategoryRule[] => {
  return db.prepare('SELECT * FROM category_rules').all() as CategoryRule[];
};

export const addCategoryRule = (keyword: string, assigned_category: string) => {
  const id = randomUUID();
  const stmt = db.prepare('INSERT INTO category_rules (id, keyword, assigned_category) VALUES (?, ?, ?)');
  stmt.run(id, keyword, assigned_category);
  return { id, keyword, assigned_category };
};

export const deleteCategoryRule = (id: string) => {
  const stmt = db.prepare('DELETE FROM category_rules WHERE id = ?');
  return stmt.run(id);
};

export const autoCategorize = (vendor: string): string => {
  const rules = getCategoryRules();
  const matchedRule = rules.find(rule => 
    vendor.toLowerCase().includes(rule.keyword.toLowerCase())
  );
  return matchedRule ? matchedRule.assigned_category : 'Uncategorized';
};
