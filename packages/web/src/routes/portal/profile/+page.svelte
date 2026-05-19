<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  // Split name into first/last for UI
  const nameParts = (data.profile?.name ?? '').split(' ');
  let firstName = $state(nameParts[0] ?? '');
  let lastName = $state(nameParts.slice(1).join(' '));
  let email = $state(data.profile?.email ?? '');
  let phone = $state('');       // UI only — not in API schema yet
  let address = $state('');     // UI only — not in API schema yet

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
      await api.client.profile.update(updates);
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
      await api.client.profile.update({ currentPassword, newPassword });
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
      await api.client.profile.uploadPicture(file);
      await invalidateAll();
    } catch (err) {
      pictureError = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      uploadingPicture = false;
    }
  }
</script>

<style>
  input:focus { outline: 1px solid var(--color-gold); }
  .field-label {
    display: block;
    color: rgba(255,255,255,0.3);
    font-size: 8px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .field-input {
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: white;
    font-size: 10px;
    padding: 8px 10px;
    box-sizing: border-box;
  }
</style>

<div style="max-width:520px;">
  <!-- Header -->
  <div style="color:rgba(255,255,255,0.4);font-size:8px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">Client Portal</div>
  <div style="color:white;font-size:20px;font-family:serif;font-weight:300;letter-spacing:0.05em;margin-bottom:20px;">PROFILE</div>

  <!-- Photo + upload -->
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #2a2a2a;">
    <div style="width:56px;height:56px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.3);">
      {#if data.profile?.profilePictureUrl}
        <img src={data.profile.profilePictureUrl} alt="Profile" style="width:100%;height:100%;object-fit:cover;" />
      {:else}
        <img src="/icons/expert_stylist.png" alt="" style="width:34px;height:34px;opacity:0.85;" />
      {/if}
    </div>
    <div>
      <div style="color:white;font-size:11px;font-weight:500;margin-bottom:6px;">{data.profile?.name ?? ''}</div>
      <label style="cursor:pointer;display:inline-block;background:transparent;border:1px solid var(--color-border);color:rgba(255,255,255,0.45);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;padding:5px 12px;">
        {uploadingPicture ? 'Uploading…' : 'Upload Photo'}
        <input type="file" accept="image/*" style="display:none;" onchange={handlePictureChange} disabled={uploadingPicture} />
      </label>
      {#if pictureError}
        <div role="alert" style="color:#f87171;font-size:9px;margin-top:4px;">{pictureError}</div>
      {/if}
    </div>
  </div>

  <!-- Personal Details -->
  <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px;">Personal Details</div>

  {#if saveError}
    <div role="alert" style="margin-bottom:10px;padding:8px 12px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{saveError}</div>
  {/if}
  {#if saveSuccess}
    <div style="margin-bottom:10px;padding:8px 12px;font-size:10px;color:rgba(255,255,255,0.6);border:1px solid var(--color-border);">{saveSuccess}</div>
  {/if}

  <!-- First + Last name -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
    <div>
      <label class="field-label" for="firstName">First Name</label>
      <input id="firstName" type="text" bind:value={firstName} class="field-input" autocomplete="given-name" />
    </div>
    <div>
      <label class="field-label" for="lastName">Last Name</label>
      <input id="lastName" type="text" bind:value={lastName} class="field-input" autocomplete="family-name" />
    </div>
  </div>

  <!-- Email -->
  <div style="margin-bottom:10px;">
    <label class="field-label" for="email">Email</label>
    <input id="email" type="email" bind:value={email} class="field-input" autocomplete="email" />
  </div>

  <!-- Phone (UI only) -->
  <div style="margin-bottom:10px;">
    <label class="field-label" for="phone">Phone</label>
    <input id="phone" type="tel" bind:value={phone} class="field-input" autocomplete="tel" />
  </div>

  <!-- Address (UI only) -->
  <div style="margin-bottom:16px;">
    <label class="field-label" for="address">Address</label>
    <input id="address" type="text" bind:value={address} class="field-input" autocomplete="street-address" />
  </div>

  <button
    onclick={saveProfile}
    disabled={saving}
    style="background:var(--color-gold);border:none;color:#000;padding:9px 20px;font-size:8px;letter-spacing:0.25em;text-transform:uppercase;font-weight:600;cursor:pointer;margin-bottom:24px;"
  >
    {saving ? 'Saving…' : 'Save Changes'}
  </button>

  <!-- Change Password -->
  <div style="border-top:1px solid #2a2a2a;padding-top:20px;">
    <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px;">Change Password</div>

    {#if passwordError}
      <div role="alert" style="margin-bottom:10px;padding:8px 12px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{passwordError}</div>
    {/if}
    {#if passwordSuccess}
      <div style="margin-bottom:10px;padding:8px 12px;font-size:10px;color:rgba(255,255,255,0.6);border:1px solid var(--color-border);">{passwordSuccess}</div>
    {/if}

    <div style="margin-bottom:10px;">
      <label class="field-label" for="currentPassword">Current Password</label>
      <input id="currentPassword" type="password" bind:value={currentPassword} class="field-input" autocomplete="current-password" />
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      <div>
        <label class="field-label" for="newPassword">New Password</label>
        <input id="newPassword" type="password" bind:value={newPassword} class="field-input" autocomplete="new-password" />
      </div>
      <div>
        <label class="field-label" for="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" bind:value={confirmPassword} class="field-input" autocomplete="new-password" />
      </div>
    </div>

    <button
      onclick={savePassword}
      disabled={saving}
      style="background:transparent;border:1px solid var(--color-gold);color:var(--color-gold);padding:9px 20px;font-size:8px;letter-spacing:0.25em;text-transform:uppercase;font-weight:600;cursor:pointer;"
    >
      {saving ? 'Saving…' : 'Update Password'}
    </button>
  </div>
</div>
