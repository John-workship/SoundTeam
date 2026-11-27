REVOKE INSERT (id, created_at) ON public.mensajes FROM authenticated;
REVOKE UPDATE (autor, canal, created_at, hora, id, sede, servicio_id, user_id) ON public.mensajes FROM authenticated;
REVOKE INSERT (id, created_at) ON public.servicios FROM authenticated;
REVOKE UPDATE (id, created_at) ON public.servicios FROM authenticated;
REVOKE INSERT (id, created_at) ON public.repertorio FROM authenticated;
REVOKE UPDATE (id, created_at) ON public.repertorio FROM authenticated;
