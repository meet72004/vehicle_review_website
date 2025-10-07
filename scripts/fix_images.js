// scripts/fix_images.js
import fs from "fs";
import path from "path";
const file = path.join(process.cwd(), "public", "data", "cars.json");
const raw = fs.readFileSync(file, "utf8");
const cars = JSON.parse(raw);

function normalize(u) {
  if (!u) return "";
  let s = String(u).trim();
  if (s.startsWith("//")) return "https:" + s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return s;
  return "https://" + s;
}

const fixed = cars.map(c => ({ ...c, image: normalize(c.image) || "" }));
fs.writeFileSync(file + ".bak", raw, "utf8");
fs.writeFileSync(file, JSON.stringify(fixed, null, 2), "utf8");
console.log("Saved fixed file and backup at", file + ".bak");
