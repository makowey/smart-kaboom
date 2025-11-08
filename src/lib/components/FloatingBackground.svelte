<script>
  import { onMount } from 'svelte';

  let floatingElements = [];
  let mounted = false;

  onMount(() => {
    mounted = true;
    createFloatingElements();
  });

  function createFloatingElements() {
    // Create 15 floating elements with random properties
    floatingElements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 40,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * -20,
      type: ['circle', 'star', 'square'][Math.floor(Math.random() * 3)],
      opacity: 0.1 + Math.random() * 0.15
    }));
  }
</script>

{#if mounted}
  <div class="floating-background">
    {#each floatingElements as element (element.id)}
      <div
        class="floating-element floating-{element.type}"
        style="
          left: {element.x}%;
          top: {element.y}%;
          width: {element.size}px;
          height: {element.size}px;
          animation-duration: {element.duration}s;
          animation-delay: {element.delay}s;
          opacity: {element.opacity};
        "
      ></div>
    {/each}
  </div>
{/if}

<style>
  .floating-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }

  .floating-element {
    position: absolute;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
    border-radius: 50%;
    animation: float-up linear infinite;
    backdrop-filter: blur(2px);
  }

  .floating-circle {
    border-radius: 50%;
  }

  .floating-star {
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05));
  }

  .floating-square {
    border-radius: 20%;
    transform: rotate(45deg);
    background: linear-gradient(135deg, rgba(147, 197, 253, 0.2), rgba(147, 197, 253, 0.05));
  }

  @keyframes float-up {
    0% {
      transform: translateY(100vh) rotate(0deg) scale(1);
      opacity: 0;
    }
    10% {
      opacity: var(--opacity, 0.2);
    }
    90% {
      opacity: var(--opacity, 0.2);
    }
    100% {
      transform: translateY(-100vh) rotate(360deg) scale(1.5);
      opacity: 0;
    }
  }
</style>
