# Post-pulido inmediato

Objetivo: cerrar el bloque inmediato tras el pulido final. Notificaciones más claras, anti-pausa de Supabase, uso de almacenamiento, preferencias de push y cuenta segura. Al final, un APK de producción.
Ramas: una por tarea desde `main` actualizado. Cada rama cierra con PR a `main`.
Entrega: Conventional Commits solo con asunto. Verificación: `npm run lint`, `npm run typecheck`, y `npx expo-doctor` si toca nativo.

## Specs

### S1. Descarga de fotos (ya cubierta)

> Respaldo/exportación del roadmap. Confirmado: basta con guardar imágenes en la galería.

- Ya existe en el visor (`save-to-gallery.ts`). No se implementa ZIP ni Drive.
- Solo se documenta como hecho.

### S2. Ícono y dismiss de notificaciones

> El ícono de corazones se ve muy pequeño en la barra. Las notificaciones deben desaparecer al ver su contenido, no quedar fijas.

- Asset dedicado `notification-icon.png` (silueta blanca, menos padding) solo para `expo-notifications`.
- Al tocar o al abrir la ruta relacionada, se descarta el aviso del sistema.
- Con la app abierta, no se acumulan en la bandeja (`shouldShowList: false`).

### S3. Anti-pausa Supabase

> Evitar que el plan gratis pause tras 7 días sin uso.

- GitHub Action diaria con `workflow_dispatch` que consulta el proyecto con la publishable key.
- Sin service_role.

### S4. Uso de almacenamiento

> Ver en Ajustes cuánto del 1 GB gratis se usa, con aviso al acercarse al límite.

- RPC `storage_usage` suma bytes de `photos` y `avatars` visibles para la persona/pareja.
- Aviso desde ~80 % de 1 GB.

### S5. Preferencias de notificaciones

> Poder apagar tipos de aviso (fotos, notas, toques, ediciones, etc.).

- `profiles.notification_prefs` jsonb, defaults en true.
- `push_to_partner` respeta el tipo del destinatario.
- Switches en Ajustes.

### S6. Cuenta y seguridad

> Recuperar contraseña, cambiar contraseña y cambiar correo.

- Reset desde login con deep link `pareja://auth/reset-password`.
- Cambio de contraseña y correo desde Ajustes.

## Tasks

| ID | Specs | Rama | Estado | PR |
| --- | --- | --- | --- | --- |
| N1 | S2 | `fix/notif-icono-dismiss` | hecha | - |
| N2 | S3 | `chore/supabase-keepalive` | hecha | - |
| N3 | S4 | `feat/uso-almacenamiento` | hecha | - |
| N4 | S5 | `feat/prefs-notificaciones` | en curso | - |
| N5 | S6 | `feat/cuenta-seguridad` | pendiente | - |
| N6 | cierre | (build production) | pendiente | - |

Orden: N1 → N2 → N3 → N4 → N5 → N6.

## Log

- L1 (2026-11-08) Alcance confirmado. Respaldo = descarga de fotos ya existente. Probar junto al final con APK de producción.

- L2 (2026-11-08) N1 mergeado. N2: Action diaria auth/v1/health. Configurar secretos SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY en GitHub.

- L3 (2026-11-08) N3 mergeado. N4: columna `notification_prefs`, `push_to_partner` con `kind`, switches en Ajustes.
