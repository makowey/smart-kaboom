export function createBoard() {
  const tiles = [];
  
  // Add tiles based on specifications
  tiles.push({ type: 'points', value: 100 });
  
  for (let i = 0; i < 2; i++) {
    tiles.push({ type: 'points', value: 50 });
  }
  
  for (let i = 0; i < 3; i++) {
    tiles.push({ type: 'points', value: 30 });
  }
  
  for (let i = 0; i < 5; i++) {
    tiles.push({ type: 'points', value: 20 });
  }
  
  for (let i = 0; i < 10; i++) {
    tiles.push({ type: 'points', value: 10 });
  }
  
  for (let i = 0; i < 3; i++) {
    tiles.push({ type: 'bomb', value: 0 });
  }
  
  for (let i = 0; i < 2; i++) {
    tiles.push({ type: 'life', value: 0 });
  }
  
  tiles.push({ type: 'multiplier', value: 0 });
  
  // Fill remaining tiles with 1 point "try one more time"
  const remainingTiles = 64 - tiles.length;
  for (let i = 0; i < remainingTiles; i++) {
    tiles.push({ type: 'try_again', value: 1 });
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
      canContinue: true
    },
    team2: {
      name: 'Lightning Wolves', 
      score: 0,
      lives: 3,
      multiplier: 1,
      flippedTiles: new Set(),
      canContinue: true
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
      teamData.score = 0; // Lose all current points
      teamData.lives--;
      message = 'Bomb! Lost all points and a life!';
      if (teamData.lives <= 0) {
        teamData.canContinue = false;
        message += ' Game Over!';
      }
      break;
      
    case 'life':
      teamData.lives++;
      message = 'Extra life gained!';
      continuePlay = true;
      break;
      
    case 'multiplier':
      teamData.multiplier = 2;
      message = 'Next points will be doubled!';
      continuePlay = true;
      break;
      
    case 'try_again':
      const tryAgainPoints = tileData.value * teamData.multiplier;
      teamData.score += tryAgainPoints;
      message = `+${tryAgainPoints} point! Try one more time!`;
      teamData.multiplier = 1; // Reset multiplier after use
      continuePlay = true;
      break;
      
  }
  
  // Check if game is over
  const otherTeam = team === 'team1' ? 'team2' : 'team1';
  if (!teamData.canContinue && !gameState[otherTeam].canContinue) {
    gameState.gameOver = true;
  }
  
  // Switch teams if not continuing
  if (!continuePlay && teamData.canContinue) {
    gameState.currentTeam = otherTeam;
  }
  
  return { message, continuePlay };
}