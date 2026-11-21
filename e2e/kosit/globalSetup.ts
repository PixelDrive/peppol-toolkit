export default async function setup() {
    const endpoint = process.env.KOSIT_ENDPOINT ?? 'http://localhost:8081/';
    try {
        await fetch(endpoint, { method: 'GET' });
    } catch {
        throw new Error(
            `KoSIT validator is not reachable at ${endpoint}.\n` +
                'Start it with `npm run kosit:start` (requires Java 17+), ' +
                'or set KOSIT_ENDPOINT to a running instance.'
        );
    }
}
