import { expect } from 'vitest';
import { ZodError } from 'zod';

/**
 * Asserts that `fn` throws a `ZodError` containing an issue at `expectedPath`.
 */
export function expectZodPath(
    fn: () => unknown,
    expectedPath: (string | number)[]
): void {
    let caught: unknown;
    try {
        fn();
    } catch (error) {
        caught = error;
    }
    expect(caught).toBeInstanceOf(ZodError);
    expect(
        (caught as ZodError).issues.map((issue) => issue.path)
    ).toContainEqual(expectedPath);
}
