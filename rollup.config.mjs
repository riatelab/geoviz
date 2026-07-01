// Plugins import
import commonjs from "@rollup/plugin-commonjs";
import noderesolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

const plugins = [
  commonjs(), // prise en charge de require
  noderesolve(), // prise en charge des modules depuis node_modules
  babel({ babelHelpers: "bundled" }), // transpilation
  terser(), // minification
];

export default [
  // Full version
  {
    input: "src/index.js",
    output: {
      format: "umd",
      file: "dist/index.min.js",
      name: "geoviz",
    },
    plugins,
  },
  // Light version
  {
    input: "src/index-lite.js",
    output: {
      format: "umd",
      file: "dist/index-lite.min.js",
      name: "geoviz",
    },
    plugins,
  },
];
