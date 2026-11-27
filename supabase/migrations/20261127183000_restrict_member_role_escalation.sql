-- Restrict role escalation and prevent moving an existing profile across branches.
DROP POLICY IF EXISTS soundteam_integrantes_insert ON public.integrantes;
CREATE POLICY soundteam_integrantes_insert
ON public.integrantes
FOR INSERT
TO authenticated
WITH CHECK (
  public.soundteam_acceso_habilitado()
  AND lower(coalesce(rol_acceso, 'miembro')) IN ('miembro','lider')
  AND (
    public.soundteam_es_admin_global()
    OR (
      lower(coalesce(rol_acceso, 'miembro')) = 'miembro'
      AND public.soundteam_es_lider_de_sede(sede_id)
    )
  )
);

DROP POLICY IF EXISTS soundteam_integrantes_update ON public.integrantes;
CREATE POLICY soundteam_integrantes_update
ON public.integrantes
FOR UPDATE
TO authenticated
USING (
  public.soundteam_acceso_habilitado()
  AND (
    public.soundteam_es_admin_global()
    OR (
      lower(coalesce(rol_acceso, '')) = 'miembro'
      AND public.soundteam_es_lider_de_sede(sede_id)
    )
  )
)
WITH CHECK (
  public.soundteam_acceso_habilitado()
  AND lower(coalesce(rol_acceso, '')) IN ('miembro','lider')
  AND (
    public.soundteam_es_admin_global()
    OR (
      lower(coalesce(rol_acceso, '')) = 'miembro'
      AND public.soundteam_es_lider_de_sede(sede_id)
    )
  )
);

REVOKE UPDATE (sede_id) ON public.integrantes FROM authenticated;
