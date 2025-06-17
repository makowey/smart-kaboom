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
      allTilesFlipped: false
    },
    team2: {
      name: 'Lightning Wolves', 
      score: 0,
      lives: 3,
      multiplier: 1,
      flippedTiles: new Set(),
      canContinue: true,
      allTilesFlipped: false
    },
    currentTeam: 'team1',
    gameOver: false
  };
}

export function processTileFlip(gameState, team, row, col, tileData) {
  const tileId = `${row}-${col}`;
  const teamData = gameState[team];
  
  // Add to flipped tiles
  teamData.flippedTiles.add(tileId);
  
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
      teamData.lives++;
      message = 'Extra life gained!';
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
  
  // Game over if both teams can't continue OR both teams have all tiles flipped
  if ((!teamData.canContinue && !gameState[otherTeam].canContinue) ||
      (teamData.allTilesFlipped && gameState[otherTeam].allTilesFlipped)) {
    gameState.gameOver = true;
  }
  
  // Switch teams if not continuing
  if (!continuePlay && teamData.canContinue) {
    gameState.currentTeam = otherTeam;
  }
  
  return { message, continuePlay };
}