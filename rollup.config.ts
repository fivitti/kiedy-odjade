import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import minify from 'rollup-plugin-babel-minify';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';
import copy from 'rollup-plugin-copy-glob';
import gzipPlugin from 'rollup-plugin-gzip'

const pkg = require('./package.json')

const libraryName = 'ztm-gdansk'

export default {
  input: `src/index.ts`,
  output: [
    //{ file: pkg.main, name: libraryName, format: 'amd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    postcss({
      extensions: [".css"],
      plugins: [
        cssnano()
      ]
    }),
    // Compile TypeScript files
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),
    minify({
      "comments": false,
    }),
    gzipPlugin(),
    copy([
      { files: "index.html", dest: "dist"}
    ], { verbose: true })
  ],
}