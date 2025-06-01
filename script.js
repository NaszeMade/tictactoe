const board = document.getElementById('board');
const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const draws = document.getElementById('draws');

const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');

let cells = [];
let currentPlayer = 'X';
let gameMode = 'pvc';
let boardState = Array(9).fill('');
let gameActive = false;
let scores = { X: 0, O: 0, D: 0 };

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
window.onload = () => {
    playAgainBtn.classList.add('hidden'); // Hide the Play Again button on page load
    resultModal.classList.add('hidden'); // Hide the result modal on page load
    startMode('pvp'); // Start the game in Player vs Player mode by default
};

function startMode(mode) {
    gameMode = mode; // Set the game mode
    restartGame(); // Restart the game with the selected mode
}

function restartGame() {
    board.innerHTML = ''; // Clear the board
    boardState = Array(9).fill(''); // Reset the board state
    resultModal.classList.add('hidden'); // Hide the result modal
    playAgainBtn.classList.add('hidden'); // Hide the Play Again button
    currentPlayer = 'X'; // Reset the current player
    gameActive = true; // Reactivate the game
  
    // Recreate the board cells
    cells = []; // Reset the cells array
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', onCellClick);
      board.appendChild(cell);
      cells[i] = cell;
    }
}

function onCellClick(e) {
  const index = e.target.dataset.index;

  if (!gameActive || boardState[index]) return;

  clickSound.play();
  makeMove(index, currentPlayer);

  if (checkWin(currentPlayer)) {
    handleWin(currentPlayer);
  } else if (boardState.every(cell => cell !== '')) {
    handleDraw();
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (gameMode === 'pvc' && currentPlayer === 'O') {
      setTimeout(computerMove, 500);
    }
  }
}

function makeMove(index, player) {
  boardState[index] = player;
  cells[index].textContent = player;
  cells[index].style.color = player === 'X' ? '#1892EA' : '#A737FF';
}

function checkWin(player) {
  return winPatterns.some(pattern =>
    pattern.every(i => boardState[i] === player)
  );
}

function handleWin(player) {
    winSound.play();
    resultText.textContent = `${player} Wins!`;
    resultModal.classList.remove('hidden'); // Show the result modal
    playAgainBtn.classList.remove('hidden'); // Show the Play Again button
    gameActive = false;
    scores[player]++;
    updateScore();
}

function handleDraw() {
    drawSound.play();
    resultText.textContent = "It's a Draw!";
    resultModal.classList.remove('hidden'); // Show the result modal
    playAgainBtn.classList.remove('hidden'); // Show the Play Again button
    gameActive = false;
    scores.D++;
    updateScore();
}

function updateScore() {
  scoreX.textContent = `X: ${scores.X}`;
  scoreO.textContent = `O: ${scores.O}`;
  draws.textContent = `Draws: ${scores.D}`;
}
function getMediumMove() {
    // Check if AI can win
    for (const [a, b, c] of winPatterns) {
      if (boardState[a] === 'O' && boardState[b] === 'O' && boardState[c] === '') return c;
      if (boardState[a] === 'O' && boardState[c] === 'O' && boardState[b] === '') return b;
      if (boardState[b] === 'O' && boardState[c] === 'O' && boardState[a] === '') return a;
    }
  
    // Check if AI needs to block
    for (const [a, b, c] of winPatterns) {
      if (boardState[a] === 'X' && boardState[b] === 'X' && boardState[c] === '') return c;
      if (boardState[a] === 'X' && boardState[c] === 'X' && boardState[b] === '') return b;
      if (boardState[b] === 'X' && boardState[c] === 'X' && boardState[a] === '') return a;
    }
  
    // Otherwise, pick a random move
    let available = boardState
      .map((val, idx) => val === '' ? idx : null)
      .filter(val => val !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function computerMove() {
    const difficulty = document.getElementById('aiDifficulty').value;
    let index;
  
    if (difficulty === 'easy') {
      // Random move
      let available = boardState
        .map((val, idx) => val === '' ? idx : null)
        .filter(val => val !== null);
      index = available[Math.floor(Math.random() * available.length)];
    } else if (difficulty === 'medium') {
      // Medium AI: Try to win, block, or pick randomly
      index = getMediumMove();
    } else {
      // Hard AI: Minimax algorithm
      index = minimax(boardState, 'O').index;
    }
  
    makeMove(index, 'O');
  
    if (checkWin('O')) {
      handleWin('O');
    } else if (boardState.every(cell => cell !== '')) {
      handleDraw();
    } else {
      currentPlayer = 'X';
    }
}

function minimax(newBoard, player) {
    const huPlayer = 'X';
    const aiPlayer = 'O';
    const availSpots = newBoard
      .map((val, idx) => val === '' ? idx : null)
      .filter(i => i !== null);
  
    if (checkWinMini(newBoard, huPlayer)) return { score: -10 };
    if (checkWinMini(newBoard, aiPlayer)) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };
  
    const moves = [];
  
    for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;
  
      if (player === aiPlayer) {
        const result = minimax(newBoard, huPlayer);
        move.score = result.score;
      } else {
        const result = minimax(newBoard, aiPlayer);
        move.score = result.score;
      }
  
      newBoard[availSpots[i]] = '';
      moves.push(move);
    }
  
    let bestMove;
    if (player === aiPlayer) {
      let bestScore = -Infinity;
      moves.forEach((move, i) => {
        if (move.score > bestScore) {
          bestScore = move.score;
          bestMove = i;
        }
      });
    } else {
      let bestScore = Infinity;
      moves.forEach((move, i) => {
        if (move.score < bestScore) {
          bestScore = move.score;
          bestMove = i;
        }
      });
    }
  
    return moves[bestMove];
}
  
function checkWinMini(board, player) {
    return winPatterns.some(pattern =>
      pattern.every(i => board[i] === player)
    );
}

function changeTheme(theme) {
    document.body.className = theme;
}

const playAgainBtn = document.getElementById('playAgainBtn');

playAgainBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden'); // Hide the modal
    playAgainBtn.classList.add('hidden'); // Hide the Play Again button
    restartGame(); // Restart the game
  });
