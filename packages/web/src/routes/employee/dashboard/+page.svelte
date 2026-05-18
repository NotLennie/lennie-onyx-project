<script lang="ts">
  import type { LayoutData } from '../$types';
  let { data } = $props<{ data: LayoutData }>();
</script>

<div class="p-8">
  <h1 class="text-2xl text-white font-bold">Welcome, {data.user.name}</h1>
  <p style="color: var(--color-gold)">Employee Portal — Dashboard coming in Plan 4</p>
</div>
