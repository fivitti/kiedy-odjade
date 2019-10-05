import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy-glob';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json')

export default {
    input: `src/index.ts`,
    output: [{
        file: "dist/bundle.js",
        format: 'es',
        sourcemap: true
    }, ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: {
        include: 'src/**',
    },
    plugins: [
        postcss({
            extensions: [".css"],
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
        copy([{
                files: "index.html",
                dest: "dist"
            },
            {
                files: "res/favicon/*",
                dest: "dist"
            }
        ], {
            verbose: true
        })
    ],
}