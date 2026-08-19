#!/bin/sh
# Builds the site into dist/.
#
# This page had no build step, and its whole conceit is that you can read the
# source: "100% vanilla HTML, CSS and JavaScript. No frameworks. No libraries."
# That is still true of the OUTPUT — `feltwork build --mode inline` writes the
# tokens and the SVG filter defs INTO the file, so dist/index.html ships as a
# single self-contained document with no runtime dependency. The build exists
# only so the design tokens are authored once instead of copy-pasted into four
# repos and left to drift.
set -e
ROOT=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT"

if [ -x node_modules/.bin/feltwork ]; then
  FW="node_modules/.bin/feltwork"
elif [ -f ../feltwork/bin/feltwork.mjs ]; then
  FW="node ../feltwork/bin/feltwork.mjs"
else
  echo "build: feltwork not found. Run 'npm install'." >&2; exit 1
fi

rm -rf dist
mkdir -p dist
$FW build --out dist --mode inline --html src/index.html
echo "build: dist/ ready ($(du -sh dist | cut -f1))"
