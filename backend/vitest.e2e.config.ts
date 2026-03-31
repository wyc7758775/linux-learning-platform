import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 120_000,      // Docker containers can be slow
    hookTimeout: 60_000,
    teardownTimeout: 30_000,
    fileParallelism: false,     // Run tests sequentially (Docker resource limits)
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
})
