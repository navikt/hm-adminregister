import { type HtmlTagDescriptor, type Plugin, defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/

function htmlPlugin({ development }: { development?: boolean }): Plugin {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      const tags: HtmlTagDescriptor[] = []
      if (development) {
        tags.push({
          tag: 'script',
          children: `window.appSettings = {
            GIT_COMMIT: 'unknown',
            USE_MSW: true,
            VITE_HM_REGISTER_URL: 'http://localhost:8080',
            VITE_IMAGE_PROXY_URL: 'http://localhost:8082/imageproxy',
            MILJO: 'local',
          }`,
        })
      } else {
        tags.push(
          {
            tag: 'script',
            children: `window.appSettings = {}`,
          },
          {
            tag: 'script',
            attrs: {
              src: '/adminregister/settings.js',
            },
          }
        )
      }
      return {
        html,
        tags,
      }
    },
  }
}

export default defineConfig((env) => ({
  base: env.mode === 'development' ? '/' : '/adminregister',
  plugins: [htmlPlugin({ development: env.mode === 'test' || env.mode === 'development' }), react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    global: true,
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['@testing-library/user-event'],
      },
    },
    setupFiles: ['vitest-setup.ts'],
  },
}))
