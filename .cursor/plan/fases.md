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

Siguiente: compilar la versión de producción cuando el usuario lo pida e instalarla en ambos teléfonos.

## Costos

- Todo el proyecto cabe en planes gratuitos. Los dos teléfonos son Android, así que no hace falta la cuenta de Apple Developer.
- Supabase gratis: 1 GB de almacenamiento, 5 GB de descarga al mes, pausa tras 7 días sin uso y sin respaldos automáticos.
- EAS gratis: 15 compilaciones de Android al mes, suficiente para las fases 7 a 9.
