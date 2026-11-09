#!/usr/bin/env bash
# Makes the web versions of the slide photos:  npm run photos
#
#   img/bg/<slide>/<any photo>  (originals, any size, not in git)
#     ->  img/slides/<slide>/01.webp, 02.webp, …
#
# <slide> is the day number (08) or a side quest (08-s1), the same names as
# the cartoons. Photos are numbered in file-name order, so name them 01.jpg,
# 02.jpg… to control the order. The app shows 01, 02, 03… until one is missing.
# Needs macOS `sips` and `cwebp` (brew install webp).
set -euo pipefail
cd "$(dirname "$0")/.."

src=img/bg
out=img/slides
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

command -v cwebp >/dev/null || { echo "cwebp ontbreekt: brew install webp" >&2; exit 1; }

rm -rf "$out"
total=0
for dir in "$src"/*/; do
  slide=$(basename "$dir")
  number=0
  while IFS= read -r photo; do
    number=$((number + 1))
    name=$(printf "%02d" "$number")
    mkdir -p "$out/$slide"
    # 1400px on the long side is sharp on a retina screen, ~150 KB as WebP
    sips -Z 1400 -s format jpeg -s formatOptions 92 "$photo" --out "$tmp/photo.jpg" >/dev/null
    cwebp -quiet -q 72 -m 6 -metadata none "$tmp/photo.jpg" -o "$out/$slide/$name.webp"
    file=$(basename "$photo")
    if [[ "${file%.*}" != "$name" ]]; then
      echo "  let op: $slide/$file is foto $name (hernoem naar $name.${file##*.} voor een vaste volgorde)"
    fi
    total=$((total + 1))
  done < <(
    find "$dir" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' \
      -o -iname '*.png' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.heic' \) |
      LC_ALL=C sort
  )
done
echo "Klaar: $total foto's in $out ($(du -sh "$out" | cut -f1))"
