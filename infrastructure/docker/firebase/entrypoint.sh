#!/bin/sh

set -eu

PROJECT_ID="${FIREBASE_PROJECT_ID:-demo-stagegate}"
DATA_DIR="/data"
EXPORT_DIR="${DATA_DIR}/export"

case "$PROJECT_ID" in
  demo-*)
    ;;
  *)
    echo "Refusing to start emulators with a non-demo project ID." >&2
    exit 1
    ;;
esac

if [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]; then
  echo "Cloud credentials are not allowed in the emulator container." >&2
  exit 1
fi

mkdir -p "$DATA_DIR"

set -- firebase emulators:start \
  --config /workspace/firebase.docker.json \
  --project "$PROJECT_ID" \
  --only auth,firestore \
  --export-on-exit "$EXPORT_DIR"

if [ -f "${EXPORT_DIR}/firebase-export-metadata.json" ]; then
  echo "Importing existing Firebase emulator data."

  set -- "$@" --import "$EXPORT_DIR"
else
  echo "Starting with empty Firebase emulator data."
fi

exec "$@"
