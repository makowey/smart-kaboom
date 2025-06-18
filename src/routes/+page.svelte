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
  let showLegend = false;
  let showSettings = false;
  let flyingCoins = [];
  let flyingHearts = [];
  let settings = {
    team1Name: 'Thunder Hawks',
    team2Name: 'Lightning Wolves',
    winCondition: 501,
    minTries: 1,
    maxTries: 3
  };

  // Load settings from localStorage on component initialization
  function loadSettings() {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('smartKaboomSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          settings = { ...settings, ...parsed };
        }
      } catch (error) {
        console.warn('Failed to load settings from localStorage:', error);
      }
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('smartKaboomSettings', JSON.stringify(settings));
      } catch (error) {
        console.warn('Failed to save settings to localStorage:', error);
      }
    }
  }

  // Initialize settings on component mount
  loadSettings();
  
  // Apply loaded settings to game state and global settings
  gameState.team1.name = settings.team1Name;
  gameState.team2.name = settings.team2Name;
  globalThis.gameSettings = { 
    winCondition: settings.winCondition,
    minTries: settings.minTries,
    maxTries: settings.maxTries
  };

  function createFlyingCoin(points, teamName, tilePosition) {
    const coinId = Date.now() + Math.random();
    
    // Get the position of the clicked tile
    let startX = '50%', startY = '50%';
    if (tilePosition) {
      startX = tilePosition.x + 'px';
      startY = tilePosition.y + 'px';
    }
    
    const coin = {
      id: coinId,
      points: points,
      team: teamName,
      isTeam1: teamName === gameState.team1.name,
      startX: startX,
      startY: startY
    };
    
    flyingCoins = [...flyingCoins, coin];
    
    // Remove coin after animation completes
    setTimeout(() => {
      flyingCoins = flyingCoins.filter(c => c.id !== coinId);
    }, 2000);
  }

  function createFlyingHeart(teamName, tilePosition) {
    const heartId = Date.now() + Math.random();
    
    // Get the position of the clicked tile
    let startX = '50%', startY = '50%';
    if (tilePosition) {
      startX = tilePosition.x + 'px';
      startY = tilePosition.y + 'px';
    }
    
    const heart = {
      id: heartId,
      team: teamName,
      isTeam1: teamName === gameState.team1.name,
      startX: startX,
      startY: startY
    };
    
    flyingHearts = [...flyingHearts, heart];
    
    // Remove heart after animation completes
    setTimeout(() => {
      flyingHearts = flyingHearts.filter(h => h.id !== heartId);
    }, 2000);
  }

  function toggleLegend() {
    showLegend = !showLegend;
  }

  function toggleSettings() {
    showSettings = !showSettings;
  }

  function applySettings() {
    // Update team names in game state
    gameState.team1.name = settings.team1Name;
    gameState.team2.name = settings.team2Name;
    
    // Store settings globally for game logic to access
    globalThis.gameSettings = { 
      winCondition: settings.winCondition,
      minTries: settings.minTries,
      maxTries: settings.maxTries
    };
    
    // Save settings to localStorage
    saveSettings();
    
    showSettings = false;
    gameState = gameState; // Trigger reactivity
  }

  function resetSettings() {
    settings = {
      team1Name: 'Thunder Hawks',
      team2Name: 'Lightning Wolves',
      winCondition: 501,
      minTries: 1,
      maxTries: 3
    };
  }

  function handleTileFlip(team, row, col, tileData, event) {
    if (gameState.currentTeam !== team || gameState.gameOver) return;
    
    const previousTeam = gameState.currentTeam;
    const result = processTileFlip(gameState, team, row, col, tileData);
    
    // Get the tile position from the event
    const tilePosition = event?.tilePosition;
    
    // Create flying coin effect for points
    if (tileData.type === 'points' || tileData.type === 'try_again') {
      const actualPoints = tileData.type === 'points' 
        ? tileData.value * gameState[team].multiplier 
        : tileData.value;
      createFlyingCoin(actualPoints, gameState[team].name, tilePosition);
    }
    
    // Create flying heart effect for life gained (only if actually gained)
    if (tileData.type === 'life' && result.message.includes('Extra life gained!')) {
      createFlyingHeart(gameState[team].name, tilePosition);
    }
    
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
    // Apply current settings to new game
    gameState.team1.name = settings.team1Name;
    gameState.team2.name = settings.team2Name;
    
    // Ensure global settings are set for new game
    globalThis.gameSettings = { 
      winCondition: settings.winCondition,
      minTries: settings.minTries,
      maxTries: settings.maxTries
    };
    
    notification.show = false;
    currentMessage = '';
    clearTimeout(notificationTimeout);
  }

  function passTurn() {
    if (gameState.gameOver) return;
    
    const currentTeamData = gameState[gameState.currentTeam];
    const otherTeam = gameState.currentTeam === 'team1' ? 'team2' : 'team1';
    const otherTeamData = gameState[otherTeam];
    
    // If team hasn't flipped any tiles this turn, they pass permanently
    if (currentTeamData.tilesFlippedThisTurn === 0) {
      currentTeamData.hasPassedTurn = true;
      currentMessage = `${currentTeamData.name} passed and won't get another turn!`;
    } else {
      currentMessage = `${currentTeamData.name} passed their turn!`;
    }
    
    // Check if both teams have passed or finished
    if ((gameState.team1.hasPassedTurn || gameState.team1.allTilesFlipped) && 
        (gameState.team2.hasPassedTurn || gameState.team2.allTilesFlipped)) {
      gameState.gameOver = true;
      // Determine winner by highest score
      if (gameState.team1.score > gameState.team2.score) {
        gameState.winner = 'team1';
      } else if (gameState.team2.score > gameState.team1.score) {
        gameState.winner = 'team2';
      }
      // If scores are equal, winner remains null (tie)
      currentMessage = `Both teams are done! Game Over!`;
    } else {
      // Switch to next available team
      let nextTeam = otherTeam;
      
      // If the other team has passed permanently or finished all tiles, 
      // check if current team can continue
      if (gameState[otherTeam].hasPassedTurn || gameState[otherTeam].allTilesFlipped) {
        // Current team can only continue if they haven't passed permanently
        if (!currentTeamData.hasPassedTurn && !currentTeamData.allTilesFlipped) {
          nextTeam = gameState.currentTeam;
          currentMessage += ` Continuing turn...`;
        } else {
          // Both teams are done
          gameState.gameOver = true;
          currentMessage = `Game Over!`;
        }
      }
      
      // Switch turns only if game isn't over
      if (!gameState.gameOver) {
        // Reset tiles flipped counter for next team's turn
        gameState[nextTeam].tilesFlippedThisTurn = 0;
        gameState.currentTeam = nextTeam;
      }
    }
    
    // Clear message after 2 seconds
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
      currentMessage = '';
    }, 2000);
    
    // Trigger reactivity
    gameState = gameState;
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
  
  .modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: rgba(0, 0, 0, 0.7) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 99999 !important;
  }
  
  .modal-content {
    background: white !important;
    padding: 32px !important;
    border-radius: 20px !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    border: 6px solid #3b82f6 !important;
    width: 800px !important;
    max-width: 90vw !important;
    margin: 16px !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
  }
  
  .message-display {
    position: fixed !important;
    top: 16px !important;
    right: 16px !important;
    background: white !important;
    padding: 12px 16px !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
    border: 2px solid #d1d5db !important;
    max-width: 20rem !important;
    z-index: 50000 !important;
  }
  
  .settings-modal-content {
    background: white !important;
    padding: 32px !important;
    border-radius: 20px !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    border: 6px solid #10b981 !important;
    width: 700px !important;
    max-width: 90vw !important;
    margin: 16px !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
  }
  
  .flying-coin {
    position: fixed;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 60000;
  }
  
  .coin-fly-to-team1 {
    animation: coin-fly-team1-score 2s ease-out forwards;
  }
  
  .coin-fly-to-team2 {
    animation: coin-fly-team2-score 2s ease-out forwards;
  }
  
  .heart-fly-to-team1 {
    animation: heart-fly-team1-lives 2s ease-out forwards;
  }
  
  .heart-fly-to-team2 {
    animation: heart-fly-team2-lives 2s ease-out forwards;
  }
  
  .coin-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
  
  .flying-heart {
    position: fixed;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 60000;
  }
  
  .heart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
  
  .heart-icon {
    font-size: 60px;
    color: #ef4444;
    animation: heart-beat 2s ease-out infinite;
  }
  
  .heart-text {
    color: #ef4444;
    font-size: 16px;
    font-weight: bold;
    margin-top: 8px;
    font-family: 'Alfa Slab One', cursive;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .coin-image {
    width: 60px;
    height: 60px;
    animation: coin-spin 2s linear infinite;
  }
  
  .coin-points {
    font-family: 'Alfa Slab One', cursive;
    font-size: 24px;
    font-weight: bold;
    color: #fbbf24;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    margin-top: 8px;
    animation: fade-scale 2s ease-out forwards;
  }
  
  @keyframes coin-fly-team1-score {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    20% {
      transform: translate(-50%, -60%) scale(1.2);
      opacity: 1;
    }
    60% {
      transform: translate(-300%, -200%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-400%, -250%) scale(0.3);
      opacity: 0;
    }
  }
  
  @keyframes coin-fly-team2-score {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    20% {
      transform: translate(-50%, -60%) scale(1.2);
      opacity: 1;
    }
    60% {
      transform: translate(-200%, -200%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-300%, -250%) scale(0.3);
      opacity: 0;
    }
  }
  
  @keyframes heart-fly-team1-lives {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    20% {
      transform: translate(-50%, -60%) scale(1.2);
      opacity: 1;
    }
    60% {
      transform: translate(200%, -200%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(300%, -250%) scale(0.3);
      opacity: 0;
    }
  }
  
  @keyframes heart-fly-team2-lives {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    20% {
      transform: translate(-50%, -60%) scale(1.2);
      opacity: 1;
    }
    60% {
      transform: translate(200%, -200%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(300%, -250%) scale(0.3);
      opacity: 0;
    }
  }
  
  @keyframes heart-beat {
    0%, 100% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.1);
    }
    50% {
      transform: scale(1.2);
    }
    75% {
      transform: scale(1.1);
    }
  }
  
  @keyframes coin-spin {
    0% {
      transform: rotateY(0deg);
    }
    50% {
      transform: rotateY(180deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }
  
  @keyframes fade-scale {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    30% {
      transform: scale(1.2);
      opacity: 1;
    }
    70% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.8);
      opacity: 0;
    }
  }
  
  /* Custom Button Base Style */
  .svg-button {
    border: none;
    position: relative;
    min-height: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: rgba(255, 255, 255, 0.95) !important;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
    font-weight: bold;
    padding: 16px 24px;
    margin: 4px;
    border-radius: 15px;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  .svg-button:hover {
    transform: translateY(-2px);
    color: rgba(255, 255, 255, 1) !important;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.3),
      0 3px 6px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  .svg-button:active {
    transform: translateY(-1px) scale(0.98);
    box-shadow: 
      0 3px 6px rgba(0, 0, 0, 0.2),
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .svg-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.5) !important;
    transform: none;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .svg-button i {
    color: rgba(255, 255, 255, 0.9) !important;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.6));
  }
  
  .svg-button:hover i {
    color: rgba(255, 255, 255, 1) !important;
    filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.8));
  }
  
  /* Button Color Variations */
  .pass-button {
    background: linear-gradient(145deg, rgba(255, 165, 0, 0.9), rgba(255, 140, 0, 0.8));
  }
  
  .pass-button:hover {
    background: linear-gradient(145deg, rgba(255, 165, 0, 1), rgba(255, 140, 0, 0.9));
  }
  
  .help-button {
    background: linear-gradient(145deg, rgba(99, 102, 241, 0.9), rgba(79, 70, 229, 0.8));
  }
  
  .help-button:hover {
    background: linear-gradient(145deg, rgba(99, 102, 241, 1), rgba(79, 70, 229, 0.9));
  }
  
  .settings-button {
    background: linear-gradient(145deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.8));
  }
  
  .settings-button:hover {
    background: linear-gradient(145deg, rgba(34, 197, 94, 1), rgba(22, 163, 74, 0.9));
  }
  
  .new-game-button {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(243, 244, 246, 0.9));
    color: rgba(59, 130, 246, 0.9) !important;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  .new-game-button:hover {
    background: linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.95));
    color: rgba(59, 130, 246, 1) !important;
    text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.9);
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  .new-game-button i {
    color: rgba(59, 130, 246, 0.85) !important;
    filter: drop-shadow(1px 1px 2px rgba(255, 255, 255, 0.8));
  }
  
  .new-game-button:hover i {
    color: rgba(59, 130, 246, 1) !important;
  }
  
  .modal-button {
    background: linear-gradient(145deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.8));
  }
  
  .modal-button:hover {
    background: linear-gradient(145deg, rgba(59, 130, 246, 1), rgba(37, 99, 235, 0.9));
  }
  
  .apply-button {
    background: linear-gradient(145deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.8));
  }
  
  .apply-button:hover {
    background: linear-gradient(145deg, rgba(34, 197, 94, 1), rgba(22, 163, 74, 0.9));
  }
  
  .download-corner {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 1000;
  }
  
  .download-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  .download-icon-button:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.4);
    color: white;
    text-decoration: none;
  }
  
  .download-icon-button i {
    font-size: 18px;
  }

  /* Icon-only button styles matching download button format */
  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }
  
  .icon-button:hover {
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.4);
    color: white;
    text-decoration: none;
  }
  
  .icon-button i {
    font-size: 24px;
  }
  
  .icon-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .icon-pass-button {
    background: linear-gradient(145deg, rgba(255, 165, 0, 0.9), rgba(255, 140, 0, 0.8));
  }
  
  .icon-pass-button:hover {
    background: linear-gradient(145deg, rgba(255, 165, 0, 1), rgba(255, 140, 0, 0.9));
  }
  
  .icon-help-button {
    background: linear-gradient(145deg, rgba(99, 102, 241, 0.9), rgba(79, 70, 229, 0.8));
  }
  
  .icon-help-button:hover {
    background: linear-gradient(145deg, rgba(99, 102, 241, 1), rgba(79, 70, 229, 0.9));
  }
  
  .icon-settings-button {
    background: linear-gradient(145deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.8));
  }
  
  .icon-settings-button:hover {
    background: linear-gradient(145deg, rgba(34, 197, 94, 1), rgba(22, 163, 74, 0.9));
  }
  
  .icon-new-game-button {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(243, 244, 246, 0.9));
    color: rgba(59, 130, 246, 0.9) !important;
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  .icon-new-game-button:hover {
    background: linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.95));
    color: rgba(59, 130, 246, 1) !important;
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  .icon-new-game-button i {
    color: rgba(59, 130, 246, 0.85) !important;
  }
  
  .icon-new-game-button:hover i {
    color: rgba(59, 130, 246, 1) !important;
  }
  
  .reset-button {
    background: linear-gradient(145deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.8));
  }
  
  .reset-button:hover {
    background: linear-gradient(145deg, rgba(107, 114, 128, 1), rgba(75, 85, 99, 0.9));
  }
  
  .cancel-button {
    background: linear-gradient(145deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.8));
  }
  
  .cancel-button:hover {
    background: linear-gradient(145deg, rgba(239, 68, 68, 1), rgba(220, 38, 38, 0.9));
  }
</style>

<div class="min-h-screen py-8 fallback-container">
  <!-- Download Icons (Top Right Corner) -->
  <div class="download-corner">
    <a 
      href="https://github.com/makowey/smart-kaboom/releases"
      class="download-icon-button"
      target="_blank"
      rel="noopener noreferrer"
      title="Download for Mac"
    >
      <i class="fab fa-apple"></i>
    </a>
    
    <a 
      href="https://github.com/makowey/smart-kaboom/releases"
      class="download-icon-button"
      target="_blank"
      rel="noopener noreferrer"
      title="Download for Windows"
    >
      <i class="fab fa-windows"></i>
    </a>
  </div>

  <div class="mx-auto px-4" style="max-width: 1800px;">
    <div class="flex items-center justify-center mb-4 gap-6">
      <img src="/assets/bomb.svg" alt="Bomb Logo" class="drop-shadow-lg" style="width: 125px; height: 125px;" />
      <h1 class="text-xl font-bold text-white drop-shadow-lg fallback-title" style="font-family: 'Alfa Slab One', cursive; letter-spacing: 0.1em;">Smart Kaboom</h1>
      <img src="/assets/bomb.svg" alt="Bomb Logo" class="drop-shadow-lg" style="width: 125px; height: 125px;" />
    </div>
    
    
    <!-- Always visible button row -->
    <div class="text-center mb-10">
      <div class="flex justify-center mb-4 flex-wrap" style="gap: 2rem;">
        {#if !gameState.gameOver}
          <button 
            class="icon-button icon-pass-button"
            on:click={!gameState[gameState.currentTeam].hasPassedTurn && gameState[gameState.currentTeam].canContinue ? passTurn : null}
            disabled={gameState[gameState.currentTeam].hasPassedTurn || !gameState[gameState.currentTeam].canContinue}
            title="Pass Turn"
          >
            <i class="fas fa-hand-paper"></i>
          </button>
        {:else}
          <button 
            class="icon-button icon-new-game-button"
            on:click={resetGame}
            title="New Game"
          >
            <i class="fas fa-gamepad"></i>
          </button>
        {/if}
        
        <button 
          class="icon-button icon-help-button"
          on:click={toggleLegend}
          title="Help & Legend"
        >
          <i class="fas fa-question-circle"></i>
        </button>
        
        <button 
          class="icon-button icon-settings-button"
          on:click={toggleSettings}
          title="Settings"
        >
          <i class="fas fa-cog"></i>
        </button>
      </div>
    </div>

    {#if gameState.gameOver}
      <div class="text-center mb-6">
        <h2 class="text-4xl font-bold text-white drop-shadow-lg mb-4" style="font-family: 'Alfa Slab One', cursive;">Game Over!</h2>
        <p class="text-2xl font-bold drop-shadow font-comic text-white">
          {gameState.winner ? `🏆 ${gameState[gameState.winner].name} Win! 🏆` :
           gameState.team1.score > gameState.team2.score ? '🏆 Thunder Hawks Win! 🏆' : 
           gameState.team2.score > gameState.team1.score ? '🏆 Lightning Wolves Win! 🏆' : 
           '🤝 It\'s a Tie! 🤝'}
        </p>
      </div>
    {/if}

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8 fallback-grid justify-center">
      <div class="relative">
        <GameBoard 
          teamName={settings.team1Name}
          teamId="team1"
          onTileFlip={handleTileFlip}
          flippedTiles={gameState.team1.flippedTiles}
          score={gameState.team1.score}
          lives={gameState.team1.lives}
          multiplier={gameState.team1.multiplier}
          isActive={gameState.currentTeam === 'team1' && !gameState.gameOver && !gameState.team1.hasPassedTurn && gameState.team1.canContinue}
          hasPassedTurn={gameState.team1.hasPassedTurn}
          canContinue={gameState.team1.canContinue}
          allTilesFlipped={gameState.team1.allTilesFlipped}
        />
        {#if gameState.currentTeam === 'team1' && !gameState.gameOver && !gameState.team1.hasPassedTurn && gameState.team1.canContinue}
          <div class="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
        {/if}
      </div>
      
      <div class="relative">
        <GameBoard 
          teamName={settings.team2Name}
          teamId="team2"
          onTileFlip={handleTileFlip}
          flippedTiles={gameState.team2.flippedTiles}
          score={gameState.team2.score}
          lives={gameState.team2.lives}
          multiplier={gameState.team2.multiplier}
          isActive={gameState.currentTeam === 'team2' && !gameState.gameOver && !gameState.team2.hasPassedTurn && gameState.team2.canContinue}
          hasPassedTurn={gameState.team2.hasPassedTurn}
          canContinue={gameState.team2.canContinue}
          allTilesFlipped={gameState.team2.allTilesFlipped}
        />
        {#if gameState.currentTeam === 'team2' && !gameState.gameOver && !gameState.team2.hasPassedTurn && gameState.team2.canContinue}
          <div class="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Legend Modal -->
  {#if showLegend}
    <div class="modal-overlay" on:click={toggleLegend}>
      <div class="modal-content" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold text-gray-800 text-center flex-1" style="font-family: 'Alfa Slab One', cursive;">Game Legend</h3>
          <button 
            class="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            on:click={toggleLegend}
          >
            ×
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col items-center p-4 bg-green-50 rounded-xl border-3 border-green-200">
            <div class="flex items-center justify-center w-32 h-32 mb-3">
              <img src="/assets/coin.svg" alt="Points" style="max-width: 150px; max-height: 150px; width: auto; height: auto;" />
            </div>
            <span class="font-comic text-gray-800 font-bold text-xl">Points</span>
            <span class="text-gray-600 font-bold text-lg">5-100 pts</span>
            <p class="text-sm text-gray-600 text-center mt-2">Collect points to win the game</p>
          </div>
          
          <div class="flex flex-col items-center p-4 bg-red-50 rounded-xl border-3 border-red-200">
            <div class="flex items-center justify-center w-32 h-32 mb-3">
              <img src="/assets/bomb.svg" alt="Bomb" style="max-width: 150px; max-height: 150px; width: auto; height: auto;" />
            </div>
            <span class="font-comic text-gray-800 font-bold text-xl">Bomb</span>
            <span class="text-gray-600 font-bold text-lg">-1 life</span>
            <p class="text-sm text-gray-600 text-center mt-2">Lose a life, or all points if no lives left</p>
          </div>
          
          <div class="flex flex-col items-center p-4 bg-pink-50 rounded-xl border-3 border-pink-200">
            <div class="flex items-center justify-center w-32 h-32 mb-3">
              <i class="fas fa-heart text-red-500" style="font-size: 120px;"></i>
            </div>
            <span class="font-comic text-gray-800 font-bold text-xl">Life</span>
            <span class="text-gray-600 font-bold text-lg">+1 life</span>
            <p class="text-sm text-gray-600 text-center mt-2">Gain an extra life for protection</p>
          </div>
          
          <div class="flex flex-col items-center p-4 bg-purple-50 rounded-xl border-3 border-purple-200">
            <div class="flex items-center justify-center w-32 h-32 mb-3">
              <i class="fas fa-star text-yellow-500" style="font-size: 120px;"></i>
            </div>
            <span class="font-comic text-gray-800 font-bold text-xl">Multiplier</span>
            <span class="text-gray-600 font-bold text-lg">x2 all pts</span>
            <p class="text-sm text-gray-600 text-center mt-2">Instantly doubles all your points</p>
          </div>
          
          <div class="flex flex-col items-center p-4 bg-yellow-100 rounded-xl border-3 border-yellow-300 col-span-2">
            <div class="flex items-center justify-center w-32 h-32 mb-3">
              <img src="/assets/coin.svg" alt="Try Again" style="max-width: 150px; max-height: 150px; width: auto; height: auto;" />
            </div>
            <span class="font-comic text-gray-800 font-bold text-xl">Try Again</span>
            <span class="text-gray-600 font-bold text-lg">+2 pts + Continue</span>
            <p class="text-sm text-gray-600 text-center mt-2">Get 2 points and continue your turn</p>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t-2 border-gray-300">
          <h4 class="font-bold text-gray-800 font-comic mb-2 text-xl">🏆 How to Win:</h4>
          <div class="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300 mb-3">
            <div class="text-lg font-bold text-yellow-800 font-comic text-center">First team to reach {settings.winCondition}+ points wins instantly!</div>
          </div>
          
          <h4 class="font-bold text-gray-800 font-comic mb-2">Game Rules:</h4>
          <div class="text-sm text-gray-700 space-y-1 font-comic">
            <div>• 4 Bombs, 3 Lives, 2 Multipliers per board</div>
            <div>• 22 Try Again tiles (continue turn)</div>
            <div>• Teams must flip minimum tries per turn</div>
            <div>• Teams can continue up to maximum tries (if no bomb)</div>
            <div>• No lives + Bomb = Lose all points</div>
            <div>• Pass without flipping = no more turns for that team</div>
            <div>• Game ends when both teams are done</div>
            <div>• Highest score wins when game ends</div>
          </div>
          
          <h4 class="font-bold text-gray-800 font-comic mb-2 mt-4">Team Status Indicators:</h4>
          <div class="text-sm text-gray-700 space-y-2 font-comic">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-yellow-400 rounded-full animate-pulse border border-white"></div>
              <span>Active team (can play tiles)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                <i class="fas fa-flag mr-1"></i>PASSED
              </div>
              <span>Team passed permanently (no more turns)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                <i class="fas fa-skull mr-1"></i>OUT
              </div>
              <span>Team lost all lives (eliminated)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                <i class="fas fa-check mr-1"></i>DONE
              </div>
              <span>Team finished all tiles (board complete)</span>
            </div>
          </div>
        </div>
        
        <button 
          class="svg-button modal-button mt-4 w-full px-6 py-3 font-bold transition-colors font-comic"
          on:click={toggleLegend}
        >
          Got it!
        </button>
      </div>
    </div>
  {/if}

  <!-- Fixed message display -->
  {#if currentMessage}
    <div class="message-display">
      <p class="text-gray-800 font-bold font-comic text-sm">{currentMessage}</p>
    </div>
  {/if}
  
  <!-- Settings Modal -->
  {#if showSettings}
    <div class="modal-overlay" on:click={toggleSettings}>
      <div class="settings-modal-content" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-3xl font-bold text-gray-800 text-center flex-1" style="font-family: 'Alfa Slab One', cursive;">Game Settings</h3>
          <button 
            class="text-gray-500 hover:text-gray-700 text-3xl font-bold"
            on:click={toggleSettings}
          >
            ×
          </button>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Team Names Column -->
          <div class="space-y-6">
            <!-- Team 1 -->
            <div class="bg-gradient-to-br from-orange-50 to-amber-100 p-5 rounded-2xl border-3 border-orange-300 shadow-lg">
              <div class="flex items-center mb-4">
                <i class="fas fa-flag text-orange-600 text-xl mr-3"></i>
                <h4 class="text-xl font-bold text-gray-800 font-comic">Team 1</h4>
              </div>
              <div class="space-y-3">
                <label class="block text-sm font-bold text-gray-700 font-comic">Team Name:</label>
                <div class="flex items-center gap-3">
                  <input 
                    type="text" 
                    bind:value={settings.team1Name}
                    class="w-64 px-4 py-3 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none font-comic text-base font-semibold bg-white shadow-inner transition-all duration-300 focus:shadow-md"
                    placeholder="Enter team 1 name"
                  />
                  <div class="w-8 h-8 flex items-center justify-center text-orange-600">
                    <i class="fas fa-users text-lg"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Team 2 -->
            <div class="bg-gradient-to-br from-purple-50 to-pink-100 p-5 rounded-2xl border-3 border-purple-300 shadow-lg">
              <div class="flex items-center mb-4">
                <i class="fas fa-flag text-purple-600 text-xl mr-3"></i>
                <h4 class="text-xl font-bold text-gray-800 font-comic">Team 2</h4>
              </div>
              <div class="space-y-3">
                <label class="block text-sm font-bold text-gray-700 font-comic">Team Name:</label>
                <div class="flex items-center gap-3">
                  <input 
                    type="text" 
                    bind:value={settings.team2Name}
                    class="w-64 px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none font-comic text-base font-semibold bg-white shadow-inner transition-all duration-300 focus:shadow-md"
                    placeholder="Enter team 2 name"
                  />
                  <div class="w-8 h-8 flex items-center justify-center text-purple-600">
                    <i class="fas fa-users text-lg"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Win Condition Column -->
          <div class="space-y-6">
            <div class="bg-gradient-to-br from-yellow-50 to-amber-100 p-5 rounded-2xl border-3 border-yellow-400 shadow-lg">
              <div class="flex items-center mb-4">
                <i class="fas fa-trophy text-yellow-600 text-xl mr-3"></i>
                <h4 class="text-xl font-bold text-gray-800 font-comic">Win Condition</h4>
              </div>
              <div class="space-y-3">
                <label class="block text-sm font-bold text-gray-700 font-comic">Points to Win:</label>
                <div class="flex items-center gap-3">
                  <input 
                    type="number" 
                    bind:value={settings.winCondition}
                    min="100"
                    max="10000"
                    step="50"
                    class="w-32 px-4 py-3 border-2 border-yellow-400 rounded-lg focus:border-yellow-600 focus:outline-none font-comic text-base font-semibold bg-white shadow-inner transition-all duration-300 focus:shadow-md"
                    placeholder="501"
                  />
                  <div class="w-8 h-8 flex items-center justify-center text-yellow-600">
                    <i class="fas fa-coins text-lg"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Turn Rules -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-2xl border-3 border-green-400 shadow-lg">
              <div class="flex items-center mb-4">
                <i class="fas fa-dice text-green-600 text-xl mr-3"></i>
                <h4 class="text-xl font-bold text-gray-800 font-comic">Turn Rules</h4>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-bold text-gray-700 font-comic">Min Tries per Turn:</label>
                  <div class="flex items-center gap-3">
                    <input 
                      type="number" 
                      bind:value={settings.minTries}
                      min="1"
                      max="5"
                      class="w-20 px-3 py-2 border-2 border-green-400 rounded-lg focus:border-green-600 focus:outline-none font-comic text-base font-semibold bg-white shadow-inner transition-all duration-300 focus:shadow-md"
                      placeholder="1"
                    />
                    <div class="w-6 h-6 flex items-center justify-center text-green-600">
                      <i class="fas fa-arrow-down text-sm"></i>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 font-comic">Max Tries per Turn:</label>
                  <div class="flex items-center gap-3">
                    <input 
                      type="number" 
                      bind:value={settings.maxTries}
                      min="1"
                      max="10"
                      class="w-20 px-3 py-2 border-2 border-green-400 rounded-lg focus:border-green-600 focus:outline-none font-comic text-base font-semibold bg-white shadow-inner transition-all duration-300 focus:shadow-md"
                      placeholder="3"
                    />
                    <div class="w-6 h-6 flex items-center justify-center text-green-600">
                      <i class="fas fa-arrow-up text-sm"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info Panel -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-2xl border-3 border-blue-300 shadow-lg">
              <div class="flex items-center mb-4">
                <i class="fas fa-info-circle text-blue-600 text-xl mr-3"></i>
                <h4 class="text-xl font-bold text-gray-800 font-comic">Game Info</h4>
              </div>
              <div class="space-y-2 text-sm text-gray-700 font-comic">
                <div class="flex items-center">
                  <i class="fas fa-star text-yellow-500 mr-2"></i>
                  <span>Default: 501 points</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-chart-line text-green-500 mr-2"></i>
                  <span>Range: 100-10000</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-clock text-blue-500 mr-2"></i>
                  <span>First team to reach target wins instantly</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-dice text-purple-500 mr-2"></i>
                  <span>Teams must flip min tries, can continue to max</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-4 mt-8">
          <button 
            class="svg-button apply-button flex-1 px-8 py-4 font-bold transition-colors font-comic"
            on:click={applySettings}
          >
            <i class="fas fa-check mr-12 text-xl"></i>Apply Settings
          </button>
          
          <button 
            class="svg-button reset-button px-8 py-4 font-bold transition-colors font-comic"
            on:click={resetSettings}
          >
            <i class="fas fa-undo mr-12 text-xl"></i>Reset
          </button>
          
          <button 
            class="svg-button cancel-button px-8 py-4 font-bold transition-colors font-comic"
            on:click={toggleSettings}
          >
            <i class="fas fa-times mr-12 text-xl"></i>Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Flying Coins Animation -->
  {#each flyingCoins as coin (coin.id)}
    <div class="flying-coin {coin.isTeam1 ? 'coin-fly-to-team1' : 'coin-fly-to-team2'}" style="left: {coin.startX}; top: {coin.startY};">
      <div class="coin-container">
        <img src="/assets/coin.svg" alt="Coin" class="coin-image" />
        <span class="coin-points">+{coin.points}</span>
      </div>
    </div>
  {/each}
  
  <!-- Flying Hearts Animation -->
  {#each flyingHearts as heart (heart.id)}
    <div class="flying-heart {heart.isTeam1 ? 'heart-fly-to-team1' : 'heart-fly-to-team2'}" style="left: {heart.startX}; top: {heart.startY};">
      <div class="heart-container">
        <i class="fas fa-heart heart-icon"></i>
        <span class="heart-text">+1 LIFE</span>
      </div>
    </div>
  {/each}
  
  <!-- Notification system -->
  <Notification 
    show={notification.show}
    message={notification.message}
    type={notification.type}
  />
</div>
