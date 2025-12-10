import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTE: For GitHub Pages, set BASE env to "/<repo-name>/" or configure in workflow.
const base = process.env.BASE || '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    sourcemap: false,
    target: 'es2018',
  },
});


