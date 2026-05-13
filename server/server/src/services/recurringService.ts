import prisma from '../db';
import { randomUUID } from 'crypto';

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
          source: 'recurring'
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
          }
        });
      }
    }
  }
};
