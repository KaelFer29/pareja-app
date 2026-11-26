#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$PROJECT_DIR/scripts/env-android-wsl.sh"

stop_gradle() {
  if [ -x "$PROJECT_DIR/android/gradlew" ]; then
    (cd "$PROJECT_DIR/android" && ./gradlew --stop >/dev/null 2>&1) || true
  fi
}
trap stop_gradle EXIT

cd "$PROJECT_DIR"
ORG_GRADLE_PROJECT_reactNativeArchitectures=x86_64 npx expo run:android --no-bundler
