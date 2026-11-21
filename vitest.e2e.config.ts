import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['e2e/**/*.e2e.test.ts'],
        globalSetup: ['e2e/kosit/globalSetup.ts'],
        testTimeout: 30_000,
    },
});
