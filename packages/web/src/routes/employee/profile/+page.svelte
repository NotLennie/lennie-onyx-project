<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  let name = $state(data.profile?.name ?? '');
  let email = $state(data.profile?.email ?? '');
  let currentPassword = $state('');
  let newPassword = $state('');

  let saving = $state(false);
  let saveError = $state('');
  let saveSuccess = $state('');

  let uploadingPicture = $state(false);
  let pictureError = $state('');

  async function saveProfile() {
    saving = true;
    saveError = '';
    saveSuccess = '';
    try {
      const updates: Record<string, string> = {};
      if (name !== data.profile?.name) updates.name = name;
      if (email !== data.profile?.email) {
        updates.email = email;
        updates.currentPassword = currentPassword;
      }
      if (newPassword) {
        updates.newPassword = newPassword;
        updates.currentPassword = currentPassword;
      }
      if (Object.keys(updates).length === 0) { saveError = 'No changes to save.'; return; }
      await api.employee.profile.update(updates);
      saveSuccess = 'Profile updated.';
      currentPassword = '';
      newPassword = '';
      await invalidateAll();
    } catch (e) {
      saveError = e instanceof Error ? e.message : 'Failed to save';
    } finally {
      saving = false;
    }
  }

  async function handlePictureChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
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
</script>

<div class="max-w-lg">
  <h1 class="text-3xl font-bold text-white mb-8">Profile</h1>

  <div class="flex items-center gap-5 mb-8 p-5 rounded-xl" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
    <div class="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style="background-color: rgba(201,168,76,0.2)">
      {#if data.profile?.profilePictureUrl}
        <img src={data.profile.profilePictureUrl} alt="Profile" class="w-full h-full object-cover" />
      {:else}
        <span class="text-2xl font-bold" style="color: var(--color-gold)">{data.profile?.name?.charAt(0)?.toUpperCase() ?? '?'}</span>
      {/if}
    </div>
    <div>
      <p class="text-white font-medium">{data.profile?.name}</p>
      {#if data.profile?.isAdmin}
        <span class="text-xs px-1.5 py-0.5 rounded font-medium" style="background-color: rgba(201,168,76,0.2); color: var(--color-gold)">Admin</span>
      {/if}
      <label class="block mt-1 cursor-pointer text-sm font-medium" style="color: var(--color-gold)">
        {uploadingPicture ? 'Uploading…' : 'Change photo'}
        <input type="file" accept="image/*" class="hidden" onchange={handlePictureChange} disabled={uploadingPicture} />
      </label>
      {#if pictureError}<p class="text-xs mt-1" style="color: #ef4444">{pictureError}</p>{/if}
    </div>
  </div>

  <div class="rounded-xl p-5" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
    <h2 class="text-base font-semibold text-white mb-4">Account Details</h2>

    {#if saveError}
      <div class="mb-4 p-3 rounded-lg text-sm" style="background-color: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">{saveError}</div>
    {/if}
    {#if saveSuccess}
      <div class="mb-4 p-3 rounded-lg text-sm" style="background-color: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.3)">{saveSuccess}</div>
    {/if}

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5" for="name">Full Name</label>
        <input id="name" type="text" bind:value={name} class="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none" style="background-color: var(--color-bg); border: 1px solid var(--color-border)" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5" for="email">Email</label>
        <input id="email" type="email" bind:value={email} class="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none" style="background-color: var(--color-bg); border: 1px solid var(--color-border)" />
      </div>
      <div style="border-top: 1px solid var(--color-border); padding-top: 1rem">
        <p class="text-sm text-gray-400 mb-3">Change password — leave blank to keep current</p>
        <div class="space-y-3">
          <input type="password" bind:value={currentPassword} placeholder="Current password" class="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none" style="background-color: var(--color-bg); border: 1px solid var(--color-border)" />
          <input type="password" bind:value={newPassword} placeholder="New password (min 8 chars)" class="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none" style="background-color: var(--color-bg); border: 1px solid var(--color-border)" />
        </div>
      </div>
      <button onclick={saveProfile} disabled={saving} class="w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-50" style="background-color: var(--color-gold); color: #1a1a1a">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  </div>
</div>
