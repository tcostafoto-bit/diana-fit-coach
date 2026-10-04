#!/bin/bash
# Junta as partes de src/ no index.html que a Vercel publica.
set -e
cd "$(dirname "$0")/.."
cat src/00-head.html src/01-base-data.js src/02-extra-data.js src/02b-figs.js src/03-program.js src/03b-nutri.js src/04-engine.js > index.html
echo "index.html: $(wc -c < index.html) bytes"
