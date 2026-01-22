#!/bin/bash

# HomeCafe Expo UI - Ralph Wiggum Loop
# Usage: ./ralph.sh <iterations>

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  echo "Example: $0 20"
  exit 1
fi

PROMPT_FILE=".claude/PROMPT.md"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: $PROMPT_FILE not found"
  exit 1
fi

echo "🏠 Starting HomeCafe Expo UI build..."
echo "Max iterations: $1"
echo "================================"
echo ""

for ((i=1; i<=$1; i++)); do
  echo "🔄 Iteration $i/$1"
  echo "--------------------------------"

  result=$(claude --dangerously-skip-permissions -p "$(cat $PROMPT_FILE)" --output-format text 2>&1) || true

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo "✅ All tasks complete after $i iterations!"
    exit 0
  fi

  echo ""
  echo "--- End of iteration $i ---"
  echo ""
done

echo "⚠️ Reached max iterations ($1)"
echo "Check activity.md and plan.md for progress."
exit 1
