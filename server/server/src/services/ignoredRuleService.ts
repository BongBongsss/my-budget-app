import prisma from '../db';

export const getIgnoredRules = async () => {
  return await prisma.ignoredRule.findMany();
};

export const ignoreRule = async (keyword: string) => {
  return await prisma.ignoredRule.create({
    data: { keyword }
  });
};

export const unignoreRule = async (id: string) => {
  await prisma.ignoredRule.delete({
    where: { id }
  });
};
