# Pareja App

App móvil personal para una pareja, en iOS y Android. Antes de empezar cualquier tarea, leer la sección Fases y respetar el alcance de la fase actual.

## Stack

- Expo SDK 57 con Expo Router, TypeScript estricto
- Supabase: Auth, Postgres con RLS, Storage, Realtime y Edge Functions
- TanStack Query para el estado del servidor
- StyleSheet de React Native con tokens de `src/shared/theme`

## Expo cambia en cada versión

No confiar en la memoria. Antes de usar una API de Expo o React Native, consultar `https://docs.expo.dev/versions/v57.0.0/` o `https://docs.expo.dev/llms.txt`.

## Arquitectura de carpetas

- `src/app/` solo contiene rutas. Cada pantalla compone componentes y hooks de una feature, sin lógica de datos.
- `src/features/<feature>/` agrupa todo lo de una funcionalidad: `api.ts`, `hooks.ts`, `types.ts` y `components/`.
- `src/shared/` contiene lo transversal: `ui/`, `theme/`, `lib/`, `hooks/` y `utils/`.
- Una feature puede importar de `shared/`. Una feature no importa archivos internos de otra feature.
- Importar siempre con el alias `@/`, que apunta a `src/`.

## Comandos

```bash
npx expo install <paquete>
npx expo start
npm run lint
npm run typecheck
npx expo-doctor
```

Usar siempre `npx expo install` para agregar dependencias. Ejecutar lint y typecheck antes de dar una tarea por terminada.

El Node de Cursor está desactualizado. Usar el de nvm: `export PATH=$HOME/.nvm/versions/node/v20.20.2/bin:$PATH`.

## Nativo

- Las carpetas `ios/` y `android/` se generan automáticamente. Nunca editarlas a mano, configurar todo en `app.json` y config plugins.
- Al agregar una librería con código nativo, la app necesita un development build (`eas build --profile development`). Expo Go deja de servir.
- Compilar y publicar con EAS: `npx eas-cli@latest <comando>`.

---

# Redacción

Aplica a los textos de la app, la documentación, los mensajes de error y las respuestas del agente.

- Español neutro, tratando de "tú". Sin voseo: "puedes", "tienes", "sube", nunca "podés", "tenés", "subí".
- Sin punto y coma. Dividir en dos oraciones o usar una coma.
- Sin guiones largos (—) ni medios (–). Solo el guion corto "-".
- Frases cortas y directas. En la interfaz, mayúscula solo al inicio de la frase.
- Los mensajes de error dicen qué pasó y qué puede hacer la persona.

## Ejemplos

| Evitar | Usar |
| --- | --- |
| Subí tu foto; la verá tu pareja. | Sube tu foto. Tu pareja la verá al instante. |
| Notas — compartidas | Notas compartidas |
| Error 400 | No se pudo guardar la nota. Revisa tu conexión e inténtalo de nuevo. |

---

# Estilo de código

Aplica al trabajar en `src/`.

## General

- Sin comentarios en el código. Si algo necesita explicación, mejorar los nombres o extraer una función.
- Nombres de variables, funciones, tipos y archivos en inglés. Los textos visibles para el usuario van en español.
- Prettier: punto y coma, comillas simples, 2 espacios, ancho 100.
- TypeScript estricto. Prohibido `any`, usar `unknown` y acotar el tipo.
- Archivos en kebab-case (`photo-card.tsx`). Componentes en PascalCase, hooks con prefijo `use`.
- Exportaciones nombradas. La única excepción son las rutas de `src/app/`, que Expo Router exige con `export default`.
- Componentes como `function`, no como constantes con flecha.

## Datos

- Solo `api.ts` y `src/shared/lib/` llaman a Supabase. Las funciones son `async`, reciben parámetros tipados y lanzan el error si Supabase devuelve uno.
- Imágenes: elegir con `requestImage` de `shared/ui`, comprimir con `compressImage` y subir con `uploadImage` de `shared/lib/storage`. Mostrarlas con `expo-image` usando la ruta de Storage como `cacheKey`.
- `hooks.ts` envuelve esas funciones con `useQuery` y `useMutation`. Las claves de consulta se definen en un objeto `<feature>Keys` dentro del mismo archivo.
- La suscripción a Realtime vive en un hook de la feature e invalida o actualiza la caché de TanStack Query.
- Los tipos de la base de datos salen de `src/shared/lib/database.types.ts`, generado desde Supabase. Nunca editarlo a mano.

## Estilos

- `StyleSheet.create` al final del archivo.
- Colores, espaciados, radios y tipografía siempre desde `@/shared/theme`. Prohibido escribir valores de color directamente.

## Ejemplo

```tsx
import { StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/shared/theme';

type PhotoCaptionProps = {
  caption: string;
};

export function PhotoCaption({ caption }: PhotoCaptionProps) {
  return <Text style={styles.caption}>{caption}</Text>;
}

const styles = StyleSheet.create({
  caption: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
```

---

# Supabase

Aplica al trabajar en `supabase/`, `src/features/**/api.ts` y `src/shared/lib/`.

Proyecto `pareja-app`, id `apbjqfkereibpanqppdu`, región `sa-east-1`. Usar este id con las herramientas MCP de Supabase.

- Consultar la documentación vigente antes de implementar. Supabase cambia seguido.
- RLS activado en todas las tablas de `public`. Las políticas se basan en la pertenencia a la pareja mediante `private.is_couple_member(couple_id)`.
- Las funciones `security definer` van en el esquema `private`, nunca en `public`.
- Las vistas se crean con `security_invoker = true`.
- Toda política de UPDATE necesita también una de SELECT.
- Nunca usar `user_metadata` para decidir permisos.
- En la app solo se usa la publishable key. La secret key y la service_role nunca salen de las Edge Functions.
- El bucket `photos` es privado. Las rutas siguen el formato `{couple_id}/{photo_id}.jpg` y las imágenes se muestran con URLs firmadas.
- Las tablas nuevas no reciben permisos solas. Revocar todo a `anon` y `authenticated` y otorgar solo lo necesario, por columna cuando aplica.
- Las RPC que llama la app viven en `public` como `security invoker` y delegan en una función `security definer` de `private`.

## Flujo de migraciones

La CLI está vinculada al proyecto y es el camino principal. El MCP es opcional.

1. Crear el archivo con `npx supabase migration new <nombre>` y escribir el SQL.
2. Revisar con `npx supabase db push --dry-run` y aplicar con `npm run db:push -- --yes`.
3. Probar las políticas. Para SQL usar `npx supabase db query --linked` con un bloque `do` que termine en `raise exception`, así nada queda guardado. Para Storage y Realtime, un script temporal con supabase-js y usuarios de prueba, que se eliminan al terminar.
4. Revisar avisos con `npx supabase db advisors --linked`.
5. Regenerar los tipos con `npm run db:types`.

Tras crear rutas nuevas, los tipos de Expo Router se regeneran al levantar `npx expo start`.

---

# Producto

App privada para dos personas. Cada una instala la app en su teléfono, crea su cuenta y se vinculan como pareja. Todo lo que comparte una aparece al instante en el teléfono de la otra.

## Funcionalidades core

### 1. Cuenta y pareja

- Registro e inicio de sesión con correo y contraseña.
- Perfil con nombre y foto.
- Una persona crea la pareja y obtiene un código de invitación. La otra lo ingresa para unirse.
- Una pareja tiene exactamente dos miembros. Sin pareja vinculada, la app solo muestra la pantalla de vinculación.

### 2. Fotos

- Subir fotos desde la galería o la cámara, con texto opcional.
- Galería compartida ordenada por fecha.
- Cuando una persona sube una foto, aparece en el teléfono de la otra sin recargar.
- Ver una foto en pantalla completa y eliminar las propias.

### 3. Notas

- Crear, editar y eliminar notas compartidas.
- Fijar notas importantes arriba.
- Los cambios se ven en tiempo real en ambos teléfonos.

### 4. Contador y fechas importantes

- Fecha de inicio de la relación y contador de días juntos en la pantalla de inicio.
- Lista de fechas importantes (aniversarios, cumpleaños) con días restantes. Pueden repetirse cada año.

### 5. Toques

- Botones rápidos para enviar un gesto ("pienso en ti", "te extraño", "te amo").
- Estado de ánimo actual visible para la otra persona.
- Cada toque genera una notificación.

### 6. Calendario compartido

- Planes de uno o varios días, con hora opcional, junto a las fechas importantes.
- Un plan se puede copiar al calendario del teléfono.
- Se sincroniza en tiempo real y tiene su propio widget.

### 7. Notificaciones push

- Aviso cuando la otra persona sube una foto, crea una nota o envía un toque.

### 8. Widget de inicio

- Widget en la pantalla de inicio del teléfono con la última foto de la pareja.
- Se actualiza cuando llega una foto nueva.

### 9. Extras

- Reacciones con emoji en fotos y notas.
- Mapa de los lugares que visitan juntos.
- Mascota virtual que cuidan entre los dos.

## Fuera del alcance

- Chat de mensajes.
- Modo oscuro (se evalúa después del MVP).
- Versión web.
- Más de una pareja por cuenta.

## Idioma

La interfaz está solo en español, siguiendo la sección Redacción.

---

# Arquitectura

## Estructura de carpetas

```
src/
  app/                          rutas de Expo Router
    _layout.tsx                 providers y protección de rutas
    (auth)/                     sin sesión: sign-in, sign-up
    (onboarding)/               con sesión pero sin pareja: crear o unirse
    (app)/                      con sesión y pareja
      (tabs)/                   inicio, fotos, notas, calendario, ajustes
      photos/[id].tsx           foto en pantalla completa
      notes/[id].tsx            editor de nota
      calendar/[id].tsx         editor de plan
      places/                   mapa de lugares
      pet.tsx                   mascota
  features/
    auth/
    couple/
    profile/
    photos/
    notes/
    dates/
    nudges/
    reactions/
    calendar/
    places/
    pet/
    notifications/
    widget/
  shared/
    ui/                         componentes genéricos (Button, Screen, TextField)
    theme/                      colores, espaciados, radios, tipografía
    lib/                        supabase.ts, query-client.ts, database.types.ts
    hooks/                      hooks genéricos
    utils/                      funciones puras
supabase/
  migrations/                   esquema versionado
  functions/                    Edge Functions (notificaciones)
```

## Anatomía de una feature

```
features/photos/
  api.ts                        funciones que llaman a Supabase
  hooks.ts                      useQuery, useMutation y photoKeys
  realtime.ts                   hook que escucha cambios e invalida la caché
  errors.ts                     traduce códigos de error a mensajes para la persona
  types.ts                      tipos derivados de database.types.ts
  components/                   PhotoGrid, PhotoCard, UploadButton
```

## Flujo de datos

1. La pantalla usa un hook de la feature, por ejemplo `usePhotos()`.
2. El hook llama a `api.ts` a través de TanStack Query, que guarda el resultado en caché.
3. `realtime.ts` escucha los cambios de la tabla filtrados por `couple_id` y actualiza la caché.
4. Las mutaciones invalidan las claves afectadas al terminar.

## Protección de rutas

`src/app/_layout.tsx` decide qué grupo mostrar con `Stack.Protected`:

| Estado                 | Grupo visible  |
| ---------------------- | -------------- |
| Sin sesión             | `(auth)`       |
| Con sesión, sin pareja | `(onboarding)` |
| Con sesión y pareja    | `(app)`        |

La sesión viene de `AuthProvider` y la pareja de `CoupleProvider`, ambos en `src/features/auth` y `src/features/couple`. `CoupleProvider` recibe el `userId` como prop desde el layout raíz, así `couple` no depende de `auth`.

Una pareja con un solo miembro sigue en `(onboarding)`, mostrando el código para compartir hasta que la otra persona se une.

## Decisiones

| Tema                 | Decisión                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Estado del servidor  | TanStack Query                                                                               |
| Tiempo real          | Supabase Realtime que actualiza la caché                                                     |
| Estilos              | StyleSheet con tokens de `shared/theme`                                                      |
| Sesión               | AsyncStorage, según la recomendación de Supabase                                             |
| Imágenes             | `expo-image` con URLs firmadas y caché en disco                                              |
| Compresión de fotos  | Lado mayor 1600 px, JPEG, unos 300 a 500 KB por foto para cuidar el 1 GB gratis              |
| Plataforma de prueba | Los dos teléfonos son Android. Se mantiene compatibilidad con iOS, pero se prueba en Android |
| Notificaciones       | Trigger en Postgres que llama a una Edge Function, que envía con el servicio push de Expo    |
| Widget               | Se investiga la opción vigente para iOS y Android al llegar a esa fase                       |

---

# Modelo de datos

Todas las tablas viven en `public` con RLS activado. Salvo `profiles` y `push_tokens`, todas tienen `couple_id`, y sus políticas permiten acceso solo a los miembros de esa pareja.

## Tablas

| Tabla             | Columnas principales                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`        | `id` (= auth.users.id), `display_name`, `avatar_path`, `mood_emoji`, `mood_text`, `updated_at`                                     |
| `couples`         | `id`, `started_on`, `invite_code` (único), `created_at`                                                                           |
| `couple_members`  | `couple_id`, `user_id` (único, referencia a `profiles`), `joined_at`                                                              |
| `photos`          | `id`, `couple_id`, `uploaded_by`, `storage_path`, `caption`, `width`, `height`, `created_at`, `updated_at`                        |
| `notes`           | `id`, `couple_id`, `author_id`, `title`, `content`, `pinned`, `position`, `color`, `created_at`, `updated_at`                     |
| `note_replies`    | `id`, `couple_id`, `note_id`, `author_id`, `content`, `created_at`, `updated_at`                                                  |
| `important_dates` | `id`, `couple_id`, `title`, `date`, `repeats_yearly`, `created_at`                                                                |
| `nudges`          | `id`, `couple_id`, `sender_id`, `kind`, `created_at`                                                                              |
| `reactions`       | `id`, `couple_id`, `user_id`, `photo_id` o `note_id`, `emoji`, `created_at`                                                       |
| `events`          | `id`, `couple_id`, `created_by`, `title`, `details`, `starts_on`, `ends_on`, `start_time`, `end_time`, `created_at`, `updated_at` |
| `places`          | `id`, `couple_id`, `created_by`, `name`, `note`, `latitude`, `longitude`, `visited_on`, `photo_id`, `created_at`, `updated_at`    |
| `pets`            | `couple_id`, `name`, `fullness`, `happiness`, `xp`, `last_action`, `last_actor`, `created_at`, `updated_at`                       |
| `push_tokens`     | `user_id`, `token`, `platform`, `updated_at`                                                                                      |

## Funciones y triggers

- `private.is_couple_member(couple_id)`: indica si el usuario actual pertenece a la pareja. Base de todas las políticas.
- `private.shares_couple_with(user_id)`: indica si otro usuario es la pareja del actual. Se usa en `profiles`.
- `public.create_couple()` y `public.join_couple(code)`: RPC que crean o vinculan la pareja de forma atómica y validan el máximo de dos miembros. Son `security invoker` y delegan en funciones `security definer` de `private`.
- Errores de las RPC: `invalid_code`, `couple_full`, `already_in_couple`. La app los traduce en `features/couple/errors.ts`.

## Permisos

Las tablas nuevas no reciben permisos automáticamente. Cada migración revoca todo a `anon` y `authenticated` y luego otorga solo lo necesario, por columna cuando aplica. Ejemplo: en `couples` solo se puede editar `started_on`.

- Trigger al crear un usuario en `auth.users` que inserta su fila en `profiles`.
- `public.adopt_pet(pet_name)` y `public.care_for_pet(action)`: RPC de la mascota. Aplican el desgaste según el tiempo pasado desde `updated_at`, así no hace falta `pg_cron`.
- Triggers en `photos`, `notes`, `nudges`, `reactions`, `events` y `places` que envían la notificación push a la otra persona. Usan `pg_net` para llamar directo a la API de Expo (`exp.host`), sin Edge Function ni claves secretas. Si el envío falla, el insert no se ve afectado.
- `public.register_push_token(new_token, new_platform)`: RPC que guarda el token del teléfono para el usuario actual. Si el token pertenecía a otra cuenta, pasa a la actual. Al cerrar sesión la app borra su token.

## Perfiles

Cada persona puede leer su perfil y el de su pareja. Solo puede editar el suyo.

## Storage

| Bucket    | Acceso                               | Ruta                         |
| --------- | ------------------------------------ | ---------------------------- |
| `photos`  | Privado, solo miembros de la pareja  | `{couple_id}/{photo_id}.jpg` |
| `avatars` | Privado, solo la persona y su pareja | `{user_id}/{uuid}.jpg`       |

- Solo se aceptan JPEG. Límite de 10 MB por foto y 5 MB por avatar.
- Las fotos se comprimen a 1600 px y los avatares a 512 px antes de subirlas.
- Cada avatar nuevo usa una ruta nueva y el anterior se elimina, así la caché nunca muestra uno viejo.
- Una restricción en `photos` exige que `storage_path` sea `{couple_id}/{id}.jpg`.
- Al eliminar una foto, primero se borra el archivo y luego la fila.

## Realtime

Publicación activa para `couples`, `couple_members`, `profiles`, `photos`, `notes`, `important_dates`, `nudges`, `reactions`, `events`, `places` y `pets`. Cada suscripción filtra por `couple_id` cuando la tabla lo tiene.

Al confirmarse una suscripción, la app vuelve a consultar los datos. Así no se pierden cambios ocurridos durante la conexión o una reconexión.

---

# Fases

Cada fase termina cuando se cumplen sus criterios, pasan lint y typecheck, y la funcionalidad se probó en un teléfono.

## Fase 0 - Fundaciones

- Reorganizar el código actual según la sección Arquitectura.
- Configurar Prettier, TanStack Query y los tokens de tema.
- Crear el proyecto en Supabase, inicializar `supabase/` y generar `.env.local`.

Terminado cuando: la app abre en Expo Go con la estructura nueva y se conecta a Supabase.

## Fase 1 - Cuenta y pareja

- Esquema de `profiles`, `couples` y `couple_members` con RLS.
- Registro, inicio de sesión y perfil.
- Crear pareja con código de invitación y unirse con código.
- Protección de rutas en tres estados.

Terminado cuando: dos cuentas en dos teléfonos quedan vinculadas y ven el nombre de la otra.

## Fase 2 - Fotos

- Foto de perfil con el bucket `avatars`, aprovechando `expo-image-picker`.
- Tabla `photos`, bucket privado y políticas.
- Subir desde galería o cámara, galería compartida, pantalla completa, eliminar.
- Sincronización en tiempo real.

Terminado cuando: una foto subida en un teléfono aparece en el otro sin recargar.

## Fase 3 - Notas

- Tabla `notes`, CRUD, notas fijadas, tiempo real.

## Fase 4 - Inicio, contador y fechas

- Fecha de inicio, contador de días y tabla `important_dates`.
- Pantalla de inicio con contador, próxima fecha, última foto y notas fijadas.

## Fase 5 - Toques y estado de ánimo

- Tabla `nudges` y campo `mood` en `profiles`, en tiempo real.

## Fase 6 - Listas

- Tablas `lists` y `list_items`, en tiempo real.

## Fase 7 - Notificaciones push

- Requiere development build con EAS.
- Registro de tokens, Edge Function y triggers.

Terminado cuando: un toque enviado desde un teléfono llega como notificación al otro con la app cerrada.

## Fase 8 - Widget

- Investigar la opción vigente para widgets en Expo SDK 57.
- Widget con la última foto en iOS y Android.

## Fase 9 - Publicación

- Ícono, splash, `bundleIdentifier` y `package`.
- Builds de producción con EAS e instalación en ambos teléfonos.

## Fase 10 - Ajustes y reacciones

- Widget de foto desde 2 por 2 y widget de próxima fecha desde 1 bloque de alto.
- Foto de perfil propia y de la pareja en pantalla completa.
- Tabla `reactions` con un emoji por persona en fotos y notas, en tiempo real y con notificación push.

## Fase 11 - Calendario compartido

- Tabla `events` con título, fecha, hora opcional, nota y autor, en tiempo real.
- Vista de mes propia, con el estilo de la app. Las fechas importantes aparecen junto a los planes. No se usa `react-native-calendars` porque sus dependencias son antiguas y no asegura compatibilidad con React 19.
- Botón para copiar un evento al calendario del teléfono con `expo-calendar`.
- El calendario reemplaza la pestaña de listas. Las listas se eliminan, código y tablas.
- Widget de Android con los próximos eventos.

## Fase 12 - Mapa de lugares

- Tabla `places` con nombre, coordenadas, fecha de visita, nota y foto opcional.
- Mapa con MapLibre y mapas de OpenStreetMap, sin cuenta de Google.
- Marcar un lugar con la ubicación actual o tocando el mapa.

## Fase 13 - Mascota compartida

- Tabla `pets` con nombre, hambre, ánimo y nivel, en tiempo real.
- El estado baja con el tiempo sin tareas programadas. Se calcula desde `updated_at` al leerla y al cuidarla, en la app y en la función `care_for_pet`. Los dos la alimentan, la miman y juegan con ella desde la app.
- Ilustraciones en SVG con el estilo de la app.

## Estado actual

- Fase 0: proyecto Supabase en `sa-east-1`, `supabase/` inicializado, estructura en `app/`, `features/` y `shared/`, TanStack Query y Prettier.
- Fase 1: migración `couples_and_profiles` con RLS verificada, registro, vinculación con código, perfil editable y navegación en tres estados. La foto de perfil pasó a la fase 2.

Fases 0 y 1 probadas en dos teléfonos Android con `npm run start:tunnel`, necesario porque WSL2 no expone su IP a la red local.

Fase 2: migración `photos_and_avatars`, galería con paginación, subida desde galería o cámara, visor con eliminación, avatares y tiempo real. Subida probada en el teléfono. La foto elegida pasa a la pantalla siguiente en memoria, no por la URL, porque Expo Router decodifica la ruta del archivo y la rompe.

Fase 3 probada en los teléfonos: migración `notes` con RLS verificada, lista con fijadas arriba, editor para crear, editar, fijar y eliminar, y tiempo real. Ambos miembros pueden editar y eliminar cualquier nota. Si los dos editan la misma nota a la vez, queda la última versión guardada.

Fase 4 terminada en código: migración `important_dates` con RLS verificada, `couples` en Realtime para que la fecha de inicio llegue a los dos, selector de fechas de `@react-native-community/datetimepicker` (incluido en Expo Go), contador de días, fechas que se repiten cada año y pantalla de inicio con contador, próxima fecha, última foto y notas fijadas. Las fechas sin hora se leen en hora local con `parseDay` para no correrse un día. Falta probarla en los teléfonos.

Fase 5 terminada en código: migración `nudges_and_mood` con RLS verificada. Cuatro toques (pienso en ti, te extraño, te amo, un abrazo) que llegan como aviso animado arriba de la pantalla si la app está abierta, y seis estados de ánimo visibles en el inicio de la otra persona. Falta probarla en los teléfonos.

Fase 6 terminada en código: migración `lists` con RLS verificada. Varias listas, elementos que se marcan como hechos con actualización inmediata, `done_by` llenado por trigger, renombrar y eliminar listas, y tiempo real. Un elemento solo puede pertenecer a una lista de la misma pareja gracias a una clave foránea compuesta. Falta probarla en los teléfonos.

Las pruebas en teléfonos de las fases 4 a 6 se harán juntas al final, según lo pedido.

Cuentas: proyecto EAS `@kaelfernandez/pareja-app`, paquete `com.kaelfernandez.pareja`, Firebase `pareja-app-2fa6c` con `google-services.json` en la raíz, keystore generado por EAS y clave FCM V1 subida a EAS. Variables `EXPO_PUBLIC_*` cargadas en EAS para los tres entornos.

Fase 7 terminada en código: migración `push_notifications` verificada, `expo-notifications` con canal `default`, registro del token al entrar, borrado al cerrar sesión y navegación al tocar la notificación. Con la app abierta no se muestra el aviso del sistema, porque el tiempo real ya actualiza la pantalla.

Fase 8 terminada en código: widget `LatestPhoto` de Android con `react-native-android-widget`, porque `expo-widgets` en SDK 57 solo documenta iOS. La tarea del widget se registra en `index.ts`, que ahora es el punto de entrada. El widget pide la última foto a Supabase al agregarse, cada 30 minutos, al cambiar la última foto y al salir de la app. Al tocarlo abre la foto. iOS queda fuera porque ambos teléfonos son Android.

Compilar solo cuando el usuario lo pida: el plan gratuito de EAS da 15 compilaciones de Android al mes.

Fases 2 a 8 probadas en los teléfonos con el development build. En Expo Go, `expo-notifications` y el widget se cargan solo fuera de Expo Go para que la app no falle, y `npm run start:go` abre el túnel en ese modo.

Rediseño de la interfaz: paleta blanca, rosada y café, tipografía Nunito, íconos Lucide y componentes base nuevos en `shared/ui`.

Fase 9 en curso: ícono de dos corazones (café y rosado) generado como SVG, splash con la misma marca y tres widgets de Android: `LatestPhoto`, `DaysTogether` y `NextDate`, con fuentes Nunito y vistas previas en `assets/widgets`. El cálculo de próximas fechas está en `shared/utils/occurrence.ts` porque lo usan las fechas y los widgets. El perfil `production` genera un APK para instalarlo directo en los dos teléfonos.

Fase 9 terminada: versión de producción instalada en ambos teléfonos como APK.

Fases 10 a 13 terminadas en código:

- Fase 10: widgets más flexibles, visor de la foto de perfil y reacciones con seis emojis en fotos y notas, con push a quien publicó.
- Fase 11: tabla `events`, pestaña Calendario en lugar de Listas, planes de uno o varios días con hora opcional, fechas importantes en el mismo mes, botón para agregar un plan al calendario del teléfono con `expo-calendar` y widget `UpcomingPlans`. Las listas se eliminaron, código y tablas.
- Fase 12: tabla `places`, mapa con MapLibre y estilo Positron de OpenFreeMap, lugares marcados con la ubicación actual o manteniendo presionado el mapa. El mapa no funciona en Expo Go.
- Fase 13: tabla `pets` con funciones `adopt_pet` y `care_for_pet`, gato en SVG con cinco ánimos, niveles por experiencia y tarjeta en el inicio.

Versión 3 de producción instalada. Ajustes después de probarla:

- Inicio simple: días juntos con el ánimo de cada uno, toques en una fila, la mascota libre sobre el fondo y los próximos planes. Tu ánimo se elige tocando tu avatar.
- Lugares pasa a ser pestaña, con búsqueda de direcciones en Nominatim de OpenStreetMap. La barra inferior se desliza cuando hay más de cinco pestañas y Ajustes queda al final.
- La mascota es un perrito panzón en estilo 3D. Crece por nivel: recién nacido desde el nivel 1, cachorro desde el 4 y adulto desde el 8. Cada etapa tiene una imagen por ánimo en `assets/pet/`, con fondo transparente, y la app la anima: respira, se balancea, salta cuando está feliz y suelta corazones al tocarlo. Tiene racha diaria, que suma cuando cualquiera de los dos lo cuida ese día. El día lo envía el teléfono en su hora local.
- El cálculo de ánimo y etapa vive en `src/shared/utils/pet.ts` y las imágenes en `src/shared/lib/pet-art.ts`, porque los usan la mascota y el widget.
- La racha tiene tres estados visibles, no solo por color: llama encendida si ya lo cuidaron hoy, llama con borde punteado si la racha está en riesgo y "Sin racha" si se perdió. Debajo del nombre se indica cuánto falta para la próxima salida.
- Cada 7 días de racha el perrito propone una salida al azar de la tabla `outing_ideas`: cine, helado, cafetería, museo o exposición, caminata o quedarse en casita. La crea `care_for_pet` en `pet_outings`, sin repetir la idea anterior, y avisa con push a la pareja. Al aceptarla se elige un día desde el siguiente al que se cumplió la racha, y `schedule_outing` crea el plan con `outing_streak`. También se puede descartar con `dismiss_outing`.
- Los planes que nacen de una racha muestran una llamita en el mes, en la agenda, en el detalle del plan y en el widget de próximos planes.
- En el mapa, al buscar un lugar que ya está guardado a menos de 75 metros, se abre ese lugar en vez de crear otro alfiler.
- Fotos como álbum de polaroids agrupado por mes, en dos columnas, con marco blanco, leve inclinación y la descripción o la fecha en letra manuscrita. La foto abierta es una polaroid grande que respeta su proporción.
- Notas adhesivas en dos columnas, con cinta o chinche si están fijadas. Cada nota tiene un color guardado en `notes.color` y se elige en el editor. La letra manuscrita es Caveat, de `@expo-google-fonts/caveat`.
- Widget de la mascota: imagen fija del ánimo actual, nombre, racha y nivel. Android no permite animaciones en widgets.
- Los widgets declaran `minResizeWidth` y `minResizeHeight` con el plugin local `plugins/with-widget-resize.js`, porque `react-native-android-widget` no los permite. Ese plugin va antes del de widgets en `app.json`, porque los mods se ejecutan en orden inverso.
- Pulido final terminado en código (T1-T8): teclado en formularios, fechas/horas en `America/Santiago`, edición y zoom de fotos, descarga y acceso compartido, push al crear o editar, respuestas anidadas en notas, ánimo libre con emoji y texto, orden de notas por arrastre (`notes.position` + `reorder_notes`) y filtros/animaciones en fotos.
- Post-pulido inmediato terminado: ícono y dismiss de notificaciones, Action anti-pausa de Supabase, uso de almacenamiento en Ajustes, preferencias de push por tipo, recuperar/cambiar contraseña y cambiar correo. El respaldo del roadmap queda cubierto por guardar fotos en la galería. APK de producción (versionCode 5) listo para instalar en los dos teléfonos y probar junto con el pulido (media-library, gestos y arrastre).

Para probar cambios de JavaScript sin compilar se usa el development build con `npm run start:tunnel`.

Para revisar las pantallas en el computador se usa `npm run web` y el modo de dispositivo del navegador. En web el mapa muestra su aviso de no disponible, porque `src/features/places/native.web.ts` reemplaza a MapLibre. Los widgets no existen en web.

## Costos

- Todo el proyecto cabe en planes gratuitos. Los dos teléfonos son Android, así que no hace falta la cuenta de Apple Developer.
- Supabase gratis: 1 GB de almacenamiento, 5 GB de descarga al mes, pausa tras 7 días sin uso y sin respaldos automáticos.
- EAS gratis: 15 compilaciones de Android al mes, suficiente para las fases 7 a 9.
- Notificaciones push sin costo: Expo Push Service y Firebase Cloud Messaging no cobran por mensaje.
- MapLibre y las teselas de OpenStreetMap no requieren tarjeta ni cuenta de pago.
