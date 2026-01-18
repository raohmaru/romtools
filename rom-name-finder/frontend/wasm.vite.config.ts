
import dotenv from 'dotenv';
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default ({ mode }: { mode?: string }) => {
    dotenv.config({
        path: [
            `../.env.${mode}`,
            '../.env'
        ]
    });

    console.log('BUILDING WEBWORKER');
    console.log('Vite mode:', mode);
    console.log('Output dir:', process.env.OUTPUT_DIR);

    // https://vite.dev/config/
    return defineConfig({
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: 'node_modules/sql.js/dist/sql-wasm.wasm',
                        dest: `../${process.env.OUTPUT_DIR}/wasm/`
                    }
                ]
            })
        ],
        build: {
            minify: false,
            emptyOutDir: false,
            rollupOptions: {
                input: {
                    'wasm/worker.sql-wasm': 'src/workers/worker.sql-wasm.ts',
                },
                output: {
                    entryFileNames: '[name].js',
                    dir: process.env.OUTPUT_DIR
                },
            },
        },
    })
};
