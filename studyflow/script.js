const symbols = ['🍎', '🎈', '⭐', '🐱', '🌸', '⚽', '🚗', '🎵'];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createBoard() {
  const board = document.getElementById('gameBoard');
  board.innerHTML = '';

  const shuffledCards = shuffle([...symbols, ...symbols]);

  shuffledCards.forEach(symbol => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.symbol = symbol;
    card.textContent = '?';
    card.addEventListener('click', flipCard);
    board.appendChild(card);
  });
}

function startGame() {
  moves = 0;
  matches = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  document.getElementById('moves').textContent = moves;
  document.getElementById('matches').textContent = matches;

  createBoard();
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;
  if (this.classList.contains('matched')) return;

  this.classList.add('flipped');
  this.textContent = this.dataset.symbol;

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  moves++;
  document.getElementById('moves').textContent = moves;

  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    disableCards();
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  matches++;
  document.getElementById('matches').textContent = matches;

  resetTurn();

  if (matches === 8) {
    setTimeout(() => {
      alert('Congratulations! You matched all cards!');
    }, 300);
  }
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    firstCard.textContent = '?';
    secondCard.textContent = '?';
    resetTurn();
  }, 800);
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

document.getElementById('startBtn').addEventListener('click', startGame);
window.addEventListener('DOMContentLoaded', startGame);