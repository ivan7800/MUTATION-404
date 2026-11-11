#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
if ! command -v node >/dev/null 2>&1; then
  echo "Necesitas Node.js 20 o posterior: https://nodejs.org/"
  read -r -p "Pulsa Intro para cerrar..." _ || true
  exit 1
fi
node scripts/launch.mjs "$@"
