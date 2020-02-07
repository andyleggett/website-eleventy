import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import css from 'rollup-plugin-css-only';

export default {
    input: 'src/_code/charger/charger.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'charger',
        file: '_site/scripts/charger.js'
    },
    plugins: [
        svelte({
            dev: false,
            css: css => {
                css.write('_site/css/code.css');
            }
        }),
        resolve({
            preferBuiltins: true
        }),
        commonjs(),
        css({
            output: '_site/css/vendor.css'
        })
    ]
};
