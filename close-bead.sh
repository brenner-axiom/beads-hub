#!/usr/bin/env bash
# close-bead.sh — Close a bead and sync+deploy the flight board
set -euo pipefail

cd "$(dirname "$0")"

BD="${BD:-bd}"

if [ $# -lt 1 ]; then
  echo "Usage: close-bead.sh <bead-id> [--reason <reason>]"
  exit 1
fi

echo "🔒 Closing bead: $1"
$BD close "$@"

echo "🛫 Syncing and deploying board..."
bash "$(dirname "$0")/sync-and-deploy.sh"
