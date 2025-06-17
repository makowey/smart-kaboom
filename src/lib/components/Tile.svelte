<script>
  export let tileData;
  export let isFlipped = false;
  export let onFlip;
  export let tileNumber;

  let isRevealing = false;

  function handleClick() {
    if (!isFlipped && !isRevealing && onFlip) {
      isRevealing = true;
      setTimeout(() => {
        onFlip();
        isRevealing = false;
      }, 1500);
    }
  }

  function getTileColor(type) {
    switch (type) {
      case 'points': return 'bg-gradient-to-br from-green-500 to-green-700 border-green-800';
      case 'bomb': return 'bg-gradient-to-br from-red-500 to-red-700 border-red-800';
      case 'life': return 'bg-gradient-to-br from-pink-500 to-pink-700 border-pink-800';
      case 'multiplier': return 'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-800';
      case 'try_again': return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-700';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-700 border-gray-800';
    }
  }
</script>

<div 
  class="tile relative perspective-1000 {isFlipped || isRevealing || !onFlip ? 'pointer-events-none' : 'cursor-pointer'}"
  style="width: 75px; height: 75px;"
  on:click={handleClick}
  role="button"
  tabindex="{isFlipped || isRevealing || !onFlip ? -1 : 0}"
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
  {#if !isFlipped && !isRevealing}
    <!-- Front face (unflipped) -->
    <div class="tile-face-front absolute inset-0 flex items-center justify-center transition-all duration-300 hover:scale-105">
      <span class="text-slate-700 font-bold font-comic z-10" style="font-size: 48px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">{tileNumber}</span>
    </div>
  {:else if isRevealing}
    <!-- Revealing animation -->
    <div class="tile-face-front absolute inset-0 flex items-center justify-center spinning-tile">
      <span class="text-slate-700 font-bold font-comic z-10" style="font-size: 48px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">{tileNumber}</span>
    </div>
  {:else}
    <!-- Back face (flipped) -->
    <div class="tile-face-back absolute inset-0 flex flex-col items-center justify-center {getTileColor(tileData.type)} transition-all duration-300">
      {#if tileData.type === 'points'}
        <div class="relative w-12 h-12 flex items-center justify-center">
          <img src="/assets/coin.svg" alt="Coin" class="w-full h-full drop-shadow-lg" />
          <span class="absolute text-white font-bold font-comic" style="color: white !important; font-size: 36px; text-shadow: 0 2px 4px rgba(0,0,0,0.9);">{tileData.value}</span>
        </div>
      {:else if tileData.type === 'bomb'}
        <div class="flex flex-col items-center justify-center h-full">
          <img src="/assets/bomb.svg" alt="Bomb" class="w-4 h-4 drop-shadow-lg bomb-reveal" style="max-width: 16px; max-height: 16px;" />
          <span class="font-bold text-xs font-comic mt-1" style="color: #e5e7eb !important;">BOMB!</span>
        </div>
      {:else if tileData.type === 'life'}
        <i class="fas fa-heart text-3xl drop-shadow-lg animate-pulse" style="color: #e5e7eb !important;"></i>
        <span class="font-bold text-xs font-comic mt-1" style="color: #e5e7eb !important;">+LIFE</span>
      {:else if tileData.type === 'multiplier'}
        <i class="fas fa-star text-2xl mb-1 drop-shadow-lg animate-spin-slow" style="color: #e5e7eb !important;"></i>
        <span class="font-bold text-lg font-comic drop-shadow-lg" style="color: #e5e7eb !important;">x2</span>
      {:else if tileData.type === 'try_again'}
        <div class="relative w-12 h-12 flex items-center justify-center">
          <img src="/assets/coin.svg" alt="Coin" class="w-full h-full drop-shadow-lg" />
          <span class="absolute text-white font-bold font-comic" style="color: white !important; font-size: 36px; text-shadow: 0 2px 4px rgba(0,0,0,0.9);">{tileData.value}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>


<style>
  .tile {
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  .tile.cursor-pointer:hover {
    transform: translateY(-2px);
  }
  
  .tile.cursor-pointer:active {
    transform: translateY(1px) scale(0.98);
  }
  
  /* Front face with SVG background */
  .tile-face-front {
    width: 75px;
    height: 75px;
    background-image: url('/assets/tile.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
  
  /* Back face styling */
  .tile-face-back {
    width: 75px;
    height: 75px;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      inset 0 2px 4px rgba(255, 255, 255, 0.2),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2),
      0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  .spinning-tile {
    animation: tile-spin 1.5s linear;
  }
  
  @keyframes tile-spin {
    0% { 
      transform: rotate(0deg) scale(1);
      filter: brightness(1);
    }
    100% { 
      transform: rotate(1800deg) scale(1.1);
      filter: brightness(1.3);
    }
  }
  
  .bomb-reveal {
    animation: bomb-grow 2s ease-out;
  }
  
  @keyframes bomb-grow {
    0% { 
      max-width: 40px;
      max-height: 40px;
      transform: scale(2.5);
      filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.8));
    }
    50% { 
      max-width: 32px;
      max-height: 32px;
      transform: scale(2);
      filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.6));
    }
    100% { 
      max-width: 16px;
      max-height: 16px;
      transform: scale(1);
      filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
    }
  }
</style>