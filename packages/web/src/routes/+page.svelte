<svelte:head>
  <title>Onyx Hair Salon</title>
</svelte:head>

<!-- Hero -->
<section class="flex flex-col items-center justify-center text-center px-8 py-36" style="background: var(--color-bg);">
  <p class="text-xs tracking-[0.4em] uppercase mb-6" style="color: var(--color-gold);">Luxury Hair Salon</p>
  <h1 class="font-serif text-5xl md:text-7xl font-light leading-tight mb-8">
    Where Beauty<br />Meets Craft
  </h1>
  <p class="text-white/50 max-w-md mb-12 leading-relaxed text-sm">
    Expert stylists. Premium treatments. A sanctuary of style open Thursday through Sunday.
  </p>
  <div class="flex flex-col sm:flex-row gap-4">
    <a href="/signup"
       class="px-10 py-4 text-xs tracking-[0.25em] uppercase transition-all duration-200"
       style="background: var(--color-gold); color: #000;">
      Book Now
    </a>
    <a href="/services"
       class="px-10 py-4 text-xs tracking-[0.25em] uppercase border transition-all duration-200 hover:bg-[#C9A84C] hover:text-black"
       style="border-color: var(--color-gold); color: var(--color-gold);">
      Our Services
    </a>
  </div>
</section>

<!-- Features strip -->
<section class="py-20 px-8" style="background: var(--color-surface);">
  <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
    {#each [
      { label: 'Expert Stylists', desc: 'Our team specialises in cuts, colour, and transformative treatments tailored to you.' },
      { label: 'Premium Products', desc: 'We use only salon-grade products for lasting, healthy, beautiful results.' },
      { label: 'Thu – Sun', desc: 'Open Thursday to Sunday, 7 AM to 7 PM, with 30-minute booking slots.' },
    ] as feature}
      <div>
        <div class="w-8 h-px mx-auto mb-6" style="background: var(--color-gold);"></div>
        <h3 class="text-xs tracking-[0.2em] uppercase mb-3" style="color: var(--color-gold);">{feature.label}</h3>
        <p class="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
      </div>
    {/each}
  </div>
</section>

<!-- About preview -->
<section class="py-28 px-8 text-center" style="background: var(--color-bg);">
  <p class="text-xs tracking-[0.4em] uppercase mb-4" style="color: var(--color-gold);">Our Story</p>
  <h2 class="font-serif text-4xl font-light mb-6">Crafted with Intention</h2>
  <p class="text-white/40 max-w-2xl mx-auto leading-relaxed text-sm mb-10">
    Onyx was founded on the belief that exceptional hair care should feel like a ritual — unhurried, intentional, and deeply personal.
  </p>
  <a href="/about"
     class="text-xs tracking-[0.25em] uppercase border-b pb-0.5"
     style="border-color: var(--color-gold); color: var(--color-gold);">
    Learn More
  </a>
</section>

<!-- Services preview -->
<section class="py-28 px-8" style="background: var(--color-cream); color: #1a1a1a;">
  <div class="max-w-5xl mx-auto">
    <p class="text-xs tracking-[0.4em] uppercase mb-4 text-center" style="color: var(--color-gold);">What We Offer</p>
    <h2 class="font-serif text-4xl font-light mb-16 text-center">Our Signature Services</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
      {#each [
        { name: 'Haircut & Styling', desc: 'Precision cuts tailored to your face shape and lifestyle.' },
        { name: 'Custom Colouring', desc: 'Bespoke colour work from subtle highlights to bold transformations.' },
        { name: 'Treatments', desc: 'Restorative treatments to nourish, strengthen, and revive.' },
      ] as svc}
        <div class="p-8 border" style="border-color: rgba(26,26,26,0.12);">
          <div class="w-6 h-px mb-6" style="background: var(--color-gold);"></div>
          <h3 class="font-serif text-lg mb-3">{svc.name}</h3>
          <p class="text-sm leading-relaxed opacity-50">{svc.desc}</p>
        </div>
      {/each}
    </div>
    <div class="text-center">
      <a href="/services"
         class="px-10 py-4 text-xs tracking-[0.25em] uppercase inline-block"
         style="background: #1a1a1a; color: var(--color-gold);">
        View All Services
      </a>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-28 px-8 text-center" style="background: var(--color-bg);">
  <p class="text-xs tracking-[0.4em] uppercase mb-6" style="color: var(--color-gold);">Ready to Transform?</p>
  <h2 class="font-serif text-4xl font-light mb-10">Book Your Appointment</h2>
  <a href="/signup"
     class="px-12 py-4 text-xs tracking-[0.25em] uppercase inline-block transition-all"
     style="background: var(--color-gold); color: #000;">
    Get Started
  </a>
</section>
