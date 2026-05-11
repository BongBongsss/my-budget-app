import prisma from '../db';
import { randomUUID } from 'crypto';

export interface CategoryRule {
  id: string;
  keyword: string;
  assigned_category: string;
}

export interface CategoryGroupRule {
  id: string;
  categoryName: string;
  assignedGroup: string;
}

// 기존 대분류 매칭 규칙
export const getCategoryRules = async (): Promise<CategoryRule[]> => {
  return await prisma.categoryRule.findMany();
};

export const addCategoryRule = async (keyword: string, assigned_category: string) => {
  return await prisma.categoryRule.create({
    data: { id: randomUUID(), keyword, assigned_category },
  });
};

export const deleteCategoryRule = async (id: string) => {
  return await prisma.categoryRule.delete({ where: { id } });
};

export const updateCategoryRule = async (id: string, keyword: string, assigned_category: string) => {
  return await prisma.categoryRule.update({
    where: { id },
    data: { keyword, assigned_category },
  });
};

// 상위 그룹 매칭 규칙
export const getCategoryGroupRules = async (): Promise<CategoryGroupRule[]> => {
  return await prisma.categoryGroupRule.findMany();
};

export const addCategoryGroupRule = async (categoryName: string, assignedGroup: string) => {
  return await prisma.categoryGroupRule.create({
    data: { id: randomUUID(), categoryName, assignedGroup },
  });
};

export const deleteCategoryGroupRule = async (id: string) => {
  return await prisma.categoryGroupRule.delete({ where: { id } });
};

export const updateCategoryGroupRule = async (id: string, categoryName: string, assignedGroup: string) => {
  return await prisma.categoryGroupRule.update({
    where: { id },
    data: { categoryName, assignedGroup },
  });
};

// 카테고리 자동 지정 (여러 건 일괄 처리 - 성능 최적화)
export const bulkAutoCategorize = async (vendors: string[]): Promise<Record<string, string>> => {
  const rules = await getCategoryRules();
  const resultMap: Record<string, string> = {};

  vendors.forEach(vendor => {
    const normalizedVendor = (vendor || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const matchedRule = rules.find(rule => normalizedVendor.includes(rule.keyword.toLowerCase().trim()));
    resultMap[vendor] = matchedRule ? matchedRule.assigned_category : '기타';
  });

  return resultMap;
};

// 카테고리 자동 지정 (Vendor -> 대분류)
export const autoCategorize = async (vendor: string): Promise<string> => {
  const rules = await getCategoryRules();
  const normalizedVendor = vendor.toLowerCase().replace(/\s+/g, ' ').trim();
  const matchedRule = rules.find(rule => normalizedVendor.includes(rule.keyword.toLowerCase().trim()));
  return matchedRule ? matchedRule.assigned_category : '기타';
};

// 카테고리 그룹 자동 지정 (대분류 -> 상위 그룹)
export const autoGroupCategory = async (category: string): Promise<string> => {
  const rules = await getCategoryGroupRules();
  const matchedRule = rules.find(rule => rule.categoryName === category);
  return matchedRule ? matchedRule.assignedGroup : category; // 매칭 없으면 원래 카테고리 그대로
};
