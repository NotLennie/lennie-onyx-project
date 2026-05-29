<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';
  import PageShell from '$lib/components/portal/PageShell.svelte';
  import PageHeader from '$lib/components/portal/PageHeader.svelte';
  import Card from '$lib/components/portal/Card.svelte';

  let { data } = $props<{ data: PageData }>();

  const nameParts = (data.profile?.name ?? '').split(' ');
  let firstName = $state(nameParts[0] ?? '');
  let lastName = $state(nameParts.slice(1).join(' '));
  let email = $state(data.profile?.email ?? '');

  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');

  let saving = $state(false);
  let saveError = $state('');
  let saveSuccess = $state('');
  let passwordError = $state('');
  let passwordSuccess = $state('');

  let uploadingPicture = $state(false);
  let pictureError = $state('');

  async function saveProfile() {
    saving = true;
    saveError = '';
    saveSuccess = '';
    try {
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      const updates: Record<string, string> = {};
      if (fullName !== data.profile?.name) updates.name = fullName;
      if (email !== data.profile?.email) {
        updates.email = email;
        if (currentPassword) updates.currentPassword = currentPassword;
      }
      if (Object.keys(updates).length === 0) {
        saveError = 'No changes to save.';
        return;
      }
      await api.employee.profile.update(updates);
      saveSuccess = 'Profile updated.';
      await invalidateAll();
    } catch (e) {
      saveError = e instanceof Error ? e.message : 'Failed to save';
    } finally {
      saving = false;
    }
  }

  async function savePassword() {
    passwordError = '';
    passwordSuccess = '';
    if (!currentPassword) { passwordError = 'Current password is required.'; return; }
    if (!newPassword) { passwordError = 'New password is required.'; return; }
    if (newPassword.length < 8) { passwordError = 'New password must be at least 8 characters.'; return; }
    if (newPassword !== confirmPassword) { passwordError = 'Passwords do not match.'; return; }
    saving = true;
    try {
      await api.employee.profile.update({ currentPassword, newPassword });
      passwordSuccess = 'Password updated.';
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
    } catch (e) {
      passwordError = e instanceof Error ? e.message : 'Failed to update password';
    } finally {
      saving = false;
    }
  }

  async function handlePictureChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    uploadingPicture = true;
    pictureError = '';
    try {
      await api.employee.profile.uploadPicture(file);
      await invalidateAll();
    } catch (err) {
      pictureError = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      uploadingPicture = false;
    }
  }

  const roleLabel = $derived(data.profile?.roles?.[0]?.name ?? null);
</script>

<PageShell bgImage="/images/portal_background.png">
  <PageHeader eyebrow="Staff Portal" title="PROFILE" user={data.user} />

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <Card label="Profile Photo">
      <div style="display:flex;align-items:center;gap:18px;">
        <div style="width:72px;height:72px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.3);">
          {#if data.profile?.profilePictureUrl}
            <img src={data.profile.profilePictureUrl} alt="Profile" style="width:100%;height:100%;object-fit:cover;" />
          {:else}
            <img src="/icons/expert_stylist.png" alt="" style="width:38px;height:38px;opacity:0.85;" />
          {/if}
        </div>
        <div>
          <div style="color:white;font-size:13px;margin-bottom:8px;">{data.profile?.name ?? ''}</div>
          <label style="cursor:pointer;display:inline-block;background:transparent;border:1px solid var(--color-border);color:rgba(255,255,255,0.45);font-size:10px;letter-spacing:0.15em;text-transform:uppercase;padding:7px 16px;">
            {uploadingPicture ? 'Uploading…' : 'Upload Photo'}
            <input type="file" accept="image/*" style="display:none;" onchange={handlePictureChange} disabled={uploadingPicture} />
          </label>
          {#if pictureError}<div role="alert" style="color:#f87171;font-size:11px;margin-top:6px;">{pictureError}</div>{/if}
        </div>
      </div>
    </Card>

    <Card label="Personal Details">
      {#if saveError}<div role="alert" style="margin-bottom:12px;padding:10px 14px;font-size:13px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{saveError}</div>{/if}
      {#if saveSuccess}<div style="margin-bottom:12px;padding:10px 14px;font-size:13px;color:rgba(255,255,255,0.6);border:1px solid var(--color-border);">{saveSuccess}</div>{/if}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div><label class="field-label" for="firstName">First Name</label><input id="firstName" type="text" bind:value={firstName} class="field-input" autocomplete="given-name" /></div>
        <div><label class="field-label" for="lastName">Last Name</label><input id="lastName" type="text" bind:value={lastName} class="field-input" autocomplete="family-name" /></div>
      </div>
      <div style="margin-bottom:10px;"><label class="field-label" for="email">Email</label><input id="email" type="email" bind:value={email} class="field-input" autocomplete="email" /></div>
      {#if roleLabel}
        <div style="margin-bottom:16px;"><label class="field-label" for="role">Role</label><input id="role" type="text" value={roleLabel} disabled style="opacity:0.5;cursor:not-allowed;" class="field-input" /></div>
      {/if}
      <button onclick={saveProfile} disabled={saving} style="background:var(--color-gold);border:none;color:#000;padding:10px 22px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:700;cursor:pointer;">{saving ? 'Saving…' : 'Save Changes'}</button>
    </Card>
  </div>

  <Card label="Security">
    {#if passwordError}<div role="alert" style="margin-bottom:12px;padding:10px 14px;font-size:13px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{passwordError}</div>{/if}
    {#if passwordSuccess}<div style="margin-bottom:12px;padding:10px 14px;font-size:13px;color:rgba(255,255,255,0.6);border:1px solid var(--color-border);">{passwordSuccess}</div>{/if}
    <div style="margin-bottom:10px;max-width:50%;"><label class="field-label" for="currentPassword">Current Password</label><input id="currentPassword" type="password" bind:value={currentPassword} class="field-input" autocomplete="current-password" /></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;max-width:75%;">
      <div><label class="field-label" for="newPassword">New Password</label><input id="newPassword" type="password" bind:value={newPassword} class="field-input" autocomplete="new-password" /></div>
      <div><label class="field-label" for="confirmPassword">Confirm Password</label><input id="confirmPassword" type="password" bind:value={confirmPassword} class="field-input" autocomplete="new-password" /></div>
    </div>
    <button onclick={savePassword} disabled={saving} style="background:transparent;border:1px solid var(--color-gold);color:var(--color-gold);padding:10px 22px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:700;cursor:pointer;">{saving ? 'Saving…' : 'Update Password'}</button>
  </Card>
</PageShell>
