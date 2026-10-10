# LC App Migration Provenance Matrix

- Version: v1.1
- Date: 2026-10-10
- Scope: migrations 001–060
- Canonical hashes: current branch at report generation

`VERIFIED ORIGINAL*` means byte-pinned recovered local source whose pre-recovery package is described in repository history but is not duplicated in this checkout. `VERIFIED RECONSTRUCTION` means every reconstructed behavior has local contract/application evidence and executable validation; it does not assert hosted equivalence.

| Seq | File | SHA-256 | Dependencies | Purpose | Provenance | Evidence |
|---:|---|---|---|---|---|---|
| 001 | `202608080001_auth_profiles_storage.sql` | `77e6bb38e1c60aa6f478564cfa5ac422562cba2b01ee2205dc9556a82309e913` | Supabase auth/storage foundation; public.profiles, public.user_settings, auth.users | LC App P0 auth/profile compatibility notes for the verified live Supabase foundation | **VERIFIED ORIGINAL*** | recovered local source; pinned SHA; added 78132f3 |
| 002 | `202608080002_profiles_role_and_moderation_helper.sql` | `aa356b306ace1fd96bc1886c7f6bb53dc48c0c319cf0058015038b8978919b6f` | prior applied chain; public.is_moderator, public.profiles, auth.uid | Social MVP: authorization prerequisites The verified live foundation already defines the approved role values: user, moderator, admin | **VERIFIED ORIGINAL*** | recovered local source; pinned SHA; added 78132f3 |
| 003 | `202608080003_social_graph.sql` | `17bbb3e4e67818c265e87ba97842231cf209170f1d7f11fb4304185cbacbe8e1` | prior applied chain; public.follows, public.profiles, public.user_blocks, public.is_blocked_pair | Social MVP: follows + user_blocks | **VERIFIED ORIGINAL*** | recovered local source; pinned SHA; added 78132f3 |
| 004 | `202608080004_posts_engagement.sql` | `a0236c2437de9c362975722346831e25be6ad09823fc93141455d54bfe203d1c` | prior applied chain; public.posts, public.profiles, public.protect_post_moderation_fields, public.is_moderator | Social MVP: posts, post_likes, comments No denormalized like_count / comment_count columns -- counted via COUNT() | **VERIFIED ORIGINAL*** | recovered local source; pinned SHA; added 78132f3 |
| 005 | `202608080005_activity_notifications.sql` | `fac4816ac4fd24bf543dd9e69dbf47998640ad58948edd70b527292a27a8b8a0` | prior applied chain; public.activity_events, public.profiles, public.notifications, auth.uid | Social MVP: activity_events + notifications Both tables are written exclusively by SECURITY DEFINER trigger functions | **VERIFIED ORIGINAL*** | recovered local source; pinned SHA; added 78132f3 |
| 006 | `202608080006_reports.sql` | `394b69364bd6046dd9ab96c93c5d30d40a73cf7e52aff98496b72b6056d3b273` | prior applied chain; public.reports, public.profiles, auth.uid, public.is_moderator | Social MVP: reports (basic moderation foundation) | **VERIFIED ORIGINAL*** | recovered local source; pinned SHA; added 78132f3 |
| 007 | `202608080007_profiles_system_field_guard.sql` | `7040d0e6feb90048710473969051a07fb6d79be4546c929d36f360706363e84d` | prior applied chain; public.profiles, public.protect_profile_system_fields | Social MVP: profiles privileged-field guard Fixes the live security bug where an authenticated user could update their own public.profiles.role through the broad own-profile UPDATE policy | **VERIFIED ORIGINAL** | Git introduction f2c641c; clean-room applied |
| 008 | `202608080008_product_personas_creator_industry.sql` | `9d76ebdc6020ea29befc578ac01cf754994b15baded3d2c3d33b374a17e5cc15` | prior applied chain; public.is_active_profile, public.profiles, public.account_personas, public.protect_account_persona_identity | LC App Functional Completion MVP: product personas, creator sessions, industry profiles, access requests and session reminders | **VERIFIED ORIGINAL** | Git introduction 42554b4; clean-room applied |
| 009 | `202608080009_creator_session_eligibility.sql` | `304799b5c543999a6ee88f90375dbbce930a4103f36840ad3384ee5bd409050e` | prior applied chain; public.can_manage_user_generated_creator_session, auth.uid, public.is_active_profile, public.account_personas | LC App Run 1: require completed Creator persona/profile before user-generated sessions | **VERIFIED ORIGINAL** | Git introduction 960e68b; clean-room applied |
| 010 | `202608080010_active_profile_mutation_gate.sql` | `59fd9dd4eee1f87b57b3b5038cb6fa2363aaf7ffaff03cb0709d5a230b7d3c11` | prior applied chain; public.follows, auth.uid, public.is_active_profile, public.is_blocked_pair | LC App product/social hardening: deny user mutations after account suspension | **VERIFIED ORIGINAL** | Git introduction a36dea4; clean-room applied |
| 011 | `202608080011_profile_account_status_admin_maintenance.sql` | `1049d2f3e964de893e778915c49fa1fc4ecace5bf274b23176f81192913b1866` | prior applied chain; public.profiles, public.protect_profile_system_fields, public.admin_set_profile_account_status, auth.uid | LC App account-status maintenance path | **VERIFIED ORIGINAL** | Git introduction 29ad26e; clean-room applied |
| 012 | `202608080012_creator_approval_gate.sql` | `b2ce0574116649d9eff8115994e95caca9d690dd166d2bdc9d4b2b8f2a4c98d6` | prior applied chain; public.is_approved_creator, public.is_active_profile, public.account_personas, public.creator_profiles | LC App Creator/Dealer approval gate | **VERIFIED ORIGINAL** | Git introduction e105a4b; clean-room applied |
| 013 | `202609080013_product_attribution_events.sql` | `59e8fbee9e62039a71298b79911399e7122af7a1530e60250ef47b74ad32dd11` | prior applied chain; public.product_events, public.profiles, public.creator_sessions, auth.uid | LC App product-loop attribution foundation | **VERIFIED ORIGINAL** | Git introduction c64018f; clean-room applied |
| 014 | `202609080014_creator_publication_control.sql` | `ddfb1d715985ec36842ef6466463165cb95af48263d0a1198c6e1781674f4974` | prior applied chain; public.can_publish_creator_profile, public.is_active_profile, public.account_personas, public.creator_profiles | LC App Creator publication control | **VERIFIED ORIGINAL** | Git introduction b1f4924; clean-room applied |
| 015 | `202609080015_block_follow_cleanup.sql` | `d99ba710779aa6001306291ae77112f2f11ed8aff6edf41fc8e5e145e3e64a95` | prior applied chain; public.remove_follows_on_user_block, public.follows, public.user_blocks | LC App block relationship cleanup | **VERIFIED ORIGINAL** | Git introduction f13ebf6; clean-room applied |
| 016 | `202609080016_account_deletion_requests.sql` | `6925f1071e2132363ef3ebf0d8620a42e5b6fca654a77a88517359770279ebf7` | prior applied chain; public.account_deletion_requests, auth.users, public.protect_account_deletion_request_insert, auth.role | User-owned account deletion request workflow | **VERIFIED ORIGINAL** | Git introduction 2fe3f22; clean-room applied |
| 017 | `202609080017_creator_live_return_signals.sql` | `c7ccd2dee857bd56d86cb5164b0077b003a95d001e9e431ff32ccc9266ce9cbf` | prior applied chain; public.return_signal_preferences, public.profiles, public.return_signals, public.creator_sessions | App-owned Creator Live return signals | **VERIFIED ORIGINAL** | Git introduction 64b6943; clean-room applied |
| 018 | `202609080018_pilot_measurement_briefs.sql` | `af84065aa8fa443be47a06391cf3082c45390c90e13babc8b87bb90e958f4f2b` | prior applied chain; public.pilot_measurement_briefs, public.profiles, public.protect_pilot_measurement_brief, auth.uid | Operator/provider-owned pilot measurement planning | **VERIFIED ORIGINAL** | Git introduction 85bf47e; clean-room applied |
| 019 | `202609080019_pilot_brief_review_workflow.sql` | `1d5baa345ab3af32f868a267e1fe8376c3f0f2d6d0c74d1a57387667bcd2b19f` | prior applied chain; public.protect_pilot_measurement_brief, auth.role | Restore the privileged review path for submitted pilot measurement briefs | **VERIFIED ORIGINAL** | Git introduction ab6c924; clean-room applied |
| 020 | `202609080020_live_signal_follow_catchup.sql` | `95ee78703c0685d487ce74d38187855c3b146a3d5296e2f0558dc7fbd38f9a7f` | prior applied chain; public.create_live_signal_on_follow, public.is_active_profile, public.is_blocked_pair, public.return_signals | Close the Follow -> Live return-loop gap for Creators who are already live | **VERIFIED ORIGINAL** | Git introduction 0ad7b82; clean-room applied |
| 021 | `202609080021_creator_session_state_machine.sql` | `83e12b6c32bf8eedaa4b550c9877364dd4bb1848826b200beec7204d7cf02a48` | prior applied chain; public.creator_sessions, public.enforce_creator_session_state_machine, public.is_approved_creator, public.remove_ineligible_creator_live_return_signals | Enforce the user-generated Creator session lifecycle at the database boundary | **VERIFIED ORIGINAL** | Git introduction 98c01c4; clean-room applied |
| 022 | `202609080022_product_event_context_guard.sql` | `70a4b2165796542a166acfc4d13f7ea699444f050d2524cc72c2c9a809afad94` | prior applied chain; public.enforce_product_event_context, public.is_approved_creator, public.user_blocks, public.creator_sessions | Protect LC attribution evidence from impossible or unsafe creator/session context | **VERIFIED ORIGINAL** | Git introduction d7d429f; clean-room applied |
| 023 | `202609080023_schedule_reminder_integrity.sql` | `e0cd493e62e89d7f24fb9489934d3f08af87024046e88cf5651d6064947ce10f` | prior applied chain; public.can_set_creator_session_reminder, auth.uid, public.is_active_profile, public.creator_sessions | Make schedule reminders a trustworthy app-owned return-intent signal | **VERIFIED ORIGINAL** | Git introduction 03d2865; clean-room applied |
| 024 | `202609080024_attributable_return_integrity.sql` | `b68e1f80378cb60ca86dfded3a2c3dc6f1e921569c4db3dde5a81ba572ac4c7f` | prior applied chain; public.enforce_product_event_context, public.is_approved_creator, public.user_blocks, public.creator_sessions | Make LC funnel evidence event-specific and preserve legitimate post-handoff returns | **VERIFIED ORIGINAL** | Git introduction 4905782; clean-room applied |
| 025 | `202609080025_per_creator_live_alert_preferences.sql` | `15a20deb9647a9674e9035e88b5edd64c6eb4d9c3e9850541f3b9f405dd66cbc` | prior applied chain; public.follows, auth.uid, public.is_active_profile, public.is_approved_creator | Per-Creator control for app-owned in-app Live return signals | **VERIFIED ORIGINAL** | Git introduction 82a9634; clean-room applied |
| 026 | `202609080026_global_live_signal_preference_integrity.sql` | `dc3aaabacac34830a195ee8fd7e434333242cec1e5868db911468cf80b406610` | prior applied chain; public.create_live_signals_on_preference_enable, public.return_signals, public.is_active_profile, public.follows | Keep the global Creator Live signal preference behaviorally correct | **VERIFIED ORIGINAL** | Git introduction 521bc03; clean-room applied |
| 027 | `202609080027_creator_public_surface_integrity.sql` | `590680983ecd2644d511b7caef0d52eb378ee6948b1c74bca0b337ae7bb910a7` | prior applied chain; public.posts, auth.uid, public.is_active_profile, public.creator_profiles | Keep the public Creator surface truthful and fail-closed | **VERIFIED ORIGINAL** | Git introduction 9e1a3e8; clean-room applied |
| 028 | `202609210028_product_event_attribution_trust.sql` | `182b70e61ae94c296cf15da9c730557ea0ef413c31ddbdaaed21f07948967b9a` | prior applied chain; public.enforce_product_event_attribution_trust, auth.role, public.product_events | Prevent browser clients from self-certifying attribution as direct | **VERIFIED ORIGINAL** | Git introduction 53dc190; clean-room applied |
| 029 | `202609210029_handoff_intent_server_boundary.sql` | `3871e658b53c06a1e0a16411a922599d05db5d4d3ca54d2c8d4c6272ee51d972` | prior applied chain; public.enforce_product_event_handoff_boundary, auth.role, public.product_events | A browser viewing LC's conceptual handoff screen is not evidence that a user actually left for a licensed operator | **VERIFIED ORIGINAL** | Git introduction aaaa3ec; clean-room applied |
| 030 | `202609220030_industry_organizations_rbac.sql` | `ac20ebd6453be01b1ee6a66d7f4b6ecb493b26fab66989a65422ed907126f646` | prior applied chain; public.industry_organizations, public.profiles, public.industry_organization_members, public.is_industry_org_member | LC App pilot foundation: tenant organizations and fail-closed membership RBAC | **VERIFIED ORIGINAL** | Git introduction 9f71bc4; clean-room applied |
| 031 | `202609220031_industry_pilot_configuration.sql` | `b93299fb58d80546e5e9fbee70d6e472c018ba16571c968675c9657a885e89cc` | prior applied chain; public.is_industry_org_manager, public.industry_organization_members, public.industry_organizations, public.profiles | LC App operator/provider pilot configuration | **VERIFIED ORIGINAL** | Git introduction f700bdb; clean-room applied |
| 032 | `202609220032_industry_support_cases.sql` | `58b7b132687fe747e403b887f8a9c9b88ebab29fe67226dcca9d834cced2d70b` | prior applied chain; public.industry_support_cases, public.industry_organizations, public.profiles, public.is_industry_org_member | LC App tenant-scoped pilot support lifecycle | **VERIFIED ORIGINAL** | Git introduction 4424840; clean-room applied |
| 033 | `202609220033_industry_integration_health.sql` | `d696823a014ef9dd4d848a71bfe5f66936631b8801a1401142757e6f2a6e1b2f` | prior applied chain; public.industry_integration_health, public.industry_organizations, public.is_industry_org_member | LC App tenant-scoped integration health snapshots | **VERIFIED ORIGINAL** | Git introduction 72e3714; clean-room applied |
| 034 | `202609220034_account_data_export_requests.sql` | `af1742a1aa89963e0fd1932626200d4b92556ea8acfe81c1c6938bcdae2bc9a5` | prior applied chain; public.account_data_export_requests, auth.users, public.protect_account_data_export_request_insert, auth.role | User-owned privacy data export request workflow | **VERIFIED ORIGINAL** | Git introduction 7e9e2e5; clean-room applied |
| 035 | `202609220035_creator_return_preferences.sql` | `6439f8bae8082028772adb0dad6917bde9acb3763e4a3c4120df2b17aad1a440` | prior applied chain; public.creator_return_preferences, auth.users, public.profiles, public.protect_creator_return_preference_write | Player-owned return preferences for approved creators/dealers | **VERIFIED ORIGINAL** | Git introduction c79e961; clean-room applied |
| 036 | `202609220036_creator_return_follow_integrity.sql` | `a0b68b412e127b4592451e2507399cf3d5287330306a3e1c6dc3f6ccdacaa4e6` | prior applied chain; public.require_follow_for_creator_return_preference, public.follows, public.creator_return_preferences, public.remove_creator_return_preference_on_unfollow | Keep creator return intent attached to the core Follow -> Return loop | **VERIFIED ORIGINAL** | Git introduction cb98035; clean-room applied |
| 037 | `202609220037_creator_return_live_signal_sync.sql` | `347aca700368b8b517c2d62e2c638c03040d04d0cc7b04b842e004f844382271` | prior applied chain; public.sync_creator_return_live_alert_preference, public.follows, public.return_signals, public.is_active_profile | Keep the newer per-Creator return preference aligned with the existing in-app Live signal path | **VERIFIED ORIGINAL** | Git introduction a16ea64; clean-room applied |
| 038 | `202609220038_creator_live_signal_generation_preference_gate.sql` | `66c5c06318ef09247f665fca435aa5065d3f86b50158f785fc5a2f470955d044` | prior applied chain; public.create_creator_live_return_signals, public.return_signals, public.follows, public.creator_profiles | Enforce per-Creator Live alert intent at signal generation time | **VERIFIED ORIGINAL** | Git introduction 6670a39; clean-room applied |
| 039 | `202609220039_return_signal_read_integrity.sql` | `42622b750ef4d5449825891c67162b3b60fef2bb0479d63407466bbf6e7b30a4` | prior applied chain; public.protect_return_signal_update | Make in-app return signal read state server-owned and monotonic | **VERIFIED ORIGINAL** | Git introduction 2836e49; clean-room applied |
| 040 | `202609220040_player_session_reminder_integrity.sql` | `e2f3911b547063760a8ee93965b6470dd63f0149c1bd0d2019ec571490cb227f` | prior applied chain; public.protect_player_session_reminder_write, auth.uid, public.is_active_profile, public.creator_sessions | Keep session reminders inside the approved public Creator -> Schedule/Live -> Return loop | **VERIFIED ORIGINAL** | Git introduction 96db63d; clean-room applied |
| 041 | `202609220041_industry_org_invitation_lifecycle.sql` | `b8076fdf748346dd253f8deccd8a2d4dd16c2aafaedf6610df21d74e907c4b46` | prior applied chain; public.industry_organization_invitations, public.industry_organizations, public.profiles, public.is_industry_org_manager | LC App pilot foundation: tenant-scoped, token-based team invitations | **VERIFIED ORIGINAL** | Git introduction 3fb8b82; clean-room applied |
| 042 | `202609220042_industry_org_invitation_membership_guard.sql` | `fd843f91fdaa8b5f27fd1be55f11637ad47905d171afbe75524d0e9cdcaac5be` | prior applied chain; public.accept_industry_org_invitation, public.industry_organization_invitations, auth.uid, public.is_active_profile | Prevent invitation acceptance from mutating an existing tenant role | **VERIFIED ORIGINAL** | Git introduction 9539bd7; clean-room applied |
| 043 | `202609220043_industry_creator_table_mapping.sql` | `f3bd5ecddee02354ca795207b0a36e11c1719211b39e83ee5ea97fff048e17a3` | prior applied chain; public.industry_creator_table_mappings, public.industry_organizations, public.profiles, public.industry_organization_members | LC App pilot foundation: tenant-scoped creator/table mapping | **VERIFIED ORIGINAL** | Git introduction d5453ad; clean-room applied |
| 044 | `202609220044_harden_creator_table_mapping_pause.sql` | `1efbc69129f1529f174988bb3cc311832cc50c4d5a09c746fd28508e0b7eb43b` | prior applied chain; public.pause_industry_creator_table_mapping, auth.uid, public.is_active_profile, public.industry_creator_table_mappings | Harden tenant creator/table mapping pause mutation for suspended/disabled callers | **VERIFIED ORIGINAL** | Git introduction 770b30f; clean-room applied |
| 045 | `202609220045_creator_table_mapping_audit.sql` | `2b121f575e2d4dc784a605df8a8600f855a5e8a245e68c6dd048dcae0b964229` | prior applied chain; public.industry_creator_table_mapping_audit, public.industry_organizations, public.industry_creator_table_mappings, public.profiles | Append-only audit trail for tenant creator/table mapping configuration | **VERIFIED ORIGINAL** | Git introduction bf372a1; clean-room applied |
| 046 | `202609220046_industry_membership_lifecycle.sql` | `48250a7f642b5b4dbc77833e8368b3565e7c8a8b9c0b173f89046e49ded690e5` | prior applied chain; public.manage_industry_org_member, auth.uid, public.is_active_profile, public.industry_organization_members | LC App tenant membership lifecycle | **VERIFIED ORIGINAL** | Git introduction ed18f89; clean-room applied |
| 047 | `202609220047_serialize_industry_owner_lifecycle.sql` | `6eaac32fbef0d05b277ab048f7a2dc122da64a1801e09a265c3225ccf1fd7068` | prior applied chain; public.manage_industry_org_member, auth.uid, public.is_active_profile, public.industry_organizations | Serialize owner membership changes per organization so concurrent demotions/removals cannot leave a tenant ownerless | **VERIFIED ORIGINAL** | Git introduction 3e4aefe; clean-room applied |
| 048 | `202609240048_approved_operator_handoff_resolution.sql` | `5319d4b703edb1b05cdd11aaf64fe1bfb0d7bb3f74a4e5902005b7eba81e681b` | prior applied chain; public.industry_creator_table_mappings, public.industry_handoff_destinations, public.assign_industry_creator_table_handoff, auth.uid | LC App pilot handoff resolution | **VERIFIED ORIGINAL** | Git introduction 8c647bc; clean-room applied |
| 049 | `202609240049_fail_closed_ambiguous_operator_handoff.sql` | `40be0943331d09b3055c828a76b89c6daf831d0733d4ab3ee4adb1b19c2f6f9d` | prior applied chain; public.resolve_licensed_operator_handoff, public.industry_creator_table_mappings, public.industry_organizations, public.industry_handoff_destinations | Prevent a creator/table reference shared by multiple eligible tenants from silently routing a player to whichever mapping happened to update last | **VERIFIED ORIGINAL** | Git introduction a9fc813; clean-room applied |
| 050 | `202609240050_handoff_return_idempotency.sql` | `add2a724210013f7c9465121c6dc8cb3e84c733f4656b0865e9c1e38092daa06` | prior applied chain; public.product_events, public.product_events_handoff_return_once_idx | Prevent duplicate client retries from inflating attributable return evidence | **VERIFIED ORIGINAL** | Git introduction 6f006f3; clean-room applied |
| 051 | `202609240051_creator_session_handoff_binding.sql` | `1aee6fed80540a184d3c80613ced5f2df9d1b81ba031359a82f19897299002c0` | prior applied chain; public.industry_creator_session_handoffs, public.creator_sessions, public.industry_creator_table_mappings, public.industry_organizations | Bind an LC Creator session to one tenant-scoped, approved operator handoff mapping | **VERIFIED ORIGINAL** | Git introduction b3c5e4a; clean-room applied |
| 052 | `—` | `—` | Unknown | No file or authoritative SQL found | **MISSING** | all branches, reflogs, reachable history and unreachable blobs checked |
| 053 | `—` | `—` | Unknown | No file or authoritative SQL found | **MISSING** | all branches, reflogs, reachable history and unreachable blobs checked |
| 054 | `—` | `—` | Unknown | No file or authoritative SQL found | **MISSING** | all branches, reflogs, reachable history and unreachable blobs checked |
| 055 | `202609240055_product_event_state_integrity.sql` | `389c3d20e9316caa1ec8865b326481984efd61fbf55553afc8dc6d94693572d4` | prior applied chain; public.enforce_product_event_state_integrity, public.follows, public.player_session_reminders, public.product_events | Keep measurement evidence aligned with persisted product state | **VERIFIED ORIGINAL** | Git introduction 3a9d200; clean-room applied |
| 056 | `202610090056_product_event_contract_hardening.sql` | `70eb6503cb6e1f9e600f52cf0ff342b8b7d8af9c3023bfe5e7581bd87ddb109e` | prior applied chain; public.enforce_product_event_context, public.is_approved_creator, public.user_blocks, public.creator_sessions | Harden notification attribution and constrain every browser-owned event metadata shape | **VERIFIED ORIGINAL** | Git introduction 501c3f1; clean-room applied |
| 057 | `202610090057_foundation_contract_recovery.sql` | `c3eeb58854d17736937375809c03f2797981d90409b3c0fa5140afe3bbde43fa` | prior applied chain; public.handle_new_user, public.profiles, public.user_settings, auth.users | Reconstructed from the authoritative LC Frontend/Supabase API Contract | **VERIFIED RECONSTRUCTION** | contract + app usage + clean-room; added 78132f3 |
| 058 | `202610090058_avatar_storage_contract_recovery.sql` | `754a946a37d05c7b22e804d9fc101d760557ef8ff4994887508e43ecf38e5096` | prior applied chain; storage.buckets, storage.objects, storage.foldername, auth.uid | Reconstructed from the authoritative LC Frontend/Supabase API Contract | **VERIFIED RECONSTRUCTION** | contract + app usage + clean-room; added 78132f3 |
| 059 | `202610090059_private_profile_policy_compatibility.sql` | `5ce85bbff3b51da6260e29147811d0a1bf93fede51ecc336c3bdfd4d1c7af1c7` | prior applied chain; public.posts, public.is_blocked_pair, auth.uid, public.is_active_profile | Keep private profile/account columns unreadable while allowing dependent RLS policies to evaluate active-account state through security-definer helpers | **VERIFIED ORIGINAL** | Git introduction 78132f3; clean-room applied |
| 060 | `202610090060_foundation_privilege_and_suspension_hardening.sql` | `eb8ec51bbd4607f50709f6811523872779ac0e99eb40938e0f654c78e87988f9` | prior applied chain; public.profiles, public.user_settings, public.is_moderator, auth.uid | Make foundation ACLs deterministic and ensure account suspension removes moderation, report creation and avatar mutation capabilities | **VERIFIED ORIGINAL** | Git introduction f449a64; clean-room applied |

## Gap decision

`052–054` remain absent. Do not create placeholders and do not use migration-repair commands. Hosted staging history must contain neither those versions nor unknown objects attributed to them before the chain can be approved.

## Executable dependency map — 2026-10-10, checkpoint 0a98c3c

Generated by `tools/migration-dependencies.py`. Edges list first-defining earlier migrations for qualified public table/function/index names; source name extraction is conservative, not a complete SQL parser. It does not infer missing behavior, overload resolution, unqualified/dynamic SQL or policy replacement ordering. Auth/Storage are local platform-shim prerequisites. All 57 SHA-256 values still match the provenance table above. Full available chain replay validates lexical ordering; absent 052–054 remain UNKNOWN.

| Seq | Earlier defining migrations | Auth/Storage prerequisites | Replay |
|---:|---|---|---|
| 001 | — | `auth.users` | PASS |
| 002 | 001 | `auth.uid` | PASS |
| 003 | 001 | `auth.uid` | PASS |
| 004 | 001, 002, 003 | `auth.uid` | PASS |
| 005 | 001, 003, 004 | `auth.uid` | PASS |
| 006 | 001, 002 | `auth.uid` | PASS |
| 007 | 001 | — | PASS |
| 008 | 001, 004 | `auth.uid` | PASS |
| 009 | 008 | `auth.uid` | PASS |
| 010 | 003, 004, 008 | `auth.uid` | PASS |
| 011 | 001, 007 | `auth.uid` | PASS |
| 012 | 008, 009 | `auth.role`, `auth.uid` | PASS |
| 013 | 001, 008 | `auth.uid` | PASS |
| 014 | 008, 009, 012 | `auth.uid` | PASS |
| 015 | 003 | — | PASS |
| 016 | — | `auth.role`, `auth.uid`, `auth.users` | PASS |
| 017 | 001, 003, 008, 015 | `auth.uid` | PASS |
| 018 | 001, 004 | `auth.uid` | PASS |
| 019 | 018 | `auth.role` | PASS |
| 020 | 003, 008, 017 | — | PASS |
| 021 | 008, 012, 017 | — | PASS |
| 022 | 003, 008, 012, 013 | — | PASS |
| 023 | 003, 008, 012, 015, 017 | `auth.uid` | PASS |
| 024 | 003, 008, 012, 013, 022 | — | PASS |
| 025 | 003, 008, 012, 017, 020 | `auth.uid` | PASS |
| 026 | 003, 008, 017, 020 | — | PASS |
| 027 | 004, 008, 012, 021 | `auth.uid` | PASS |
| 028 | 013 | `auth.role` | PASS |
| 029 | 013 | `auth.role` | PASS |
| 030 | 001, 008 | `auth.uid` | PASS |
| 031 | 001, 004, 008, 030 | `auth.uid` | PASS |
| 032 | 001, 004, 030, 031 | `auth.uid` | PASS |
| 033 | 004, 030 | — | PASS |
| 034 | 008 | `auth.role`, `auth.uid`, `auth.users` | PASS |
| 035 | 001, 008, 012 | `auth.uid`, `auth.users` | PASS |
| 036 | 003, 035 | — | PASS |
| 037 | 003, 008, 012, 017, 035 | — | PASS |
| 038 | 003, 008, 017 | — | PASS |
| 039 | 017 | — | PASS |
| 040 | 003, 008, 012 | `auth.uid` | PASS |
| 041 | 001, 008, 030, 031 | `auth.uid` | PASS |
| 042 | 008, 030, 041 | `auth.uid` | PASS |
| 043 | 001, 008, 030, 031 | `auth.uid` | PASS |
| 044 | 008, 031, 043 | `auth.uid` | PASS |
| 045 | 001, 030, 043 | `auth.uid` | PASS |
| 046 | 008, 030 | `auth.uid` | PASS |
| 047 | 008, 030, 046 | `auth.uid` | PASS |
| 048 | 001, 008, 030, 031, 043 | `auth.uid` | PASS |
| 049 | 001, 008, 030, 031, 043, 048 | — | PASS |
| 050 | 013 | — | PASS |
| 051 | 001, 008, 030, 031, 043 | `auth.uid` | PASS |
| 052 | UNKNOWN | UNKNOWN | MISSING / not executed |
| 053 | UNKNOWN | UNKNOWN | MISSING / not executed |
| 054 | UNKNOWN | UNKNOWN | MISSING / not executed |
| 055 | 003, 008, 013 | — | PASS |
| 056 | 003, 008, 012, 013, 022 | — | PASS |
| 057 | 001, 008 | `auth.uid`, `auth.users` | PASS |
| 058 | — | `auth.uid`, `storage.buckets`, `storage.foldername`, `storage.objects` | PASS |
| 059 | 003, 004, 008, 030, 043, 045 | `auth.uid` | PASS |
| 060 | 001, 002, 006, 008, 011 | `auth.uid`, `storage.foldername`, `storage.objects` | PASS |

Replacement-order dependencies supplement first-definition edges: 057 overrides the profile/Auth contract and must respect 007/011 field guards; 059 repairs policy compatibility after 057 profile ACL restrictions; 060 hardens 057/058 grants, profile/settings/reports policies and avatar policies. Do not treat 058 as a substitute for 001 or omit 059/060 after 057. 055 directly references follows (003), reminders (008) and product_events (013). No known qualified reference requires an object attributable to 052–054; their unseen semantics cannot be audited.
