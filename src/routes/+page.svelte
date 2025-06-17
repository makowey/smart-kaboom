<script>
  import GameBoard from '$lib/components/GameBoard.svelte';
  import Notification from '$lib/components/Notification.svelte';
  import { createGameState, processTileFlip } from '$lib/gameLogic.js';

  let gameState = createGameState();
  let notification = {
    show: false,
    message: '',
    type: 'info'
  };
  let notificationTimeout;
  let currentMessage = '';

  function handleTileFlip(team, row, col, tileData) {
    if (gameState.currentTeam !== team || gameState.gameOver) return;
    
    const previousTeam = gameState.currentTeam;
    const result = processTileFlip(gameState, team, row, col, tileData);
    
    // Show tile result message
    currentMessage = `${gameState[team].name}: ${result.message}`;
    
    // Clear message after 3 seconds, then show team change if needed
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
      // If team changed and game is not over, show team change
      if (gameState.currentTeam !== previousTeam && !gameState.gameOver && !result.continuePlay) {
        currentMessage = `${gameState[gameState.currentTeam].name}'s Turn!`;
        
        // Clear team change message after 2 seconds
        setTimeout(() => {
          currentMessage = '';
        }, 2000);
      } else {
        currentMessage = '';
      }
    }, 3000);
    
    // Trigger reactivity
    gameState = gameState;
  }

  function resetGame() {
    gameState = createGameState();
    notification.show = false;
    currentMessage = '';
  }

  $: currentTeamName = gameState[gameState.currentTeam]?.name || '';
</script>

<style>
  /* Fallback styles if Tailwind doesn't load */
  .fallback-container {
    min-height: 100vh;
    padding: 2rem;
    font-family: 'Comic Neue', cursive, sans-serif;
  }
  
  .fallback-title {
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    color: white;
    margin-bottom: 2rem;
    text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: 'Alfa Slab One', cursive !important;
  }
  
  .fallback-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  @media (min-width: 1024px) {
    .fallback-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>

<div class="min-h-screen py-8 fallback-container">
  <div class="mx-auto px-4" style="max-width: 1800px;">
    <h1 class="text-5xl font-bold text-center mb-8 text-white drop-shadow-lg fallback-title" style="font-family: 'Alfa Slab One', cursive;">Smart Kaboom</h1>
    
    {#if !gameState.gameOver}
      <div class="text-center mb-6">
        <p class="text-xl font-semibold text-white drop-shadow font-comic">Current Turn: <span class="font-bold text-white">{currentTeamName}</span></p>
      </div>
    {:else}
      <div class="text-center mb-6">
        <h2 class="text-4xl font-bold text-white drop-shadow-lg mb-4" style="font-family: 'Alfa Slab One', cursive;">Game Over!</h2>
        <p class="text-2xl font-bold drop-shadow font-comic text-white">
          {gameState.team1.score > gameState.team2.score ? '🏆 Thunder Hawks Win! 🏆' : 
           gameState.team2.score > gameState.team1.score ? '🏆 Lightning Wolves Win! 🏆' : 
           '🤝 It\'s a Tie! 🤝'}
        </p>
        <button 
          class="mt-6 px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg font-comic"
          on:click={resetGame}
        >
          <i class="fas fa-gamepad mr-2"></i>New Game
        </button>
      </div>
    {/if}

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8 fallback-grid justify-center">
      <div class="relative">
        <GameBoard 
          teamName="Thunder Hawks" 
          onTileFlip={handleTileFlip}
          flippedTiles={gameState.team1.flippedTiles}
          score={gameState.team1.score}
          lives={gameState.team1.lives}
          multiplier={gameState.team1.multiplier}
          isActive={gameState.currentTeam === 'team1' && !gameState.gameOver}
        />
        {#if gameState.currentTeam === 'team1' && !gameState.gameOver}
          <div class="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
        {/if}
      </div>
      
      <div class="relative">
        <GameBoard 
          teamName="Lightning Wolves" 
          onTileFlip={handleTileFlip}
          flippedTiles={gameState.team2.flippedTiles}
          score={gameState.team2.score}
          lives={gameState.team2.lives}
          multiplier={gameState.team2.multiplier}
          isActive={gameState.currentTeam === 'team2' && !gameState.gameOver}
        />
        {#if gameState.currentTeam === 'team2' && !gameState.gameOver}
          <div class="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Fixed message display -->
  {#if currentMessage}
    <div class="fixed top-4 right-4 bg-white px-4 py-3 rounded-lg shadow-xl border-2 border-gray-300 max-w-sm" style="z-index: 10000;">
      <p class="text-gray-800 font-bold font-comic text-sm">{currentMessage}</p>
    </div>
  {/if}
  
  <!-- Notification system -->
  <Notification 
    show={notification.show}
    message={notification.message}
    type={notification.type}
  />
</div>
