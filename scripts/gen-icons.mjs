import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync("public/icon.svg");

async function gen(size, out) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(out);
  console.log("gerado:", out);
}

await gen(192, "public/icon-192.png");
await gen(512, "public/icon-512.png");
await gen(180, "public/apple-icon.png");
