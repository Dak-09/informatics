const gameBoard = document.getElementById("gameBoard");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const hintBtn = document.getElementById("hintBtn");
const restartBtn = document.getElementById("restartBtn");
const levelBtns = document.querySelectorAll(".level-btn");

const timeEl = document.getElementById("time");
const movesEl = document.getElementById("moves");
const matchesEl = document.getElementById("matches");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const hintsEl = document.getElementById("hints");
const bestScoreEl = document.getElementById("bestScore");
const messageEl = document.getElementById("message");
const statusChip = document.getElementById("statusChip");
const timeFill = document.getElementById("timeFill");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

const cardItems = [
  { id: "apple", name: "Apple", color: "#ef4444", accent: "#7ddf64", shape: "apple" },
  { id: "banana", name: "Banana", color: "#facc15", accent: "#ff8a3d", shape: "banana" },
  { id: "cherry", name: "Cherry", color: "#e11d48", accent: "#7ddf64", shape: "cherry" },
  { id: "orange", name: "Orange", color: "#fb923c", accent: "#f97316", shape: "orange" },
  { id: "grape", name: "Grape", color: "#a855f7", accent: "#7ddf64", shape: "grape" },
  { id: "pear", name: "Pear", color: "#bef264", accent: "#65a30d", shape: "pear" },
  { id: "watermelon", name: "Watermelon", color: "#22c55e", accent: "#ef4444", shape: "watermelon" },
  { id: "pineapple", name: "Pineapple", color: "#fbbf24", accent: "#22c55e", shape: "pineapple" },
  { id: "strawberry", name: "Strawberry", color: "#f43f5e", accent: "#22c55e", shape: "strawberry" },
  { id: "lemon", name: "Lemon", color: "#fde047", accent: "#84cc16", shape: "lemon" },
  { id: "kiwi", name: "Kiwi", color: "#84cc16", accent: "#3f6212", shape: "kiwi" },
  { id: "peach", name: "Peach", color: "#fb7185", accent: "#f97316", shape: "peach" }
];

const levels = {
  default: {
    name: "Beta Mission",
    pairs: 6,
    time: 75,
    boardClass: "medium",
    points: 150
  }
};

let currentLevel = "default";
let deck = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let gameStarted = false;
let isPaused = false;
let hintActive = false;

let moves = 0;
let matches = 0;
let score = 0;
let combo = 0;
let bestComboRound = 0;
let hintsLeft = 3;
let timeLeft = 60;
let timerInterval = null;
let previewTimeout = null;
let bestScore = Number(localStorage.getItem("cardQuestBestScore")) || 0;

bestScoreEl.textContent = bestScore;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function getShapeMarkup(item) {
  const fill = item.color;
  const stroke = item.accent;

  const shapes = {
    apple: `<path d="M64 42 C77 27 105 37 105 69 C105 96 86 111 66 104 C44 113 23 95 23 68 C23 37 51 27 64 42 Z" fill="${fill}" stroke="#7f1d1d" stroke-width="6" /><path d="M64 40 C61 28 64 19 73 13" fill="none" stroke="#78350f" stroke-width="7" stroke-linecap="round" /><path d="M75 24 C88 19 97 22 103 30 C90 34 82 34 75 24 Z" fill="${stroke}" />`,
    banana: `<path d="M28 83 C59 109 96 96 111 50 C93 79 58 88 31 58 C27 68 26 76 28 83 Z" fill="${fill}" stroke="${stroke}" stroke-width="7" stroke-linejoin="round" /><circle cx="31" cy="58" r="5" fill="#7c2d12" /><circle cx="111" cy="50" r="5" fill="#7c2d12" />`,
    cherry: `<path d="M58 64 C61 47 72 34 86 24" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" /><path d="M82 66 C83 48 84 35 86 24" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" /><circle cx="48" cy="82" r="24" fill="${fill}" stroke="#881337" stroke-width="6" /><circle cx="83" cy="82" r="24" fill="${fill}" stroke="#881337" stroke-width="6" /><path d="M86 24 C99 19 108 22 113 31 C101 35 92 34 86 24 Z" fill="${stroke}" />`,
    orange: `<circle cx="64" cy="70" r="38" fill="${fill}" stroke="#c2410c" stroke-width="7" /><path d="M64 35 C60 25 64 17 73 12" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round" /><path d="M75 25 C88 20 96 23 101 31 C90 35 82 34 75 25 Z" fill="${stroke}" /><path d="M39 70 H89 M64 45 V96 M46 51 C59 66 70 76 82 91 M82 51 C69 66 58 76 46 91" stroke="#fed7aa" stroke-width="3" opacity="0.45" />`,
    grape: `<circle cx="51" cy="50" r="15" fill="${fill}" stroke="#581c87" stroke-width="5" /><circle cx="76" cy="50" r="15" fill="${fill}" stroke="#581c87" stroke-width="5" /><circle cx="39" cy="75" r="15" fill="${fill}" stroke="#581c87" stroke-width="5" /><circle cx="64" cy="75" r="15" fill="${fill}" stroke="#581c87" stroke-width="5" /><circle cx="89" cy="75" r="15" fill="${fill}" stroke="#581c87" stroke-width="5" /><circle cx="52" cy="99" r="15" fill="${fill}" stroke="#581c87" stroke-width="5" /><circle cx="77" cy="99" r="15" fill="${fill}" stroke="#581c87" stroke-width="5" /><path d="M64 34 C66 23 72 16 82 12" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round" /><path d="M82 18 C95 15 103 20 107 29 C96 31 88 28 82 18 Z" fill="${stroke}" />`,
    pear: `<path d="M64 18 C79 18 86 34 79 49 C97 58 101 104 64 111 C27 104 31 58 49 49 C42 34 49 18 64 18 Z" fill="${fill}" stroke="${stroke}" stroke-width="7" stroke-linejoin="round" /><path d="M65 20 C62 13 65 8 72 6" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round" />`,
    watermelon: `<path d="M18 79 C31 31 97 31 110 79 C86 103 42 103 18 79 Z" fill="${fill}" stroke="#166534" stroke-width="7" stroke-linejoin="round" /><path d="M31 77 C42 48 86 48 97 77 C78 89 50 89 31 77 Z" fill="${stroke}" /><path d="M38 78 C54 86 74 86 90 78" fill="none" stroke="#fef2f2" stroke-width="5" /><circle cx="55" cy="70" r="3" fill="#111827" /><circle cx="72" cy="66" r="3" fill="#111827" /><circle cx="82" cy="75" r="3" fill="#111827" />`,
    pineapple: `<path d="M64 38 C88 52 94 97 64 113 C34 97 40 52 64 38 Z" fill="${fill}" stroke="#a16207" stroke-width="7" /><path d="M42 71 H86 M45 88 H83 M50 52 L78 104 M78 52 L50 104" stroke="#92400e" stroke-width="3" opacity="0.7" /><path d="M64 41 C57 27 49 20 38 17 C50 15 58 18 64 29 C69 16 80 10 94 11 C86 19 78 27 72 41 Z" fill="${stroke}" stroke="#166534" stroke-width="4" stroke-linejoin="round" />`,
    strawberry: `<path d="M64 112 C35 89 25 60 41 43 C52 31 61 39 64 45 C67 39 76 31 87 43 C103 60 93 89 64 112 Z" fill="${fill}" stroke="#9f1239" stroke-width="7" stroke-linejoin="round" /><path d="M42 42 L54 36 L64 43 L74 36 L86 42 L76 50 H52 Z" fill="${stroke}" stroke="#166534" stroke-width="4" stroke-linejoin="round" /><circle cx="55" cy="62" r="2.5" fill="#fee2e2" /><circle cx="73" cy="62" r="2.5" fill="#fee2e2" /><circle cx="64" cy="78" r="2.5" fill="#fee2e2" /><circle cx="50" cy="82" r="2.5" fill="#fee2e2" /><circle cx="78" cy="84" r="2.5" fill="#fee2e2" />`,
    lemon: `<path d="M22 68 C36 34 83 18 106 39 C92 77 45 110 22 68 Z" fill="${fill}" stroke="#ca8a04" stroke-width="7" stroke-linejoin="round" /><path d="M40 68 C55 55 72 46 91 42" stroke="#fef9c3" stroke-width="4" opacity="0.7" />`,
    kiwi: `<circle cx="64" cy="70" r="39" fill="#854d0e" stroke="#3f2a12" stroke-width="7" /><circle cx="64" cy="70" r="30" fill="${fill}" /><circle cx="64" cy="70" r="13" fill="#fef9c3" /><circle cx="48" cy="60" r="2.5" fill="#111827" /><circle cx="80" cy="60" r="2.5" fill="#111827" /><circle cx="47" cy="82" r="2.5" fill="#111827" /><circle cx="81" cy="82" r="2.5" fill="#111827" /><circle cx="64" cy="46" r="2.5" fill="#111827" /><circle cx="64" cy="94" r="2.5" fill="#111827" />`,
    peach: `<path d="M64 104 C35 104 23 82 29 58 C35 34 55 31 64 45 C73 31 93 34 99 58 C105 82 93 104 64 104 Z" fill="${fill}" stroke="#be123c" stroke-width="7" /><path d="M64 46 C59 66 61 86 64 103" fill="none" stroke="${stroke}" stroke-width="4" opacity="0.55" /><path d="M69 35 C81 27 91 27 99 34 C87 40 78 41 69 35 Z" fill="#84cc16" />`
  };

  return shapes[item.shape];
}

function createCardImage(item) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <g>
        ${getShapeMarkup(item)}
      </g>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function updateStats() {
  const level = levels[currentLevel];
  const timePercent = Math.max(0, Math.min(100, (timeLeft / level.time) * 100));

  timeEl.textContent = formatTime(timeLeft);
  movesEl.textContent = moves;
  matchesEl.textContent = `${matches} / ${level.pairs}`;
  scoreEl.textContent = score;
  comboEl.textContent = `x${combo}`;
  hintsEl.textContent = hintsLeft;
  bestScoreEl.textContent = bestScore;
  timeFill.style.width = `${timePercent}%`;
  timeFill.classList.toggle("low", timePercent <= 25);
}

function setMessage(text, type = "") {
  messageEl.innerHTML = text;
  messageEl.className = "message";

  if (type) {
    messageEl.classList.add(type);
  }
}

function createDeck() {
  const level = levels[currentLevel];
  const selected = cardItems.slice(0, level.pairs);
  deck = shuffle([...selected, ...selected]);
}

function renderBoard() {
  const level = levels[currentLevel];

  gameBoard.innerHTML = "";
  gameBoard.className = `game-board ${level.boardClass}`;

  deck.forEach((item, index) => {
    const card = document.createElement("button");
    card.className = "card";
    card.dataset.cardId = item.id;
    card.dataset.cardName = item.name;
    card.dataset.index = index;
    card.disabled = true;

    card.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-front">?</span>
        <span class="card-face card-back">
          <img class="card-image" src="${createCardImage(item)}" alt="${item.name}" />
        </span>
      </span>
    `;

    card.addEventListener("click", () => flipCard(card));
    gameBoard.appendChild(card);
  });
}

function prepareGame() {
  const level = levels[currentLevel];

  clearInterval(timerInterval);
  clearTimeout(previewTimeout);
  timerInterval = null;
  previewTimeout = null;

  moves = 0;
  matches = 0;
  score = 0;
  combo = 0;
  bestComboRound = 0;
  hintsLeft = 3;
  timeLeft = level.time;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  gameStarted = false;
  isPaused = false;
  hintActive = false;

  modal.style.display = "none";
  modal.classList.remove("win");

  createDeck();
  renderBoard();
  updateStats();
  startBtn.disabled = false;
  startBtn.textContent = "Start Game";
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pause";
  hintBtn.disabled = true;
  statusChip.textContent = "Standby";
  statusChip.className = "status-chip";

  setMessage("Press <b>Start Game</b> to begin.");
}

function startGame() {
  if (gameStarted || previewTimeout) return;

  prepareGame();

  gameStarted = true;
  lockBoard = true;
  isPaused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = true;
  hintBtn.disabled = true;
  startBtn.textContent = "Preparing";
  statusChip.textContent = "Preview";
  statusChip.className = "status-chip previewing";

  setMessage("Memorize the cards. Game starts in 3 seconds.");

  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.disabled = true;
    card.classList.add("preview");
  });

  previewTimeout = setTimeout(() => {
    previewTimeout = null;

    cards.forEach(card => {
      card.classList.remove("preview");
      card.disabled = false;
    });

    lockBoard = false;
    pauseBtn.disabled = false;
    hintBtn.disabled = false;
    statusChip.textContent = "Running";
    statusChip.className = "status-chip running";
    setMessage("Game started. Find all matching pairs!");

    timerInterval = setInterval(() => {
      if (isPaused) return;

      timeLeft--;
      updateStats();

      if (timeLeft <= 0) {
        endGame(false);
      }
    }, 1000);
  }, 3000);
}

function flipCard(card) {
  if (!gameStarted || isPaused || lockBoard || hintActive) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  if (card === firstCard) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  updateStats();

  checkMatch();
}

function checkMatch() {
  const isMatch = firstCard.dataset.cardId === secondCard.dataset.cardId;

  if (isMatch) {
    handleMatch();
  } else {
    handleWrong();
  }
}

function handleMatch() {
  const level = levels[currentLevel];

  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  firstCard.classList.add("pulse");
  secondCard.classList.add("pulse");

  matches++;
  combo++;
  bestComboRound = Math.max(bestComboRound, combo);
  score += level.points + Math.max(timeLeft, 0) - moves + combo * 25;

  setMessage(`Combo x${combo}! You found the <b>${firstCard.dataset.cardName}</b> pair.`, "success");

  resetTurn();
  updateStats();

  if (matches === level.pairs) {
    setTimeout(() => endGame(true), 700);
  }
}

function handleWrong() {
  lockBoard = true;
  combo = 0;
  score = Math.max(0, score - 20);
  setMessage("Not a match. Try again.", "danger");
  updateStats();

  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetTurn();
  }, 850);
}

function togglePause() {
  if (!gameStarted || previewTimeout || lockBoard && !isPaused) return;

  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
  statusChip.textContent = isPaused ? "Paused" : "Running";
  statusChip.className = isPaused ? "status-chip paused" : "status-chip running";
  setMessage(isPaused ? "Game paused. Press <b>Resume</b> to continue." : "Game resumed. Find all matching pairs!");

  document.querySelectorAll(".card:not(.matched)").forEach(card => {
    card.disabled = isPaused;
  });
}

function useHint() {
  if (!gameStarted || isPaused || lockBoard || hintActive || firstCard || hintsLeft <= 0) return;

  hintActive = true;
  hintsLeft--;
  combo = 0;
  score = Math.max(0, score - 50);
  updateStats();
  setMessage("Hint used. Unmatched cards are visible for a moment.");

  const cards = document.querySelectorAll(".card:not(.matched)");
  cards.forEach(card => {
    card.disabled = true;
    card.classList.add("preview");
  });

  setTimeout(() => {
    cards.forEach(card => {
      card.classList.remove("preview");
      card.disabled = false;
    });

    hintActive = false;
    hintBtn.disabled = hintsLeft <= 0;
    setMessage("Hint finished. Keep matching!");
  }, 1200);
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function endGame(win) {
  clearInterval(timerInterval);
  clearTimeout(previewTimeout);
  timerInterval = null;
  previewTimeout = null;
  gameStarted = false;
  isPaused = false;
  hintActive = false;
  lockBoard = true;
  startBtn.disabled = false;
  startBtn.textContent = "Start Game";
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pause";
  hintBtn.disabled = true;
  statusChip.textContent = win ? "Complete" : "Offline";
  statusChip.className = win ? "status-chip complete" : "status-chip danger";

  document.querySelectorAll(".card").forEach(card => {
    card.disabled = true;
  });

  if (win && score > bestScore) {
    bestScore = score;
    localStorage.setItem("cardQuestBestScore", bestScore);
  }

  updateStats();

  modal.style.display = "flex";
  modal.classList.toggle("win", win);

  if (win) {
    modalTitle.textContent = "You Win!";
    modalText.innerHTML = `
      Score: <b>${score}</b><br>
      Best Combo: <b>x${bestComboRound}</b><br>
      Moves: <b>${moves}</b><br>
      Time Left: <b>${formatTime(timeLeft)}</b>
    `;
    setMessage("Congratulations! You completed the beta version.", "success");
  } else {
    modalTitle.textContent = "Time is Over!";
    modalText.innerHTML = `
      You found <b>${matches}</b> pairs.<br>
      Final Score: <b>${score}</b><br>
      Try again to improve your result.
    `;
    setMessage("Time finished. Restart the game.", "danger");
  }
}

levelBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentLevel = btn.dataset.level;

    levelBtns.forEach(item => item.classList.remove("active"));
    btn.classList.add("active");

    prepareGame();
  });
});

restartBtn.addEventListener("click", prepareGame);
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
hintBtn.addEventListener("click", useHint);

prepareGame();
