import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig((env) => ({
    base: env.mode === 'development' ? '/' : '/adminregister-vite',
    plugins: [react()],
}))
