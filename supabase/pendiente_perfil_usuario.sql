-- Perfil personal de SoundTeam: foto y nombre propio, sin modificar permisos ni datos de otros integrantes.
alter table public.integrantes
  add column if not exists avatar_url text;
alter table public.integrantes add column if not exists nombre_perfil text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists soundteam_avatar_public_read on storage.objects;
create policy soundteam_avatar_public_read
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists soundteam_avatar_owner_insert on storage.objects;
create policy soundteam_avatar_owner_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists soundteam_avatar_owner_update on storage.objects;
create policy soundteam_avatar_owner_update
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists soundteam_avatar_owner_delete on storage.objects;
create policy soundteam_avatar_owner_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.soundteam_actualizar_perfil(
  p_nombre text,
  p_avatar_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  if p_nombre is null or length(trim(p_nombre)) < 2 or length(trim(p_nombre)) > 80 then
    raise exception 'El nombre debe tener entre 2 y 80 caracteres.';
  end if;

  update public.integrantes
  set nombre_perfil = trim(p_nombre),
      avatar_url = nullif(trim(coalesce(p_avatar_url, '')), '')
  where user_id = auth.uid();

  if not found then
    raise exception 'No se encontró tu perfil de SoundTeam.';
  end if;
end;
$$;

revoke all on function public.soundteam_actualizar_perfil(text, text) from public, anon;
grant execute on function public.soundteam_actualizar_perfil(text, text) to authenticated;
