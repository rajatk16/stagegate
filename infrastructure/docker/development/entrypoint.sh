#!/bin/sh

set -eu

cd /workspace

echo "Building StageGate shared packages..."

npm run build:packages

echo "Starting StageGate development process..."

exec "$@"

