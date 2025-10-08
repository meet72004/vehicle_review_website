// pages/api/test-db.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to count users
    const userCount = await prisma.user.count();
    
    return res.status(200).json({ 
      message: "Database connection successful", 
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Database test error:", err);
    return res.status(500).json({ 
      error: "Database connection failed", 
      details: err.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}
