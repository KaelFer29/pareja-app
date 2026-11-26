# Pareja App

App móvil privada para dos personas. Cada una crea su cuenta, se vinculan como pareja con un código de invitación y todo lo que comparte una aparece al instante en el teléfono de la otra. La interfaz está solo en español.

Este archivo solo guarda reglas estables. Las funcionalidades, planes e historial no van aquí (ver Planificación).

## Stack

- Expo SDK 57 con Expo Router y TypeScript estricto.
- Supabase: Auth, Postgres con RLS, Storage, Realtime y una Edge Function (`auth-redirect`).
- TanStack Query para el estado del servidor.
- StyleSheet de React Native con tokens de `src/shared/theme`.

Expo y Supabase cambian en cada versión. No confiar en la memoria: antes de usar una API, consultar `https://docs.expo.dev/versions/v57.0.0/` o la documentación vigente de Supabase.

## Comandos

```bash
export PATH=$HOME/.nvm/versions/node/v20.20.2/bin:$PATH   # el Node del sistema está desactualizado
npx expo install <paquete>   # siempre así para agregar dependencias
npm run start:tunnel         # development build en teléfonos físicos, que no llegan a la IP de WSL
npm run start:go             # túnel en modo Expo Go
npm run emulator             # abre el AVD de Windows desde WSL y espera a que arranque
npm run android:build        # compila para x86_64 e instala el development build en el emulador, sin EAS
npm run start:emulator       # emulador más Metro en la IP de WSL, sin túnel
npm run web                  # revisar pantallas en el navegador
npm run lint
npm run typecheck
npx expo-doctor              # si se tocó algo nativo o de Expo
npm run db:push -- --yes
npm run db:types
```

Ejecutar lint y typecheck antes de dar una tarea por terminada.

## Nativo y compilación

- `ios/` y `android/` se generan solos. Nunca editarlos, configurar todo en `app.json` y config plugins.
- Una librería con código nativo necesita un development build nuevo. Expo Go deja de servir.
- Compilar con `npx eas-cli@latest`, y solo cuando el usuario lo pida: el plan gratuito da 15 builds de Android al mes.
- Los dos teléfonos son Android. Se mantiene compatibilidad con iOS, pero se prueba en Android. El perfil `production` genera un APK.
- En Expo Go, `expo-notifications` y los widgets se cargan solo fuera de Expo Go. El mapa no funciona en Expo Go ni en web (`src/features/places/native.web.ts`).

## Emulador

Es la forma principal de probar cambios en Android. La web sirve para iterar rápido en pantallas, pero no tiene mapa, notificaciones, widgets ni cámara.

### Esquema

- El AVD `Pixel_7_API_35` corre en Windows. Node, Metro, Gradle y el SDK Linux (`~/Android/Sdk`, JDK Zulu 17) corren en WSL.
- `~/Android/Sdk/platform-tools/adb` es un puente a `adb.exe` de Windows, para que haya un solo servidor ADB. Si `sdkmanager` lo sobrescribe, `scripts/env-android-wsl.sh` avisa y explica cómo recrearlo.
- El emulador llega directo a la IP de WSL. Metro no usa `--localhost` ni `adb reverse`, y en Windows no debe haber un `portproxy` sobre el 8081.
- `C:\Users\kdfh\.wslconfig` limita WSL a `memory=6GB` con `autoMemoryReclaim=gradual`. Sin ese límite, WSL, el emulador y Gradle agotan los 16 GB del PC.

### Flujo diario

1. `npm run start:emulator` abre el emulador y Metro. Luego se presiona `a` en esa misma terminal.
2. Los cambios de JavaScript se ven al instante con Fast Refresh.
3. Si cambian dependencias con código nativo, `app.json` o `plugins/`, primero `npx expo prebuild --platform android --no-install` y luego `npm run android:build`. Compila solo para `x86_64`, tarda cerca de 2 minutos y apaga Gradle al terminar.
4. `expo prebuild` y `expo install --fix` cambian solos los scripts `android` e `ios` de `package.json` a `expo run:*`. Hay que dejarlos en `expo start --android` y `expo start --ios`.

### Verificar como agente

- La persona corre su propio Metro. No dejar un Metro propio corriendo en paralelo: dos Metro y dos instancias de la app provocan el error `App react context shouldn't be created before`.
- Nunca levantar Metro con `CI=1`, porque deja de vigilar los archivos y sirve código viejo.
- Abrir la app sin el aviso del menú de Expo: `adb shell am start -n com.kaelfernandez.pareja/.MainActivity -a android.intent.action.VIEW -d "'exp+pareja-app://expo-development-client/?url=http%3A%2F%2F<IP>%3A8081&disableOnboarding=1'"`, con la IP de `hostname -I`.
- Ver la pantalla con `adb exec-out screencap -p > captura.png` y sus textos con `adb shell uiautomator dump`. Los errores de JavaScript salen en la terminal de Metro y los nativos en `adb logcat`.
- La app usa el Supabase real. Lo que se haga con una cuenta real le llega a la pareja, con notificación incluida. Para probar, usar cuentas de prueba.

### Problemas conocidos

- Pantalla negra o "System UI isn't responding": falta memoria o el emulador quedó degradado. Cerrar el emulador y arrancarlo en frío desde Device Manager (Cold Boot Now).
- `Theme.AppCompat` o el logo pegado en un build debug: revisar que `plugins/with-release-only-splash.js` siga en `app.json` y regenerar con `expo prebuild`.
- Para escribir con el teclado del PC, el AVD necesita `hw.keyboard = yes` en su `config.ini` y la ventana del emulador debe tener el foco en Windows.

## Arquitectura

```
src/
  app/          solo rutas. Cada pantalla compone componentes y hooks de una feature
  features/     una carpeta por funcionalidad
  shared/       ui/, theme/, lib/, hooks/, utils/
supabase/
  migrations/   esquema versionado
  functions/    Edge Functions
plugins/        config plugins locales
```

- Una feature puede importar de `shared/`. Nunca importa archivos internos de otra feature. Si dos features necesitan lo mismo, va a `shared/`.
- Entre carpetas distintas, importar con el alias `@/`, que apunta a `src/`. Dentro de una misma feature se usan imports relativos (`./types`, `../hooks`).
- Anatomía de una feature: `api.ts` (llamadas a Supabase), `hooks.ts` (`useQuery`, `useMutation` y el objeto `<feature>Keys`), `realtime.ts`, `errors.ts`, `types.ts` y `components/`.
- Flujo de datos: la pantalla usa un hook, el hook llama a `api.ts` con TanStack Query, `realtime.ts` escucha la tabla filtrada por `couple_id` y actualiza la caché, y las mutaciones invalidan sus claves al terminar.
- Al confirmarse una suscripción de Realtime, la app vuelve a consultar los datos para no perder cambios ocurridos durante la reconexión.
- `src/app/_layout.tsx` decide el grupo visible con `Stack.Protected`: sin sesión `(auth)`, con sesión sin pareja completa `(onboarding)`, con sesión y pareja `(app)`. `CoupleProvider` recibe el `userId` como prop, así `couple` no depende de `auth`.

## Estilo de código

- Sin comentarios. Si algo necesita explicación, mejorar los nombres o extraer una función.
- Nombres de código y archivos en inglés. Textos visibles en español.
- Prettier: punto y coma, comillas simples, 2 espacios, ancho 100.
- TypeScript estricto. Prohibido `any`, usar `unknown` y acotar.
- Archivos en kebab-case. Componentes en PascalCase y como `function`, no como flecha. Hooks con prefijo `use`.
- Exportaciones nombradas. La única excepción son las rutas de `src/app/` (`export default`).
- `StyleSheet.create` al final del archivo. Colores, espaciados, radios y tipografía siempre desde `@/shared/theme`, nunca valores escritos a mano.

## Datos

- Solo `api.ts` y `src/shared/lib/` llaman a Supabase. Funciones `async`, parámetros tipados, y lanzan el error si Supabase devuelve uno.
- Los tipos salen de `src/shared/lib/database.types.ts`, generado con `npm run db:types`. Nunca editarlo a mano.
- Imágenes: elegir con `requestImage` de `shared/ui`, comprimir con `compressImage` y subir con `uploadImage` de `shared/lib/storage`. Mostrarlas con `expo-image` usando la ruta de Storage como `cacheKey`.
- Fechas sin hora se leen con `parseDay` para no correrse un día. Fechas y horas se muestran en `America/Santiago`.

## Supabase

Proyecto `pareja-app`, id `apbjqfkereibpanqppdu`, región `sa-east-1`. La CLI está vinculada y es el camino principal.

### Seguridad

- RLS activado en todas las tablas de `public`. Las políticas se basan en `private.is_couple_member(couple_id)`, y en `profiles` en `private.shares_couple_with(user_id)`.
- Las tablas nuevas no reciben permisos solas. Revocar todo a `anon` y `authenticated` y otorgar solo lo necesario, por columna cuando aplica.
- Toda política de UPDATE necesita también una de SELECT.
- Las funciones `security definer` van en `private`, nunca en `public`. Las RPC que llama la app viven en `public` como `security invoker` y delegan en una de `private`.
- Las vistas se crean con `security_invoker = true`.
- Nunca usar `user_metadata` para decidir permisos.
- La app solo usa la publishable key. La secret key y la service_role nunca salen de las Edge Functions.
- Buckets `photos` y `avatars` privados, solo JPEG, mostrados con URLs firmadas. Rutas `{couple_id}/{photo_id}.jpg` y `{user_id}/{uuid}.jpg`. Al eliminar una foto, primero el archivo y luego la fila.

### Migraciones

1. `npx supabase migration new <nombre>` y escribir el SQL.
2. `npx supabase db push --dry-run` y luego `npm run db:push -- --yes`.
3. Probar las políticas. En SQL, `npx supabase db query --linked` con un bloque `do` que termine en `raise exception` para no guardar nada. En Storage y Realtime, un script temporal con supabase-js y usuarios de prueba que se eliminan al terminar.
4. `npx supabase db advisors --linked`.
5. `npm run db:types`.

Nunca editar ni borrar una migración ya aplicada. Las tablas nuevas con `couple_id` se agregan a la publicación de Realtime.

## Decisiones que no salen del código

- Las notificaciones push las envían triggers de Postgres con `pg_net` directo a la API de Expo, sin Edge Function. Si el envío falla, el insert no se ve afectado.
- Widgets de Android con `react-native-android-widget`, porque `expo-widgets` solo cubre iOS. La tarea se registra en `index.ts`, el punto de entrada.
- `plugins/with-widget-resize.js` va antes del plugin de widgets en `app.json`, porque los mods se ejecutan en orden inverso.
- En `src/app/_layout.tsx`, `auth/reset-password` se declara al final del `Stack` y `(auth)` fija `sign-in` como ruta inicial. Sin sesión, `/` no coincide con ninguna ruta y Expo Router muestra la primera pantalla disponible, que antes era "Nueva contraseña".
- `plugins/with-release-only-splash.js` va antes de `expo-splash-screen` en `app.json`. En builds debug, `MainActivity` aplica `AppTheme` en vez de registrar el splash, porque con `expo-dev-client` el logo queda pegado sobre la app (expo/expo#40464). Release no cambia.
- Calendario con vista de mes propia. No se usa `react-native-calendars` porque sus dependencias son antiguas.
- Mapa con MapLibre y OpenFreeMap, búsqueda con Nominatim. Sin cuenta de Google.
- El desgaste de la mascota se calcula desde `updated_at`, en la app y en `care_for_pet`, sin `pg_cron`. La lógica compartida con el widget vive en `src/shared/utils/pet.ts`.
- Fotos comprimidas a 1600 px y avatares a 512 px para cuidar el 1 GB gratis de Supabase. Un workflow de GitHub evita que el proyecto se pause.
- Todo debe caber en planes gratuitos.

## Redacción

Aplica a la app, la documentación, los mensajes de error, los commits y las respuestas del agente.

- Español neutro de "tú". Sin voseo: "puedes", "sube", nunca "podés", "subí".
- Sin punto y coma. Sin guiones largos (—) ni medios (–), solo el guion corto.
- Frases cortas y directas. En la interfaz, mayúscula solo al inicio.
- Los errores dicen qué pasó y qué puede hacer la persona: "No se pudo guardar la nota. Revisa tu conexión e inténtalo de nuevo."

## Git

- `main` es estable. El trabajo va en ramas `tipo/slug-en-kebab` (sin tildes) y llega a `main` por PR. Una funcionalidad por rama.
- Commits solo cuando el usuario lo pida. Conventional Commits, solo el asunto: `tipo(ámbito): resumen en español`. Ámbito en inglés (`photos`, `db`, `widget`).
- Nunca agregar `Co-authored-by` ni atribución de la IA en commits ni PRs. Verificar con `git log -1 --format=%B` después de cada commit.
- No usar `--no-verify` ni enmendar commits publicados salvo pedido explícito.

## Planificación

- Una funcionalidad que necesita plan va en `odd/tasks/<feature>.md`, con specs, tareas y log. Al cerrarla se elimina, git guarda el historial.
- Engram (proyecto `pareja-app`) guarda decisiones y hallazgos duraderos.
- Nunca agregar estado de funcionalidades a este archivo. Solo se agrega una regla aquí si es una convención permanente.
