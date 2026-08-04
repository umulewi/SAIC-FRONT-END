import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "../../../client/src/images");
const outDir = path.resolve(__dirname, "../../../client/public/images");

const jobs = [
  ["beautiful-shot-cornfield-with-blue-sky.jpg", "hero-cornfield.jpg", 1920],
  ["organic-food-farm.jpg", "about-organic-farm.jpg", 1600],
  ["handful-soil-being-sprinkled-agricultural-land.jpg", "service-incubation.jpg", 1200],
  ["cheerful-african-farmer-talking-phone-while-working-field.jpg", "service-branding.jpg", 1200],
  ["medium-shot-smiley-farmer-cornfield.jpg", "service-advisory.jpg", 1200],
  ["photorealistic-view-african-people-harvesting-vegetables-grains.jpg", "service-training.jpg", 1200],
  ["woman-working-rural-farming-agriculture-sector-celebrate-women-working-field-labour-day.jpg", "impact-community.jpg", 1200],
  ["side-view-woman-holding-carrots.jpg", "gallery-1.jpg", 1000],
  ["photorealistic-view-african-people-harvesting-vegetables-grains (1).jpg", "gallery-2.jpg", 1000],
];

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const [srcName, outName, maxWidth] of jobs) {
  const srcPath = path.join(srcDir, srcName);
  const outPath = path.join(outDir, outName);
  if (!fs.existsSync(srcPath)) {
    console.log("MISSING", srcPath);
    continue;
  }
  const before = fs.statSync(srcPath).size;
  await sharp(srcPath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(outPath);
  const after = fs.statSync(outPath).size;
  console.log(
    `${srcName} -> ${outName}: ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024).toFixed(0)}KB`
  );
}
