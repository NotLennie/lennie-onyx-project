<svelte:head>
  <title>Contact — Onyx Hair Salon</title>
</svelte:head>

<section class="py-32 px-8 text-center" style="background: var(--color-bg);">
  <p class="text-xs tracking-[0.4em] uppercase mb-6" style="color: var(--color-gold);">Get in Touch</p>
  <h1 class="font-serif text-5xl font-light">Contact Us</h1>
</section>

<section class="py-20 px-8" style="background: var(--color-cream); color: #1a1a1a;">
  <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
    <div>
      <h2 class="font-serif text-2xl font-light mb-10">Visit Us</h2>
      <div class="space-y-8">
        <div>
          <p class="text-xs tracking-[0.2em] uppercase opacity-35 mb-2">Hours</p>
          <p class="text-sm">Thursday – Sunday</p>
          <p class="text-sm">7:00 AM – 7:00 PM</p>
        </div>
        <div>
          <p class="text-xs tracking-[0.2em] uppercase opacity-35 mb-2">Bookings</p>
          <p class="text-sm mb-2">All appointments are booked online through your client account.</p>
          <a href="/signup" class="text-sm border-b pb-0.5 inline-block" style="border-color: var(--color-gold); color: var(--color-gold);">
            Create an account →
          </a>
        </div>
        <div>
          <p class="text-xs tracking-[0.2em] uppercase opacity-35 mb-2">Payment</p>
          <p class="text-sm">In-person only. We accept cash and card.</p>
        </div>
      </div>
    </div>

    <div>
      <h2 class="font-serif text-2xl font-light mb-10">Send a Message</h2>
      <form class="space-y-6" onsubmit={(e) => e.preventDefault()}>
        <div>
          <label class="text-xs tracking-[0.2em] uppercase opacity-40 block mb-2" for="name">Name</label>
          <input id="name" type="text" placeholder="Your name"
                 class="w-full border px-4 py-3 text-sm outline-none bg-transparent transition-colors"
                 style="border-color: rgba(26,26,26,0.2); color: #1a1a1a;" />
        </div>
        <div>
          <label class="text-xs tracking-[0.2em] uppercase opacity-40 block mb-2" for="email">Email</label>
          <input id="email" type="email" placeholder="your@email.com"
                 class="w-full border px-4 py-3 text-sm outline-none bg-transparent transition-colors"
                 style="border-color: rgba(26,26,26,0.2); color: #1a1a1a;" />
        </div>
        <div>
          <label class="text-xs tracking-[0.2em] uppercase opacity-40 block mb-2" for="message">Message</label>
          <textarea id="message" rows="5" placeholder="How can we help?"
                    class="w-full border px-4 py-3 text-sm outline-none resize-none bg-transparent"
                    style="border-color: rgba(26,26,26,0.2); color: #1a1a1a;"></textarea>
        </div>
        <button type="submit"
                class="w-full py-4 text-xs tracking-[0.25em] uppercase"
                style="background: #1a1a1a; color: var(--color-gold);">
          Send Message
        </button>
        <p class="text-xs opacity-35 text-center">We'll get back to you as soon as possible.</p>
      </form>
    </div>
  </div>
</section>
