REVOKE INSERT, UPDATE ON public.mensajes FROM authenticated;
GRANT INSERT (autor, texto, hora, canal, sede, user_id, servicio_id, editado) ON public.mensajes TO authenticated;
GRANT UPDATE (texto, editado) ON public.mensajes TO authenticated;

REVOKE INSERT, UPDATE ON public.servicios FROM authenticated;
GRANT INSERT (fecha, titulo, observaciones, setlist, paleta_seleccionada, voces, instrumentos, sede, sede_id, cupos_coros, orden_bloques_setlist) ON public.servicios TO authenticated;
GRANT UPDATE (fecha, titulo, observaciones, setlist, paleta_seleccionada, voces, instrumentos, sede, sede_id, cupos_coros, orden_bloques_setlist) ON public.servicios TO authenticated;

REVOKE INSERT, UPDATE ON public.repertorio FROM authenticated;
GRANT INSERT (titulo, artista, tono, bpm, etiquetas, letra, sede_id, tipo_set, compas) ON public.repertorio TO authenticated;
GRANT UPDATE (titulo, artista, tono, bpm, etiquetas, letra, sede_id, tipo_set, compas) ON public.repertorio TO authenticated;
