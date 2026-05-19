<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props<{ children: Snippet }>();
</script>

<Navbar />
<main class="pt-[73px] min-h-screen flex flex-col">
  {@render children()}
</main>
<Footer />
