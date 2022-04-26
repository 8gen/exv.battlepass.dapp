import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3010,
        hmr: {
            clientPort: 443
        }
    },
    plugins: [react()]
})
