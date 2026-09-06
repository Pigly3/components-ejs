const external = ["ejs"]

await Promise.all([
  Bun.build({
    entrypoints: ["./index.ts"],
    outdir: "./dist",
    format: "esm",
    naming: "index.js",
    external: external,
    target: "node"
  }),
  Bun.build({
    entrypoints: ["./index.ts"],
    outdir: "./dist", 
    format: "cjs",
    naming: "index.cjs",
    external: external,
    target: "node"
  })
])