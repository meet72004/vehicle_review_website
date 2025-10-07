// scripts/check_images.js
// Node 18+ recommended (uses global fetch)
import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "public", "data", "cars.json");
if (!fs.existsSync(dataPath)) {
  console.error("Missing file:", dataPath);
  process.exit(1);
}
const cars = JSON.parse(fs.readFileSync(dataPath, "utf8"));

function normalize(u) {
  if (!u) return "";
  let s = String(u).trim();
  if (s.startsWith("//")) return "https:" + s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return s;
  return "https://" + s;
}

(async () => {
  console.log(`Checking ${cars.length} images... (this may take a few seconds)`);
  const results = [];
  for (const car of cars) {
    const url = normalize(car.image);
    if (!url) {
      results.push({ id: car.id, url: null, ok: false, reason: "empty" });
      continue;
    }
    try {
      // use HEAD first; some servers don't support HEAD, fallback to GET
      let resp = await fetch(url, { method: "HEAD" });
      if (!resp.ok) {
        // try GET as fallback
        resp = await fetch(url, { method: "GET" });
      }
      results.push({ id: car.id, url, ok: resp.ok, status: resp.status });
    } catch (err) {
      results.push({ id: car.id, url, ok: false, reason: err.message });
    }
  }

  const fails = results.filter(r => !r.ok || (r.status && r.status >= 400));
  console.log(`Checked ${results.length} images. Failures: ${fails.length}`);
  if (fails.length) console.table(fails.slice(0, 50));
})();
