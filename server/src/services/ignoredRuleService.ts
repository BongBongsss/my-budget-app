import prisma from '../db';
import { normalizeRuleText } from './ruleMatching';

export const getIgnoredRules = async () => {
  return await prisma.ignoredRule.findMany();
};

export const ignoreRule = async (keyword: string) => {
  const normalizedKeyword = normalizeRuleText(keyword);
  if (!normalizedKeyword) throw new Error('Keyword is required');
  return await prisma.ignoredRule.upsert({
    where: { keyword: normalizedKeyword },
    update: {},
    create: { keyword: normalizedKeyword }
  });
};

export const unignoreRule = async (id: string) => {
  await prisma.ignoredRule.delete({
    where: { id }
  });
};
