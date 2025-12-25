import type { BuildConfig } from "bun";
import glob from "fast-glob";

const browserHooks = await glob("./src/browser/*.ts");
const entrypoints = ["./src/index.ts", ...browserHooks];

const defaultBuildConfig: BuildConfig = {
  entrypoints,
  outdir: "./dist",
  target: "browser",
  minify: true,
  sourcemap: "external",
  root: "src",
  external: ["react", "react-dom"],
};

await Promise.all([
  Bun.build({
    ...defaultBuildConfig,
    format: "esm",
    naming: "[dir]/[name].js",
  }),
  Bun.build({
    ...defaultBuildConfig,
    format: "cjs",
    naming: "[dir]/[name].cjs",
  }),
]);
