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

  let board = createBoard();

  function handleTileFlip(row, col) {
    const tileId = `${row}-${col}`;
    if (!flippedTiles.has(tileId) && onTileFlip) {
      onTileFlip(teamName === 'Thunder Hawks' ? 'team1' : 'team2', row, col, board[row][col]);
    }
  }
</script>

<div class="game-board p-4 bg-white bg-opacity-90 rounded-xl shadow-2xl backdrop-blur-sm transition-all duration-300 {isActive ? 'border-4 border-yellow-400 shadow-yellow-400/50 glow-active' : 'border-4 border-transparent'}">
  <div class="text-center mb-4">
    <h2 class="text-2xl font-bold mb-2 {teamName === 'Thunder Hawks' ? 'text-orange-600' : 'text-purple-600'}" style="font-family: 'Alfa Slab One', cursive;">{teamName}</h2>
    <div class="flex justify-center items-center gap-4 text-sm">
      <div class="flex items-center">
        <i class="fas fa-coins mr-1 text-yellow-600"></i>
        <span class="font-bold font-comic {teamName === 'Thunder Hawks' ? 'text-orange-600' : 'text-purple-600'}">{score}</span>
      </div>
      <div class="flex items-center">
        <i class="fas fa-heart mr-1 text-red-500"></i>
        <span class="font-bold font-comic {teamName === 'Thunder Hawks' ? 'text-orange-600' : 'text-purple-600'}">{lives}</span>
      </div>
      {#if multiplier > 1}
        <div class="flex items-center">
          <i class="fas fa-star mr-1 text-purple-600"></i>
          <span class="font-bold font-comic {teamName === 'Thunder Hawks' ? 'text-orange-600' : 'text-purple-600'}">x{multiplier}</span>
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
      0 0 20px rgba(255, 255, 255, 0.6),
      0 0 40px rgba(255, 255, 255, 0.4),
      0 0 60px rgba(255, 255, 255, 0.2),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
    animation: pulse-glow 2s ease-in-out infinite alternate;
  }
  
  @keyframes pulse-glow {
    from {
      box-shadow: 
        0 0 20px rgba(255, 255, 255, 0.6),
        0 0 40px rgba(255, 255, 255, 0.4),
        0 0 60px rgba(255, 255, 255, 0.2),
        inset 0 0 20px rgba(255, 255, 255, 0.1);
    }
    to {
      box-shadow: 
        0 0 30px rgba(255, 255, 255, 0.8),
        0 0 60px rgba(255, 255, 255, 0.6),
        0 0 90px rgba(255, 255, 255, 0.4),
        inset 0 0 30px rgba(255, 255, 255, 0.2);
    }
  }
</style>