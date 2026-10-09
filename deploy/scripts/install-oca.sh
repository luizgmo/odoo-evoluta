#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
OCA_DIR="$ROOT_DIR/addons/oca"
LOCK_FILE=${OCA_LOCK_FILE:-$ROOT_DIR/deploy/oca-versions.lock}
[ -f "$LOCK_FILE" ] || {
  printf '%s\n' "ERRO: manifesto OCA não encontrado: $LOCK_FILE" >&2
  exit 1
}
mkdir -p "$OCA_DIR"

while IFS=' ' read -r repo url sha; do
  case "$repo" in
    ''|'#'*) continue ;;
  esac
  [ -n "$url" ] || { printf '%s\n' "ERRO: URL ausente para $repo" >&2; exit 1; }
  [ -n "$sha" ] || { printf '%s\n' "ERRO: SHA ausente para $repo" >&2; exit 1; }

  target="$OCA_DIR/$repo"
  if [ -d "$target/.git" ]; then
    [ -z "$(git -C "$target" status --porcelain)" ] || {
      printf '%s\n' "ERRO: repositório OCA com alterações locais: $target" >&2
      exit 1
    }
    git -C "$target" fetch --no-tags origin "$sha"
  else
    git clone "$url" "$target"
  fi
  git -C "$target" checkout --detach "$sha"
  printf '%s %s\n' "$repo" "$(git -C "$target" rev-parse HEAD)"
done < "$LOCK_FILE"

printf '%s\n' "OCA instalado exatamente conforme $LOCK_FILE"
