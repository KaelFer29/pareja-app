# Fases

Cada fase termina cuando se cumplen sus criterios, pasan lint y typecheck, y la funcionalidad se probó en un teléfono.

## Fase 0 - Fundaciones

- Reorganizar el código actual según `arquitectura.md`.
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

Fase 5 terminada en código: migración `nudges_and_mood` con RLS verificada. Cuatro toques (pienso en ti, te extraño, te quiero, un abrazo) que llegan como aviso animado arriba de la pantalla si la app está abierta, y seis estados de ánimo visibles en el inicio de la otra persona. Falta probarla en los teléfonos.

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

Falta compilar y probar en los teléfonos. Se compila una sola vez, cuando el usuario lo pida.

## Costos

- Todo el proyecto cabe en planes gratuitos. Los dos teléfonos son Android, así que no hace falta la cuenta de Apple Developer.
- Supabase gratis: 1 GB de almacenamiento, 5 GB de descarga al mes, pausa tras 7 días sin uso y sin respaldos automáticos.
- EAS gratis: 15 compilaciones de Android al mes, suficiente para las fases 7 a 9.
- Notificaciones push sin costo: Expo Push Service y Firebase Cloud Messaging no cobran por mensaje.
- MapLibre y las teselas de OpenStreetMap no requieren tarjeta ni cuenta de pago.
