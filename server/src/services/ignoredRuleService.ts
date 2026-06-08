import prisma from '../db';

export const getIgnoredRules = async () => {
  return await prisma.ignoredRule.findMany();
};

export const ignoreRule = async (keyword: string) => {
  return await prisma.ignoredRule.upsert({
    where: { keyword },
    update: {},
    create: { keyword }
  });
};

export const unignoreRule = async (id: string) => {
  await prisma.ignoredRule.delete({
    where: { id }
  });
};
