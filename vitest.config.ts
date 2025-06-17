import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        // Critical components require 95% coverage
        './hooks/useYouTubePlayer.ts': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        './hooks/useLoopMemory.ts': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        './components/YouTubePlayer.tsx': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        './components/Timeline.tsx': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      },
      exclude: [
        'node_modules/**',
        'cdk/**',
        '.next/**',
        'out/**',
        'coverage/**',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        'src/test/**',
        'cypress/**'
      ]
    },
    // Mock canvas for Timeline tests
    server: {
      deps: {
        external: []
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '~': path.resolve(__dirname, './')
    }
  }
})