import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/assets/scss/app.scss',
                'resources/js/app.jsx',
            ],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'slash-div'],
            },
        },
    },
    build: {
        cssCodeSplit: true,
        rollupOptions: {
            onwarn(warning, warn) {
                // Suppress CSS syntax warnings for IE hacks
                if (warning.code === 'css-syntax-error' && warning.message?.includes('*')) {
                    return;
                }
                // Use default warning handler for other warnings
                warn(warning);
            },
        },
    },
});
