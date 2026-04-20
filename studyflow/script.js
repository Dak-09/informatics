const symbols = ['🔥', '🎯', '⭐', '💎', '🃏', '🚀'];
const gameBoard = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const timeEl = document.getElementById('time');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const messageEl = document.getElementById('message');

let deck = [];
let flippedCards = [];
let lockBoard = false;
let moves = 0;
let matches = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateStats() {
  timeEl.textContent = formatTime(timer);
  movesEl.textContent = moves;
  matchesEl.textContent = `${matches} / 6`;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    updateStats();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function setMessage(text, isSuccess = false) {
  messageEl.innerHTML = text;
  messageEl.classList.toggle('success', isSuccess);
}

function createDeck() {
  const doubled = [...symbols, ...symbols];
  deck = shuffle(doubled).map((symbol, index) => ({
    id: index,
    symbol,
    matched: false
  }));
}

function createCardElement(cardData) {
  const button = document.createElement('button');
  button.className = 'card';
  button.dataset.id = cardData.id;
  button.dataset.symbol = cardData.symbol;
  button.setAttribute('aria-label', 'Game card');

  button.innerHTML = `
    <span class="card-inner">
      <span class="card-face card-front">?</span>
      <span class="card-face card-back">${cardData.symbol}</span>
    </span>
  `;

  button.addEventListener('click', () => flipCard(button, cardData));
  return button;
}

function renderBoard() {
  gameBoard.innerHTML = '';
  deck.forEach(card => {
    gameBoard.appendChild(createCardElement(card));
  });
}

function resetGameState() {
  flippedCards = [];
  lockBoard = false;
  moves = 0;
  matches = 0;
  timer = 0;
  gameStarted = false;
  stopTimer();
  updateStats();
  createDeck();
  renderBoard();
  setMessage('Press <b>Start Game</b> to begin your alpha version test.');
  disableAllCards(true);
}

function disableAllCards(disabled) {
  document.querySelectorAll('.card').forEach(card => {
    card.disabled = disabled;
  });
}

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    disableAllCards(false);
    startTimer();
    setMessage('Game started. Find all 6 pairs.');
  }
}

function restartGame() {
  resetGameState();
}

function flipCard(cardElement, cardData) {
  if (!gameStarted || lockBoard || cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
    return;
  }

  cardElement.classList.add('flipped');
  flippedCards.push({ element: cardElement, data: cardData });

  if (flippedCards.length === 2) {
    moves++;
    updateStats();
    checkForMatch();
  }
}

function checkForMatch() {
  const [first, second] = flippedCards;
  if (!first || !second) return;

  const isMatch = first.data.symbol === second.data.symbol;
  lockBoard = true;

  if (isMatch) {
    first.element.classList.add('matched');
    second.element.classList.add('matched');
    matches++;
    setMessage(`Nice! You found a pair of <b>${first.data.symbol}</b>.`);
    resetTurn();

    if (matches === symbols.length) {
      stopTimer();
      setMessage(
        `Excellent! You completed the alpha game in <b>${moves}</b> moves and <b>${formatTime(timer)}</b>.`,
        true
      );
      disableAllCards(true);
    }
  } else {
    setMessage('Not a match. Try again.');
    setTimeout(() => {
      first.element.classList.remove('flipped');
      second.element.classList.remove('flipped');
      resetTurn();
    }, 900);
  }
}

function resetTurn() {
  flippedCards = [];
  lockBoard = false;
  updateStats();
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

resetGameState();