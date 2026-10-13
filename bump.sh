#!/bin/sh
# Bump the ?v= stamp on every CSS/JS link so phones and the projector load the new version.
cd "$(dirname "$0")"
v=$(date +%s)
for f in index.html host.html screen.html; do sed -i '' -E "s/\?v=[0-9]+\"/?v=$v\"/g" "$f"; done
echo "assets stamped v=$v"
