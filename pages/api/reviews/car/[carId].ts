// pages/api/reviews/car/[carId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { carId } = req.query;

  if (!carId || Array.isArray(carId)) {
    return res.status(400).json({ error: "carId required" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { carId: String(carId) },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return res.status(200).json({ 
      reviews, 
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length 
    });
  } catch (err: any) {
    console.error("Get car reviews error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
