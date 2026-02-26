#!/usr/bin/env bash
# ingest-issues.sh — Ingest GitHub issues into beads, tag GH issues with bead IDs
set -euo pipefail

cd "$(dirname "$0")"
git pull -q 2>/dev/null || true

REPO="brenner-axiom/beads-hub"

# Read allowlist
ALLOWLIST_FILE="ingest-allowlist.json"
if [ -f "$ALLOWLIST_FILE" ]; then
  ALLOWLIST=$(jq -r '.[]' "$ALLOWLIST_FILE")
else
  echo "⚠️  No allowlist file found. Processing all issues."
  ALLOWLIST=""
fi

# Get all open GH issues (exclude already-ingested ones)
gh issue list --repo "$REPO" --state open --json number,title,url,body,labels,author --limit 100 | jq -c '.[] | select([.labels[]?.name] | index("ingested") | not)' | while read -r issue; do
  NUMBER=$(echo "$issue" | jq -r '.number')
  TITLE=$(echo "$issue" | jq -r '.title')
  URL=$(echo "$issue" | jq -r '.url')
  BODY=$(echo "$issue" | jq -r '.body // ""')
  AUTHOR=$(echo "$issue" | jq -r '.author.login')

  # Skip if title already has a bead ID tag [beads-hub-xxx]
  if [[ "$TITLE" =~ ^\[beads-hub-[a-z0-9]+\] ]]; then
    echo "⏭ Issue #$NUMBER already tagged: $TITLE"
    continue
  fi

  # Check for /approve comment from goern
  APPROVED_COMMENT=$(gh issue view "$NUMBER" --repo "$REPO" --json comments --jq '.comments[] | select(.author.login == "goern" and (.body == "/approve" or .body == "/approved"))' | head -1)

  # Check if author is in allowlist (if allowlist exists)
  if [ -n "$ALLOWLIST" ]; then
    if ! echo "$ALLOWLIST" | grep -q "^$AUTHOR$" && [ -z "$APPROVED_COMMENT" ]; then
      echo "⏭ Issue #$NUMBER by $AUTHOR not in allowlist and not approved"
      continue
    fi
  fi

  # If approved by comment, add the label
  if [ -n "$APPROVED_COMMENT" ]; then
    echo "👍 Issue #$NUMBER approved by goern's comment"
    gh issue edit "$NUMBER" --repo "$REPO" --add-label "approved" 2>/dev/null || true
  fi


  # Check if a bead already exists for this issue (search by external-ref or notes)
  EXISTING=$(bd list --json 2>/dev/null | jq -r --arg url "$URL" '.[] | select(.notes // "" | contains($url)) | .id' | head -1)
  if [ -n "$EXISTING" ]; then
    echo "⏭ Issue #$NUMBER already has bead $EXISTING"
    # Still tag the GH issue if not tagged
    gh issue edit "$NUMBER" --repo "$REPO" --title "[$EXISTING] $TITLE" --add-label "ingested" 2>/dev/null || true
    echo "✅ Tagged issue #$NUMBER with [$EXISTING]"
    continue
  fi

  # Enhanced classification logic to properly identify research tasks
  # Research tasks typically contain keywords such as:
  # research, documentation, evaluation, analysis, study, investigation
  IS_RESEARCH_TASK=false
  TITLE_LOWERCASE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]')
  BODY_LOWERCASE=$(echo "$BODY" | tr '[:upper:]' '[:lower:]')
  
  # Keywords that generally indicate research tasks
  RESEARCH_KEYWORDS=("research" "documentation" "evaluation" "analysis" "study" "investigation" "review" "investigate" "mapping" "compliance" "regulatory")
  
  for keyword in "${RESEARCH_KEYWORDS[@]}"; do
    if [[ "$TITLE_LOWERCASE" == *"$keyword"* ]] || [[ "$BODY_LOWERCASE" == *"$keyword"* ]]; then
      IS_RESEARCH_TASK=true
      break
    fi
  done
  
  # Create bead from GH issue
  echo "📦 Creating bead for issue #$NUMBER: $TITLE"
  
  # Add research label if this looks like a research task
  if [ "$IS_RESEARCH_TASK" = true ]; then
    echo "✅ Identified as research task - adding research label"
    RESULT=$(bd create "GH#$NUMBER: $TITLE" \
      --notes "GitHub issue: $URL" \
      --external-ref "gh-$NUMBER" \
      --labels "research" \
      --json 2>/dev/null)
  else
    RESULT=$(bd create "GH#$NUMBER: $TITLE" \
      --notes "GitHub issue: $URL" \
      --external-ref "gh-$NUMBER" \
      --json 2>/dev/null)
  fi

  BEAD_ID=$(echo "$RESULT" | jq -r '.id // empty')
  if [ -z "$BEAD_ID" ]; then
    echo "❌ Failed to create bead for issue #$NUMBER"
    continue
  fi

  echo "✅ Created bead $BEAD_ID for issue #$NUMBER"

  # Tag the GitHub issue title with the bead ID and add 'ingested' label
  gh issue edit "$NUMBER" --repo "$REPO" --title "[$BEAD_ID] $TITLE" --add-label "ingested"
  echo "✅ Tagged issue #$NUMBER → [$BEAD_ID] $TITLE"
done

# Sync beads
echo "🎯 Ingest complete — syncing and deploying board..."
bash "$(dirname "$0")/sync-and-deploy.sh"
