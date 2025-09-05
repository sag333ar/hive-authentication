import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['localhost', '127.0.0.1', 'e7fe6d7207c3.ngrok-free.app'],
  },

  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'HiveAuthentication',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
