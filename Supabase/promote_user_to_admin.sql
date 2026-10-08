-- ════════════════════════════════════════════════════════════
-- ROLE MANAGEMENT: PROMOTE USER TO ADMIN
-- ════════════════════════════════════════════════════════════
-- This script promotes a regular user to admin role
-- Admin can access: Public pages, User pages, Admin panel (/admin/*)
-- Admin cannot access: Owner panel (/owner/*)

-- Function to promote user to admin
create or replace function public.promote_user_to_admin(
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
begin
  -- Check promoter is owner
  select role into v_promoter_role from public.auth_users where id = p_promoted_by;
  if v_promoter_role != 'owner' then
    raise exception 'Only owner can promote users to admin';
  end if;

  -- Check user exists and get current role
  select role into v_current_role from public.auth_users where id = p_user_id;
  if not found then
    raise exception 'User not found';
  end if;

  -- Check if already admin or owner
  if v_current_role = 'admin' then
    raise exception 'User is already an admin';
  end if;

  if v_current_role = 'owner' then
    raise exception 'Cannot demote owner to admin';
  end if;

  -- Promote to admin
  update public.auth_users
  set role = 'admin', updated_at = now()
  where id = p_user_id;

  raise notice 'User % promoted to admin', p_user_id;
end;
$$;

-- ════════════════════════════════════════════════════════════
-- MANUAL PROMOTION QUERIES
-- ════════════════════════════════════════════════════════════

-- Example 1: Promote user by email
-- UPDATE public.auth_users 
-- SET role = 'admin', updated_at = now() 
-- WHERE email = 'user@example.com' AND role = 'user';

-- Example 2: Promote user by user_id (6-char code)
-- UPDATE public.auth_users 
-- SET role = 'admin', updated_at = now() 
-- WHERE user_id = 'ABC123' AND role = 'user';

-- Example 3: Promote user by UUID
-- UPDATE public.auth_users 
-- SET role = 'admin', updated_at = now() 
-- WHERE id = '550e8400-e29b-41d4-a716-446655440000' AND role = 'user';

-- Example 4: Use function (recommended - includes validation)
-- SELECT public.promote_user_to_admin(
--   '550e8400-e29b-41d4-a716-446655440000',  -- user_id to promote
--   'f47ac10b-58cc-4372-a567-0e02b2c3d479'   -- owner_id (promoter)
-- );

-- ════════════════════════════════════════════════════════════
-- DEMOTE ADMIN TO USER
-- ════════════════════════════════════════════════════════════

-- Function to demote admin to user
create or replace function public.demote_admin_to_user(
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
    raise exception 'Only owner can demote admins';
  end if;

  -- Check user exists and get current role
  select role into v_current_role from public.auth_users where id = p_user_id;
  if not found then
    raise exception 'User not found';
  end if;

  -- Check if admin
  if v_current_role != 'admin' then
    raise exception 'User is not an admin';
  end if;

  -- Demote to user
  update public.auth_users
  set role = 'user', updated_at = now()
  where id = p_user_id;

  raise notice 'Admin % demoted to user', p_user_id;
end;
$$;

-- Example demote query
-- SELECT public.demote_admin_to_user(
--   '550e8400-e29b-41d4-a716-446655440000',  -- admin_id to demote
--   'f47ac10b-58cc-4372-a567-0e02b2c3d479'   -- owner_id (demoter)
-- );

-- ════════════════════════════════════════════════════════════
-- LIST ALL ADMINS
-- ════════════════════════════════════════════════════════════

-- Query to see all admins
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
-- WHERE role = 'admin' 
-- ORDER BY created_at DESC;
