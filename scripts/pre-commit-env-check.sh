#!/bin/bash
# SECURITY & QUALITY PRE-COMMIT HOOK

if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "=========================================================="
    echo "⚠️  [SECURITY WARNING] You are about to commit the .env file!"
    echo "   Committing API keys or secrets to the repository is highly dangerous."
    echo "   Please run 'git reset HEAD .env' to remove it from this commit."
    echo "=========================================================="
    exit 1
fi

echo "[PRE-COMMIT] Running Unit Tests (Vitest Data Dictionary Check)..."
if ! npm run test; then
    echo "=========================================================="
    echo "❌ [TEST FAILED] Some unit tests failed!"
    echo "   Please fix the data structures or dictionary format before committing."
    echo "=========================================================="
    exit 1
fi

exit 0
