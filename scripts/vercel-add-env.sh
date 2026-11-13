#!/usr/bin/env bash
# Prompts for each named environment variable (input hidden) and saves it to the
# linked Vercel project for both Production and Preview. Values are never echoed
# or written to disk.
#
#   bash scripts/vercel-add-env.sh CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "$#" -eq 0 ]; then
  echo "Usage: bash scripts/vercel-add-env.sh NAME [NAME...]"
  exit 1
fi

for NAME in "$@"; do
  printf "\nPaste the value for %s and press Enter (hidden): " "$NAME"
  IFS= read -rs VALUE
  echo
  VALUE="$(printf %s "$VALUE" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  if [ -z "$VALUE" ]; then
    echo "  ✘ Nothing pasted for $NAME — stopping. Run the command again to retry."
    exit 1
  fi
  for ENV in production preview; do
    if printf %s "$VALUE" | npx -y vercel@latest env add "$NAME" "$ENV" --force >/dev/null 2>&1; then
      echo "  ✔ $NAME saved for $ENV"
    else
      echo "  ✘ Could not save $NAME for $ENV (are you signed in with 'npx vercel login'?)"
      exit 1
    fi
  done
done
VALUE=""
echo
echo "All done. Redeploy for the new values to take effect."
