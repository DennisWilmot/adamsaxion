import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// .jsx-in-.jsx is standard; nothing special needed.
export default defineConfig({
  plugins: [react()],
});
