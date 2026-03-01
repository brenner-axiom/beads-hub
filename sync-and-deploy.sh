#!/usr/bin/env bash
# sync-and-deploy.sh — Sync beads, regenerate flight board, commit & push
set -euo pipefail

cd "$(dirname "$0")"

BD="${BD:-bd}"

echo "🔄 Syncing beads..."
$BD dolt pull 2>/dev/null || true

echo "🛫 Regenerating flight board..."
bash generate-board.sh

echo "📤 Committing and pushing..."
git add -A
git commit -m "chore: sync beads and regenerate board" --allow-empty
git push

echo "✅ Board synced and deployed"
