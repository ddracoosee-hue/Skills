#!/usr/bin/env bash
# Links each skill in this repo into the Muse user-skills folder, one symlink per skill, and turns on
# the repo's pre-commit secret scan. For Muse Code running inside WSL, Linux or macOS.
# On native Windows use install.ps1 instead.
#
#   ./install.sh [target-dir]        default target: ~/.agents/skills
#
# Check VERIFIED.md: Phase 0 records which folder `muse skills list` actually reads.
# Safe by design: a real folder or a link pointing elsewhere is never replaced; only symlinks that
# point into this repo are created or removed. Keep this repo on the Linux filesystem in WSL
# (e.g. ~/src/muse-skills), not under /mnt/c, for speed and correct symlinks.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src="$here/skills"
target="${1:-$HOME/.agents/skills}"
if [ -L "$target" ]; then
  [ "$(readlink "$target")" = "$src" ] || { echo "$target links elsewhere; resolve it by hand." >&2; exit 1; }
  rm "$target"; echo "Replaced the old whole-folder link at $target"
fi
mkdir -p "$target"

for link in "$target"/*; do
  [ -L "$link" ] || continue
  dest="$(readlink "$link")"
  case "$dest" in "$src"/*) [ -e "$dest" ] || { rm "$link"; echo "Removed dangling link $(basename "$link")"; } ;; esac
done

linked=0
for dir in "$src"/*/; do
  [ -d "$dir" ] || continue
  dir="${dir%/}"; name="$(basename "$dir")"; link="$target/$name"
  if [ -L "$link" ] && [ "$(readlink "$link")" = "$dir" ]; then linked=$((linked+1)); continue; fi
  if [ -e "$link" ] || [ -L "$link" ]; then echo "Skipped $name: $link exists and is not this repo's link." >&2; continue; fi
  ln -s "$dir" "$link"; linked=$((linked+1))
done

git -C "$here" config core.hooksPath .githooks
echo "$linked skill(s) linked into $target. Pre-commit scan enabled. Restart Muse, then run: muse skills list"
