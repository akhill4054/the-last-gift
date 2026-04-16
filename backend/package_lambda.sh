#!/bin/bash
set -e

echo "🚀 Packaging Lambda..."

# Paths
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LAMBDA_DIR="$ROOT_DIR/lambda_function"
APP_DIR="$ROOT_DIR/app"
REQ_FILE="$ROOT_DIR/requirements.txt"
DIST_DIR="$LAMBDA_DIR/dist"
OUTPUT_ZIP="$LAMBDA_DIR/function.zip"

echo "👇 Using $REQ_FILE"

# Reset dist
echo "🧹 Preparing dist..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Copy entry + app (exclude caches)
echo "📁 Copying source..."
cp "$LAMBDA_DIR/main.py" "$DIST_DIR/"

rsync -a \
  --exclude="__pycache__" \
  --exclude="*.pyc" \
  "$APP_DIR/" "$DIST_DIR/app/"

# Install deps into dist (Lambda-compatible)
echo "📦 Installing dependencies (ARM64)..."
docker run --rm \
  --platform linux/arm64 \
  -v "$DIST_DIR":/var/task \
  -v "$REQ_FILE":/tmp/requirements.txt \
  -w /var/task \
  python:3.12-slim \
  sh -c "pip install --no-cache-dir -r /tmp/requirements.txt -t ."

# Remove cache/junk just in case
echo "🧽 Cleaning build artifacts..."
find "$DIST_DIR" -name "__pycache__" -type d -exec rm -rf {} + || true
find "$DIST_DIR" -name "*.pyc" -delete || true

# Create zip (always replace)
echo "🗜️ Creating zip..."
rm -f "$OUTPUT_ZIP"
cd "$DIST_DIR"
zip -r "$OUTPUT_ZIP" . > /dev/null

# Cleanup dist
cd "$ROOT_DIR"
rm -rf "$DIST_DIR"

echo "✅ Done: $OUTPUT_ZIP"
