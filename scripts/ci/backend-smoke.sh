#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  result=$?

  if [ "$result" -ne 0 ]; then
    docker logs stagegate-api-ci || true
  fi

  docker rm --force stagegate-api-ci >/dev/null 2>&1 || true
  exit "$result"
}

trap cleanup EXIT

docker run --detach \
  --name stagegate-api-ci \
  --network host \
  --env NODE_ENV=test \
  --env PORT=3000 \
  --env FRONTEND_ORIGIN=http://localhost:5173 \
  --env FIREBASE_MODE=emulator \
  --env FIREBASE_PROJECT_ID=demo-stagegate-ci \
  --env FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
  --env FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
  --env FIREBASE_STORAGE_BUCKET=demo-stagegate-ci.appspot.com \
  --env FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199 \
  --env EMAIL_PROVIDER=memory \
  --env SHUTDOWN_TIMEOUT_MS=8000 \
  stagegate-api:ci

curl \
  --fail \
  --silent \
  --show-error \
  --retry 60 \
  --retry-all-errors \
  --retry-delay 1 \
  --retry-max-time 90 \
  --max-time 3 \
  http://127.0.0.1:3000/api/v1/health/ready

docker stop --time 45 stagegate-api-ci

exit_code="$(docker inspect \
  --format '{{.State.ExitCode}}' \
  stagegate-api-ci)"

test "$exit_code" = 0
