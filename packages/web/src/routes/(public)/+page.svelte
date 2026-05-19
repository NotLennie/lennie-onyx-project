<script lang="ts">
  import type { PageData } from './$types';
  import ServiceCarousel from '$lib/components/ServiceCarousel.svelte';

  let { data }: { data: PageData } = $props();

  const features = [
    { icon: '/icons/premium.png', label: 'Premium Products', desc: 'We use only salon-grade products for lasting, healthy results.' },
    { icon: '/icons/expert_stylist.png', label: 'Expert Stylist', desc: 'Precision and artistry from stylists trained in the latest techniques.' },
    { icon: '/icons/luxurious_experience.png', label: 'Luxurious Experience', desc: 'Every visit is designed to feel like a retreat, not just a service.' },
    { icon: '/icons/customer_satisfaction.png', label: 'Customer Satisfaction', desc: "Your happiness is our standard — we don't stop until you love it." },
    { icon: '/icons/easy_booking.png', label: 'Easy Booking', desc: 'Book online in minutes, anytime, with 30-minute appointment slots.' },
  ];
</script>

<svelte:head>
  <title>Onyx Hair Salon</title>
</svelte:head>

<!-- Hero -->
<section
  id="hero"
  class="relative flex items-center"
  style="
    min-height: 90vh;
    background-image: url('/images/header.png');
    background-size: cover;
    background-position: center 20%;
  "
>
  <div class="absolute inset-0" style="background: rgba(0,0,0,0.62);"></div>
  <div class="relative z-10 px-8 md:px-20 max-w-3xl text-center md:ml-28">
    <p class="text-xs tracking-[0.4em] uppercase mb-6" style="color: var(--color-gold);">
      Luxury Hair Salon
    </p>
    <h1 class="font-serif text-5xl md:text-7xl font-light leading-tight mb-8 text-white">
      WHERE STYLE<br />
      <span class="font-script" style="color: var(--color-gold); font-size: 1.15em;">Meets</span><br />
      EXCELLENCE
    </h1>
    <p class="text-sm leading-relaxed mb-12 mx-auto" style="color: rgba(255,255,255,0.6); max-width: 28rem;">
      Experience premium hair care services in a luxurious and relaxing environment tailored just for you.
    </p>
    <a
      href="/signup"
      class="inline-block px-10 py-4 text-xs tracking-[0.25em] uppercase transition-opacity duration-200 hover:opacity-85"
      style="background: var(--color-gold); color: #000;"
    >
      Book Appointment
    </a>
  </div>
</section>

<!-- Features Strip -->
<section id="features" class="py-24 px-8" style="background: var(--color-cream);">
  <div class="max-w-6xl mx-auto text-center">
    <!-- Row 1: first 3 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-16">
      {#each features.slice(0, 3) as f}
        <div class="flex flex-col items-center px-4">
          <img src={f.icon} alt={f.label} class="w-12 h-12 mb-6 object-contain" />
          <h3 class="text-sm tracking-[0.15em] uppercase font-semibold mb-3" style="color: #1a1a1a;">{f.label}</h3>
          <p class="text-sm leading-relaxed" style="color: rgba(26,26,26,0.55);">{f.desc}</p>
        </div>
      {/each}
    </div>
    <!-- Row 2: last 2, centered -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-2xl mx-auto">
      {#each features.slice(3) as f}
        <div class="flex flex-col items-center px-4">
          <img src={f.icon} alt={f.label} class="w-12 h-12 mb-6 object-contain" />
          <h3 class="text-sm tracking-[0.15em] uppercase font-semibold mb-3" style="color: #1a1a1a;">{f.label}</h3>
          <p class="text-sm leading-relaxed" style="color: rgba(26,26,26,0.55);">{f.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- About -->
<section id="about" class="grid grid-cols-1 md:grid-cols-2" style="min-height: 70vh;">
  <div class="relative overflow-hidden" style="min-height: 50vh;">
    <img
      src="/images/about_us.png"
      alt="Inside Onyx Hair Salon"
      class="absolute inset-0 w-full h-full object-cover"
    />
  </div>
  <div
    class="flex flex-col justify-center px-12 py-20"
    style="background: var(--color-bg);"
  >
    <p class="text-xs tracking-[0.4em] uppercase mb-4" style="color: var(--color-gold);">About Us</p>
    <h2 class="font-serif text-3xl md:text-4xl font-light leading-snug mb-8 text-white">
      PASSION FOR HAIR,<br />DEDICATION TO YOU
    </h2>
    <p class="text-sm leading-relaxed mb-4" style="color: rgba(255,255,255,0.5);">
      At Onyx Hair Salon, we believe that hair is your most natural accessory. Our team of experienced
      stylists is committed to enhancing your natural beauty with services tailored just for you.
    </p>
    <p class="text-sm leading-relaxed mb-4" style="color: rgba(255,255,255,0.5);">
      With a commitment to using only the finest products and techniques, we ensure that every visit
      leaves you feeling confident and beautiful.
    </p>
    <p class="text-sm leading-relaxed" style="color: rgba(255,255,255,0.5);">
      Open Thursday through Tuesday, 7 AM to 7 PM — because great hair deserves great timing.
    </p>
  </div>
</section>

<!-- Services Carousel -->
<section id="services" class="py-24 px-12" style="background: var(--color-surface);">
  <div class="max-w-6xl mx-auto">
    <p class="text-xs tracking-[0.4em] uppercase mb-3 text-center" style="color: var(--color-gold);">
      Our Services
    </p>
    <h2 class="font-serif text-3xl md:text-4xl font-light mb-16 text-center text-white">
      BEAUTY TAILORED JUST FOR YOU
    </h2>
    <ServiceCarousel services={data.services} />
  </div>
</section>

<!-- CTA -->
<section
  id="cta"
  class="relative flex items-center justify-center text-center py-40 px-8"
  style="
    background-image: url('/images/extra_background.png');
    background-size: cover;
    background-position: center;
  "
>
  <div class="absolute inset-0" style="background: rgba(0,0,0,0.68);"></div>
  <div class="relative z-10">
    <p class="text-xs tracking-[0.4em] uppercase mb-6" style="color: var(--color-gold);">
      Ready to Transform?
    </p>
    <h2 class="font-serif text-4xl md:text-5xl font-light text-white mb-10">
      READY FOR A NEW LOOK?
    </h2>
    <a
      href="/signup"
      class="inline-block px-12 py-4 text-xs tracking-[0.25em] uppercase transition-opacity duration-200 hover:opacity-85"
      style="background: var(--color-gold); color: #000;"
    >
      Book Appointment
    </a>
  </div>
</section>
