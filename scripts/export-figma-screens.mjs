#!/usr/bin/env node
/**
 * Export Tabby Figma frames as PNGs into public/screens/.
 *
 * Usage:
 *   FIGMA_TOKEN=figd_xxx node scripts/export-figma-screens.mjs
 *
 * Get a token at: https://www.figma.com/developers/api#access-tokens
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE_KEY = "EqRZbskb9ok0IJh8xbZk2A";
const SCALE = 3;

// All 17 screens from the 3/9/2026 page, in logical user-journey order.
const FRAMES = [
  { id: "439:1476", name: "welcome" },          // 1. Onboarding
  { id: "439:491",  name: "scan" },             // 2. Create Tab (camera)
  { id: "439:510",  name: "claim" },            // 3. Select Items
  { id: "439:688",  name: "claim-expanded" },   // 4. Select Items - Expanded
  { id: "439:1240", name: "split-amount" },     // 5. Split Amount
  { id: "439:1092", name: "add-split" },        // 6. Add Split Amount
  { id: "439:1981", name: "tip" },              // 7. Add Tip
  { id: "439:839",  name: "settle" },           // 8. Payment Methods
  { id: "439:1038", name: "card" },             // 9. Virtual Card
  { id: "439:1066", name: "confirmation" },     // 10. Confirmation
  { id: "439:2137", name: "order-summary" },    // 11. User Order Summary
  { id: "439:953",  name: "progress" },         // 12. Tab Progress
  { id: "439:973",  name: "progress-friend" },  // 13. Tab Progress - Friend
  { id: "439:1794", name: "smart-receipts" },   // 14. Smart Receipts (taller)
  { id: "439:1381", name: "dashboard" },        // 15. Dashboard
  { id: "439:1491", name: "friends" },          // 16. Friends
  { id: "439:1610", name: "groups" },           // 17. Groups
  { id: "439:1483", name: "cat-mascot" },       // Black cat asset (nav peek)
];

const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error("Missing FIGMA_TOKEN. Get one at https://figma.com/developers/api#access-tokens");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "..", "public", "screens");
await fs.mkdir(outDir, { recursive: true });

const ids = FRAMES.map((f) => f.id).join(",");
const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=${SCALE}`;

console.log("Requesting image URLs from Figma…");
const res = await fetch(url, { headers: { "X-Figma-Token": token } });
if (!res.ok) {
  console.error("Figma API error:", res.status, await res.text());
  process.exit(1);
}
const data = await res.json();
if (data.err) {
  console.error("Figma error:", data.err);
  process.exit(1);
}

for (const frame of FRAMES) {
  const imgUrl = data.images[frame.id];
  if (!imgUrl) {
    console.warn(`! ${frame.name} (${frame.id}) — no image URL returned`);
    continue;
  }
  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) {
    console.warn(`! ${frame.name} — fetch failed ${imgRes.status}`);
    continue;
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const outPath = path.join(outDir, `${frame.name}.png`);
  await fs.writeFile(outPath, buf);
  console.log(`✓ public/screens/${frame.name}.png (${(buf.length / 1024).toFixed(0)} KB)`);
}

console.log("\nDone. Rebuild the site to pick them up.");
