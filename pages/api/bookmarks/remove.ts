// pages/api/bookmarks/remove.ts
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

    const result = await prisma.bookmark.deleteMany({
      where: { userId: u, carId: c },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    return res.status(200).json({ message: "Removed bookmark successfully" });
  } catch (err: any) {
    console.error("Remove bookmark error:", err);
    return res.status(500).json({ error: "Failed to remove bookmark", details: err.message });
  }
}
