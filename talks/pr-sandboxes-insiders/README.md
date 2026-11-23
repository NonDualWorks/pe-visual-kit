# One baseline, a sandbox per PR · insiders deck

The long-term design only, for a small group of insiders before the full pitch. 45 slides in 10 sections:
end state · same pipeline, new plumbing · building the baseline · life of a PR · test suites as components ·
transition · Concourse as the harness · will it scale? · keeping it safe · open questions.

```
npm install
npm run dev        # http://localhost:3030 · presenter view at /presenter
npm run build      # static site in dist/
npm run export     # PDF (needs: npm i -D playwright-chromium)
```

Pictures are in `public/images/`: Excalidraw SVGs with the scene embedded, so you can open one in Excalidraw, edit, and export again with "Embed scene" on.
Their sources are the `ins-*` scenes in `excalidraw-kit/src/insiders.ts`.
