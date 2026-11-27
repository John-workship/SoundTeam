-- SoundTeam: limitar perfiles visibles y proteger correos por rol/sede.
BEGIN;

-- La lectura normal nunca entrega correos. El correo se obtiene mediante una RPC
-- que valida el rol y la sede en el servidor.
REVOKE SELECT (email) ON TABLE public.integrantes FROM authenticated;

CREATE OR REPLACE FUNCTION public.soundteam_listar_integrantes_visibilidad()
RETURNS TABLE (
  id bigint,
  nombre text,
  email text,
  sede_id text,
  rol_acceso text,
  roles_musicales jsonb,
  user_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    i.id,
    i.nombre,
    CASE
      WHEN (SELECT public.soundteam_es_admin_global())
        OR (SELECT public.soundteam_es_lider_de_sede(i.sede_id))
      THEN i.email
      ELSE NULL
    END AS email,
    i.sede_id,
    i.rol_acceso,
    i.roles_musicales,
    CASE
      WHEN (SELECT public.soundteam_es_admin_global())
        OR (SELECT public.soundteam_es_lider_de_sede(i.sede_id))
        OR i.user_id = (SELECT auth.uid())
      THEN i.user_id
      ELSE NULL
    END AS user_id
  FROM public.integrantes AS i
  WHERE
    (SELECT public.soundteam_acceso_habilitado())
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR (
        (SELECT public.soundteam_pertenece_a_sede(i.sede_id))
        AND (i.rol_acceso = 'miembro' OR i.user_id = (SELECT auth.uid()))
      )
    )
  ORDER BY i.nombre ASC;
$function$;

REVOKE ALL ON FUNCTION public.soundteam_listar_integrantes_visibilidad() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.soundteam_listar_integrantes_visibilidad() TO authenticated;

-- Defensa adicional en consultas directas a PostgREST: los usuarios de sede
-- solo ven integrantes de tipo miembro y su propio perfil. El admin global ve todo.
DROP POLICY IF EXISTS soundteam_integrantes_select ON public.integrantes;
CREATE POLICY soundteam_integrantes_select
ON public.integrantes
FOR SELECT
TO authenticated
USING (
  public.soundteam_acceso_habilitado()
  AND (
    (SELECT public.soundteam_es_admin_global())
    OR (
      (SELECT public.soundteam_pertenece_a_sede(integrantes.sede_id))
      AND (
        integrantes.rol_acceso = 'miembro'
        OR integrantes.user_id = (SELECT auth.uid())
      )
    )
  )
);

COMMIT;