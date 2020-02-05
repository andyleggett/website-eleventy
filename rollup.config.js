import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/_code/charger.js',
    output: {
        sourcemap: true,
        format: 'iife',
        file: '_site/scripts/charger.js'
    },
    plugins: [
        svelte({
            dev: false,
            css: css => {
                css.write('_site/css/code.css');
            }
        }),
        resolve(),
        commonjs()
    ]
};
