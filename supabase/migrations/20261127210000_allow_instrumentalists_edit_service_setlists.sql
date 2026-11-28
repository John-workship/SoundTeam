-- Permite que integrantes con un rol musical instrumental asignado
-- organicen el setlist de cualquier servicio de su propia sede.
-- No modifica permisos para crear/eliminar servicios ni administrar cupos.

CREATE OR REPLACE FUNCTION public.soundteam_actualizar_servicio_asignado(
  p_servicio_id bigint,
  p_observaciones text,
  p_setlist jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_servicio public.servicios%ROWTYPE;
  v_usuario_id text;
  v_es_instrumentista boolean;
BEGIN
  v_usuario_id := (SELECT auth.uid())::text;
  IF v_usuario_id IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
  IF NOT (SELECT public.soundteam_acceso_habilitado()) THEN
    RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar.';
  END IF;

  SELECT * INTO v_servicio
  FROM public.servicios
  WHERE id = p_servicio_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'El servicio no existe'; END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.integrantes i
    WHERE i.user_id = (SELECT auth.uid())
      AND i.sede_id = v_servicio.sede_id
  ) THEN
    RAISE EXCEPTION 'No perteneces a la sede de este servicio';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.integrantes i
    WHERE i.user_id = (SELECT auth.uid())
      AND i.sede_id = v_servicio.sede_id
      AND COALESCE(i.roles_musicales, '[]'::jsonb)
        ?| ARRAY['piano', 'guitarra', 'bajo', 'bateria']
  ) INTO v_es_instrumentista;

  IF v_servicio.voces->>'principal_user_id' IS DISTINCT FROM v_usuario_id
     AND NOT COALESCE(v_es_instrumentista, false) THEN
    RAISE EXCEPTION 'No tienes permiso para organizar el setlist de este servicio';
  END IF;

  IF jsonb_typeof(COALESCE(p_setlist, '[]'::jsonb)) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'El setlist debe ser una lista de canciones';
  END IF;

  UPDATE public.servicios
  SET observaciones = COALESCE(NULLIF(trim(p_observaciones), ''), 'Sin observaciones'),
      setlist = COALESCE(p_setlist, '[]'::jsonb)
  WHERE id = p_servicio_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.soundteam_actualizar_orden_bloques(
  p_servicio_id bigint,
  p_orden text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_sede_id text;
  v_voces jsonb;
  v_usuario_id text;
  v_es_instrumentista boolean;
BEGIN
  v_usuario_id := (SELECT auth.uid())::text;
  IF v_usuario_id IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
  IF NOT (SELECT public.soundteam_acceso_habilitado()) THEN
    RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar.';
  END IF;
  IF p_orden NOT IN ('lenta-rapida', 'rapida-lenta') THEN
    RAISE EXCEPTION 'Orden de bloques no válido';
  END IF;

  SELECT sede_id, voces INTO v_sede_id, v_voces
  FROM public.servicios
  WHERE id = p_servicio_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'El servicio no existe'; END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.integrantes i
    WHERE i.user_id = (SELECT auth.uid())
      AND i.sede_id = v_sede_id
      AND COALESCE(i.roles_musicales, '[]'::jsonb)
        ?| ARRAY['piano', 'guitarra', 'bajo', 'bateria']
  ) INTO v_es_instrumentista;

  IF NOT COALESCE(public.soundteam_puede_gestionar_sede(v_sede_id), false)
     AND COALESCE(v_voces->>'principal_user_id', '') <> v_usuario_id
     AND NOT COALESCE(v_es_instrumentista, false) THEN
    RAISE EXCEPTION 'No tienes permiso para ordenar los bloques de este servicio';
  END IF;

  UPDATE public.servicios
  SET orden_bloques_setlist = p_orden
  WHERE id = p_servicio_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.soundteam_actualizar_servicio_asignado(bigint, text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_actualizar_orden_bloques(bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.soundteam_actualizar_servicio_asignado(bigint, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.soundteam_actualizar_orden_bloques(bigint, text) TO authenticated, service_role;
