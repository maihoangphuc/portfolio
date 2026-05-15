#!/usr/bin/env bash
# PostToolUse hook: run `eslint --fix` on the edited file.
# Reads Claude Code hook JSON from stdin and ignores non-JS/TS files.

set -u

file=$(python -c "
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
f = (d.get('tool_input') or {}).get('file_path') \
    or (d.get('tool_response') or {}).get('filePath') \
    or ''
print(f)
")

[ -z "$file" ] && exit 0

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    npx --no-install eslint --fix "$file" || true
    ;;
esac
