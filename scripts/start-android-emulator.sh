#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/env-android-wsl.sh"

if [ ! -x "$WIN_ADB" ]; then
  echo "No se encontró adb.exe en Windows: $WIN_ADB"
  echo "Instala platform-tools y emulator en el SDK de Windows."
  exit 1
fi

emulator_ready() {
  "$WIN_ADB" devices 2>/dev/null | tr -d '\r' | grep -q $'emulator-.*\tdevice'
}

boot_completed() {
  [ "$("$WIN_ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)" = "1" ]
}

wait_for() {
  local check="$1"
  local error_message="$2"
  for _ in $(seq 1 60); do
    "$check" && return 0
    sleep 3
  done
  echo "$error_message" >&2
  exit 1
}

if ! emulator_ready; then
  echo "Iniciando el emulador $AVD_NAME en Windows..."
  (
    cd /mnt/c/Windows/System32
    powershell.exe -NoProfile -Command \
      "\$emu = Join-Path \$env:LOCALAPPDATA 'Android\Sdk\emulator\emulator.exe'; if (-not (Test-Path \$emu)) { throw \"No existe \$emu\" }; Start-Process -FilePath \$emu -ArgumentList @('-avd','$AVD_NAME','-netdelay','none','-netspeed','full')" \
      >/dev/null
  )
fi

echo "Esperando el dispositivo..."
wait_for emulator_ready "El emulador no apareció en 3 minutos. Revisa que el AVD $AVD_NAME exista en Windows."

echo "Esperando que termine de arrancar..."
wait_for boot_completed "El emulador no terminó de arrancar en 3 minutos. Ciérralo e inténtalo de nuevo."

"$WIN_ADB" shell dumpsys battery set ac 1 >/dev/null
"$WIN_ADB" shell svc power stayon true >/dev/null
"$WIN_ADB" shell input keyevent KEYCODE_WAKEUP >/dev/null
"$WIN_ADB" shell wm dismiss-keyguard >/dev/null

echo "Emulador listo."
"$WIN_ADB" devices
