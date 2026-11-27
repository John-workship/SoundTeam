-- SoundTeam: aislamiento por sede, protección de datos heredados y avatares privados.
-- Revisar y aplicar en el proyecto Supabase de producción únicamente tras validar el preview.

BEGIN;

-- Tablas antiguas sin uso en la app actual. Se conservan sus datos, pero se bloquea el acceso por API.
ALTER TABLE public."Integrantes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."Integrantes" FROM anon, authenticated;

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir insercion publica en songs" ON public.songs;
REVOKE ALL ON TABLE public.songs FROM anon, authenticated;

DROP POLICY IF EXISTS "Permitir lectura publica de usuarios" ON public.usuarios;
REVOKE ALL ON TABLE public.usuarios FROM anon, authenticated;

-- Otras tablas del esquema paralelo: no tienen datos ni uso en el App.js actual.
REVOKE ALL ON TABLE public.teams, public.team_members, public.events,
  public.assignments, public.setlists FROM anon, authenticated;

-- La app no necesita leer el PIN legado de los integrantes. Se revocan permisos de tabla
-- y se conceden únicamente las columnas funcionales que usa el cliente.
REVOKE ALL ON TABLE public.integrantes FROM anon, authenticated;
GRANT SELECT (id, nombre, sede_id, rol_acceso, roles_musicales, email, user_id, avatar_url, nombre_perfil)
  ON TABLE public.integrantes TO authenticated;
GRANT INSERT (nombre, email, sede_id, rol_acceso, roles_musicales)
  ON TABLE public.integrantes TO authenticated;
GRANT UPDATE (nombre, email, sede_id, rol_acceso, roles_musicales)
  ON TABLE public.integrantes TO authenticated;
GRANT DELETE ON TABLE public.integrantes TO authenticated;

-- La tabla de claves temporales queda exclusivamente para el backend privilegiado.
REVOKE ALL ON TABLE public.soundteam_claves_temporales FROM anon, authenticated;

-- Los RPC que solo devuelven verificaciones internas no deben ser invocables por anon.
REVOKE EXECUTE ON FUNCTION public.soundteam_actualizar_servicio_asignado(bigint, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_es_admin_global() FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_es_lider_de_sede(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_pertenece_a_sede(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_puede_gestionar_repertorio(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_puede_gestionar_sede(text) FROM anon;

-- Endurecer search_path de funciones SECURITY DEFINER existentes.
ALTER FUNCTION public.soundteam_actualizar_perfil(text, text) SET search_path = '';

CREATE OR REPLACE FUNCTION public.soundteam_puede_gestionar_repertorio(p_sede text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    public.soundteam_puede_gestionar_sede(p_sede)
    OR EXISTS (
      SELECT 1
      FROM public.integrantes i
      WHERE i.user_id = (SELECT auth.uid())
        AND lower(i.sede_id) = lower(p_sede)
        AND COALESCE(i.roles_musicales, '[]'::jsonb)
          ?| ARRAY['piano', 'guitarra', 'bajo', 'bateria']
    );
$function$;

REVOKE EXECUTE ON FUNCTION public.soundteam_puede_gestionar_repertorio(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.soundteam_puede_gestionar_repertorio(text) TO authenticated, service_role;

-- Las fotos no tienen objetos actualmente. Se vuelve privado el bucket y cada usuario
-- solo puede leer/escribir objetos dentro de su propia carpeta.
UPDATE storage.buckets SET public = false WHERE id = 'avatars';
DROP POLICY IF EXISTS soundteam_avatar_public_read ON storage.objects;
DROP POLICY IF EXISTS soundteam_avatar_owner_select ON storage.objects;
CREATE POLICY soundteam_avatar_owner_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

COMMIT;
