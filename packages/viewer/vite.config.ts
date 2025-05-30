import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { codeInspectorPlugin } from 'code-inspector-plugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    console.log(`env`, env);
    return {
        plugins: [
            react({
                tsDecorators: true,
            }),
            codeInspectorPlugin({
                bundler: 'vite',
            }),
        ],
        build: {
            sourcemap: mode === 'development',
            target: ['es2022', 'chrome100', 'safari13'],
            outDir: 'dist-client',
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            host: '0.0.0.0',
            proxy: {
                '^/peer': {
                    target: env.VITE__VOERKA__PEER_SERVER__PROXY || 'http://127.0.0.1:8000/api/peer/',
                    // rewrite: (path) => path.replace(/^\/peer/, ""),
                    // ws: true,
                    changeOrigin: true,
                },
                '^/api': {
                    target: env.VITE__VOERKA__SERVER__PROXY || 'http://127.0.0.1:8000/api/',
                    rewrite: (path: string) => path.replace(/^\/api/, ''),
                    // ws: true,
                    changeOrigin: true,
                },
            },
        },
    };
});
