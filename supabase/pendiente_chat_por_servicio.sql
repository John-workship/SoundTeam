-- SoundTeam: chat aislado por servicio.
-- Migración preparada en la rama soundteam-2.0. NO aplicar hasta autorización expresa.
-- Los mensajes históricos conservan sus filas y quedan fuera del chat nuevo (servicio_id IS NULL).

alter table public.mensajes
  add column if not exists servicio_id bigint
  references public.servicios(id) on delete cascade;

create index if not exists mensajes_servicio_created_at_idx
  on public.mensajes (servicio_id, created_at);

create or replace function public.soundteam_es_participante_servicio(p_servicio_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.servicios s
    join public.integrantes i
      on i.user_id = (select auth.uid())
     and i.sede_id = s.sede_id
    where s.id = p_servicio_id
      and (
        s.voces->>'principal' = i.nombre
        or exists (
          select 1
          from regexp_split_to_table(coalesce(s.voces->>'coros', ''), ',') as c(nombre)
          where btrim(c.nombre) = i.nombre
        )
        or s.instrumentos->>'piano' = i.nombre
        or s.instrumentos->>'guitarra' = i.nombre
        or s.instrumentos->>'bajo' = i.nombre
        or s.instrumentos->>'bateria' = i.nombre
      )
  );
$$;

create or replace function public.soundteam_puede_acceder_chat_servicio(p_servicio_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.servicios s
    where s.id = p_servicio_id
      and (
        (select public.soundteam_es_admin_global())
        or (select public.soundteam_es_lider_de_sede(s.sede_id))
        or (select public.soundteam_es_participante_servicio(s.id))
      )
  );
$$;

drop policy if exists soundteam_mensajes_select on public.mensajes;
drop policy if exists soundteam_mensajes_insert on public.mensajes;
drop policy if exists soundteam_mensajes_update on public.mensajes;
drop policy if exists soundteam_mensajes_delete on public.mensajes;

create policy soundteam_mensajes_select
on public.mensajes for select to authenticated
using (
  servicio_id is not null
  and (select public.soundteam_puede_acceder_chat_servicio(servicio_id))
);

create policy soundteam_mensajes_insert
on public.mensajes for insert to authenticated
with check (
  servicio_id is not null
  and user_id = (select auth.uid())
  and (select public.soundteam_puede_acceder_chat_servicio(servicio_id))
);

create policy soundteam_mensajes_update
on public.mensajes for update to authenticated
using (
  servicio_id is not null
  and (
    (select public.soundteam_es_admin_global())
    or exists (
      select 1 from public.servicios s
      where s.id = mensajes.servicio_id
        and (select public.soundteam_es_lider_de_sede(s.sede_id))
    )
    or (
      user_id = (select auth.uid())
      and (select public.soundteam_es_participante_servicio(servicio_id))
    )
  )
)
with check (
  servicio_id is not null
  and (
    (select public.soundteam_es_admin_global())
    or exists (
      select 1 from public.servicios s
      where s.id = mensajes.servicio_id
        and (select public.soundteam_es_lider_de_sede(s.sede_id))
    )
    or (
      user_id = (select auth.uid())
      and (select public.soundteam_es_participante_servicio(servicio_id))
    )
  )
);

create policy soundteam_mensajes_delete
on public.mensajes for delete to authenticated
using (
  servicio_id is not null
  and (
    (select public.soundteam_es_admin_global())
    or exists (
      select 1 from public.servicios s
      where s.id = mensajes.servicio_id
        and (select public.soundteam_es_lider_de_sede(s.sede_id))
    )
  )
);

grant execute on function public.soundteam_es_participante_servicio(bigint) to authenticated;
grant execute on function public.soundteam_puede_acceder_chat_servicio(bigint) to authenticated;
