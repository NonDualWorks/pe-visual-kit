// pe-visual-kit · Excalidraw library generator
// Run:  npm run build   → writes dist/pe-kit-sketchy.excalidrawlib and dist/pe-kit-clean.excalidrawlib
// Components live in src/kit/ (one file per category); this file only packages them.

import { mkdirSync, writeFileSync } from "node:fs";
import { STYLES, COMPONENTS } from "./kit/index.js";

mkdirSync("dist", { recursive: true });
for (const s of STYLES) {
  const libraryItems = COMPONENTS.map(([name, build], i) => ({
    id: `pe-kit-${s.name}-${i}`, status: "unpublished", created: 1763150400000, name, elements: build(s),
  }));
  const lib = { type: "excalidrawlib", version: 2, source: "https://excalidraw.com", libraryItems };
  writeFileSync(`dist/pe-kit-${s.name}.excalidrawlib`, JSON.stringify(lib, null, 2));
  console.log(`dist/pe-kit-${s.name}.excalidrawlib  (${libraryItems.length} items)`);
}
