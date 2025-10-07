// pages/api/bookmarks/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, carId } = req.body ?? {};
  if (!userId || !carId) return res.status(400).json({ error: "userId and carId required" });

  try {
    const client = await clientPromise;
    // if you put the DB name in your connection string, client.db() will use it;
    // otherwise set process.env.MONGODB_DB to the DB name and it will be used here.
    const db = client.db(process.env.MONGODB_DB || undefined);

    const filter = { _id: new ObjectId(String(userId)) };

    // Use $addToSet to avoid duplicate bookmarks. TypeScript's mongodb types can be strict,
    // so we cast the update to 'any' to avoid compile errors while preserving correct behavior.
    const update = { $addToSet: { bookmarks: { $each: [String(carId)] } } } as any;

    const result = await db.collection("users").updateOne(filter, update);

    if (result.matchedCount === 0) return res.status(404).json({ error: "User not found" });

    const user = await db.collection("users").findOne(filter, { projection: { bookmarks: 1 } });

    return res.status(200).json({ bookmarks: user?.bookmarks || [] });
  } catch (err: any) {
    console.error("Bookmark add error:", err);
    return res.status(500).json({ error: "Server error", details: err?.message });
  }
}
