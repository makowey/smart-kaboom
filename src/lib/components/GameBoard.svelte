<script>
  import Tile from './Tile.svelte';
  import { createBoard } from '../gameLogic.js';

  export let teamName;
  export let onTileFlip;
  export let flippedTiles = new Set();
  export let score = 0;
  export let lives = 3;
  export let multiplier = 1;
  export let isActive = false;
  export let hasPassedTurn = false;
  export let canContinue = true;
  export let allTilesFlipped = false;

  let board = createBoard();

  export let teamId; // Add teamId prop to identify which team this board belongs to

  function handleTileFlip(row, col) {
    const tileId = `${row}-${col}`;
    if (!flippedTiles.has(tileId) && onTileFlip) {
      onTileFlip(teamId, row, col, board[row][col]);
    }
  }
</script>

<div class="game-board p-6 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300 {teamId === 'team1' ? 'bg-orange-400 bg-opacity-20 border-4 border-orange-500' : 'bg-purple-400 bg-opacity-20 border-4 border-purple-500'} {isActive ? 'glow-active' : 'inactive-board'}">
  <div class="text-center mb-4">
    <div class="flex items-center justify-center gap-4 mb-3">
      <h2 class="text-3xl font-bold text-white drop-shadow-lg" style="font-family: 'Alfa Slab One', cursive; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">{teamName}</h2>
      {#if hasPassedTurn}
        <div class="bg-white text-red-600 px-4 py-2 rounded-full text-lg font-bold font-comic shadow-xl border-3 border-red-600 animate-pulse">
          <i class="fas fa-flag mr-2"></i>PASSED
        </div>
      {/if}
      {#if !canContinue && !hasPassedTurn}
        <div class="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold font-comic shadow-lg border-2 border-white">
          <i class="fas fa-skull mr-1"></i>OUT
        </div>
      {/if}
      {#if allTilesFlipped && !hasPassedTurn && canContinue}
        <div class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold font-comic shadow-lg border-2 border-white">
          <i class="fas fa-check mr-1"></i>DONE
        </div>
      {/if}
    </div>
    <div class="flex justify-center items-center gap-12 text-xl mb-4">
      <!-- Score Display -->
      <div class="flex flex-col items-center">
        <div class="flex items-center bg-white bg-opacity-20 px-10 py-6 rounded-2xl backdrop-blur-sm mb-2">
          <img src="/assets/coin.svg" alt="Coin" class="w-10 h-10 mr-4 drop-shadow-md" />
          <span class="font-bold text-white drop-shadow-lg text-5xl" style="font-family: 'Alfa Slab One', cursive;">{score}</span>
        </div>
        <span class="text-white font-comic text-sm opacity-80">POINTS</span>
      </div>

      <!-- Lives Display -->
      <div class="flex flex-col items-center">
        <div class="flex items-center bg-white bg-opacity-20 px-8 py-6 rounded-2xl backdrop-blur-sm mb-2">
          {#each Array(4) as _, i}
            <i class="fas fa-heart text-3xl {i < lives ? 'text-red-400' : 'text-gray-400 opacity-30'} drop-shadow-md {i > 0 ? 'ml-4' : ''}"></i>
          {/each}
        </div>
        <span class="text-white font-comic text-sm opacity-80">LIVES</span>
      </div>

      <!-- Multiplier Display -->
      {#if multiplier > 1}
        <div class="flex flex-col items-center">
          <div class="flex items-center bg-purple-500 bg-opacity-30 px-10 py-6 rounded-2xl backdrop-blur-sm animate-pulse mb-2">
            <i class="fas fa-star mr-4 text-yellow-300 text-4xl drop-shadow-md animate-spin-slow"></i>
            <span class="font-bold text-white drop-shadow-lg text-5xl" style="font-family: 'Alfa Slab One', cursive;">x{multiplier}</span>
          </div>
          <span class="text-white font-comic text-sm opacity-80">MULTIPLIER</span>
        </div>
      {/if}
    </div>
  </div>
  <div class="grid grid-cols-8 gap-2 mx-auto" style="width: 614px;">
    {#each board as row, rowIndex}
      {#each row as tileData, colIndex}
        <Tile 
          {tileData}
          tileNumber={rowIndex * 8 + colIndex + 1}
          isFlipped={flippedTiles.has(`${rowIndex}-${colIndex}`)}
          onFlip={isActive ? () => handleTileFlip(rowIndex, colIndex) : null}
        />
      {/each}
    {/each}
  </div>
</div>

<style>
  .glow-active {
    box-shadow: 
      0 0 25px rgba(255, 255, 255, 0.8),
      0 0 50px rgba(255, 255, 255, 0.6),
      0 0 75px rgba(255, 255, 255, 0.4),
      0 0 100px rgba(255, 255, 255, 0.2),
      inset 0 0 25px rgba(255, 255, 255, 0.2);
    animation: pulse-glow 2s ease-in-out infinite alternate;
    border: 4px solid rgba(255, 255, 255, 0.8) !important;
  }
  
  @keyframes pulse-glow {
    from {
      box-shadow: 
        0 0 25px rgba(255, 255, 255, 0.8),
        0 0 50px rgba(255, 255, 255, 0.6),
        0 0 75px rgba(255, 255, 255, 0.4),
        0 0 100px rgba(255, 255, 255, 0.2),
        inset 0 0 25px rgba(255, 255, 255, 0.2);
    }
    to {
      box-shadow: 
        0 0 35px rgba(255, 255, 255, 1),
        0 0 70px rgba(255, 255, 255, 0.8),
        0 0 105px rgba(255, 255, 255, 0.6),
        0 0 140px rgba(255, 255, 255, 0.4),
        inset 0 0 35px rgba(255, 255, 255, 0.3);
    }
  }
  
  .inactive-board {
    opacity: 0.6;
    filter: grayscale(0.3) brightness(0.8);
  }
</style>