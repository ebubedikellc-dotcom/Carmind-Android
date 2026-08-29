#!/usr/bin/env bash
set -euo pipefail
GRADLE_VERSION="8.9"
BASE="$HOME/.carmind-gradle"
DIST="$BASE/gradle-${GRADLE_VERSION}"
if [ ! -x "$DIST/bin/gradle" ]; then
  mkdir -p "$BASE"
  ZIP="$BASE/gradle-${GRADLE_VERSION}-bin.zip"
  echo "Downloading Gradle ${GRADLE_VERSION}..."
  curl -fL --retry 3 --retry-delay 2 \
    "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" \
    -o "$ZIP"
  rm -rf "$DIST"
  unzip -q "$ZIP" -d "$BASE"
fi
exec "$DIST/bin/gradle" "$@"
