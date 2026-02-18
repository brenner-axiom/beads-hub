#!/usr/bin/env bash
# ingest-issues.sh — Ingest GitHub issues into beads, tag GH issues with bead IDs
set -euo pipefail

cd "$(dirname "$0")"
git pull -q 2>/dev/null || true

REPO="brenner-axiom/beads-hub"

# Get all open GH issues
gh issue list --repo "$REPO" --state open --json number,title,url,body --limit 100 | jq -c '.[]' | while read -r issue; do
  NUMBER=$(echo "$issue" | jq -r '.number')
  TITLE=$(echo "$issue" | jq -r '.title')
  URL=$(echo "$issue" | jq -r '.url')
  BODY=$(echo "$issue" | jq -r '.body // ""')

  # Skip if title already has a bead ID tag [beads-hub-xxx]
  if [[ "$TITLE" =~ ^\[beads-hub-[a-z0-9]+\] ]]; then
    echo "⏭ Issue #$NUMBER already tagged: $TITLE"
    continue
  fi

  # Check if a bead already exists for this issue (search by external-ref or notes)
  EXISTING=$(bd list --json 2>/dev/null | jq -r --arg url "$URL" '.[] | select(.notes // "" | contains($url)) | .id' | head -1)
  if [ -n "$EXISTING" ]; then
    echo "⏭ Issue #$NUMBER already has bead $EXISTING"
    # Still tag the GH issue if not tagged
    gh issue edit "$NUMBER" --repo "$REPO" --title "[$EXISTING] $TITLE" 2>/dev/null || true
    echo "✅ Tagged issue #$NUMBER with [$EXISTING]"
    continue
  fi

  # Create bead from GH issue
  echo "📦 Creating bead for issue #$NUMBER: $TITLE"
  RESULT=$(bd create "GH#$NUMBER: $TITLE" \
    --notes "GitHub issue: $URL" \
    --external-ref "gh-$NUMBER" \
    --json 2>/dev/null)

  BEAD_ID=$(echo "$RESULT" | jq -r '.id // empty')
  if [ -z "$BEAD_ID" ]; then
    echo "❌ Failed to create bead for issue #$NUMBER"
    continue
  fi

  echo "✅ Created bead $BEAD_ID for issue #$NUMBER"

  # Tag the GitHub issue title with the bead ID
  gh issue edit "$NUMBER" --repo "$REPO" --title "[$BEAD_ID] $TITLE"
  echo "✅ Tagged issue #$NUMBER → [$BEAD_ID] $TITLE"
done

# Sync beads
bd sync 2>/dev/null || true
echo "🎯 Ingest complete"
