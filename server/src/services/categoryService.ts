import prisma from '../db';
import { randomUUID } from 'crypto';

export interface CategoryRule {
  id: string;
  keyword: string;
  assigned_category: string;
}

export const getCategoryRules = async (): Promise<CategoryRule[]> => {
  return await prisma.categoryRule.findMany();
};

export const addCategoryRule = async (keyword: string, assigned_category: string) => {
  return await prisma.categoryRule.create({
    data: {
      id: randomUUID(),
      keyword,
      assigned_category,
    },
  });
};

export const deleteCategoryRule = async (id: string) => {
  return await prisma.categoryRule.delete({
    where: { id },
  });
};

export const autoCategorize = async (vendor: string): Promise<string> => {
  const rules = await getCategoryRules();
  const matchedRule = rules.find(rule => 
    vendor.toLowerCase().includes(rule.keyword.toLowerCase())
  );
  return matchedRule ? matchedRule.assigned_category : '기타';
};
