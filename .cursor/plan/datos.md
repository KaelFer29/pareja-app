# Modelo de datos

Todas las tablas viven en `public` con RLS activado. Salvo `profiles` y `push_tokens`, todas tienen `couple_id`, y sus políticas permiten acceso solo a los miembros de esa pareja.

## Tablas

| Tabla             | Columnas principales                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`        | `id` (= auth.users.id), `display_name`, `avatar_path`, `mood`, `updated_at`                                                       |
| `couples`         | `id`, `started_on`, `invite_code` (único), `created_at`                                                                           |
| `couple_members`  | `couple_id`, `user_id` (único, referencia a `profiles`), `joined_at`                                                              |
| `photos`          | `id`, `couple_id`, `uploaded_by`, `storage_path`, `caption`, `width`, `height`, `created_at`                                      |
| `notes`           | `id`, `couple_id`, `author_id`, `title`, `content`, `pinned`, `created_at`, `updated_at`                                          |
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
