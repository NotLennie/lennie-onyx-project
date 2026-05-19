<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { Service } from '@project/shared';

  let { services }: { services: Service[] } = $props();

  const VISIBLE = 4;
  const AUTO_MS = 3000;

  const SERVICE_IMAGES: Record<string, string> = {
    haircut: '/images/services_haircut.png',
    custom_coloring: '/images/services_custom_coloring.png',
    treatment: '/images/services_treatment.png',
    rebond: '/images/services_rebonding.png',
    straightening: '/images/services_straightening.png',
    perming: '/images/services_perming.png',
    specialized_styling: '/images/services_specialized_styling.png',
  };

  const SERVICE_LABELS: Record<string, string> = {
    haircut: 'Haircut & Styling',
    custom_coloring: 'Custom Colouring',
    treatment: 'Hair Treatments',
    rebond: 'Hair Rebonding',
    straightening: 'Hair Straightening',
    perming: 'Perming',
    specialized_styling: 'Specialised Styling',
  };

  type CardItem = { type: string; name: string };

  const FALLBACK: CardItem[] = [
    { type: 'haircut', name: 'Haircut & Styling' },
    { type: 'custom_coloring', name: 'Custom Colouring' },
    { type: 'treatment', name: 'Hair Treatments' },
    { type: 'rebond', name: 'Hair Rebonding' },
    { type: 'straightening', name: 'Hair Straightening' },
    { type: 'perming', name: 'Perming' },
    { type: 'specialized_styling', name: 'Specialised Styling' },
  ];

  const items: CardItem[] = $derived(
    services.length > 0
      ? services.map(s => ({ type: s.type, name: SERVICE_LABELS[s.type] ?? s.name }))
      : FALLBACK
  );

  let startIndex = $state(0);
  let autoTimer: ReturnType<typeof setInterval> | null = null;

  const visibleCards = $derived(
    Array.from({ length: Math.min(VISIBLE, items.length) }, (_, i) =>
      items[(startIndex + i) % items.length]
    )
  );

  function startAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      startIndex = (startIndex + 1) % items.length;
    }, AUTO_MS);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function prev() {
    startIndex = (startIndex - 1 + items.length) % items.length;
    startAuto();
  }

  function next() {
    startIndex = (startIndex + 1) % items.length;
    startAuto();
  }

  onMount(() => {
    startAuto();
    return stopAuto;
  });
</script>

<div
  class="relative px-8"
  role="region"
  aria-label="Services carousel"
  onmouseenter={stopAuto}
  onmouseleave={startAuto}
>
  <!-- Prev arrow -->
  <button
    onclick={prev}
    class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border text-lg transition-all duration-200 hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C]"
    style="border-color: var(--color-gold); color: var(--color-gold);"
    aria-label="Previous services"
  >
    ‹
  </button>

  <!-- Cards grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#each visibleCards as card (card.type)}
      <a
        href="/#cta"
        class="relative overflow-hidden block"
        style="aspect-ratio: 3/4;"
        transition:fade={{ duration: 400 }}
      >
        <img
          src={SERVICE_IMAGES[card.type] ?? '/images/services_haircut.png'}
          alt={card.name}
          class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div
          class="absolute inset-x-0 bottom-0"
          style="height: 50%; background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, transparent 100%);"
        ></div>
        <p class="absolute bottom-4 left-0 right-0 text-center font-serif text-sm text-white px-3 z-10">
          {card.name}
        </p>
      </a>
    {/each}
  </div>

  <!-- Next arrow -->
  <button
    onclick={next}
    class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border text-lg transition-all duration-200 hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C]"
    style="border-color: var(--color-gold); color: var(--color-gold);"
    aria-label="Next services"
  >
    ›
  </button>
</div>
