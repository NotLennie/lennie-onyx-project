<footer
  id="contact"
  class="pt-16 pb-8 px-8"
  style="background: var(--color-surface); border-top: 1px solid var(--color-border);"
>
  <div class="max-w-6xl mx-auto">

    <!-- Top 3-column row -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 mb-8"
      style="border-bottom: 1px solid var(--color-border);"
    >

      <!-- Left: Logo -->
      <div>
        <p class="font-serif text-2xl tracking-[0.3em] uppercase mb-1" style="color: var(--color-gold);">
          Onyx
        </p>
        <p class="text-xs tracking-widest uppercase" style="color: rgba(255,255,255,0.3);">Hair Salon</p>
      </div>

      <!-- Center: Contact info -->
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <img src="/icons/contact_us_phone.png" alt="" class="w-5 h-5 mt-0.5 shrink-0" style="opacity: 0.65;" />
          <span class="text-sm" style="color: rgba(255,255,255,0.6);">(555) 123-4567</span>
        </div>
        <div class="flex items-start gap-3">
          <img src="/icons/contact_us_email.png" alt="" class="w-5 h-5 mt-0.5 shrink-0" style="opacity: 0.65;" />
          <span class="text-sm" style="color: rgba(255,255,255,0.6);">hello@onyxhairsalon.com</span>
        </div>
        <div class="flex items-start gap-3">
          <img src="/icons/contact_us_address.png" alt="" class="w-5 h-5 mt-0.5 shrink-0" style="opacity: 0.65;" />
          <span class="text-sm" style="color: rgba(255,255,255,0.6);">123 Salon Street, City, Province</span>
        </div>
        <div class="flex items-start gap-3">
          <img src="/icons/contact_us_hours.png" alt="" class="w-5 h-5 mt-0.5 shrink-0" style="opacity: 0.65;" />
          <span class="text-sm" style="color: rgba(255,255,255,0.6);">Thursday – Sunday · 7:00 AM – 7:00 PM</span>
        </div>
      </div>

      <!-- Right: Social media -->
      <div>
        <p class="text-xs tracking-[0.2em] uppercase mb-5" style="color: rgba(255,255,255,0.4);">Follow Us</p>
        <div class="flex gap-4 flex-wrap">
          {#each [
            { href: 'https://www.facebook.com/login', src: '/icons/social_media_facebook.png', label: 'Facebook' },
            { href: 'https://www.instagram.com/accounts/login', src: '/icons/social_media_instagram.png', label: 'Instagram' },
            { href: 'https://www.tiktok.com/login', src: '/icons/social_media_tiktok.png', label: 'TikTok' },
            { href: 'https://www.youtube.com/account', src: '/icons/social_media_youtube.png', label: 'YouTube' },
            { href: 'https://www.pinterest.com/login', src: '/icons/social_media_pinterest.png', label: 'Pinterest' },
          ] as social}
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              class="opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <img src={social.src} alt={social.label} class="w-6 h-6" />
            </a>
          {/each}
        </div>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-xs" style="color: rgba(255,255,255,0.25);">
        © {new Date().getFullYear()} Onyx Hair Salon
      </p>
      <div class="flex gap-8 text-xs tracking-[0.15em] uppercase" style="color: rgba(255,255,255,0.4);">
        <a href="/#about" class="transition-colors duration-200 hover:text-white">About</a>
        <a href="/#services" class="transition-colors duration-200 hover:text-white">Services</a>
        <a href="/login" class="transition-colors duration-200 hover:text-white">Login</a>
      </div>
    </div>

  </div>
</footer>
