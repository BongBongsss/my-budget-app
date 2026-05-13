import prisma from './db';
import { cleanupTransactions } from './services/transactionService';

async function main() {
  console.log('🧹 Starting transaction cleanup and hash recalculation...');
  try {
    const result = await cleanupTransactions();
    console.log(`✅ Cleanup complete!`);
    console.log(`📊 Updated: ${result.updatedCount}`);
    console.log(`🗑️ Deleted duplicates: ${result.deletedCount}`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
