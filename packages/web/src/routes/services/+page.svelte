<script lang="ts">
  import type { PageData } from './$types';

  const SERVICE_LABELS: Record<string, string> = {
    haircut: 'Haircut',
    custom_coloring: 'Custom Colouring',
    treatment: 'Treatment',
    straightening: 'Straightening',
    rebond: 'Rebond',
    perming: 'Perming',
    specialized_styling: 'Specialised Styling',
  };

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Services — Onyx Hair Salon</title>
</svelte:head>

<section class="py-32 px-8 text-center" style="background: var(--color-bg);">
  <p class="text-xs tracking-[0.4em] uppercase mb-6" style="color: var(--color-gold);">What We Offer</p>
  <h1 class="font-serif text-5xl font-light">Our Services</h1>
</section>

<section class="py-20 px-8" style="background: var(--color-cream); color: #1a1a1a;">
  <div class="max-w-5xl mx-auto">
    {#if data.services.length === 0}
      <p class="text-center opacity-40 py-20">No services available at this time. Please check back soon.</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.services as service}
          <div class="p-8 border flex flex-col" style="border-color: rgba(26,26,26,0.12); background: white;">
            <div class="flex justify-between items-start mb-5">
              <span class="text-xs tracking-[0.15em] uppercase opacity-40">
                {SERVICE_LABELS[service.type] ?? service.type}
              </span>
              <span class="font-serif text-lg" style="color: var(--color-gold);">
                ${Number(service.price).toFixed(2)}
              </span>
            </div>
            <h3 class="font-serif text-xl mb-3">{service.name}</h3>
            {#if service.description}
              <p class="text-sm leading-relaxed opacity-55 flex-1">{service.description}</p>
            {/if}
            <p class="text-xs opacity-30 mt-5 pt-5 border-t" style="border-color: rgba(26,26,26,0.08);">
              {service.durationMinutes} min
            </p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<section class="py-24 px-8 text-center" style="background: var(--color-bg);">
  <h2 class="font-serif text-3xl font-light mb-8">Ready to Book?</h2>
  <a href="/signup"
     class="px-10 py-4 text-xs tracking-[0.25em] uppercase inline-block"
     style="background: var(--color-gold); color: #000;">
    Create an Account
  </a>
</section>
