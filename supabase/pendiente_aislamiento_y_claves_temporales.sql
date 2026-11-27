-- SoundTeam: aislamiento por sede, protección de datos heredados,
-- bloqueo de sesiones con clave temporal y avatares privados.
-- No ejecutar en producción hasta validar la versión preview.

BEGIN;

-- Las tablas heredadas se conservan, pero dejan de estar expuestas por la API.
ALTER TABLE public."Integrantes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."Integrantes" FROM anon, authenticated;

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir insercion publica en songs" ON public.songs;
REVOKE ALL ON TABLE public.songs FROM anon, authenticated;

DROP POLICY IF EXISTS "Permitir lectura publica de usuarios" ON public.usuarios;
REVOKE ALL ON TABLE public.usuarios FROM anon, authenticated;

REVOKE ALL ON TABLE public.teams, public.team_members, public.events,
  public.assignments, public.setlists FROM anon, authenticated;

-- La app no necesita leer el PIN legado. Solo se conceden las columnas necesarias.
REVOKE ALL ON TABLE public.integrantes FROM anon, authenticated;
REVOKE SELECT (pin), INSERT (pin), UPDATE (pin) ON TABLE public.integrantes FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.integrantes_id_seq FROM anon, authenticated;
GRANT USAGE ON SEQUENCE public.integrantes_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.usuarios_id_seq, public."Integrantes_id_seq" FROM anon, authenticated;
GRANT SELECT (id, nombre, sede_id, rol_acceso, roles_musicales, email, user_id, avatar_url, nombre_perfil)
  ON TABLE public.integrantes TO authenticated;
GRANT INSERT (nombre, email, sede_id, rol_acceso, roles_musicales)
  ON TABLE public.integrantes TO authenticated;
GRANT UPDATE (nombre, email, sede_id, rol_acceso, roles_musicales)
  ON TABLE public.integrantes TO authenticated;
GRANT DELETE ON TABLE public.integrantes TO authenticated;

-- La tabla temporal solo puede consultarse desde el backend con service_role.
REVOKE ALL ON TABLE public.soundteam_claves_temporales FROM anon, authenticated;

-- Las claves temporales obligan al cambio antes de permitir cualquier dato de la app.
CREATE OR REPLACE FUNCTION public.soundteam_acceso_habilitado()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    (SELECT auth.uid()) IS NOT NULL
    AND COALESCE(
      (SELECT auth.jwt() -> 'app_metadata' ->> 'soundteam_must_change_password'),
      'false'
    ) <> 'true';
$function$;

REVOKE ALL ON FUNCTION public.soundteam_acceso_habilitado() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.soundteam_acceso_habilitado() TO authenticated, service_role;

-- Reglas de integrantes: eliminar la política antigua que, por ser permisiva,
-- permitía que cualquier usuario borrara integrantes de otras sedes.
DROP POLICY IF EXISTS soundteam_integrantes_proteger_admin ON public.integrantes;

ALTER POLICY soundteam_integrantes_select ON public.integrantes
  USING (
    public.soundteam_acceso_habilitado()
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR (SELECT public.soundteam_pertenece_a_sede(integrantes.sede_id))
    )
  );

ALTER POLICY soundteam_integrantes_insert ON public.integrantes
  WITH CHECK (
    public.soundteam_acceso_habilitado()
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR (SELECT public.soundteam_es_lider_de_sede(integrantes.sede_id))
    )
  );

ALTER POLICY soundteam_integrantes_update ON public.integrantes
  USING (
    public.soundteam_acceso_habilitado()
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR (
        rol_acceso = 'miembro'
        AND (SELECT public.soundteam_es_lider_de_sede(integrantes.sede_id))
      )
    )
  )
  WITH CHECK (
    public.soundteam_acceso_habilitado()
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR (
        rol_acceso = 'miembro'
        AND (SELECT public.soundteam_es_lider_de_sede(integrantes.sede_id))
      )
    )
  );

ALTER POLICY soundteam_integrantes_delete ON public.integrantes
  USING (
    public.soundteam_acceso_habilitado()
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR (
        rol_acceso = 'miembro'
        AND lower(btrim(COALESCE(email, ''))) <> 'johnbocal31@gmail.com'
        AND (SELECT public.soundteam_es_lider_de_sede(integrantes.sede_id))
      )
    )
  );

-- Servicios: solo usuarios habilitados y pertenecientes a la sede.
ALTER POLICY soundteam_servicios_select ON public.servicios
  USING (
    public.soundteam_acceso_habilitado()
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR (SELECT public.soundteam_pertenece_a_sede(servicios.sede_id))
    )
  );
ALTER POLICY soundteam_servicios_insert ON public.servicios
  WITH CHECK (
    public.soundteam_acceso_habilitado()
    AND (SELECT public.soundteam_puede_gestionar_sede(servicios.sede_id))
  );
ALTER POLICY soundteam_servicios_update ON public.servicios
  USING (
    public.soundteam_acceso_habilitado()
    AND (SELECT public.soundteam_puede_gestionar_sede(servicios.sede_id))
  )
  WITH CHECK (
    public.soundteam_acceso_habilitado()
    AND (SELECT public.soundteam_puede_gestionar_sede(servicios.sede_id))
  );
ALTER POLICY soundteam_servicios_delete ON public.servicios
  USING (
    public.soundteam_acceso_habilitado()
    AND (SELECT public.soundteam_puede_gestionar_sede(servicios.sede_id))
  );

-- Repertorio.
ALTER POLICY soundteam_repertorio_select ON public.repertorio
  USING (
    public.soundteam_acceso_habilitado()
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR (SELECT public.soundteam_pertenece_a_sede(repertorio.sede_id))
    )
  );
ALTER POLICY soundteam_repertorio_insert ON public.repertorio
  WITH CHECK (
    public.soundteam_acceso_habilitado()
    AND public.soundteam_puede_gestionar_repertorio(sede_id)
  );
ALTER POLICY soundteam_repertorio_update ON public.repertorio
  USING (
    public.soundteam_acceso_habilitado()
    AND public.soundteam_puede_gestionar_repertorio(sede_id)
  )
  WITH CHECK (
    public.soundteam_acceso_habilitado()
    AND public.soundteam_puede_gestionar_repertorio(sede_id)
  );
ALTER POLICY soundteam_repertorio_delete ON public.repertorio
  USING (
    public.soundteam_acceso_habilitado()
    AND public.soundteam_puede_gestionar_repertorio(sede_id)
  );

-- Chat por servicio: conserva el control de participantes, líderes y administrador.
ALTER POLICY soundteam_mensajes_select ON public.mensajes
  USING (
    public.soundteam_acceso_habilitado()
    AND servicio_id IS NOT NULL
    AND (SELECT public.soundteam_puede_acceder_chat_servicio(mensajes.servicio_id))
  );
ALTER POLICY soundteam_mensajes_insert ON public.mensajes
  WITH CHECK (
    public.soundteam_acceso_habilitado()
    AND servicio_id IS NOT NULL
    AND user_id = (SELECT auth.uid())
    AND (SELECT public.soundteam_puede_acceder_chat_servicio(mensajes.servicio_id))
  );
ALTER POLICY soundteam_mensajes_update ON public.mensajes
  USING (
    public.soundteam_acceso_habilitado()
    AND servicio_id IS NOT NULL
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR EXISTS (
        SELECT 1 FROM public.servicios s
        WHERE s.id = mensajes.servicio_id
          AND (SELECT public.soundteam_es_lider_de_sede(s.sede_id))
      )
      OR (
        user_id = (SELECT auth.uid())
        AND (SELECT public.soundteam_es_participante_servicio(mensajes.servicio_id))
      )
    )
  )
  WITH CHECK (
    public.soundteam_acceso_habilitado()
    AND servicio_id IS NOT NULL
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR EXISTS (
        SELECT 1 FROM public.servicios s
        WHERE s.id = mensajes.servicio_id
          AND (SELECT public.soundteam_es_lider_de_sede(s.sede_id))
      )
      OR (
        user_id = (SELECT auth.uid())
        AND (SELECT public.soundteam_es_participante_servicio(mensajes.servicio_id))
      )
    )
  );
ALTER POLICY soundteam_mensajes_delete ON public.mensajes
  USING (
    public.soundteam_acceso_habilitado()
    AND servicio_id IS NOT NULL
    AND (
      (SELECT public.soundteam_es_admin_global())
      OR EXISTS (
        SELECT 1 FROM public.servicios s
        WHERE s.id = mensajes.servicio_id
          AND (SELECT public.soundteam_es_lider_de_sede(s.sede_id))
      )
    )
  );

-- Bloqueo adicional para RPC SECURITY DEFINER que escriben en integrantes/servicios.
CREATE OR REPLACE FUNCTION public.soundteam_proteger_integrantes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF COALESCE(
    (SELECT auth.jwt() -> 'app_metadata' ->> 'soundteam_must_change_password'),
    'false'
  ) = 'true' THEN
    RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar';
  END IF;

  IF current_user IN ('postgres', 'service_role') THEN
    RETURN NEW;
  END IF;

  IF (SELECT public.soundteam_es_admin_global()) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT (SELECT public.soundteam_es_lider_de_sede(NEW.sede_id)) THEN
      RAISE EXCEPTION 'No tienes permiso para crear integrantes en esta sede';
    END IF;
    NEW.rol_acceso := 'miembro';
    NEW.user_id := NULL;
    NEW.pin := NULL;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NOT (SELECT public.soundteam_es_lider_de_sede(OLD.sede_id)) THEN
      RAISE EXCEPTION 'No tienes permiso para modificar este integrante';
    END IF;
    IF NEW.rol_acceso IS DISTINCT FROM OLD.rol_acceso
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.sede_id IS DISTINCT FROM OLD.sede_id
       OR NEW.pin IS DISTINCT FROM OLD.pin THEN
      RAISE EXCEPTION 'No puedes modificar roles, cuentas vinculadas, sedes ni PIN';
    END IF;
    IF OLD.user_id IS NOT NULL AND NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'No puedes cambiar el correo de una cuenta vinculada';
    END IF;
    RETURN NEW;
  END IF;

  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.soundteam_bloquear_servicio_con_clave_temporal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF COALESCE(
    (SELECT auth.jwt() -> 'app_metadata' ->> 'soundteam_must_change_password'),
    'false'
  ) = 'true' THEN
    RAISE EXCEPTION 'Debes cambiar tu contraseña temporal antes de continuar';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS soundteam_bloquear_servicio_clave_temporal ON public.servicios;
CREATE TRIGGER soundteam_bloquear_servicio_clave_temporal
  BEFORE INSERT OR UPDATE OR DELETE ON public.servicios
  FOR EACH ROW EXECUTE FUNCTION public.soundteam_bloquear_servicio_con_clave_temporal();

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

REVOKE EXECUTE ON FUNCTION public.soundteam_actualizar_servicio_asignado(bigint, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_es_admin_global() FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_es_lider_de_sede(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_pertenece_a_sede(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_puede_gestionar_repertorio(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soundteam_puede_gestionar_sede(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.soundteam_puede_gestionar_repertorio(text) TO authenticated, service_role;

-- Bucket privado. Cada integrante solo puede leer, cargar, reemplazar y borrar sus propios archivos.
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

DROP POLICY IF EXISTS soundteam_avatar_public_read ON storage.objects;
DROP POLICY IF EXISTS soundteam_avatar_owner_select ON storage.objects;
CREATE POLICY soundteam_avatar_owner_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND public.soundteam_acceso_habilitado()
  );

ALTER POLICY soundteam_avatar_owner_insert ON storage.objects
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND public.soundteam_acceso_habilitado()
  );
ALTER POLICY soundteam_avatar_owner_update ON storage.objects
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND public.soundteam_acceso_habilitado()
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND public.soundteam_acceso_habilitado()
  );
ALTER POLICY soundteam_avatar_owner_delete ON storage.objects
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND public.soundteam_acceso_habilitado()
  );

COMMIT;
