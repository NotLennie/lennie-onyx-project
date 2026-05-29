<script lang="ts">
  let { image, title, cta }: {
    image: string;
    title: string;
    cta: { label: string; href: string };
  } = $props();
</script>

<a class="hero" href={cta.href}>
  <div class="bg" style="background-image: url('{image}');"></div>
  <div class="overlay"></div>
  <div class="content">
    <div class="title">{title}</div>
    <span class="btn">{cta.label}</span>
  </div>
</a>

<style>
  .hero { position: relative; overflow: hidden; min-height: 200px; padding: 28px; display: flex; flex-direction: column; justify-content: center; border: 1px solid var(--color-border); text-decoration: none; }
  .bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.55; }
  .overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.45) 60%, rgba(13,13,13,0.8) 100%); }
  .content { position: relative; z-index: 2; }
  .title { color: white; font-family: Georgia, serif; font-size: 22px; font-weight: 300; max-width: 340px; line-height: 1.3; margin-bottom: 20px; }
  .btn { display: inline-block; background: var(--color-gold); color: #000; padding: 10px 24px; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700; }
</style>
