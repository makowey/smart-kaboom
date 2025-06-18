export function createBoard() {
  const tiles = [];
  
  // High value tiles (rare but valuable)
  tiles.push({ type: 'points', value: 100 }); // 1 tile
  tiles.push({ type: 'points', value: 75 });  // 1 tile
  
  for (let i = 0; i < 2; i++) {
    tiles.push({ type: 'points', value: 50 }); // 2 tiles
  }
  
  for (let i = 0; i < 3; i++) {
    tiles.push({ type: 'points', value: 30 }); // 3 tiles
  }
  
  for (let i = 0; i < 6; i++) {
    tiles.push({ type: 'points', value: 20 }); // 6 tiles
  }
  
  for (let i = 0; i < 8; i++) {
    tiles.push({ type: 'points', value: 10 }); // 8 tiles
  }
  
  for (let i = 0; i < 12; i++) {
    tiles.push({ type: 'points', value: 5 }); // 12 tiles
  }
  
  // Risk/reward tiles
  for (let i = 0; i < 4; i++) {
    tiles.push({ type: 'bomb', value: 0 }); // 4 bombs (slightly more risk)
  }
  
  for (let i = 0; i < 3; i++) {
    tiles.push({ type: 'life', value: 0 }); // 3 lives (more safety)
  }
  
  for (let i = 0; i < 2; i++) {
    tiles.push({ type: 'multiplier', value: 0 }); // 2 multipliers (more strategy)
  }
  
  // Fill remaining tiles with low-value continue tiles
  const remainingTiles = 64 - tiles.length; // Should be 22 tiles
  for (let i = 0; i < remainingTiles; i++) {
    tiles.push({ type: 'try_again', value: 2 }); // 22 tiles worth 2 points each
  }
  
  // Shuffle the tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  
  // Create 8x8 grid
  const board = [];
  for (let row = 0; row < 8; row++) {
    board[row] = [];
    for (let col = 0; col < 8; col++) {
      board[row][col] = tiles[row * 8 + col];
    }
  }
  
  return board;
}

export function createGameState() {
  return {
    team1: {
      name: 'Thunder Hawks',
      score: 0,
      lives: 3,
      multiplier: 1,
      flippedTiles: new Set(),
      canContinue: true,
      allTilesFlipped: false,
      hasPassedTurn: false,
      tilesFlippedThisTurn: 0
    },
    team2: {
      name: 'Lightning Wolves', 
      score: 0,
      lives: 3,
      multiplier: 1,
      flippedTiles: new Set(),
      canContinue: true,
      allTilesFlipped: false,
      hasPassedTurn: false,
      tilesFlippedThisTurn: 0
    },
    currentTeam: 'team1',
    gameOver: false,
    winner: null,
    consecutivePasses: 0
  };
}

export function processTileFlip(gameState, team, row, col, tileData) {
  const tileId = `${row}-${col}`;
  const teamData = gameState[team];
  
  // Add to flipped tiles
  teamData.flippedTiles.add(tileId);
  teamData.tilesFlippedThisTurn++;
  
  let message = '';
  let continuePlay = false;
  
  switch (tileData.type) {
    case 'points':
      const points = tileData.value * teamData.multiplier;
      teamData.score += points;
      message = `+${points} points!`;
      teamData.multiplier = 1; // Reset multiplier after use
      break;
      
    case 'bomb':
      teamData.lives--;
      if (teamData.lives < 0) {
        // No lives left - lose all points
        teamData.score = 0;
        teamData.canContinue = false;
        message = 'Bomb! No lives left - lost all points! Game Over!';
      } else {
        // Still have lives - only lose the life
        message = 'Bomb! Lost a life!';
      }
      break;
      
    case 'life':
      if (teamData.lives >= 4) {
        message = 'Already at maximum lives (4)!';
      } else {
        teamData.lives++;
        message = 'Extra life gained!';
      }
      continuePlay = true;
      break;
      
    case 'multiplier':
      teamData.score *= 2; // Double all current points
      message = `All points doubled! Now ${teamData.score} points!`;
      continuePlay = true;
      break;
      
    case 'try_again':
      const tryAgainPoints = tileData.value;
      teamData.score += tryAgainPoints;
      message = `+${tryAgainPoints} points! Try one more time!`;
      continuePlay = true;
      break;
      
  }
  
  // Check if game is over
  const otherTeam = team === 'team1' ? 'team2' : 'team1';
  
  // Check if all tiles are flipped for this team
  if (teamData.flippedTiles.size >= 64) {
    teamData.allTilesFlipped = true;
  }
  
  // Check for instant win condition (get win condition from global settings)
  const winCondition = globalThis.gameSettings?.winCondition || 501;
  if (teamData.score >= winCondition) {
    gameState.gameOver = true;
    gameState.winner = team;
    return { message: `${message} 🏆 WINNER! Reached ${winCondition}+ points!`, continuePlay };
  }
  
  // Check if this team has surpassed a passed team's score (instant win)
  const otherTeamData = gameState[otherTeam];
  if (otherTeamData.hasPassedTurn && teamData.score > otherTeamData.score) {
    gameState.gameOver = true;
    gameState.winner = team;
    return { message: `${message} 🏆 WINNER! Surpassed passed team's score!`, continuePlay };
  }
  
  // Game over if both teams are done (can't continue, passed permanently, or finished all tiles)
  const team1Done = !gameState.team1.canContinue || gameState.team1.hasPassedTurn || gameState.team1.allTilesFlipped;
  const team2Done = !gameState.team2.canContinue || gameState.team2.hasPassedTurn || gameState.team2.allTilesFlipped;
  
  if (team1Done && team2Done) {
    gameState.gameOver = true;
  }
  
  // Reset consecutive passes when a tile is flipped
  gameState.consecutivePasses = 0;
  
  // Check min/max tries rule (but not if bomb was hit)
  const gameSettings = globalThis.gameSettings || { minTries: 1, maxTries: 3 };
  const currentTries = teamData.tilesFlippedThisTurn;
  const hitBomb = tileData.type === 'bomb';
  
  // If bomb was hit, turn ends immediately - no min/max tries apply
  if (hitBomb) {
    continuePlay = false;
  } else {
    // Force continue if haven't reached minimum tries yet
    if (currentTries < gameSettings.minTries && !continuePlay) {
      continuePlay = true;
      message += ` (Must flip ${gameSettings.minTries - currentTries} more tile${gameSettings.minTries - currentTries > 1 ? 's' : ''})`;
    }
    
    // Force end turn if reached maximum tries
    if (currentTries >= gameSettings.maxTries && continuePlay) {
      continuePlay = false;
      message += ` (Maximum ${gameSettings.maxTries} tries reached)`;
    }
  }
  
  // Handle team switching or game ending
  if (!continuePlay) {
    if (teamData.canContinue) {
      // Current team can continue, check if other team can play
      if (!gameState[otherTeam].hasPassedTurn && !gameState[otherTeam].allTilesFlipped && gameState[otherTeam].canContinue) {
        // Switch to other team
        gameState[otherTeam].tilesFlippedThisTurn = 0;
        gameState.currentTeam = otherTeam;
      } else {
        // Other team can't play, current team continues (they're the only active team)
        teamData.tilesFlippedThisTurn = 0;
      }
    } else {
      // Current team can't continue (lost all lives), switch to other team if possible
      if (!gameState[otherTeam].hasPassedTurn && !gameState[otherTeam].allTilesFlipped && gameState[otherTeam].canContinue) {
        // Switch to other team
        gameState[otherTeam].tilesFlippedThisTurn = 0;
        gameState.currentTeam = otherTeam;
      } else {
        // Neither team can continue, end the game
        gameState.gameOver = true;
      }
    }
  }
  
  return { message, continuePlay };
}