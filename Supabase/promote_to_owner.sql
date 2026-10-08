-- ════════════════════════════════════════════════════════════
-- ROLE MANAGEMENT: PROMOTE USER/ADMIN TO OWNER
-- ════════════════════════════════════════════════════════════
-- This script promotes a user or admin to owner role
-- Owner has FULL ACCESS to everything: Public, User, Admin, Owner panels
-- ⚠️ WARNING: Use with extreme caution. Only one owner should exist.

-- Function to promote user/admin to owner
create or replace function public.promote_to_owner(
  p_user_id uuid,
  p_promoted_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_role text;
  v_promoter_role text;
  v_owner_count int;
begin
  -- Check promoter is owner
  select role into v_promoter_role from public.auth_users where id = p_promoted_by;
  if v_promoter_role != 'owner' then
    raise exception 'Only existing owner can promote to owner';
  end if;

  -- Check user exists and get current role
  select role into v_current_role from public.auth_users where id = p_user_id;
  if not found then
    raise exception 'User not found';
  end if;

  -- Check if already owner
  if v_current_role = 'owner' then
    raise exception 'User is already an owner';
  end if;

  -- Warn if multiple owners will exist
  select count(*) into v_owner_count from public.auth_users where role = 'owner';
  if v_owner_count > 0 then
    raise warning 'Multiple owners will exist after this promotion. Current count: %', v_owner_count;
  end if;

  -- Promote to owner
  update public.auth_users
  set role = 'owner', updated_at = now()
  where id = p_user_id;

  raise notice 'User % promoted to owner', p_user_id;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- MANUAL PROMOTION QUERIES
-- ════════════════════════════════════════════════════════════

-- Example 1: Promote user to owner by email
-- UPDATE public.auth_users 
-- SET role = 'owner', updated_at = now() 
-- WHERE email = 'user@example.com' AND role IN ('user', 'admin');

-- Example 2: Promote to owner by user_id (6-char code)
-- UPDATE public.auth_users 
-- SET role = 'owner', updated_at = now() 
-- WHERE user_id = 'ABC123' AND role IN ('user', 'admin');

-- Example 3: Promote to owner by UUID
-- UPDATE public.auth_users 
-- SET role = 'owner', updated_at = now() 
-- WHERE id = '550e8400-e29b-41d4-a716-446655440000' AND role IN ('user', 'admin');

-- Example 4: Use function (recommended - includes validation)
-- SELECT public.promote_to_owner(
--   '550e8400-e29b-41d4-a716-446655440000',  -- user_id to promote
--   'f47ac10b-58cc-4372-a567-0e02b2c3d479'   -- current owner_id (promoter)
-- );

-- ════════════════════════════════════════════════════════════
-- DEMOTE OWNER (USE WITH EXTREME CAUTION)
-- ════════════════════════════════════════════════════════════

-- Function to demote owner to admin
create or replace function public.demote_owner_to_admin(
  p_user_id uuid,
  p_demoted_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_role text;
  v_demoter_role text;
begin
  -- Check demoter is owner
  select role into v_demoter_role from public.auth_users where id = p_demoted_by;
  if v_demoter_role != 'owner' then
    raise exception 'Only owner can demote owner';
  end if;

  -- Check user exists and get current role
  select role into v_current_role from public.auth_users where id = p_user_id;
  if not found then
    raise exception 'User not found';
  end if;

  -- Check if owner
  if v_current_role != 'owner' then
    raise exception 'User is not an owner';
  end if;

  -- Prevent self-demotion
  if p_user_id = p_demoted_by then
    raise exception 'Cannot demote yourself';
  end if;

  -- Demote to admin
  update public.auth_users
  set role = 'admin', updated_at = now()
  where id = p_user_id;

  raise notice 'Owner % demoted to admin', p_user_id;
end;
$$;

-- Example demote query
-- SELECT public.demote_owner_to_admin(
--   '550e8400-e29b-41d4-a716-446655440000',  -- owner_id to demote
--   'f47ac10b-58cc-4372-a567-0e02b2c3d479'   -- current owner_id (demoter, must be different)
-- );

-- Function to demote owner to user
create or replace function public.demote_owner_to_user(
  p_user_id uuid,
  p_demoted_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_role text;
  v_demoter_role text;
begin
  -- Check demoter is owner
  select role into v_demoter_role from public.auth_users where id = p_demoted_by;
  if v_demoter_role != 'owner' then
    raise exception 'Only owner can demote owner';
  end if;

  -- Check user exists and get current role
  select role into v_current_role from public.auth_users where id = p_user_id;
  if not found then
    raise exception 'User not found';
  end if;

  -- Check if owner
  if v_current_role != 'owner' then
    raise exception 'User is not an owner';
  end if;

  -- Prevent self-demotion
  if p_user_id = p_demoted_by then
    raise exception 'Cannot demote yourself';
  end if;

  -- Demote to user
  update public.auth_users
  set role = 'user', updated_at = now()
  where id = p_user_id;

  raise notice 'Owner % demoted to user', p_user_id;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- INITIAL OWNER SETUP (First time only)
-- ════════════════════════════════════════════════════════════

-- Set first owner (no validation needed for initial setup)
-- UPDATE public.auth_users 
-- SET role = 'owner', updated_at = now() 
-- WHERE email = 'owner@example.com';

-- ════════════════════════════════════════════════════════════
-- LIST ALL OWNERS
-- ════════════════════════════════════════════════════════════

-- Query to see all owners
-- SELECT 
--   id, 
--   user_id, 
--   first_name, 
--   last_name, 
--   email, 
--   role, 
--   created_at,
--   updated_at
-- FROM public.auth_users 
-- WHERE role = 'owner' 
-- ORDER BY created_at DESC;

-- ════════════════════════════════════════════════════════════
-- VIEW ALL ROLES DISTRIBUTION
-- ════════════════════════════════════════════════════════════

-- SELECT 
--   role,
--   count(*) as total_users
-- FROM public.auth_users 
-- GROUP BY role
-- ORDER BY 
--   CASE role 
--     WHEN 'owner' THEN 1 
--     WHEN 'admin' THEN 2 
--     WHEN 'user' THEN 3 
--   END;
