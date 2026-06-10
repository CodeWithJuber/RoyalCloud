#!/usr/bin/env bash
#
# clone-site.sh — capture the live royalclouds.net verbatim into /tmp/rcmirror.
#
# This is the owner's own site. We pull every page listed in the sitemap plus
# all of its requisites (css/js/img/fonts), then a second pass picks up assets
# that are only referenced from inside CSS (url(), @font-face) which wget does
# not follow on its own. The result is a flat, faithful mirror that we feed into
# the Astro build (see src/pages/[...slug].astro).
#
set -euo pipefail

BASE="https://royalclouds.net"
OUT="/tmp/rcmirror"
HOST="royalclouds.net"

rm -rf "$OUT"
mkdir -p "$OUT"
cd "$OUT"

echo "==> Fetching sitemap URL list"
curl -sS --max-time 30 "$BASE/sitemap.xml" \
  | grep -oE '<loc>[^<]+</loc>' | sed 's/<[^>]*>//g' > urls.txt
echo "    $(wc -l < urls.txt) URLs"

COMMON_WGET=(--no-verbose --tries=3 --timeout=30 -e robots=off
  --user-agent="Mozilla/5.0 (clone)" --no-host-directories
  --domains="$HOST" --no-parent)

echo "==> Pass 1: pages + page-requisites"
# -p grabs each page's requisites; -k is NOT used so links stay as-authored
# (relative assets/... resolve to /assets/... at the site root, which Astro
# serves from public/).
wget "${COMMON_WGET[@]}" -p -i urls.txt 2>&1 | tail -2 || true

echo "==> Extra top-level files"
for f in robots.txt sitemap.xml favicon.ico; do
  wget "${COMMON_WGET[@]}" "$BASE/$f" 2>/dev/null || true
done

echo "==> Pass 2: assets referenced only from CSS"
# Collect url(...) and src: refs from every captured stylesheet, resolve to a
# path under the site root, and fetch any that are still missing.
missing=0
while IFS= read -r css; do
  grep -oE "url\(['\"]?[^)'\"]+" "$css" 2>/dev/null \
    | sed -E "s/^url\(['\"]?//" \
    | while IFS= read -r ref; do
        case "$ref" in
          data:*|http://*|https://*|//*) continue ;;
        esac
        # Resolve relative to the CSS file's directory, normalise ../ segments.
        dir="$(dirname "$css")"
        path="$dir/${ref%%[?#]*}"
        path="$(python3 -c "import os,sys;print(os.path.normpath(sys.argv[1]))" "$path")"
        rel="${path#./}"
        if [ ! -f "$rel" ]; then
          mkdir -p "$(dirname "$rel")"
          if wget "${COMMON_WGET[@]}" -O "$rel" "$BASE/$rel" 2>/dev/null; then
            echo "    + $rel"
          else
            rm -f "$rel"
            echo "    ! missing $rel"
          fi
        fi
      done
done < <(find . -name '*.css' -type f)

echo "==> Summary"
echo "    HTML docs : $(find . -type f \( -name '*.html' -o -name 'shared-hosting' \) | wc -l) (raw)"
echo "    assets/   : $(find assets -type f 2>/dev/null | wc -l) files"
find . -maxdepth 1 -type f | sort
