// pages/api/reviews/[userId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ error: "userId required" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { userId: String(userId) },
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

    // Get car information for each review
    const reviewsWithCars = await Promise.all(
      reviews.map(async (review) => {
        try {
          // Try to get car info from the cars.json file
          const fs = require('fs');
          const path = require('path');
          const jsonPath = path.join(process.cwd(), "public", "data", "cars.json");
          const carsData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
          const car = carsData.find((c: any) => String(c.id) === String(review.carId));
          
          return {
            ...review,
            car: car ? { name: car.name, brand: car.brand } : null
          };
        } catch (err) {
          console.warn("Could not load car info for review:", review.id);
          return {
            ...review,
            car: null
          };
        }
      })
    );

    return res.status(200).json({ reviews: reviewsWithCars });
  } catch (err: any) {
    console.error("Get reviews error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
