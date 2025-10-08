// pages/api/bookmarks/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { userId, carId } = req.body;

  if (!userId || !carId)
    return res.status(400).json({ error: "Missing userId or carId" });

  try {
    const u = String(userId);
    const c = String(carId);

    const existing = await prisma.bookmark.findFirst({
      where: { userId: u, carId: c },
    });

    if (existing) return res.status(200).json({ message: "Already bookmarked" });

    await prisma.bookmark.create({
      data: { userId: u, carId: c },
    });

    return res.status(200).json({ message: "Bookmarked successfully" });
  } catch (err: any) {
    console.error("Add bookmark error:", err);
    return res.status(500).json({ error: "Failed to add bookmark", details: err.message });
  }
}
