-- Fonction pour vérifier si un index existe
create or replace function public.check_index_exists(
  table_name text,
  index_name text
) returns boolean
language plpgsql security definer
as $$
declare
  idx_exists boolean;
begin
  select exists(
    select 1
    from pg_indexes
    where
      schemaname = 'public' and
      tablename = table_name and
      indexname = index_name
  ) into idx_exists;
  
  return idx_exists;
end;
$$;

-- Fonction pour créer l'index sur token
create or replace function public.create_token_index()
returns boolean
language plpgsql security definer
as $$
begin
  create index if not exists organization_invitations_token_idx on public.organization_invitations(token);
  return true;
exception
  when others then
    return false;
end;
$$;

-- Créer manuellement l'index si nécessaire
create index if not exists organization_invitations_token_idx on public.organization_invitations(token);

-- Politique de sécurité RLS pour les invitations (pour lecture)
create policy "Allow public access to invitations by token" 
on public.organization_invitations for select 
to authenticated
using (true);

-- Politique de sécurité RLS pour les invitations (pour suppression par l'utilisateur)
create policy "Allow deletion of invitations by organization owners" 
on public.organization_invitations for delete 
to authenticated
using (
  invited_by = auth.uid() or
  exists (
    select 1 from organization_members 
    where user_id = auth.uid() 
      and organization_id = organization_invitations.organization_id 
      and role in ('owner', 'admin')
  )
); 