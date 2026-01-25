import dotenv from 'dotenv';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { configDefaults } from 'vitest/config'

export default ({ mode }: { mode?: string }) => {
    dotenv.config({
        path: [
            `../.env.${mode}`,
            '../.env'
        ]
    });
    // https://vite.dev/config/
    return defineConfig({
        plugins: [
            react(),
        ],
        base: './',
        build: {
            rollupOptions: {
                treeshake: {
                    moduleSideEffects: false,
                    propertyReadSideEffects: false,
                    tryCatchDeoptimization: false
                },
                output: {
                    manualChunks: {
                        // Separate vendor chunks for better caching
                        'react-vendor': ['react', 'react-dom'],
                        'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
                        'ui-vendor': ['react-window']
                    }
                }
            },
            // Enable more aggressive minification
            // minify: 'terser',
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.info', 'console.debug']
                }
            }
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@/components': path.resolve(__dirname, './src/components'),
                '@/hooks': path.resolve(__dirname, './src/hooks'),
                '@/stores': path.resolve(__dirname, './src/stores'),
                '@/services': path.resolve(__dirname, './src/services'),
                '@/types': path.resolve(__dirname, './src/types'),
                '@/utils': path.resolve(__dirname, './src/utils'),
                '@/contexts': path.resolve(__dirname, './src/contexts'),
                '@/img': path.resolve(__dirname, './src/img'),
            },
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/vitest.setup.ts'],
            exclude: [...configDefaults.exclude, 'e2e/**'],
            include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
        },
    })
};
