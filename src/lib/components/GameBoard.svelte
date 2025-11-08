<script>
  import Tile from './Tile.svelte';
  import { createBoard } from '../gameLogic.js';
  import { onMount } from 'svelte';

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
  export let isWinner = false;
  export let winCondition = 501;

  $: progressPercentage = Math.min((score / winCondition) * 100, 100);

  let board = createBoard();
  let mounted = false;
  let displayScore = 0;
  let previousScore = 0;
  let animatingScore = false;

  export let teamId; // Add teamId prop to identify which team this board belongs to

  onMount(() => {
    setTimeout(() => {
      mounted = true;
    }, teamId === 'team1' ? 100 : 300);
  });

  // Animate score changes
  $: if (score !== previousScore) {
    animateScore(previousScore, score);
    previousScore = score;
  }

  function animateScore(from, to) {
    animatingScore = true;
    const duration = 800;
    const steps = 30;
    const increment = (to - from) / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        displayScore = to;
        animatingScore = false;
        clearInterval(interval);
      } else {
        displayScore = Math.round(from + increment * currentStep);
      }
    }, stepDuration);
  }

  function handleTileFlip(row, col, event) {
    const tileId = `${row}-${col}`;
    if (!flippedTiles.has(tileId) && onTileFlip) {
      onTileFlip(teamId, row, col, board[row][col], event);
    }
  }
</script>

<div class="game-board p-6 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300 {teamId === 'team1' ? 'bg-orange-400 bg-opacity-20 border-4 border-orange-500' : 'bg-purple-400 bg-opacity-20 border-4 border-purple-500'} {isWinner ? 'glow-winner' : isActive ? 'glow-active' : 'inactive-board'} {mounted ? 'board-enter' : 'board-hidden'}">
  <div class="text-center mb-4">
    <!-- Unified Team Header Panel -->
    <div style="background: rgba(255, 255, 255, 0.95); padding: 12px 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); border: 3px solid rgba(255,255,255,0.8); backdrop-filter: blur(10px); margin-bottom: 12px;">
      <div class="flex items-center justify-between">
        <!-- Score Display (Left) -->
        <div class="flex items-center score-container {animatingScore ? 'score-pulse' : ''}" style="background: rgba(255, 255, 255, 0.8); padding: 6px 12px; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); border: 2px solid rgba(0,0,0,0.1);">
          <img src="/assets/coin.svg" alt="Coin" style="width: 26px; height: 26px; margin-right: 8px;" />
          <span style="font-family: 'Alfa Slab One', cursive; font-size: 34px; font-weight: bold; color: #000000; text-shadow: none; line-height: 1;">{displayScore}</span>
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
                style="margin-left: 24px;"
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
      
      <!-- Progress Bar -->
      <div class="progress-bar-container" style="margin-top: 8px;">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: {progressPercentage}%"></div>
          <div class="progress-bar-text">
            {score} / {winCondition}
          </div>
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
  
  .glow-winner {
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 1),
      0 0 60px rgba(255, 215, 0, 0.8),
      0 0 90px rgba(255, 215, 0, 0.6),
      0 0 120px rgba(255, 215, 0, 0.4),
      inset 0 0 30px rgba(255, 215, 0, 0.3);
    animation: pulse-winner 1.5s ease-in-out infinite alternate;
    border: 4px solid rgba(255, 215, 0, 1) !important;
    transform: scale(1.02);
  }
  
  @keyframes pulse-winner {
    from {
      box-shadow: 
        0 0 30px rgba(255, 215, 0, 1),
        0 0 60px rgba(255, 215, 0, 0.8),
        0 0 90px rgba(255, 215, 0, 0.6),
        0 0 120px rgba(255, 215, 0, 0.4),
        inset 0 0 30px rgba(255, 215, 0, 0.3);
    }
    to {
      box-shadow: 
        0 0 40px rgba(255, 215, 0, 1),
        0 0 80px rgba(255, 215, 0, 1),
        0 0 120px rgba(255, 215, 0, 0.8),
        0 0 160px rgba(255, 215, 0, 0.6),
        inset 0 0 40px rgba(255, 215, 0, 0.4);
    }
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
  
  /* Progress Bar Styles */
  .progress-bar-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .progress-bar-bg {
    position: relative;
    width: 100%;
    height: 24px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  .progress-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7);
    border-radius: 10px;
    transition: width 0.8s ease-out;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }
  
  .progress-bar-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    border-radius: 10px;
    animation: shimmer 2s infinite;
  }
  
  .progress-bar-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Alfa Slab One', cursive;
    font-size: 12px;
    font-weight: bold;
    color: #000;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    z-index: 2;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* Board entrance animation */
  .board-hidden {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }

  .board-enter {
    animation: board-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes board-entrance {
    0% {
      opacity: 0;
      transform: translateY(50px) scale(0.9);
    }
    60% {
      transform: translateY(-10px) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Score animation */
  .score-container {
    transition: all 0.3s ease;
  }

  .score-pulse {
    animation: score-pulse-animation 0.5s ease-out;
  }

  @keyframes score-pulse-animation {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
      box-shadow:
        inset 0 2px 4px rgba(0,0,0,0.1),
        0 0 20px rgba(255, 215, 0, 0.6);
    }
    100% {
      transform: scale(1);
    }
  }
</style>