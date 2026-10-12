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
