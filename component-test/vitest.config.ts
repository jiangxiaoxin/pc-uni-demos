import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/components/**/*.vue', 'src/composables/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
