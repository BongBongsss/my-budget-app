import prisma from '../db';

export const getExclusionRules = async () => {
  return await prisma.exclusionRule.findMany();
};

export const addExclusionRule = async (keyword: string) => {
  return await prisma.exclusionRule.create({
    data: { keyword }
  });
};

export const deleteExclusionRule = async (id: string) => {
  await prisma.exclusionRule.delete({
    where: { id }
  });
};
