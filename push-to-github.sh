#!/bin/bash
# Push this project to your existing rewrite-prototype repo.
# 1. Replace YOUR_GITHUB_USERNAME below with your actual GitHub username.
# 2. Run: chmod +x push-to-github.sh && ./push-to-github.sh

set -e
cd "$(dirname "$0")"

GITHUB_USERNAME=seanpower-ui  # <-- Edit this

if [ "$GITHUB_USERNAME" = "YOUR_GITHUB_USERNAME" ]; then
  echo "Please edit this script and set GITHUB_USERNAME to your GitHub username."
  exit 1
fi

echo "Initializing git..."
git init

echo "Staging files..."
git add .

echo "Creating initial commit..."
git commit -m "Initial commit"

echo "Adding remote..."
git remote add origin "https://github.com/${GITHUB_USERNAME}/rewrite-prototype.git"

echo "Pushing to main..."
git branch -M main
git push -u origin main

echo "Done. Your project is at https://github.com/${GITHUB_USERNAME}/rewrite-prototype"
