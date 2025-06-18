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
  export let onPassTurn = null;

  let board = createBoard();

  export let teamId; // Add teamId prop to identify which team this board belongs to

  function handleTileFlip(row, col, event) {
    const tileId = `${row}-${col}`;
    if (!flippedTiles.has(tileId) && onTileFlip) {
      onTileFlip(teamId, row, col, board[row][col], event);
    }
  }
</script>

<div class="game-board p-6 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300 {teamId === 'team1' ? 'bg-orange-400 bg-opacity-20 border-4 border-orange-500' : 'bg-purple-400 bg-opacity-20 border-4 border-purple-500'} {isActive ? 'glow-active' : 'inactive-board'}">
  <div class="text-center mb-4">
    <!-- Unified Team Header Panel -->
    <div style="background: rgba(255, 255, 255, 0.95); padding: 12px 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); border: 3px solid rgba(255,255,255,0.8); backdrop-filter: blur(10px); margin-bottom: 12px;">
      <div class="flex items-center justify-between">
        <!-- Score Display (Left) -->
        <div class="flex items-center" style="background: rgba(255, 255, 255, 0.8); padding: 6px 12px; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); border: 2px solid rgba(0,0,0,0.1);">
          <img src="/assets/coin.svg" alt="Coin" style="width: 26px; height: 26px; margin-right: 8px;" />
          <span style="font-family: 'Alfa Slab One', cursive; font-size: 34px; font-weight: bold; color: #000000; text-shadow: none; line-height: 1;">{score}</span>
        </div>

        <!-- Team Name and Status (Center) -->
        <div class="flex flex-col items-center">
          <div class="flex items-center gap-6 mb-1">
            <h2 style="font-family: 'Alfa Slab One', cursive; font-size: 26px; font-weight: bold; color: #000000; text-shadow: 0 2px 4px rgba(0,0,0,0.2); margin: 0; line-height: 1;">{teamName}</h2>
            {#if isActive && onPassTurn && !hasPassedTurn && canContinue}
              <button 
                class="pass-turn-button"
                on:click={onPassTurn}
                title="Pass Turn"
              >
                <i class="fas fa-hand-paper" style="font-size: 16px;"></i>
              </button>
            {/if}
          </div>
          <div class="flex gap-1">
            {#if hasPassedTurn}
              <div class="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold font-comic shadow-lg animate-pulse">
                <i class="fas fa-flag mr-1"></i>PASSED
              </div>
            {/if}
            {#if !canContinue && !hasPassedTurn}
              <div class="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold font-comic shadow-lg">
                <i class="fas fa-skull mr-1"></i>OUT
              </div>
            {/if}
            {#if allTilesFlipped && !hasPassedTurn && canContinue}
              <div class="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold font-comic shadow-lg">
                <i class="fas fa-check mr-1"></i>DONE
              </div>
            {/if}
            {#if multiplier > 1}
              <div class="flex items-center" style="background: rgba(255, 255, 255, 0.8); padding: 4px 8px; border-radius: 10px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); border: 2px solid #FCD34D;">
                <i class="fas fa-star" style="font-size: 14px; color: #D97706; margin-right: 3px;"></i>
                <span style="font-family: 'Alfa Slab One', cursive; font-size: 16px; font-weight: bold; color: #000000; text-shadow: none; line-height: 1;">x{multiplier}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Lives Display (Right) -->
        <div class="flex items-center" style="background: rgba(255, 255, 255, 0.8); padding: 6px 10px; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); border: 2px solid rgba(0,0,0,0.1);">
          {#each Array(4) as _, i}
            <i class="fas fa-heart" style="font-size: 26px; color: {i < lives ? '#DC2626' : '#9CA3AF'}; margin-left: {i > 0 ? '6px' : '0'};"></i>
          {/each}
        </div>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-8 gap-2 mx-auto" style="width: 614px;">
    {#each board as row, rowIndex}
      {#each row as tileData, colIndex}
        <Tile 
          {tileData}
          tileNumber={rowIndex * 8 + colIndex + 1}
          isFlipped={flippedTiles.has(`${rowIndex}-${colIndex}`)}
          onFlip={isActive ? (event) => handleTileFlip(rowIndex, colIndex, event) : null}
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
  
  /* Pass Turn button styles */
  .pass-turn-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    color: white;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    background: linear-gradient(145deg, rgba(255, 165, 0, 0.9), rgba(255, 140, 0, 0.8));
    animation: pulse-pass-button 2s ease-in-out infinite;
  }
  
  .pass-turn-button:hover {
    background: linear-gradient(145deg, rgba(255, 165, 0, 1), rgba(255, 140, 0, 0.9));
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  @keyframes pulse-pass-button {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.7);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(255, 165, 0, 0);
    }
  }
</style>