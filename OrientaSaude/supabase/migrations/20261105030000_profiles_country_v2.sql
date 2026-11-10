
create schema if not exists private;
create extension if not exists pgcrypto with schema extensions;

create table if not exists private.encrypted_profiles_v2 (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ciphertext bytea not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table private.encrypted_profiles_v2 enable row level security;
revoke all on private.encrypted_profiles_v2 from public, anon, authenticated;

create or replace function private._valid_cpf_v2(p_value text)
returns boolean language plpgsql immutable set search_path = ''
as $$
declare
  d text := pg_catalog.regexp_replace(coalesce(p_value,''), '[^0-9]', '', 'g');
  sm integer;
  dg integer;
  i integer;
begin
  if pg_catalog.length(d) <> 11 or d = pg_catalog.repeat(pg_catalog.substr(d,1,1),11) then return false; end if;
  sm := 0;
  for i in 1..9 loop sm := sm + (pg_catalog.substr(d,i,1))::integer * (11-i); end loop;
  dg := (sm * 10) % 11;
  if dg = 10 then dg := 0; end if;
  if dg <> (pg_catalog.substr(d,10,1))::integer then return false; end if;
  sm := 0;
  for i in 1..10 loop sm := sm + (pg_catalog.substr(d,i,1))::integer * (12-i); end loop;
  dg := (sm * 10) % 11;
  if dg = 10 then dg := 0; end if;
  return dg = (pg_catalog.substr(d,11,1))::integer;
end;
$$;

create or replace function private._save_my_profile_v2(p_profile jsonb)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_country text := pg_catalog.upper(pg_catalog.btrim(coalesce(p_profile->>'country_of_origin','')));
  v_country_other text := pg_catalog.btrim(coalesce(p_profile->>'country_other',''));
  v_name text := pg_catalog.btrim(coalesce(p_profile->>'full_name',''));
  v_preferred text := pg_catalog.btrim(coalesce(p_profile->>'preferred_name',''));
  v_gender text := pg_catalog.btrim(coalesce(p_profile->>'gender_identity',''));
  v_phone text := pg_catalog.regexp_replace(coalesce(p_profile->>'phone',''), '[^0-9]', '', 'g');
  v_document text := pg_catalog.upper(pg_catalog.btrim(coalesce(p_profile->>'national_id','')));
  v_birth_raw text := pg_catalog.btrim(coalesce(p_profile->>'birth_date',''));
  v_birth date;
  v_key text;
  v_data jsonb;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if pg_catalog.jsonb_typeof(p_profile) is distinct from 'object' then
    raise exception 'Invalid profile';
  end if;
  if v_country not in ('BR','PY','AR','OTHER') then raise exception 'Country is required'; end if;
  if v_country = 'OTHER' and (pg_catalog.length(v_country_other) < 2 or pg_catalog.length(v_country_other) > 80) then
    raise exception 'Other country name is required';
  end if;
  if v_country <> 'OTHER' then v_country_other := ''; end if;
  if pg_catalog.length(v_name) < 5 or pg_catalog.length(v_name) > 120 then
    raise exception 'Invalid full name';
  end if;
  if pg_catalog.length(v_preferred) > 80 then raise exception 'Invalid preferred name'; end if;
  if v_gender not in ('mulher','homem','nao_binario','outra','prefiro_nao_informar') then
    raise exception 'Gender identity selection is required';
  end if;
  if pg_catalog.length(v_phone) not in (0) and
      (pg_catalog.length(v_phone) < 8 or pg_catalog.length(v_phone) > 15) then
    raise exception 'Invalid optional phone';
  end if;
  if v_country = 'BR' then
    v_document := pg_catalog.regexp_replace(v_document,'[^0-9]','','g');
    if not private._valid_cpf_v2(v_document) then raise exception 'Invalid CPF'; end if;
  elsif v_country = 'AR' then
    v_document := pg_catalog.regexp_replace(v_document,'[^0-9]','','g');
    if v_document !~ '^[0-9]{7,9}$' then raise exception 'Invalid Argentine DNI format'; end if;
  elsif v_country = 'PY' then
    v_document := pg_catalog.regexp_replace(v_document,'[^0-9]','','g');
    if v_document !~ '^[0-9]{5,9}$' then raise exception 'Invalid Paraguayan CI format'; end if;
  else
    v_document := pg_catalog.regexp_replace(v_document,'[^A-Z0-9/-]','','g');
    if pg_catalog.length(v_document) < 4 or pg_catalog.length(v_document) > 30 then
      raise exception 'Invalid identification document';
    end if;
  end if;
  if v_birth_raw !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Birth date required (YYYY-MM-DD)';
  end if;
  v_birth := v_birth_raw::date;
  if v_birth < date '1900-01-01' or v_birth > current_date then
    raise exception 'Invalid birth date';
  end if;

  select ds.decrypted_secret into v_key
  from vault.decrypted_secrets as ds
  where ds.name = 'orientasaude_profile_key_v1'
  limit 1;
  if v_key is null or v_key = '' then raise exception 'Encryption key missing'; end if;
  v_data := pg_catalog.jsonb_build_object(
    'country_of_origin',v_country,
    'country_other',v_country_other,
    'full_name',v_name,
    'preferred_name',v_preferred,
    'gender_identity',v_gender,
    'phone',v_phone,
    'national_id',v_document,
    'birth_date',v_birth::text
  );

  insert into private.encrypted_profiles_v2(user_id,ciphertext)
  values (v_uid,extensions.pgp_sym_encrypt(v_data::text,v_key,'cipher-algo=aes256'))
  on conflict (user_id) do update
    set ciphertext = excluded.ciphertext,
        updated_at = pg_catalog.now();
end;
$$;

create or replace function private._read_my_profile_v2()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_cipher bytea;
  v_key text;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select ep.ciphertext into v_cipher
  from private.encrypted_profiles_v2 ep where ep.user_id = v_uid;
  if not found then return null; end if;
  select ds.decrypted_secret into v_key
  from vault.decrypted_secrets ds
  where ds.name = 'orientasaude_profile_key_v1'
  limit 1;
  if v_key is null or v_key = '' then raise exception 'Encryption key missing'; end if;
  return extensions.pgp_sym_decrypt(v_cipher,v_key)::jsonb;
end;
$$;

create or replace function private._delete_my_profile_v2()
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  delete from private.encrypted_profiles_v2 where user_id = auth.uid();
end;
$$;

create or replace function public.save_my_profile_v2(p_profile jsonb)
returns void language sql security invoker set search_path = ''
as $$ select private._save_my_profile_v2(p_profile); $$;
create or replace function public.read_my_profile_v2()
returns jsonb language sql security invoker set search_path = ''
as $$ select private._read_my_profile_v2(); $$;
create or replace function public.delete_my_profile_v2()
returns void language sql security invoker set search_path = ''
as $$ select private._delete_my_profile_v2(); $$;

revoke all on function private._valid_cpf_v2(text) from public, anon, authenticated;
revoke all on function private._save_my_profile_v2(jsonb) from public, anon, authenticated;
revoke all on function private._read_my_profile_v2() from public, anon, authenticated;
revoke all on function private._delete_my_profile_v2() from public, anon, authenticated;
revoke all on function public.save_my_profile_v2(jsonb) from public, anon, authenticated;
revoke all on function public.read_my_profile_v2() from public, anon, authenticated;
revoke all on function public.delete_my_profile_v2() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private._save_my_profile_v2(jsonb) to authenticated;
grant execute on function private._read_my_profile_v2() to authenticated;
grant execute on function private._delete_my_profile_v2() to authenticated;
grant execute on function public.save_my_profile_v2(jsonb) to authenticated;
grant execute on function public.read_my_profile_v2() to authenticated;
grant execute on function public.delete_my_profile_v2() to authenticated;

notify pgrst, 'reload schema';

