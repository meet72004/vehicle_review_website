// scripts/migrate.js
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test if Review model exists
    try {
      const reviewCount = await prisma.review.count();
      console.log('✅ Review model exists, count:', reviewCount);
    } catch (error) {
      console.error('❌ Review model not found. Please run: npx prisma db push');
      console.error('Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
