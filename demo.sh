#!/usr/bin/env bash
set -euo pipefail

# If not running under bash (e.g., invoked via `sh`), re-exec with bash so arrays work
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

# Demo script for Web Compatibility Scanner
# - Installs dependencies
# - Scans a provided website URL
# - Prints summary to stdout
# - Saves report to ./reports

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPORT_DIR="$ROOT_DIR/reports"
# Use an array so command and argument are handled correctly
CLI=(node "$ROOT_DIR/src/cli.js")

usage() {
  cat <<EOF
Usage: $(basename "$0") [<url>] [--format json|yaml|md] [--verbose]

Examples:
  $(basename "$0")                          # prompts for URL and format; Enter to scan example site
  $(basename "$0") https://example.com      # scan URL
  $(basename "$0") https://example.com --format yaml
  $(basename "$0") https://example.com --format md
EOF
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

# Accept optional first arg as URL; prompt if missing
URL="${1:-}"
if [[ -z "$URL" ]]; then
  read -r -p "Enter website URL (leave blank to scan included example site): " URL
fi
if [[ -n "${1:-}" ]]; then shift || true; fi

FORMAT=""
EXTRA_ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --format)
      FORMAT="${2:-$FORMAT}"; shift 2 ;;
    -f)
      FORMAT="${2:-$FORMAT}"; shift 2 ;;
    --verbose|-V)
      EXTRA_ARGS+=("--verbose"); shift ;;
    --*)
      # pass through any other long opts to CLI
      EXTRA_ARGS+=("$1"); shift ;;
    -*)
      # pass through short opts to CLI
      EXTRA_ARGS+=("$1"); shift ;;
    *)
      # ignore stray args
      shift ;;
  esac
done

# If format was not provided via flags, prompt interactively
if [[ -z "$FORMAT" ]]; then
  read -r -p "Choose report format [json|yaml|md] (default: json): " FORMAT
fi
if [[ -z "$FORMAT" ]]; then
  FORMAT="json"
fi
case "$FORMAT" in
  json|yaml|md) ;;
  *)
    echo "Unsupported format: $FORMAT. Falling back to 'json'." >&2
    FORMAT="json"
    ;;
esac

mkdir -p "$REPORT_DIR"

echo "==> Installing dependencies"
(cd "$ROOT_DIR" && npm install --no-audit --no-fund)

ts="$(date +%Y%m%d-%H%M%S)"
# Derive a safe filename from the URL host/path
safe_name() {
  local s="$1"
  s="${s#http://}"
  s="${s#https://}"
  s="${s%%/*}"
  # replace non-alnum with dashes
  echo "$s" | tr -c '[:alnum:]' '-'
}

SCAN_MODE="url"
TARGET_LABEL="$URL"
if [[ -z "$URL" ]]; then
  SCAN_MODE="dir"
  TARGET_DIR="$ROOT_DIR/examples/sample-site"
  TARGET_LABEL="$TARGET_DIR"
fi

if [[ "$SCAN_MODE" == "url" ]]; then
  NAME="$(safe_name "$URL")"
else
  NAME="sample-site"
fi
OUT="$REPORT_DIR/${NAME}-${ts}.${FORMAT}"

echo "\n==> Scanning $TARGET_LABEL -> $OUT"
if [[ "$SCAN_MODE" == "url" ]]; then
  "${CLI[@]}" --url "$URL" --format "$FORMAT" --output "$OUT" ${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}
else
  "${CLI[@]}" "$TARGET_DIR" --format "$FORMAT" --output "$OUT" ${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}
fi

echo "\nAll done. Report written to: $OUT"
