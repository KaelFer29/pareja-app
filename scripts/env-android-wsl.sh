#!/usr/bin/env bash
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk/zulu-17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export WIN_ANDROID_SDK="${WIN_ANDROID_SDK:-/mnt/c/Users/kdfh/AppData/Local/Android/Sdk}"
export WIN_ADB="$WIN_ANDROID_SDK/platform-tools/adb.exe"
export AVD_NAME="${AVD_NAME:-Pixel_7_API_35}"
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

if ! grep -qs 'adb.exe' "$ANDROID_HOME/platform-tools/adb"; then
  echo "El adb de $ANDROID_HOME/platform-tools ya no apunta a adb.exe de Windows." >&2
  echo "Probablemente se actualizó platform-tools. Vuelve a crear el puente:" >&2
  echo "  mv $ANDROID_HOME/platform-tools/adb $ANDROID_HOME/platform-tools/adb.linux" >&2
  echo "  printf '#!/usr/bin/env bash\nexec \"%s\" \"\$@\"\n' \"$WIN_ADB\" > $ANDROID_HOME/platform-tools/adb" >&2
  echo "  chmod +x $ANDROID_HOME/platform-tools/adb" >&2
  return 1 2>/dev/null || exit 1
fi
