import { defineConfig } from 'vite';

export default defineConfig({
    // Base path is required for GitHub Pages project sites
    // It must match your repository name: /repo-name/
    base: '/finance/',
    build: {
        outDir: 'dist',
    }
});
