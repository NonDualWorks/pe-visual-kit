# Talk: From full copies to sandboxes

A Slidev deck in three parts: current state → short term → long term.

## Run it

```
npm install
npm run dev        # opens the deck; press the presenter icon (or go to /presenter) for notes + timer
```

## Replace a picture

1. Draw in Excalidraw: open the matching file from `../../excalidraw-kit/dist/examples/` (same name as the image), or drop the SVG itself onto excalidraw.com.
2. **Export → SVG with "Embed scene" turned on**, and save over the file in `public/images/` (same name).
   The SVG keeps its Excalidraw source: drop it onto excalidraw.com to edit it again.
3. Pictures are scaled down to fit a slide, so draw them roughly 16:9 and keep text large (≥ 20px).

## Reveals and notes

- `<v-clicks>` around a list reveals one item per click; `v-click` on any element reveals it.
- `v-mark.circle.orange="2"` draws a hand-drawn circle on click 2 (same look as Excalidraw).
- Speaker notes are the `<!-- ... -->` block at the end of each slide. `[click]` markers highlight in sync with your clicks in presenter mode.

## Record

- Built in: in presenter mode, use the camera and record buttons. Record camera and slides as **separate files** for easier editing.
- Or use CleanShot X (screen + webcam bubble).
- Record one part at a time (current state / short term / long term), so a retake is short.
- Recordings go in `recordings/` (git-ignored).

## Share

- `npm run export` → PDF (for Confluence). Needs `playwright-chromium` installed once.
- `npm run build` → static site in `dist/`, opens from any folder or static host.
- The MP4 from recording → your video host.
