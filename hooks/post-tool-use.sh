#!/usr/bin/env bash
# hooks/post-tool-use.sh
# Fires AFTER Claude executes any tool.
# Used for: audit logging, secret scanning output, auto-formatting.
# Exit code does NOT block — this is observability only.

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
TOOL_OUTPUT=$(echo "$INPUT" | jq -r '.tool_output // ""')
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

log() {
  echo "[$TIMESTAMP] [PostToolUse] $1" >> .claude/hooks.log
}

# ── 1. SCAN TOOL OUTPUT FOR LEAKED SECRETS ───────────────────────────────────
# If Claude reads a file or runs a command that outputs secrets, catch it here
if echo "$TOOL_OUTPUT" | grep -qE '(sk-[a-zA-Z0-9]{20,}|rk_live_[a-zA-Z0-9]{20,}|re_[a-zA-Z0-9]{20,}|AKIA[A-Z0-9]{16})'; then
  log "ALERT: Possible secret in tool output for tool=$TOOL_NAME — output suppressed from log"
  # Do NOT log the output itself — just the alert
else
  # Log truncated output for audit
  OUTPUT_PREVIEW=$(echo "$TOOL_OUTPUT" | head -c 300 | tr '\n' ' ')
  log "tool=$TOOL_NAME output_preview=$OUTPUT_PREVIEW"
fi

# ── 2. POST-WRITE: Auto-check TypeScript errors ──────────────────────────────
if [[ "$TOOL_NAME" == "write_file" || "$TOOL_NAME" == "create_file" || "$TOOL_NAME" == "str_replace" ]]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.path // ""')

  # Only for .ts / .tsx files
  if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]]; then
    log "TypeScript file written: $FILE_PATH — running type check"

    # Non-blocking tsc check (background, results go to log only)
    if command -v pnpm &>/dev/null; then
      (pnpm tsc --noEmit --pretty 2>&1 | head -50 >> .claude/tsc.log) &
    fi
  fi
fi

# ── 3. POST-BASH: Detect if .env was accidentally created ────────────────────
if [[ "$TOOL_NAME" == "bash" ]]; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

  if echo "$COMMAND" | grep -q '\.env'; then
    # Check if real .env exists and contains real secrets
    if [[ -f ".env" ]]; then
      if grep -qE '(sk-|rk_live_|re_|AKIA)' .env 2>/dev/null; then
        log "CRITICAL ALERT: .env file contains apparent real secrets — verify it is gitignored"
        # Ensure .gitignore has .env
        if ! grep -q '^\.env$' .gitignore 2>/dev/null; then
          echo ".env" >> .gitignore
          log "AUTO-FIX: added .env to .gitignore"
        fi
      fi
    fi
  fi
fi

# ── 4. STRIPE WEBHOOK — remind about signature verification ──────────────────
if [[ "$TOOL_NAME" == "write_file" || "$TOOL_NAME" == "create_file" ]]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.path // ""')
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.file_text // ""')

  if echo "$FILE_PATH" | grep -q 'webhook' && echo "$CONTENT" | grep -q 'stripe'; then
    if ! echo "$CONTENT" | grep -q 'constructEvent'; then
      log "WARNING: Stripe webhook file written without constructEvent signature check"
    fi
  fi
fi

# ── 5. METRICS: Track file changes for change log ────────────────────────────
if [[ "$TOOL_NAME" == "write_file" || "$TOOL_NAME" == "create_file" || "$TOOL_NAME" == "str_replace" ]]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.path // ""')
  echo "$TIMESTAMP $FILE_PATH" >> .claude/changed-files.log
fi

exit 0
