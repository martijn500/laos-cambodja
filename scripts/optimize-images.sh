#!/usr/bin/env bash
# Makes the web versions of the slide photos and cartoons:  npm run images
#
#   img/slides-src/<slide>/<any photo>  (originals, any size, not in git)
#     ->  img/slides/<slide>/01.webp, 02.webp, …
#   img/slides/<slide>/01.webp
#     ->  img/slides/<slide>/thumb.webp  (timeline thumbnail, 360px wide)
#   img/cartoons-src/<slide>.png  (originals with transparency, not in git)
#     ->  img/cartoons/<slide>.webp
#
# <slide> is the day number (08) or a side quest (08-s1). Photos are
# numbered in file-name order, so name them 01.jpg, 02.jpg… to control the
# order. A missing source folder is skipped, so a fresh clone can still run
# this for whatever originals it has.
# Needs macOS `sips` and `cwebp` (brew install webp).
set -euo pipefail
cd "$(dirname "$0")/.."

command -v cwebp >/dev/null || { echo "cwebp ontbreekt: brew install webp" >&2; exit 1; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

photos() {
  local src=img/slides-src out=img/slides total=0
  [[ -d $src ]] || { echo "Geen $src, foto's overgeslagen"; return; }
  rm -rf "$out"
  for dir in "$src"/*/; do
    local slide number=0
    slide=$(basename "$dir")
    while IFS= read -r photo; do
      number=$((number + 1))
      local name file
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
}

thumbs() {
  local total=0
  for photo in img/slides/*/01.webp; do
    # Shown at ~172x61 CSS px in the timeline: 360px wide is sharp at 2x
    cwebp -quiet -resize 360 0 -q 70 -m 6 -metadata none "$photo" \
      -o "$(dirname "$photo")/thumb.webp"
    total=$((total + 1))
  done
  echo "Klaar: $total thumbnails in img/slides/*/thumb.webp"
}

cartoons() {
  local src=img/cartoons-src out=img/cartoons total=0
  [[ -d $src ]] || { echo "Geen $src, cartoons overgeslagen"; return; }
  mkdir -p "$out"
  for png in "$src"/*.png; do
    # Shown at most 240 CSS px wide, so the ~430px originals are 2x already
    cwebp -quiet -q 82 -alpha_q 90 -m 6 -metadata none "$png" \
      -o "$out/$(basename "${png%.png}").webp"
    total=$((total + 1))
  done
  echo "Klaar: $total cartoons in $out ($(du -sh "$out" | cut -f1))"
}

# npm run images            everything
# npm run images cartoons   only one step (photos, thumbs, cartoons)
for step in "${@:-photos thumbs cartoons}"; do
  case $step in
    photos | thumbs | cartoons) "$step" ;;
    *) echo "Onbekend: $step (photos, thumbs of cartoons)" >&2; exit 1 ;;
  esac
done
