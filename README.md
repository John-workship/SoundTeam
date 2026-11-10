# SoundTeam

Aplicación web/móvil construida con Expo, React Native y Supabase.

## Requisitos
- Node.js LTS
- Proyecto Supabase
- Cuenta Vercel vinculada al repositorio Git

## Configuración local
1. Copia `.env.example` a `.env`.
2. Completa `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con los valores de **Supabase → Project Settings → API**.
3. Instala dependencias: `npm install`.
4. Ejecuta: `npm run web`.

Nunca uses `service_role` en variables `EXPO_PUBLIC_*`. Las variables `EXPO_PUBLIC_*` se incluyen en el bundle del navegador y son visibles para los usuarios.

## Supabase
1. Revisa y ejecuta `supabase/migrations/20261110_soundteam_hardening.sql` en SQL Editor.
2. Crea el primer administrador siguiendo `supabase/BOOTSTRAP_ADMIN.md`.
3. Para cada integrante, crea su cuenta en **Authentication → Users** y registra su perfil desde la sección Equipo de SoundTeam con el mismo correo. El perfil se vincula a la cuenta autenticada al iniciar sesión.
4. Habilita confirmación de correo en Supabase Auth para evitar cuentas no verificadas.

La migración conserva las filas existentes; normaliza el nombre de la tabla `Integrantes`, agrega columnas y activa RLS. Revisa el SQL antes de ejecutarlo en cualquier proyecto que contenga datos importantes.

## Despliegue en Vercel
- Framework preset: Other (o Expo si Vercel lo detecta correctamente).
- Build command: `npx expo export --platform web`
- Output directory: `dist`
- Environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Aplica las variables a Production, Preview y Development según corresponda.
- Después de guardar las variables, crea un nuevo deployment.

`vercel.json` ya declara el comando de compilación, la carpeta `dist` y la reescritura SPA.

## Comprobación
Antes de publicar, prueba inicio/cierre de sesión, perfiles sin autorización, separación de sedes, creación/edición/eliminación de servicios, chat, repertorio y postulaciones. Revisa también las políticas RLS en Supabase.
