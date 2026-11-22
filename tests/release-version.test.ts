import { describe, expect, it } from 'vitest';
import lockfile from '../package-lock.json';
import packageJson from '../package.json';

const publishConfig: { access?: string; tag?: string } =
    packageJson.publishConfig;

describe('npm release version', () => {
    it('uses a prerelease version for canary and a stable version for latest', () => {
        const tag = publishConfig.tag ?? 'latest';
        const versionWithoutBuildMetadata = packageJson.version.split(
            '+',
            1
        )[0];
        const isPrerelease = versionWithoutBuildMetadata.includes('-');

        if (tag === 'canary') {
            expect(isPrerelease).toBe(true);
        }
        if (tag === 'latest') {
            expect(isPrerelease).toBe(false);
        }
    });

    it('keeps the lockfile version in sync with the package version', () => {
        expect(lockfile.version).toBe(packageJson.version);
        expect(lockfile.packages[''].version).toBe(packageJson.version);
    });
});
