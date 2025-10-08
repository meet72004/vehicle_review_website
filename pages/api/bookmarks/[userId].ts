// pages/api/bookmarks/[userId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
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
    const uid = String(userId);

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: uid },
      select: { carId: true },
    });

    const bookmarkIds = bookmarks.map((b) => String(b.carId));

    const jsonPath = path.join(process.cwd(), "public", "data", "cars.json");
    let cars: any[] = [];
    try {
      const raw = fs.readFileSync(jsonPath, "utf8");
      cars = JSON.parse(raw);
    } catch (err) {
      console.warn("Could not read cars.json:", err);
      // continue; return empty cars if file not available
    }

    const bookmarkedCars = cars.filter((c: any) =>
      bookmarkIds.includes(String(c.id))
    );

    return res.status(200).json({ bookmarks: bookmarkIds, cars: bookmarkedCars });
  } catch (err: any) {
    console.error("Get bookmarks error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
