import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { buildWardrobe } from "../studio.js";

const source = ["art.js", "clothes.js"].map(file => readFileSync(new URL("../" + file, import.meta.url), "utf8")).join("\n");
const catalogs = runInNewContext(source + "\n({tops: TOPS, bottoms: BOTTOMS, dresses: DRESSES, shoes: SHOES})");
globalThis.FileReader = class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend();
  }
};
const file = await new GLTFExporter().parseAsync(buildWardrobe(catalogs), { binary: true });
writeFileSync(join(tmpdir(), "lulu-wardrobe-source.glb"), new Uint8Array(file));
