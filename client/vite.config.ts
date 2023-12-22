import react from '@vitejs/plugin-react'
import { defineConfig, Plugin } from 'vite'

const htmlPlugin = ({ development }: { development?: boolean }): Plugin => ({
    name: 'html-transform',
    async transformIndexHtml(html) {
        if (development) {
            return {
                html: html,
                tags: [
                    {
                        tag: 'script',
                        children: `window.appSettings = {
                                  USE_MSW: false,
                                }`,
                    },
                ],
            }
        } else {
            return {
                html,
                tags: [
                    {
                        tag: 'script',
                        children: `window.appSettings = {
                                  USE_MSW: false,
                                }`,
                    },
                ],
            }
        }
    },
})

// https://vitejs.dev/config/
export default defineConfig((env) => ({
    base: env.mode === 'development' ? '/' : '/adminregister-vite',
    plugins: [react()],
}))
