import { loadEnv } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
    test: {
        // mode defines what ".env.{mode}" file to choose if exists
        env: loadEnv(mode, process.cwd(), ''),
        // KoSIT end-to-end tests need a running validator, see vitest.e2e.config.ts
        exclude: [...configDefaults.exclude, 'e2e/**'],
    },
}));
