import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },build: {
    outDir: '../backend/pb_public', 
    
    // Esto borra el contenido viejo de pb_public antes de compilar (recomendado)
    emptyOutDir: true, 
  }
})