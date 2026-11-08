#!/usr/bin/env bash
# Builds dist/ from src/index.html and data/*.txt.
#   ./build.sh          build
#   ./build.sh serve    build, then serve at http://localhost:8830
#   ./build.sh deploy   build, then publish to https://kawillion.rennko.tech (Cloudflare Workers)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist
cp src/index.html dist/index.html && rm -rf dist/art && cp -R src/art dist/art
python3 tools/compile.py
case "${1:-}" in
  serve) echo "Serving at http://localhost:8830"; python3 -m http.server 8830 --directory dist ;;
  deploy) npx -y wrangler@4 d1 execute kawillion --remote --command "$(grep -v "^--" schema.sql | tr "\n" " ")" && npx -y wrangler@4 deploy ;;
esac
