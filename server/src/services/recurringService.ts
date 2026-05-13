import prisma from '../db';
import { randomUUID } from 'crypto';

export const getAllRecurringTransactions = async () => {
  return await prisma.recurringTransaction.findMany();
};

export const addRecurringTransaction = async (data: any) => {
  return await prisma.recurringTransaction.create({
    data: {
      id: randomUUID(),
      vendor: data.vendor,
      amount: data.amount,
      category: data.category,
      type: data.type || 'expense',
      day_of_month: data.day_of_month,
    },
  });
};

export const deleteRecurringTransaction = async (id: string) => {
  return await prisma.recurringTransaction.delete({
    where: { id },
  });
};

export const processRecurringTransactions = async () => {
  const recurring = await prisma.recurringTransaction.findMany();
  const today = new Date();
  const day = today.getDate();
  const dateStr = today.toISOString().split('T')[0];

  for (const item of recurring) {
    if (item.day_of_month === day) {
      const existing = await prisma.transaction.findFirst({
        where: {
          date: dateStr,
          vendor: item.vendor,
          source: 'recurring',
          isDeleted: false
        }
      });
      
      if (!existing) {
        await prisma.transaction.create({
          data: {
            id: randomUUID(),
            date: dateStr,
            amount: item.amount,
            vendor: item.vendor,
            category: item.category,
            type: item.type,
            source: 'recurring',
            isDeleted: false,
            isVerified: true
          }
        });
      }
    }
  }
};
