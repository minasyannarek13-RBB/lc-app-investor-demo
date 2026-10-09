-- Keep private profile/account columns unreadable while allowing dependent RLS
-- policies to evaluate active-account state through security-definer helpers.

begin;

drop policy if exists "posts_select_visible" on public.posts;
create policy "posts_select_visible"
  on public.posts for select
  to authenticated
  using (
    status = 'active'
    and deleted_at is null
    and not public.is_blocked_pair(auth.uid(), author_id)
    and public.is_active_profile(author_id)
  );

drop policy if exists "comments_select_visible" on public.comments;
create policy "comments_select_visible"
  on public.comments for select
  to authenticated
  using (
    status = 'active'
    and deleted_at is null
    and not public.is_blocked_pair(auth.uid(), author_id)
    and exists (
      select 1
      from public.posts p
      where p.id = comments.post_id
        and p.status = 'active'
        and p.deleted_at is null
        and public.is_active_profile(p.author_id)
        and not public.is_blocked_pair(auth.uid(), p.author_id)
    )
  );

drop policy if exists "post_likes_select_visible" on public.post_likes;
create policy "post_likes_select_visible"
  on public.post_likes for select
  to authenticated
  using (
    not public.is_blocked_pair(auth.uid(), post_likes.user_id)
    and exists (
      select 1
      from public.posts p
      where p.id = post_likes.post_id
        and p.status = 'active'
        and p.deleted_at is null
        and public.is_active_profile(p.author_id)
        and not public.is_blocked_pair(auth.uid(), p.author_id)
    )
  );

drop policy if exists "industry_creator_table_mappings_member_select" on public.industry_creator_table_mappings;
create policy "industry_creator_table_mappings_member_select"
  on public.industry_creator_table_mappings for select
  to authenticated
  using (public.is_industry_org_member(organization_id));

drop policy if exists "industry_creator_table_mapping_audit_member_select" on public.industry_creator_table_mapping_audit;
create policy "industry_creator_table_mapping_audit_member_select"
  on public.industry_creator_table_mapping_audit for select
  to authenticated
  using (public.is_industry_org_member(organization_id));

commit;
