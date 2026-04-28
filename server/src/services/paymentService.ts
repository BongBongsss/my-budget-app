import prisma from '../db';
import { randomUUID } from 'crypto';

export interface PaymentRule {
  id: string;
  paymentType: 'card' | 'transfer';
  keyword: string;
}

export const getPaymentRules = async (): Promise<PaymentRule[]> => {
  return await prisma.paymentRule.findMany();
};

export const addPaymentRule = async (paymentType: 'card' | 'transfer', keyword: string) => {
  return await prisma.paymentRule.create({
    data: { id: randomUUID(), paymentType, keyword },
  });
};

export const deletePaymentRule = async (id: string) => {
  return await prisma.paymentRule.delete({ where: { id } });
};

// 결제 수단 자동 지정 로직
export const getPaymentType = (source: string, rules: PaymentRule[]): 'card' | 'transfer' | null => {
  const rule = rules.find(r => source.toLowerCase().includes(r.keyword.toLowerCase()));
  return rule ? (rule.paymentType as 'card' | 'transfer') : null;
};
