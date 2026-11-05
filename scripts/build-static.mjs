import { cpSync, mkdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const output = new URL("dist/", root);
const files = [
  "index.html",
  "styles.css",
  "art.js",
  "clothes.js",
  "accessories.js",
  "scenes.js",
  "music.js",
  "game.js",
  "assets"
];

mkdirSync(output, { recursive: true });
for (const file of files) {
  cpSync(new URL(file, root), new URL(file, output), { recursive: true });
}
