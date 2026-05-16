#!/usr/bin/env bash
# hooks/pre-tool-use.sh
# Fires BEFORE Claude executes any tool.
# Exit 0 = allow. Exit 1 = block (Claude receives the stderr as feedback).
#
# Configure in .claude/settings.json:
# {
#   "hooks": {
#     "PreToolUse": [{ "matcher": ".*", "hooks": [{ "type": "command", "command": "bash .claude/hooks/pre-tool-use.sh" }] }]
#   }
# }

set -euo pipefail

# ── Read tool context from stdin ──────────────────────────────────────────────
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // {}')

# ── Helper ────────────────────────────────────────────────────────────────────
block() {
  echo "BLOCKED: $1" >&2
  exit 1
}

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [PreToolUse] $1" >> .claude/hooks.log
}

# ── 1. BASH TOOL — dangerous command patterns ─────────────────────────────────
if [[ "$TOOL_NAME" == "bash" ]]; then
  COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // ""')

  log "bash: $(echo "$COMMAND" | head -c 200)"

  # Block rm -rf on root, src, or project root
  if echo "$COMMAND" | grep -qE 'rm\s+-[a-z]*r[a-z]*f?\s+(\/|~|\.\s*$|\.\/[^.])'; then
    block "Destructive rm -rf detected on critical path"
  fi

  # Block dropping production database
  if echo "$COMMAND" | grep -qiE '(drop\s+database|drop\s+schema|truncate\s+table)\s+prod'; then
    block "Destructive database operation on production detected"
  fi

  # Block curl/wget piped to bash (supply chain attack pattern)
  if echo "$COMMAND" | grep -qE '(curl|wget).*(sh|bash|zsh)\s*$|bash\s*<\s*<\s*\('; then
    block "Pipe-to-shell pattern blocked (supply chain risk)"
  fi

  # Block writing to .env with real-looking secrets
  if echo "$COMMAND" | grep -qE 'echo.*(sk-|rk_live_|re_|AKIA|ghp_).*>.*\.env'; then
    block "Writing apparent secret to .env file — use environment manager instead"
  fi

  # Block git push --force to main/master without explicit flag
  if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force\s+.*\s+(main|master)'; then
    block "Force push to main/master blocked — get explicit approval first"
  fi

  # Block npm/pnpm publish without confirmation
  if echo "$COMMAND" | grep -qE '(npm|pnpm|yarn)\s+publish'; then
    block "Package publish blocked — run manually with confirmation"
  fi

  # Block overwriting migration files
  if echo "$COMMAND" | grep -qE '>\s*supabase/migrations/.*\.sql'; then
    block "Overwriting migration files blocked — create a new migration instead"
  fi

  # Warn on production env references (allow but log prominently)
  if echo "$COMMAND" | grep -qiE 'PROD|production' && ! echo "$COMMAND" | grep -qiE 'echo|print|cat'; then
    log "WARNING: production reference in command: $(echo "$COMMAND" | head -c 100)"
  fi
fi

# ── 2. FILE WRITE TOOL — protect critical files ───────────────────────────────
if [[ "$TOOL_NAME" == "write_file" || "$TOOL_NAME" == "create_file" || "$TOOL_NAME" == "str_replace" ]]; then
  FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.path // ""')

  log "file_write: $FILE_PATH"

  # Block overwriting CLAUDE.md (the constitution)
  if [[ "$FILE_PATH" == *"CLAUDE.md" ]]; then
    block "CLAUDE.md is protected — propose changes in a PR instead"
  fi

  # Block writing secrets to source files
  FILE_CONTENT=$(echo "$TOOL_INPUT" | jq -r '.file_text // .new_str // ""')
  if echo "$FILE_CONTENT" | grep -qE '(sk-[a-zA-Z0-9]{20,}|rk_live_[a-zA-Z0-9]{20,}|re_[a-zA-Z0-9]{20,}|AKIA[A-Z0-9]{16})'; then
    block "Apparent secret/API key detected in file content — use env vars"
  fi

  # Block writing to supabase migrations (create new, never overwrite)
  if echo "$FILE_PATH" | grep -qE 'supabase/migrations/.*\.sql' && [[ "$TOOL_NAME" == "str_replace" ]]; then
    block "Cannot modify existing migrations — create a new migration file"
  fi
fi

# ── 3. NETWORK TOOL — restrict external calls ─────────────────────────────────
if [[ "$TOOL_NAME" == "web_fetch" || "$TOOL_NAME" == "browser" ]]; then
  URL=$(echo "$TOOL_INPUT" | jq -r '.url // ""')

  log "network: $URL"

  # Block fetching from non-approved external hosts during dev
  if echo "$URL" | grep -qvE '^https://(docs\.|api\.|dashboard\.)?(anthropic|supabase|stripe|resend|upstash|vercel|npmjs|github)\.com'; then
    log "WARNING: fetching from non-standard host: $URL"
    # Don't block — just log (web research is valid)
  fi
fi

# ── 4. LOG ALL TOOL CALLS (for audit trail) ───────────────────────────────────
log "ALLOW tool=$TOOL_NAME"

exit 0
