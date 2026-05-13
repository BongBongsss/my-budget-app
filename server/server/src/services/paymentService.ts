import prisma from '../db';
import { randomUUID } from 'crypto';

export interface PaymentRule {
  id: string;
  paymentType: 'card' | 'transfer';
  keyword: string;
}

export const getPaymentRules = async (): Promise<PaymentRule[]> => {
  const rules = await prisma.paymentRule.findMany();
  return rules.map(r => ({
    ...r,
    paymentType: r.paymentType as 'card' | 'transfer'
  }));
};

export const addPaymentRule = async (paymentType: 'card' | 'transfer', keyword: string) => {
  return await prisma.paymentRule.create({
    data: { id: randomUUID(), paymentType, keyword },
  });
};

export const deletePaymentRule = async (id: string) => {
  return await prisma.paymentRule.delete({ where: { id } });
};

const getPaymentType = (source: string, rules: PaymentRule[]): 'card' | 'transfer' | null => {
  for (const rule of rules) {
    if (source.toLowerCase().includes(rule.keyword.toLowerCase())) {
      return rule.paymentType;
    }
  }
  return null;
};

// 기존 데이터에 결제 규칙 일괄 적용
export const applyPaymentRulesToExisting = async () => {
  const transactions = await prisma.transaction.findMany();
  const rules = await getPaymentRules();
  
  let updatedCount = 0;
  for (const tx of transactions) {
    if (!tx.source) continue;
    
    const paymentType = getPaymentType(tx.source, rules);
    if (paymentType) {
      // 규칙에 맞게 source 필드를 표준화 (예: '신한카드' -> '신한카드 (카드결제)') 
      // 혹은 단순히 탭 필터링에 걸리도록 키워드를 보장하는 방식으로 업데이트
      const targetKeyword = paymentType === 'card' ? '카드' : '이체';
      if (!tx.source.toLowerCase().includes(targetKeyword.toLowerCase())) {
         await prisma.transaction.update({
           where: { id: tx.id },
           data: { source: `${tx.source} (${targetKeyword})` }
         });
         updatedCount++;
      }
    }
  }
  return updatedCount;
};
