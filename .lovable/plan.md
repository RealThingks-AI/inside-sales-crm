

# Campaign Module Deep Audit & Validation Report

## Audit Summary

After thorough code and database inspection, the Campaign module is **substantially implemented** with a few bugs, one critical credential mismatch, and several gaps vs. the audit checklist.

---

## Section A: Bugs & Critical Issues Found

### 1. CRITICAL: Azure Credential Mismatch in `send-campaign-email`
**File:** `supabase/functions/send-campaign-email/index.ts` (lines 9-11)

The function uses `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` but the project convention (per memory and other functions) is `AZURE_EMAIL_TENANT_ID`, `AZURE_EMAIL_CLIENT_ID`, `AZURE_EMAIL_CLIENT_SECRET`. Both sets of secrets exist, but if the non-prefixed ones are stale or misconfigured, email sending silently fails.

**Fix:** Update `send-campaign-email` to use `AZURE_EMAIL_*` prefixed secrets consistently.

### 2. Missing `AZURE_SENDER_EMAIL` Secret Check
The secret `AZURE_SENDER_EMAIL` is used but not listed in the fetched secrets. Need to verify it exists or add it.

### 3. Duplicate Unique Indexes on `campaign_accounts` and `campaign_contacts`
Each table has 3 redundant unique indexes on the same columns `(campaign_id, account_id/contact_id)`. These waste storage and slow writes. Should drop the duplicates.

### 4. `campaign_communications` contact FK is SET NULL on delete (not CASCADE)
When a contact is deleted from the CRM, the communication record keeps existing but with `contact_id = NULL`. This is acceptable behavior but should be documented. Same for account_id.

### 5. `send-campaign-email` Not in `config.toml` with Proper Auth
It has `verify_jwt = false` which is correct per project convention, but the function validates JWT via `getUser(token)` instead of `getClaims(token)` as prescribed by the project knowledge. This works but is slower (makes a server call instead of local JWT verification).

**Fix:** Replace `getUser(token)` with `getClaims(token)` for faster auth.

---

## Section B: What Is Fully Implemented & Working

| Feature | Status | Notes |
|---------|--------|-------|
| Campaign CRUD (create/edit/delete) | DONE | All fields persist correctly |
| Campaign cloning/duplication | DONE | Clones templates + scripts |
| Campaign name required validation | DONE | Button disabled if empty |
| Start/end date validation | DONE | Toast error if start > end |
| Owner defaults to current user | DONE | In CampaignModal |
| Status defaults to Draft | DONE | Hardcoded default |
| MART: Message strategy field | DONE | Textarea in modal |
| MART: Target audience field | DONE | Dropdown with segments |
| MART: Region/Country fields | DONE | Text inputs in modal |
| MART: Start/End dates | DONE | Date inputs |
| Accounts tab (search, filter, bulk add) | DONE | Industry + country filters |
| Account status tracking (4 stages) | DONE | Dropdown per row |
| Contacts tab (search, filter by account/position, bulk add) | DONE | With pagination |
| Contact stage tracking (6 stages) | DONE | Dropdown per row + auto-update on email send |
| Convert to Deal | DONE | Duplicate guard, stakeholder linking, campaign_id stored |
| Email sending via Microsoft Graph | DONE | Template support + placeholders |
| Template placeholders | DONE | contact_name, company_name, email, position, sender_name |
| Email templates (CRUD) | DONE | With audience segment + email type |
| Phone scripts (CRUD) | DONE | Opening, talking points, questions, objections |
| Materials upload/download | DONE | Supabase storage bucket exists |
| Communication logging | DONE | Email, Phone, LinkedIn, Meeting, Follow Up |
| Action items integration | DONE | Uses unified action_items table with module_type='campaigns' |
| Analytics dashboard | DONE | Funnel chart, pie chart, summary metrics |
| Campaign settings | DONE | Follow-up rules persist to campaign_settings table |
| Campaign list with aggregates | DONE | Accounts, contacts, deals, won counts |
| Cascade deletes | DONE | Campaign delete cascades to accounts, contacts, communications, templates, scripts |
| Unique constraints | DONE | Prevents duplicate account/contact in same campaign |

---

## Section C: Issues to Fix

### Fix 1: Azure Credentials in `send-campaign-email`
Update to use `AZURE_EMAIL_*` prefixed secrets.

### Fix 2: Auth Method in `send-campaign-email`
Replace `getUser(token)` with `getClaims(token)` per project convention.

### Fix 3: Remove Duplicate Unique Indexes
Drop 4 redundant indexes:
- `campaign_accounts_campaign_id_account_id_unique`
- `campaign_accounts_campaign_account_unique`
- `campaign_contacts_campaign_id_contact_id_unique`
- `campaign_contacts_campaign_contact_unique`

### Fix 4: Email Template Placeholder Hint Missing `sender_name`
In `CampaignEmailTemplatesTab.tsx` line 121, the placeholder hint shows `contact_name`, `company_name`, `email`, `position` but is missing `sender_name` which IS supported in the send flow.

### Fix 5: Aggregates Query May Hit 1000-Row Limit
`useCampaignAggregates` fetches all `campaign_accounts`, `campaign_contacts`, and `deals` without pagination. If any table exceeds 1000 rows, counts will be wrong. Need to use `.select('campaign_id', { count: 'exact', head: true })` grouped approach or RPC.

### Fix 6: `campaign_settings` Upsert Needs `unique` Constraint on `setting_key`
The code does `upsert({ onConflict: 'setting_key' })`. Need to verify a unique constraint exists on `setting_key`.

---

## Section D: Missing Features (from audit checklist)

| Feature | Status | Priority |
|---------|--------|----------|
| Archive campaign | NOT IMPLEMENTED | Low - can use status "Cancelled" |
| Campaign Notes field | PARTIALLY - uses description | Low |
| Email open tracking (tracking pixel) | NOT IMPLEMENTED | Medium |
| Send scheduling / timezone awareness | NOT IMPLEMENTED | Medium |
| Prevent email send after campaign end date | NOT IMPLEMENTED | Low |
| Regional messaging (region-specific templates) | NOT IMPLEMENTED | Low - templates have audience_segment but not region |
| Contact stage auto-update on phone/LinkedIn | PARTIAL - only auto on email send | Medium |
| Communications appear in Contact/Account activity feeds | NOT VERIFIED | Medium |
| Campaign ROI calculation | NOT IMPLEMENTED | Low |
| Engagement scoring | NOT IMPLEMENTED | Low |
| Follow-up automation | NOT IMPLEMENTED | Medium |
| AI email drafting | NOT IMPLEMENTED | Low |

---

## Section E: Implementation Plan

### Phase 1: Critical Bug Fixes (immediate)

1. **Fix Azure credentials** in `send-campaign-email/index.ts` - change to `AZURE_EMAIL_*` prefixed secrets
2. **Fix auth method** - replace `getUser` with `getClaims`
3. **Add `sender_name` placeholder** hint to email templates tab
4. **Drop duplicate indexes** via migration

### Phase 2: Data Integrity Fixes

5. **Fix aggregates 1000-row limit** - rewrite `useCampaignAggregates` to use count queries instead of fetching all rows
6. **Verify `campaign_settings` unique constraint** on `setting_key`, add if missing

### Phase 3: Functional Enhancements (from audit gaps)

7. **Prevent email send after campaign end date** - add validation in outreach tab
8. **Auto-update contact stage on phone/LinkedIn communications** - extend `addCommunication` mutation logic
9. **Add `sender_name` to email template placeholder hint**

### Estimated Changes
- 1 edge function file modified
- 1 migration for dropping duplicate indexes
- 3 component files modified
- 1 hook file modified

