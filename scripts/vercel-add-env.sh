#!/usr/bin/env bash
# Prompts for each named environment variable (input hidden) and saves it to the
# linked Vercel project for both Production and Preview (all preview branches).
# Values are never echoed or written to disk. Afterwards it checks with Vercel
# that each variable really exists in both environments.
#
#   bash scripts/vercel-add-env.sh CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "$#" -eq 0 ]; then
  echo "Usage: bash scripts/vercel-add-env.sh NAME [NAME...]"
  exit 1
fi

VERCEL="npx -y vercel@latest"
ERR="$(mktemp)"
trap 'rm -f "$ERR"' EXIT

for NAME in "$@"; do
  printf "\nPaste the value for %s and press Enter (hidden): " "$NAME"
  IFS= read -rs VALUE
  echo
  VALUE="$(printf %s "$VALUE" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  if [ -z "$VALUE" ]; then
    echo "  ✘ Nothing pasted for $NAME — stopping. Run the command again to retry."
    exit 1
  fi
  # One non-interactive call for both environments; --yes accepts "all preview branches".
  if printf %s "$VALUE" | $VERCEL env add "$NAME" --environment production,preview --yes --force >/dev/null 2>"$ERR"; then
    echo "  ✔ $NAME sent to Vercel"
  else
    echo "  ✘ Could not save $NAME:"
    grep -v "^Vercel CLI" "$ERR" | tail -3 | sed 's/^/    /'
    exit 1
  fi
done
VALUE=""

echo
echo "Checking with Vercel…"
LIST="$($VERCEL env ls 2>/dev/null)"
OK=1
for NAME in "$@"; do
  LINE="$(printf '%s\n' "$LIST" | awk -v n="$NAME" '$1 == n' | tr '\n' ' ')"
  if printf %s "$LINE" | grep -q "Production" && printf %s "$LINE" | grep -q "Preview"; then
    echo "  ✔ $NAME is set for Production and Preview"
  else
    echo "  ✘ $NAME is NOT set for both environments"
    OK=0
  fi
done
[ "$OK" = 1 ] && echo && echo "All done. Redeploy for the new values to take effect." || exit 1
