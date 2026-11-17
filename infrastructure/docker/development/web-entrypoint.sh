#!/bin/sh

set -eu

cd /workspace

exec npm run dev \
  --workspace=@stagegate/web \
  -- \
  --host 0.0.0.0 \
  --port 3000 \
  --strictPort

