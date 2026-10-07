#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/LC_App_GitHub_Pages_Upload"
PORT="${PORT:-4173}"

echo "LC App local review: http://localhost:${PORT}/"
python3 -m http.server "$PORT"
