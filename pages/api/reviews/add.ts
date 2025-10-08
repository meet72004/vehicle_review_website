// pages/api/reviews/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Review API called with method:", req.method);
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    console.log("Session:", session);
    
    if (!session?.user?.id) {
      console.log("No session or user ID");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { carId, rating, comment } = req.body;
    console.log("Request body:", { carId, rating, comment });

    if (!carId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");

    // Check if user already reviewed this car
    const existingReview = await prisma.review.findFirst({
      where: { userId: session.user.id, carId: String(carId) },
    });

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this car" });
    }

    const review = await prisma.review.create({
      data: {
        carId: String(carId),
        userId: session.user.id,
        rating: parseInt(rating),
        comment: String(comment),
      },
    });

    console.log("Review created successfully:", review);
    return res.status(200).json({ message: "Review added successfully", review });
  } catch (err: any) {
    console.error("Add review error:", err);
    return res.status(500).json({ 
      error: "Failed to add review", 
      details: err.message,
      stack: err.stack 
    });
  } finally {
    await prisma.$disconnect();
  }
}
