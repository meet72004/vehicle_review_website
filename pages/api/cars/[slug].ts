// pages/api/cars/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

const DATA_PATH = path.join(process.cwd(), "public", "data", "cars.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const cars = JSON.parse(raw) as any[];

    const { slug } = req.query;
    const slugStr = String(slug || "").toLowerCase();

    const car = cars.find((c) => String(c.slug).toLowerCase() === slugStr) || cars.find((c) => String(c.id) === slugStr);

    if (!car) return res.status(404).json({ error: "Car not found" });

    res.status(200).json(car);
  } catch (err: any) {
    console.error("API /cars/[slug] error:", err);
    res.status(500).json({ error: "Failed to read car data" });
  }
}
