-- Security hardening: block privileged RPC actions while an account
-- still has a temporary password pending.
CREATE OR REPLACE FUNCTION public.claim_soundteam_profile()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
DECLARE v_user_id uuid; v_email text; v_rows integer;
BEGIN
  v_user_id := (SELECT auth.uid());
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión para vincular tu perfil.'; END IF;
  IF NOT (SELECT public.soundteam_acceso_habilitado()) THEN
    RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar.';
  END IF;
  SELECT u.email INTO v_email FROM auth.users u
  WHERE u.id=v_user_id AND u.email_confirmed_at IS NOT NULL;
  IF v_email IS NULL THEN RAISE EXCEPTION 'Tu correo debe estar confirmado.'; END IF;
  UPDATE public.integrantes i SET user_id=v_user_id
  WHERE lower(trim(i.email))=lower(trim(v_email)) AND (i.user_id IS NULL OR i.user_id=v_user_id);
  GET DIAGNOSTICS v_rows=ROW_COUNT;
  IF v_rows=0 AND NOT EXISTS (
    SELECT 1 FROM public.integrantes i
    WHERE lower(trim(i.email))=lower(trim(v_email)) AND i.user_id=v_user_id
  ) THEN RAISE EXCEPTION 'No se encontró un perfil disponible asociado a tu correo.'; END IF;
END; $function$;

CREATE OR REPLACE FUNCTION public.postularse_servicio(p_servicio_id bigint,p_rol text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
DECLARE v_usuario text; v_sede text; v_servicio public.servicios%ROWTYPE;
v_voces jsonb; v_instrumentos jsonb; v_coros text[]; v_ocupante text; v_campo text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión para postularte'; END IF;
  IF NOT (SELECT public.soundteam_acceso_habilitado()) THEN RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar.'; END IF;
  SELECT i.nombre,i.sede_id INTO v_usuario,v_sede FROM public.integrantes i
  WHERE i.user_id=(SELECT auth.uid()) LIMIT 1;
  IF v_usuario IS NULL THEN RAISE EXCEPTION 'No se encontró tu perfil de integrante'; END IF;
  SELECT * INTO v_servicio FROM public.servicios WHERE id=p_servicio_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El servicio no existe'; END IF;
  IF v_servicio.sede_id IS DISTINCT FROM v_sede THEN RAISE EXCEPTION 'No puedes postularte a servicios de otra sede'; END IF;
  v_voces:=COALESCE(v_servicio.voces,'{}'::jsonb); v_instrumentos:=COALESCE(v_servicio.instrumentos,'{}'::jsonb);
  IF p_rol='vozPrincipal' THEN
    v_ocupante:=COALESCE(v_voces->>'principal','Sin asignar');
    IF v_ocupante<>'Sin asignar' THEN RAISE EXCEPTION 'Voz Principal ocupada'; END IF;
    v_voces:=jsonb_set(v_voces,'{principal}',to_jsonb(v_usuario),true);
    v_voces:=jsonb_set(v_voces,'{principal_user_id}',to_jsonb((SELECT auth.uid())::text),true);
  ELSIF p_rol='coros' THEN
    v_ocupante:=COALESCE(v_voces->>'coros','Sin asignar'); v_coros:=string_to_array(v_ocupante,', ');
    IF v_ocupante='Sin asignar' THEN v_coros:=ARRAY[]::text[]; END IF;
    IF COALESCE(array_length(v_coros,1),0)>=v_servicio.cupos_coros THEN RAISE EXCEPTION 'No hay más espacio en los coros'; END IF;
    IF v_usuario=ANY(v_coros) THEN RAISE EXCEPTION 'Ya estás registrado en este rol'; END IF;
    v_coros:=array_append(v_coros,v_usuario);
    v_voces:=jsonb_set(v_voces,'{coros}',to_jsonb(array_to_string(v_coros,', ')),true);
  ELSIF p_rol IN ('piano','guitarra','bajo','bateria') THEN
    v_campo:=p_rol; v_ocupante:=COALESCE(v_instrumentos->>v_campo,'Sin asignar');
    IF v_ocupante<>'Sin asignar' THEN RAISE EXCEPTION 'Este instrumento ya está ocupado'; END IF;
    v_instrumentos:=jsonb_set(v_instrumentos,ARRAY[v_campo],to_jsonb(v_usuario),true);
  ELSE RAISE EXCEPTION 'Rol musical no válido'; END IF;
  UPDATE public.servicios SET voces=v_voces,instrumentos=v_instrumentos WHERE id=p_servicio_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.retirar_postulacion_servicio(p_servicio_id bigint,p_rol text,p_integrante text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
DECLARE v_servicio public.servicios%ROWTYPE; v_voces jsonb; v_instrumentos jsonb;
v_coros text[]; v_coros_original text; v_ocupante text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
  IF NOT (SELECT public.soundteam_acceso_habilitado()) THEN RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar.'; END IF;
  IF p_integrante IS NULL OR trim(p_integrante)='' THEN RAISE EXCEPTION 'Integrante no válido'; END IF;
  SELECT * INTO v_servicio FROM public.servicios WHERE id=p_servicio_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El servicio no existe'; END IF;
  IF NOT public.soundteam_puede_gestionar_sede(v_servicio.sede_id) THEN RAISE EXCEPTION 'No tienes permiso para retirar postulantes de esta sede'; END IF;
  v_voces:=COALESCE(v_servicio.voces,'{}'::jsonb); v_instrumentos:=COALESCE(v_servicio.instrumentos,'{}'::jsonb);
  IF p_rol='vozPrincipal' THEN
    v_ocupante:=COALESCE(v_voces->>'principal','Sin asignar');
    IF v_ocupante<>p_integrante THEN RAISE EXCEPTION 'La persona no ocupa ese puesto'; END IF;
    v_voces:=jsonb_set(v_voces,'{principal}',to_jsonb('Sin asignar'::text),true); v_voces:=v_voces-'principal_user_id';
  ELSIF p_rol='coros' THEN
    v_coros_original:=COALESCE(v_voces->>'coros','Sin asignar');
    IF v_coros_original='Sin asignar' THEN RAISE EXCEPTION 'No hay integrantes asignados a coros'; END IF;
    v_coros:=regexp_split_to_array(v_coros_original,'\\s*,\\s*');
    IF NOT (p_integrante=ANY(v_coros)) THEN RAISE EXCEPTION 'La persona no está asignada a coros'; END IF;
    v_coros:=array_remove(v_coros,p_integrante);
    v_voces:=jsonb_set(v_voces,'{coros}',to_jsonb(CASE WHEN COALESCE(array_length(v_coros,1),0)=0 THEN 'Sin asignar' ELSE array_to_string(v_coros,', ') END),true);
  ELSIF p_rol IN ('piano','guitarra','bajo','bateria') THEN
    v_ocupante:=COALESCE(v_instrumentos->>p_rol,'Sin asignar');
    IF v_ocupante<>p_integrante THEN RAISE EXCEPTION 'La persona no ocupa ese instrumento'; END IF;
    v_instrumentos:=jsonb_set(v_instrumentos,ARRAY[p_rol],to_jsonb('Sin asignar'::text),true);
  ELSE RAISE EXCEPTION 'Puesto musical no válido'; END IF;
  UPDATE public.servicios SET voces=v_voces,instrumentos=v_instrumentos WHERE id=p_servicio_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.soundteam_actualizar_orden_bloques(p_servicio_id bigint,p_orden text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
DECLARE v_sede_id text; v_voces jsonb; v_usuario_id text;
BEGIN
  v_usuario_id:=(SELECT auth.uid())::text;
  IF v_usuario_id IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
  IF NOT (SELECT public.soundteam_acceso_habilitado()) THEN RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar.'; END IF;
  IF p_orden NOT IN ('lenta-rapida','rapida-lenta') THEN RAISE EXCEPTION 'Orden de bloques no válido'; END IF;
  SELECT sede_id,voces INTO v_sede_id,v_voces FROM public.servicios WHERE id=p_servicio_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El servicio no existe'; END IF;
  IF NOT COALESCE(public.soundteam_puede_gestionar_sede(v_sede_id),false)
     AND COALESCE(v_voces->>'principal_user_id','')<>v_usuario_id THEN
    RAISE EXCEPTION 'No tienes permiso para ordenar los bloques de este servicio';
  END IF;
  UPDATE public.servicios SET orden_bloques_setlist=p_orden WHERE id=p_servicio_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.soundteam_actualizar_perfil(p_nombre text,p_avatar_url text DEFAULT NULL::text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión.'; END IF;
  IF NOT (SELECT public.soundteam_acceso_habilitado()) THEN RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar.'; END IF;
  IF p_nombre IS NULL OR length(trim(p_nombre))<2 OR length(trim(p_nombre))>80 THEN RAISE EXCEPTION 'El nombre debe tener entre 2 y 80 caracteres.'; END IF;
  IF NULLIF(trim(COALESCE(p_avatar_url,'')),'') IS NOT NULL
     AND left(trim(p_avatar_url),length((SELECT auth.uid())::text)+1)<>((SELECT auth.uid())::text||'/') THEN
    RAISE EXCEPTION 'La foto de perfil debe pertenecer a tu carpeta personal.';
  END IF;
  UPDATE public.integrantes SET nombre_perfil=trim(p_nombre),avatar_url=NULLIF(trim(COALESCE(p_avatar_url,'')),'')
  WHERE user_id=(SELECT auth.uid());
  IF NOT FOUND THEN RAISE EXCEPTION 'No se encontró tu perfil de SoundTeam.'; END IF;
END; $function$;

CREATE OR REPLACE FUNCTION public.soundteam_actualizar_servicio_asignado(p_servicio_id bigint,p_observaciones text,p_setlist jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
DECLARE v_servicio public.servicios%ROWTYPE;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión'; END IF;
  IF NOT (SELECT public.soundteam_acceso_habilitado()) THEN RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar.'; END IF;
  SELECT * INTO v_servicio FROM public.servicios WHERE id=p_servicio_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El servicio no existe'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.integrantes i WHERE i.user_id=(SELECT auth.uid()) AND i.sede_id=v_servicio.sede_id) THEN
    RAISE EXCEPTION 'No perteneces a la sede de este servicio';
  END IF;
  IF v_servicio.voces->>'principal_user_id' IS DISTINCT FROM (SELECT auth.uid())::text THEN
    RAISE EXCEPTION 'No eres la voz principal asignada a este servicio';
  END IF;
  IF jsonb_typeof(COALESCE(p_setlist,'[]'::jsonb)) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'El setlist debe ser una lista de canciones'; END IF;
  UPDATE public.servicios SET observaciones=COALESCE(NULLIF(trim(p_observaciones),''),'Sin observaciones'),setlist=COALESCE(p_setlist,'[]'::jsonb)
  WHERE id=p_servicio_id;
END; $function$;
