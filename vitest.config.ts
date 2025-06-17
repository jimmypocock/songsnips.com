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
        // Critical components with realistic coverage targets
        './hooks/useYouTubePlayer.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        './hooks/useLoopMemory.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        './components/YouTubePlayer.tsx': {
          branches: 80,
          functions: 45,
          lines: 75,
          statements: 75
        },
        './components/Timeline.tsx': {
          branches: 90,
          functions: 85,
          lines: 90,
          statements: 90
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