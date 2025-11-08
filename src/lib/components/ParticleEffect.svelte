<script>
  import { onMount } from 'svelte';

  export let type = 'confetti'; // 'confetti', 'sparkle', 'explosion', 'burst'
  export let x = 0;
  export let y = 0;
  export let color = '#FFD700';
  export let duration = 2000;
  export let onComplete = null;

  let particles = [];
  let mounted = false;

  onMount(() => {
    mounted = true;
    createParticles();

    setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      mounted = false;
    };
  });

  function createParticles() {
    const particleCount = type === 'confetti' ? 50 : type === 'explosion' ? 30 : 20;

    particles = Array.from({ length: particleCount }, (_, i) => {
      const angle = type === 'confetti'
        ? Math.random() * Math.PI * 2
        : type === 'explosion'
        ? (i / particleCount) * Math.PI * 2
        : Math.random() * Math.PI * 2;

      const velocity = type === 'confetti'
        ? 3 + Math.random() * 5
        : type === 'explosion'
        ? 5 + Math.random() * 3
        : 2 + Math.random() * 4;

      const size = type === 'confetti'
        ? 6 + Math.random() * 8
        : type === 'explosion'
        ? 4 + Math.random() * 6
        : 3 + Math.random() * 5;

      const particleColor = type === 'confetti'
        ? ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'][Math.floor(Math.random() * 8)]
        : type === 'explosion'
        ? ['#FF4500', '#FF6347', '#FF7F50', '#FFA500', '#FFD700'][Math.floor(Math.random() * 5)]
        : color;

      return {
        id: i,
        angle,
        velocity,
        size,
        color: particleColor,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      };
    });
  }
</script>

{#if mounted}
  <div class="particle-container" style="left: {x}px; top: {y}px;">
    {#each particles as particle (particle.id)}
      <div
        class="particle particle-{type}"
        style="
          --angle: {particle.angle}rad;
          --velocity: {particle.velocity};
          --size: {particle.size}px;
          --color: {particle.color};
          --rotation: {particle.rotation}deg;
          --rotation-speed: {particle.rotationSpeed}deg;
          --duration: {duration}ms;
        "
      ></div>
    {/each}
  </div>
{/if}

<style>
  .particle-container {
    position: fixed;
    pointer-events: none;
    z-index: 70000;
    transform: translate(-50%, -50%);
  }

  .particle {
    position: absolute;
    width: var(--size);
    height: var(--size);
    background: var(--color);
    border-radius: 50%;
    opacity: 1;
    animation: particle-fly var(--duration) ease-out forwards;
  }

  .particle-confetti {
    border-radius: 4px;
    animation: confetti-fly var(--duration) ease-out forwards;
  }

  .particle-explosion {
    box-shadow: 0 0 10px var(--color);
    animation: explosion-fly var(--duration) ease-out forwards;
  }

  .particle-sparkle {
    animation: sparkle-fly var(--duration) ease-out forwards;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  }

  .particle-burst {
    animation: burst-fly var(--duration) ease-out forwards;
  }

  @keyframes confetti-fly {
    0% {
      transform:
        translate(0, 0)
        rotate(var(--rotation))
        scale(1);
      opacity: 1;
    }
    100% {
      transform:
        translate(
          calc(cos(var(--angle)) * var(--velocity) * 150px),
          calc(sin(var(--angle)) * var(--velocity) * 150px + 400px)
        )
        rotate(calc(var(--rotation) + var(--rotation-speed) * 10))
        scale(0.3);
      opacity: 0;
    }
  }

  @keyframes explosion-fly {
    0% {
      transform:
        translate(0, 0)
        scale(1);
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform:
        translate(
          calc(cos(var(--angle)) * var(--velocity) * 100px),
          calc(sin(var(--angle)) * var(--velocity) * 100px)
        )
        scale(0);
      opacity: 0;
    }
  }

  @keyframes sparkle-fly {
    0% {
      transform:
        translate(0, 0)
        rotate(0deg)
        scale(0);
      opacity: 0;
    }
    20% {
      transform:
        translate(0, 0)
        rotate(72deg)
        scale(1.5);
      opacity: 1;
    }
    100% {
      transform:
        translate(
          calc(cos(var(--angle)) * var(--velocity) * 80px),
          calc(sin(var(--angle)) * var(--velocity) * 80px)
        )
        rotate(360deg)
        scale(0);
      opacity: 0;
    }
  }

  @keyframes burst-fly {
    0% {
      transform:
        translate(0, 0)
        scale(1);
      opacity: 1;
    }
    100% {
      transform:
        translate(
          calc(cos(var(--angle)) * var(--velocity) * 120px),
          calc(sin(var(--angle)) * var(--velocity) * 120px)
        )
        scale(0);
      opacity: 0;
    }
  }

  @keyframes particle-fly {
    0% {
      transform:
        translate(0, 0)
        scale(1);
      opacity: 1;
    }
    100% {
      transform:
        translate(
          calc(cos(var(--angle)) * var(--velocity) * 100px),
          calc(sin(var(--angle)) * var(--velocity) * 100px)
        )
        scale(0);
      opacity: 0;
    }
  }
</style>
