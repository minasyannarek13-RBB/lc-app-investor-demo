#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
PORT="${PORT:-4173}"

echo "LC App local review: http://localhost:${PORT}/"
python3 -m http.server "$PORT" --bind 127.0.0.1
