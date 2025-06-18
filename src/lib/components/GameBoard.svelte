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
    <div class="flex justify-center items-center gap-20 mb-8">
      <!-- Score Display -->
      <div class="flex items-center bg-white px-16 py-10 rounded-3xl shadow-2xl border-4 border-gray-200">
        <img src="/assets/coin.svg" alt="Coin" class="w-16 h-16 mr-8 drop-shadow-md" />
        <span class="font-bold text-black text-6xl" style="font-family: 'Alfa Slab One', cursive; text-shadow: none;">{score}</span>
      </div>

      <!-- Lives Display -->
      <div class="flex items-center bg-white px-14 py-10 rounded-3xl shadow-2xl border-4 border-gray-200">
        {#each Array(4) as _, i}
          <i class="fas fa-heart text-5xl {i < lives ? 'text-red-600' : 'text-gray-400'} {i > 0 ? 'ml-6' : ''}"></i>
        {/each}
      </div>

      <!-- Multiplier Display -->
      {#if multiplier > 1}
        <div class="flex items-center bg-white px-16 py-10 rounded-3xl shadow-2xl border-4 border-yellow-300">
          <i class="fas fa-star mr-8 text-yellow-600 text-6xl animate-spin-slow"></i>
          <span class="font-bold text-black text-6xl" style="font-family: 'Alfa Slab One', cursive; text-shadow: none;">x{multiplier}</span>
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