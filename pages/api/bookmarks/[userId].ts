// pages/api/bookmarks/[userId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";
import { getDb } from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId || Array.isArray(userId)) return res.status(400).json({ error: "userId required" });

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(String(userId)) }, { projection: { bookmarks: 1 } });
    const bookmarks: string[] = user?.bookmarks || [];

    // Read public/data/cars.json
    const jsonPath = path.join(process.cwd(), "public", "data", "cars.json");
    let cars: any[] = [];
    try {
      const raw = fs.readFileSync(jsonPath, "utf8");
      cars = JSON.parse(raw);
    } catch (err) {
      console.warn("Could not read cars.json", err);
    }

    // return full car objects for bookmarked ids
    const bookmarkedCars = cars.filter((c: any) => bookmarks.includes(String(c.id)));

    res.status(200).json({ bookmarks, cars: bookmarkedCars });
  } catch (err: any) {
    console.error("Get bookmarks error:", err);
    res.status(500).json({ error: "Server error", details: err?.message });
  }
}
