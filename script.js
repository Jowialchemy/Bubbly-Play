/* =========================================
   BUBBLY PLAY — script.js
   Little games. Big smiles!
   ========================================= */

let stars = Number(localStorage.getItem("bubblyStars") || 0);
let currentGame = "";
let completed = false;
let bubbleCount = 0;

const colors = [
  { name: "Red", value: "#ff6b7f", emoji: "🍎" },
  { name: "Blue", value: "#5bbcff", emoji: "🐟" },
  { name: "Yellow", value: "#ffd34d", emoji: "⭐" },
  { name: "Green", value: "#65d99a", emoji: "🐸" },
  { name: "Purple", value: "#a58aff", emoji: "🍇" }
];

const shapes = [
  { name: "Circle", emoji: "🔵" },
  { name: "Square", emoji: "🟦" },
  { name: "Triangle", emoji: "🔺" },
  { name: "Star", emoji: "⭐" }
];

/* UPDATE STAR COUNTERS AND PROGRESS */

function updateStars() {
  document.getElementById("starCount").textContent = stars;
  document.getElementById("progressText").textContent = stars + " stars earned";
  document.getElementById("progressPercent").textContent =
    Math.min(stars * 10, 100) + "%";

  document.getElementById("progressFill").style.width =
    Math.min(stars * 10, 100) + "%";

  document.getElementById("rewardStars").textContent = stars + " Stars";
  document.getElementById("profileStars").textContent = stars;

  localStorage.setItem("bubblyStars", stars);
}

/* NAVIGATION */

function showScreen(screenId, navButton) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const targetScreen = document.getElementById(screenId);

  if (targetScreen) {
    targetScreen.classList.add("active");
  }

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  if (navButton) {
    navButton.classList.add("active");
  } else {
    const matchingButton = document.querySelector(
      '[data-screen="' + screenId + '"]'
    );

    if (matchingButton) {
      matchingButton.classList.add("active");
    }
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* START A GAME */

function startGame(game) {
  currentGame = game;
  completed = false;

  showScreen("gameScreen");

  document.getElementById("feedback").textContent = "";
  document.getElementById("nextButton").classList.add("hidden");

  nextRound();
}

/* NEXT ROUND */

function nextRound() {
  completed = false;

  document.getElementById("feedback").textContent = "";
  document.getElementById("nextButton").classList.add("hidden");

  if (currentGame === "bubble") {
    bubblePopGame();
  }

  if (currentGame === "color") {
    colorMatchGame();
  }

  if (currentGame === "sort") {
    shapeSorterGame();
  }

  if (currentGame === "fit") {
    shapeFitGame();
  }
}

/* AWARD A STAR */

function awardStar(message = "Great job! ⭐") {
  if (completed) return;

  completed = true;
  stars++;

  updateStars();

  document.getElementById("feedback").textContent = message;
  document.getElementById("nextButton").classList.remove("hidden");
}

/* =========================================
   GAME 1 — BUBBLE POP
   ========================================= */

function bubblePopGame() {
  document.getElementById("gameTitle").textContent = "Bubble Pop 🫧";

  document.getElementById("gameInstruction").textContent =
    "Tap all the floating bubbles!";

  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <div class="bubble-area" id="bubbleArea"></div>
  `;

  const bubbleArea = document.getElementById("bubbleArea");

  bubbleCount = 0;

  const bubbleColors = [
    "#ffb8d2",
    "#bde8ff",
    "#ffe58a",
    "#b9f2d0",
    "#d7c8ff"
  ];

  for (let i = 0; i < 10; i++) {
    const bubble = document.createElement("button");

    bubble.className = "bubble";

    const size = 45 + Math.random() * 30;

    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.background = bubbleColors[i % bubbleColors.length];
    bubble.style.left = Math.random() * 80 + "%";
    bubble.style.top = Math.random() * 75 + "%";
    bubble.style.animationDelay = Math.random() + "s";

    bubble.textContent = "✨";
    bubble.setAttribute("aria-label", "Pop bubble");

    bubble.onclick = () => {
      bubble.remove();

      bubbleCount++;

      if (bubbleCount === 10) {
        awardStar("You popped them all! Amazing! ⭐");
      }
    };

    bubbleArea.appendChild(bubble);
  }
}

/* =========================================
   GAME 2 — COLOR MATCH
   ========================================= */

function colorMatchGame() {
  document.getElementById("gameTitle").textContent = "Color Match 🎨";

  const target = colors[Math.floor(Math.random() * colors.length)];

  document.getElementById("gameInstruction").innerHTML =
    'Can you find <strong style="color:' +
    target.value +
    '">' +
    target.name +
    "</strong>?";

  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <div class="choice-row" id="colorChoices"></div>
  `;

  const choices = [...colors]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  if (!choices.some(color => color.name === target.name)) {
    choices[Math.floor(Math.random() * choices.length)] = target;
  }

  choices.forEach(color => {
    const button = document.createElement("button");

    button.className = "color-choice";
    button.style.background = color.value;
    button.setAttribute("aria-label", color.name);

    button.onclick = () => {
      if (color.name === target.name) {
        awardStar("You found " + target.name + "! ⭐");
      } else {
        document.getElementById("feedback").textContent =
          "Try another color! 😊";
      }
    };

    document.getElementById("colorChoices").appendChild(button);
  });
}

/* =========================================
   GAME 3 — SHAPE SORTER
   ========================================= */

function shapeSorterGame() {
  document.getElementById("gameTitle").textContent = "Shape Sorter 🔺";

  const target = shapes[Math.floor(Math.random() * shapes.length)];

  document.getElementById("gameInstruction").textContent =
    "Tap the " + target.name + " shape!";

  const choices = [...shapes].sort(() => Math.random() - 0.5);

  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <div class="choice-row" id="shapeChoices"></div>
  `;

  choices.forEach(shape => {
    const button = document.createElement("button");

    button.className = "shape-piece";
    button.style.background = "#eee8ff";
    button.textContent = shape.emoji;
    button.setAttribute("aria-label", shape.name);

    button.onclick = () => {
      if (shape.name === target.name) {
        awardStar("Wonderful! That's the " + target.name + "! ⭐");
      } else {
        document.getElementById("feedback").textContent =
          "Not quite. Try again! 😊";
      }
    };

    document.getElementById("shapeChoices").appendChild(button);
  });
}

/* =========================================
   GAME 4 — SHAPE FIT PUZZLE
   ========================================= */

function shapeFitGame() {
  document.getElementById("gameTitle").textContent =
    "Shape Fit Puzzle 🧩";

  document.getElementById("gameInstruction").textContent =
    "Tap a shape, then tap its matching empty space.";

  const puzzleShapes = [...shapes]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  let placed = 0;
  let selectedPiece = null;

  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <div class="shape-board" id="shapeBoard"></div>
    <div class="shape-pieces" id="shapePieces"></div>
  `;

  const board = document.getElementById("shapeBoard");
  const pieces = document.getElementById("shapePieces");

  puzzleShapes.forEach(shape => {
    /* CREATE EMPTY SHAPE SPACE */

    const slot = document.createElement("button");

    slot.className = "shape-slot";
    slot.dataset.shape = shape.name;
    slot.setAttribute("aria-label", "Empty " + shape.name + " space");
    slot.textContent = "?";

    slot.onclick = () => {
      if (!selectedPiece || slot.classList.contains("filled")) {
        return;
      }

      if (selectedPiece.dataset.shape === slot.dataset.shape) {
        slot.textContent = selectedPiece.textContent;
        slot.classList.add("filled");

        selectedPiece.remove();
        selectedPiece = null;

        placed++;

        document.getElementById("feedback").textContent =
          "Perfect fit! 🎉";

        if (placed === puzzleShapes.length) {
          awardStar("Puzzle complete! You did it! ⭐");
        }
      } else {
        document.getElementById("feedback").textContent =
          "Try a different space! 😊";
      }
    };

    board.appendChild(slot);

    /* CREATE MOVABLE SHAPE PIECE */

    const piece = document.createElement("button");

    piece.className = "shape-piece";
    piece.dataset.shape = shape.name;
    piece.textContent = shape.emoji;
    piece.setAttribute("aria-label", shape.name + " puzzle piece");

    piece.onclick = () => {
      selectedPiece = piece;

      document.querySelectorAll(".shape-piece").forEach(item => {
        item.style.outline = "none";
      });

      piece.style.outline = "4px solid #8b6cf6";

      document.getElementById("feedback").textContent =
        "Now tap the matching " + shape.name + " space!";
    };

    pieces.appendChild(piece);
  });
}

/* LOAD SAVED STARS */

updateStars();
