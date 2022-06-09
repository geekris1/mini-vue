const { build } = require("esbuild");
const { resolve } = require("path");
const path = require("path");
const arg = require("minimist")(process.argv.slice(2));

const target = arg._[0] || "reactivity";

const format = arg.f || "global";

const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`);

const packagesName = require(path.resolve(
  __dirname,
  `../packages/${target}/package.json`
)).buildOptions?.name;

const outputFormat = format.startsWith("global")
  ? "iife"
  : format === "cjs"
  ? "cjs"
  : "esm";

const outfile = path.resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
);

build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  sourcemap: true,
  format: outputFormat,
  globalName: packagesName,
  platform: format === "cjs" ? "node" : "browser",
  watch: {
    onRebuild(err) {
      if (!err) console.log("rebuild~~~");
    },
  },
}).then(() => {
  console.log("watching~~~~");
});
