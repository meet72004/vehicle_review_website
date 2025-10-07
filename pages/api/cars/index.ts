// pages/api/cars/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

const DATA_PATH = path.join(process.cwd(), "public", "data", "cars.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const cars = JSON.parse(raw) as any[];

    const { search, brand, limit, offset, sort } = req.query;
    let results = Array.isArray(cars) ? cars.slice() : [];

    if (brand) {
      const b = String(brand).toLowerCase();
      results = results.filter((c) => (c.brand || "").toLowerCase() === b);
    }

    if (search) {
      const s = String(search).toLowerCase();
      results = results.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(s) ||
          (c.brand || "").toLowerCase().includes(s) ||
          (c.slug || "").toLowerCase().includes(s)
      );
    }

    // basic sort options: price_asc, price_desc, name_asc, name_desc
    if (sort === "price_asc") {
      results.sort((a, b) => (a.price_value || 0) - (b.price_value || 0));
    } else if (sort === "price_desc") {
      results.sort((a, b) => (b.price_value || 0) - (a.price_value || 0));
    } else if (sort === "name_asc") {
      results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    const total = results.length;
    const o = offset ? parseInt(String(offset), 10) : 0;
    const l = limit ? parseInt(String(limit), 10) : 50;
    const page = results.slice(o, o + l);

    res.status(200).json({ total, results: page });
  } catch (err: any) {
    console.error("API /cars error:", err);
    res.status(500).json({ error: "Failed to read cars data" });
  }
}
