# Pulido final de pareja-app

Objetivo: dejar la app lista con ocho mejoras de ánimo, fotos, notas, notificaciones y orden.
Ramas: una por tarea desde `main` actualizado, en formato `tipo/slug` (ver tabla Tasks). Cada rama cierra con PR a `main`.
Entrega: `ask-on-risk`, Conventional Commits solo con asunto. Verificación: `npm run lint`, `npm run typecheck`, `npx expo-doctor` y prueba en los dos teléfonos Android. No hay runner de tests, así que las migraciones se prueban con el bloque `do ... raise exception` de AGENTS.md.

## Specs

Cada spec cita el pedido textual entre comillas. Lo que sigue a la cita es el criterio de aceptación derivado. Los puntos marcados **Supuesto** no los pidió la persona y se confirman antes de implementar.

### S1. Estado de ánimo libre

> "Estados de como me siento flexibles, poder colocar el como me siento con un emoji a elección con un límite de palabras para poder visualizarlo bien."

- La persona elige cualquier emoji y escribe un texto corto para su estado.
- El texto tiene un límite que se ve completo en el inicio y en el widget. **Confirmado**: máximo 15 caracteres, validado en la app y en la base.
- Los seis estados actuales quedan como sugerencias rápidas.
- La pareja ve el estado nuevo en tiempo real, como hoy.

Estado actual: `profiles.mood` es texto con el CHECK `profiles_mood_valid` que solo acepta `happy, loving, calm, tired, sad, stressed` (`supabase/migrations/20261012014532_nudges_and_mood.sql:2-3`). Definiciones en `src/features/profile/moods.ts`, selector en `src/features/profile/components/mood-picker.tsx`, se muestra en `src/app/(app)/(tabs)/index.tsx:71,76,81`. También lo usa el cálculo de ánimo de la mascota si aplica, revisar antes de cambiarlo.

Implicancia: migración que reemplaza el CHECK por columnas `mood_emoji` y `mood_text` (o similar) con límites, y convierte los valores existentes. Riesgo: item 1 (cambia el formato de un dato guardado).

### S2. Teclado al escribir la descripción de una foto

> "Escritura del título de una foto cargada sin que el teclado tape lo que se está escribiendo, ya que al actualmente cargar una foto y escribir, el teclado tapa lo que se está escribiendo y es sumamente molesto."

- Al escribir la descripción en Android, el campo y lo que se escribe quedan siempre a la vista sobre el teclado.
- El mismo comportamiento aplica al editor de notas y a cualquier otro formulario largo.

Estado actual: `src/app/(app)/photos/new.tsx:19-22` usa `KeyboardAvoidingView` con `behavior` `undefined` en Android, que no hace nada. El campo está bajo una vista previa de hasta 420 px en `src/features/photos/components/new-photo-form.tsx`. `src/app/(app)/notes/[id].tsx` tiene el mismo patrón. No está instalado `react-native-keyboard-controller` y `app.json` no define `softwareKeyboardLayoutMode`.

Implicancia: consultar la documentación de Expo SDK 57 sobre manejo de teclado y elegir entre `react-native-keyboard-controller` (requiere development build) o corregir `behavior` en Android. Crear un componente compartido en `src/shared/ui` para no repetir la solución.

### S3. Editar la descripción y ver la foto en detalle

> "Poder editar los títulos o descripciones de estas fotos, ya que actualmente no se puede. Además, si el título es lo suficientemente largo, no se puede ver completo. A lo mejor implementaría una barra deslizadora o un detalle en esta foto, ya que actualmente ni siquiera se le puede hacer zoom."

- Desde el visor se puede editar la descripción de la foto. Se guarda y la pareja la ve en tiempo real.
- La descripción larga se lee completa en el visor, con desplazamiento o un panel de detalle.
- La foto admite zoom con dos dedos y doble toque, y vuelve a su tamaño al soltar o con otro doble toque.

Estado actual: `photos` no tiene grant ni política de UPDATE (`supabase/migrations/20261012010737_photos_and_avatars.sql:38-58`). El visor `src/features/photos/components/photo-viewer.tsx:67-68` corta la descripción en 2 líneas y la grilla en 1 (`photo-grid.tsx:153`). La imagen es un `expo-image` sin gestos.

Implicancia: migración con `grant update (caption)` y política de UPDATE más una de SELECT, columna `updated_at` en `photos` para S6. `react-native-gesture-handler` y `react-native-reanimated` solo están como dependencias transitivas, hay que agregarlas con `npx expo install`. Riesgo: item 2 (permisos nuevos).

### S4. Descargar fotos y libertad compartida

> "Poder descargar una foto cargada, ya sea personal o de mi pareja. Veamos esta aplicación como una funcionalidad unificada, mi pareja y yo deberíamos tener total libertad para modificar las cosas de cada uno, excepto los datos personales como la foto de perfil, obvio."

- Cualquier foto de la pareja se puede guardar en la galería del teléfono con un botón en el visor. Si falta el permiso, el mensaje dice qué pasó y qué hacer.
- Ambos miembros pueden editar y eliminar cualquier foto, nota, lugar y plan de la pareja.
- El perfil (nombre, foto de perfil, estado de ánimo) solo lo edita su dueño. Las reacciones siguen siendo de cada persona.

Estado actual: `expo-media-library` no está instalado. Eliminar fotos y sus archivos exige ser quien subió (`photos_and_avatars.sql:54-58` y `:85-92`). Notas y lugares ya permiten editar y eliminar a ambos.

Implicancia: `npx expo install expo-media-library` con su config plugin en `app.json` (requiere development build). Migración que abre UPDATE y DELETE de `photos` y DELETE del Storage a cualquier miembro, manteniendo el formato de ruta `{couple_id}/{id}.jpg`. Revisar `events` con el mismo criterio. Riesgo: item 2 (cambia políticas RLS y de Storage).

### S5. Notificar creaciones y cambios

> "Que se notifiqué cuando se realice alguna modificación en alguna foto o nota, con todo en generar que se cargue o cree, como una ubicación, nota y fotos."

- Crear o editar una foto, nota, lugar o plan envía un push a la otra persona.
- El texto distingue creación de edición. Ejemplo: "Kael editó la nota Compras".
- **Confirmado**: fijar una nota sí notifica. Cambiar el color no. También notifican cambios de título, contenido o descripción.

Estado actual: todos los triggers de contenido son `AFTER INSERT` (`push_notifications.sql:172-180`, `calendar_events.sql:85`, `places_and_pet.sql:71`). Solo `reactions_notify_owner` reacciona a UPDATE. El push envía solo `data.url` (`push_notifications.sql:56-97`).

Implicancia: triggers `AFTER UPDATE OF <columnas>` con `when (old.x is distinct from new.x)` que reutilizan `private.push_to_partner`. La edición de S3 y las respuestas de S7 deben notificar también.

### S6. Fecha y hora de Chile

> "Visualización de las horas en Chile de cuando se cargó una imagen y editó, lo mismo con las notas, no solo el día."

- Fotos y notas muestran fecha y hora de creación y, si cambió, de la última edición.
- La hora se muestra en la zona `America/Santiago` sin importar la zona del teléfono, con horario de verano incluido.

Estado actual: `src/shared/utils/date.ts` usa `toLocaleDateString('es')` sin `timeZone`. Fotos usan `formatLongDate` y `formatDayWithoutYear`, notas usan `formatRelativeShort` (`note-list.tsx:126`). `photos` no tiene `updated_at`.

Implicancia: funciones nuevas en `date.ts` con `timeZone: 'America/Santiago'`. Verificar que Hermes en Android respete la opción. `photos.updated_at` con trigger, compartido con S3.

### S7. Respuestas anidadas en notas

> "Anidar notas a notas ya creadas y con notificación igualmente, ahora solo deja crear notas y reaccionar, no avisa cuando se modifica una nota personal o de tu pareja, y mi idea es que ademas de reaccionar te permita anidar notas a las notas como de reacción."

- En una nota se pueden agregar notas de respuesta, visibles bajo la nota original junto a las reacciones.
- Cada respuesta muestra autor, fecha y hora (S6) y se puede editar y eliminar según S4.
- Crear una respuesta notifica a la pareja y aparece en tiempo real.
- Editar una nota notifica (cubierto por S5).

Estado actual: no existe ningún concepto de respuesta o comentario. Las reacciones viven en `reactions` con `note_id` y se muestran en `src/features/reactions/components/reaction-bar.tsx` dentro del editor (`note-editor.tsx:166`).

Implicancia: **Confirmado**: tabla nueva `note_replies` (`id`, `couple_id`, `note_id`, `author_id`, `content`, `created_at`, `updated_at`) con FK compuesta a `notes(id, couple_id)`, RLS, Realtime y trigger de push. Un solo nivel de anidación. La tabla nueva se suma a la sección Modelo de datos de AGENTS.md.

### S8. Orden libre e interacción en notas y fotos

> "Mayor interacción en el apartado de notas e imagenes, que haya libertad de ordenamiento, como arrastre, mayor interacción visual y que no sea tan plano."

- Las notas se reordenan arrastrando. El orden se guarda y es el mismo en ambos teléfonos.
- **Confirmado**: en fotos se mantiene el álbum por mes y se agregan filtros (todas, mías, de mi pareja) y animaciones de entrada. No se reordenan por arrastre.
- Interacción visual: animación al tocar, al fijar y al eliminar, y respuesta háptica en el arrastre.
- Las notas fijadas siguen arriba.

Estado actual: `note-list.tsx` es un `ScrollView` en dos columnas sin virtualizar. `photo-grid.tsx` es un `FlatList` por mes. No hay columna de orden: fotos por `created_at desc` y notas por `pinned desc, updated_at desc`.

Implicancia: columna `position` en `notes` con grant de UPDATE y RPC de reordenamiento si hace falta atomicidad. Evaluar librerías de arrastre compatibles con Reanimated 4 y React 19 consultando su documentación vigente, no la memoria.

## Tasks

| ID | Specs | Rama | Riesgo | Estado | PR |
| --- | --- | --- | --- | --- | --- |
| T1 | S2 | `fix/teclado-formularios` | ninguno | hecha | [#1](https://github.com/KaelFer29/pareja-app/pull/1) |
| T2 | S6 | `feat/fechas-chile` | ninguno | hecha | - |
| T3 | S3, S6 | `feat/edicion-fotos` | item 2 (política UPDATE en `photos`) | pendiente | - |
| T4 | S4 | `feat/fotos-compartidas` | item 2 (RLS y Storage compartidos) | pendiente | - |
| T5 | S5 | `feat/push-ediciones` | ninguno | pendiente | - |
| T6 | S7 | `feat/respuestas-notas` | ninguno (tabla nueva) | pendiente | - |
| T7 | S1 | `feat/animo-libre` | item 1 (migra valores de `mood`) | pendiente | - |
| T8 | S8 | `feat/interaccion-notas-fotos` | ninguno | pendiente | - |

Orden sugerido: T1 y T2 son rápidos y sin migración. T3 y T4 comparten `photos` y conviene hacerlos seguidos (PRs en serie). T5 depende de T3 y se completa con T6. T7 y T8 son independientes. Cada tarea es una rama y un PR. Las que agregan librerías nativas (T1 si usa keyboard-controller, T3, T4, T8) necesitan un development build. Agruparlas en una sola compilación para cuidar las 15 mensuales de EAS.

Cada tarea cierra con lint, typecheck, avisos de `npx supabase db advisors --linked` si tocó la base, tipos regenerados con `npm run db:types` y la sección Estado actual de AGENTS.md actualizada.

## Log

- L1 (2026-11-07) Pedido original:

  > Necesito terminar de pulir esta aplicación móvil. No tengo muy clara las funcionalidades que me gustaría implementar para dejarla lista ni las cosas que corregir o pulir. Lo que sí tengo seguro, son las siguientes funcionalidades y correcciones:
  >
  > 1. Estados de como me siento flexibles, poder colocar el como me siento con un emoji a elección con un límite de palabras para poder visualizarlo bien.
  > 2. Escritura del título de una foto cargada sin que el teclado tape lo que se está escribiendo, ya que al actualmente cargar una foto y escribir, el teclado tapa lo que se está escribiendo y es sumamente molesto.
  > 3. Poder editar los títulos o descripciones de estas fotos, ya que actualmente no se puede. Además, si el título es lo suficientemente largo, no se puede ver completo. A lo mejor implementaría una barra deslizadora o un detalle en esta foto, ya que actualmente ni siquiera se le puede hacer zoom.
  > 4. Poder descargar una foto cargada, ya sea personal o de mi pareja. Veamos esta aplicación como una funcionalidad unificada, mi pareja y yo deberíamos tener total libertad para modificar las cosas de cada uno, excepto los datos personales como la foto de perfil, obvio.
  > 5. Que se notifiqué cuando se realice alguna modificación en alguna foto o nota, con todo en generar que se cargue o cree, como una ubicación, nota y fotos.
  > 6. Visualización de las horas en Chile de cuando se cargó una imagen y editó, lo mismo con las notas, no solo el día.
  > 7. Anidar notas a notas ya creadas y con notificación igualmente, ahora solo deja crear notas y reaccionar, no avisa cuando se modifica una nota personal o de tu pareja, y mi idea es que ademas de reaccionar te permita anidar notas a las notas como de reacción.
  > 8. Mayor interacción en el apartado de notas e imagenes, que haya libertad de ordenamiento, como arrastre, mayor interacción visual y que no sea tan plano.
  >
  > Luego de la organziación y almacenamiento de las copias anteriores, quiero que me listes próximas funcionalidades en las que podríamos trabajar y que aporten valor. Esto debe quedar almacenado en Engram, aquí solo veremos la especificación y el estructuramiento. Luego, con Cursor, yo me encargaré de leer las últimas memorias del proyecto y aplicar la codificación en base a esto y el ODD.

- L2 (2026-11-07) Estado actual mapeado desde el código y las migraciones (última: `20261012202023_note_colors.sql`). Sin implementación todavía. La codificación se hará en Cursor leyendo este documento y su copia en Engram (`odd/pulido-final/tasks`). Las próximas funcionalidades propuestas quedan en Engram bajo `roadmap/proximas-funcionalidades`.
- L3 (2026-11-08) Supuestos confirmados: S1 máximo 15 caracteres, S5 fijar sí notifica y color no, S7 y S8 como estaban. Ramas por tarea, no un epic único. Próximo paso: T1 en `fix/teclado-formularios`.
- L4 (2026-11-08) T1 en PR #1: teclado de formularios. T2 en `feat/fechas-chile`: horas en `America/Santiago` en fotos y notas. `photos.updated_at` queda para T3. Próximo: T3 `feat/edicion-fotos`.
