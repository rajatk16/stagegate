import process from 'node:process';

const url = process.argv[2];

const expectedStatus = Number(process.argv[3] ?? '200');

const timeoutMs = Number(process.argv[4] ?? '3000');

const checkHealth = async () => {
  if (!url || !Number.isInteger(expectedStatus) || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Invalid health check configuration.');
  }

  const response = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'error',
    cache: 'no-store',
  });

  await response.body?.cancel();

  if (response.status !== expectedStatus) {
    throw new Error(`Unexpected HTTP status: ${response.status}`);
  }
};

try {
  await checkHealth();

  process.exitCode = 0;
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Health check failed.');

  process.exitCode = 1;
}
