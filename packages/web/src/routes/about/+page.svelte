<svelte:head>
  <title>About — Onyx Hair Salon</title>
</svelte:head>

<section class="py-32 px-8 text-center" style="background: var(--color-bg);">
  <p class="text-xs tracking-[0.4em] uppercase mb-6" style="color: var(--color-gold);">About Us</p>
  <h1 class="font-serif text-5xl font-light">Our Story</h1>
</section>

<section class="py-20 px-8" style="background: var(--color-cream); color: #1a1a1a;">
  <div class="max-w-3xl mx-auto">
    <p class="font-serif text-2xl font-light leading-relaxed mb-8">
      Onyx Hair Salon was born out of a passion for the artistry of hair and the power it holds to transform how we feel.
    </p>
    <p class="text-sm leading-relaxed opacity-60 mb-6">
      Founded by a collective of dedicated stylists with years of experience across colour, texture, and styling, Onyx is a space built for intentional beauty — where every appointment is designed to be as enjoyable as the result.
    </p>
    <p class="text-sm leading-relaxed opacity-60 mb-6">
      We believe that great hair care starts with great listening. Every client is unique, and every service we provide is tailored to reflect that.
    </p>
    <p class="text-sm leading-relaxed opacity-60">
      We are open Thursday through Sunday, 7 AM to 7 PM, offering 30-minute booking slots.
    </p>
  </div>
</section>

<section class="py-24 px-8" style="background: var(--color-bg);">
  <div class="max-w-5xl mx-auto">
    <p class="text-xs tracking-[0.4em] uppercase text-center mb-16" style="color: var(--color-gold);">What We Stand For</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
      {#each [
        { title: 'Craft', body: 'Every cut, colour, and treatment is executed with precision and care.' },
        { title: 'Intention', body: 'We take time to understand what you need — no rushing, no guessing.' },
        { title: 'Luxury', body: 'A premium experience from the moment you arrive to the moment you leave.' },
      ] as value}
        <div>
          <div class="w-8 h-px mx-auto mb-6" style="background: var(--color-gold);"></div>
          <h3 class="font-serif text-xl mb-4">{value.title}</h3>
          <p class="text-sm text-white/40 leading-relaxed">{value.body}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="py-20 px-8 text-center" style="background: var(--color-surface);">
  <h2 class="font-serif text-3xl font-light mb-8">Ready to Experience Onyx?</h2>
  <a href="/services"
     class="px-10 py-4 text-xs tracking-[0.25em] uppercase inline-block"
     style="background: var(--color-gold); color: #000;">
    View Our Services
  </a>
</section>
