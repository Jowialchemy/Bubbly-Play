
/* ==========================================
   BUBBLY PLAY — COMPLETE GAME CONTROLLER
   Home • Learn • Games • Rewards • Profile
   Bubble Pop • Color Match • Shape Sorter
========================================== */

const screenIds = ["home", "learn", "games", "rewards", "profile", "play"];

let currentGame = "bubble";
let bubbleCount = 0;
let score = 0;
let gamePaused = false;
let animationFrame = null;
let gameCleanup = null;
let selectedPiece = null;

const bubblyState = {
  stars: 0,
  completedGames: 0,
  bubblesPopped: 0
};

function getElement(...ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) return element;
  }
  return null;
}

function goTo(id) {
  stopCurrentGame();

  screenIds.forEach(screenId => {
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.toggle("active", screenId === id);
  });

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.screen === id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showNotice(message) {
  alert(message);
}

function stopCurrentGame() {
  gamePaused = false;

  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (typeof gameCleanup === "function") {
    gameCleanup();
    gameCleanup = null;
  }
}

function startGame(game) {
  stopCurrentGame();

  currentGame = game;
  score = 0;
  gamePaused = false;

  goTo("play");

  if (game === "shape") {
    setupShapeSorter();
  } else if (game === "color") {
    setupColorMatch();
  } else {
    setupBubblePop();
  }
}

function resetGame() {
  startGame(currentGame);
}

/* ==========================================
   GAME SCREEN HELPERS
========================================== */

function prepareGame(title, prompt, instructions) {
  const titleElement = getElement("play-title");
  const promptElement = getElement("play-prompt");
  const instructionsElement = getElement("play-instructions");
  const area = getElement("playArea", "play-area");
  const feedback = getElement("playFeedback", "play-feedback");

  if (titleElement) titleElement.textContent = title;
  if (promptElement) promptElement.textContent = prompt;
  if (instructionsElement) instructionsElement.textContent = instructions;

  if (area) {
    area.innerHTML = "";
    area.style.display = "block";
    area.style.gridTemplateColumns = "";
  }

  if (feedback) feedback.textContent = "";

  return { area, feedback };
}

function setFeedback(message) {
  const feedback = getElement("playFeedback", "play-feedback");
  if (feedback) feedback.textContent = message;
}

function awardStar() {
  bubblyState.stars++;
  updateRewards();
}

function updateRewards() {
  document.querySelectorAll("[data-bubbly-stars]").forEach(element => {
    element.textContent = bubblyState.stars;
  });
}

/* ==========================================
   BUBBLE POP — MOVING, FLOATING BUBBLES
========================================== */

function setupBubblePop() {
  const { area } = prepareGame(
    "Bubble Pop",
    "Pop the floating bubbles! 🫧",
    "Tap the bubbles as they float around the sky!"
  );

  if (!area) return;

  const stage = document.createElement("div");
  stage.className = "bubble-stage";

  stage.style.cssText = `
    position:relative;
    width:100%;
    height:clamp(360px,65vh,540px);
    min-height:360px;
    overflow:hidden;
    border-radius:28px;
    background:linear-gradient(180deg,#8bd7ff 0%,#d9f4ff 65%,#b8e9d1 100%);
    box-shadow:inset 0 0 25px rgba(255,255,255,.6);
    touch-action:pan-y;
  `;

  area.appendChild(stage);
  area.style.display = "block";

  const colors = [
    "#ff83c3", "#ffd15c", "#5ce0b2", "#55baff",
    "#b59aff", "#ff9d80", "#8ce6ed", "#ffb4d5"
  ];

  const bubbles = [];
  let popped = 0;
  let lastTime = 0;
  let running = true;

  const count = 12;

  for (let i = 0; i < count; i++) {
    const size = 43 + Math.random() * 35;
    const bubble = document.createElement("button");

    bubble.type = "button";
    bubble.className = "moving-bubble";
    bubble.setAttribute("aria-label", "Pop bubble");

    bubble.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      padding:0;
      border-radius:50%;
      border:3px solid rgba(255,255,255,.85);
      background:radial-gradient(circle at 30% 25%,white 0%,${colors[i % colors.length]} 30%,${colors[i % colors.length]} 75%);
      box-shadow:inset -5px -7px 10px rgba(70,60,130,.15),0 6px 12px rgba(80,100,180,.18);
      display:grid;
      place-items:center;
      font-size:18px;
      z-index:1;
      will-change:transform;
      transition:opacity .2s,filter .2s;
    `;

    const bubbleData = {
      element: bubble,
      size,
      x: Math.random() * 75 + 5,
      y: Math.random() * 75 + 5,
      vx: (Math.random() * 0.08 + 0.025) * (Math.random() > .5 ? 1 : -1),
      vy: (Math.random() * 0.07 + 0.02) * (Math.random() > .5 ? 1 : -1),
      popped: false,
      phase: Math.random() * 6
    };

    bubble.addEventListener("click", () => {
      if (bubbleData.popped || !running || gamePaused) return;

      bubbleData.popped = true;
      popped++;
      bubblyState.bubblesPopped++;

      bubble.textContent = "✨";
      bubble.style.transform += " scale(1.5)";
      bubble.style.opacity = "0";
      bubble.style.filter = "brightness(1.5)";

      const message = getElement("playFeedback", "play-feedback");

      if (message) {
        message.textContent = popped === count
          ? "Amazing! You popped every bubble! ⭐"
          : `Pop! ${popped} of ${count} bubbles popped! ✨`;
      }

      if (popped === count) {
        bubblyState.completedGames++;
        awardStar();

        const finish = document.createElement("div");
        finish.textContent = "🎉 Fantastic! You're a Bubble Star! 🌟";

        finish.style.cssText = `
          position:absolute;
          z-index:5;
          top:50%;
          left:50%;
          transform:translate(-50%,-50%);
          width:85%;
          padding:20px 12px;
          text-align:center;
          background:white;
          color:#6548d4;
          font-size:19px;
          font-weight:bold;
          border-radius:22px;
          box-shadow:0 8px 25px rgba(70,50,130,.2);
        `;

        stage.appendChild(finish);
      }
    });

    stage.appendChild(bubble);
    bubbles.push(bubbleData);
  }

  function animate(time) {
    if (!running) return;

    if (!lastTime) lastTime = time;

    const delta = Math.min(time - lastTime, 40);
    lastTime = time;

    if (!gamePaused) {
      const width = stage.clientWidth;
      const height = stage.clientHeight;

      bubbles.forEach((bubble, index) => {
        if (bubble.popped) return;

        bubble.phase += delta * 0.001;

        bubble.x += bubble.vx * delta * 0.035;
        bubble.y += bubble.vy * delta * 0.035;

        bubble.x += Math.sin(bubble.phase + index) * delta * 0.0009;

        const maxX = Math.max(0, width - bubble.size);
        const maxY = Math.max(0, height - bubble.size);

        if (bubble.x < 0 || bubble.x > maxX) {
          bubble.vx *= -1;
          bubble.x = Math.max(0, Math.min(maxX, bubble.x));
        }

        if (bubble.y < 0 || bubble.y > maxY) {
          bubble.vy *= -1;
          bubble.y = Math.max(0, Math.min(maxY, bubble.y));
        }

        bubble.element.style.left = bubble.x + "px";
        bubble.element.style.top = bubble.y + "px";
      });
    }

    animationFrame = requestAnimationFrame(animate);
  }

  animationFrame = requestAnimationFrame(animate);

  gameCleanup = () => {
    running = false;
    bubbles.length = 0;
  };
}

/* ==========================================
   COLOR MATCH
========================================== */

function setupColorMatch() {
  const { area } = prepareGame(
    "Color Match",
    "Find the matching color! 🎨",
    "Tap the color that matches the target."
  );

  if (!area) return;

  const colors = [
    { name: "Purple", color: "#9675ff" },
    { name: "Green", color: "#55d6a1" },
    { name: "Orange", color: "#ffad55" },
    { name: "Pink", color: "#ff82bd" },
    { name: "Blue", color: "#4bbcff" },
    { name: "Yellow", color: "#ffd447" }
  ];

  let round = 0;
  let target = null;
  let answered = false;

  const game = document.createElement("div");

  game.style.cssText = `
    padding:18px 12px 24px;
    border-radius:28px;
    background:linear-gradient(180deg,#d5f1ff,#f2eaff);
  `;

  const targetCard = document.createElement("div");

  targetCard.style.cssText = `
    text-align:center;
    padding:18px;
    border-radius:22px;
    background:white;
    margin-bottom:18px;
    color:#253b91;
    font-weight:bold;
  `;

  const targetCircle = document.createElement("div");

  targetCircle.style.cssText = `
    width:76px;
    height:76px;
    margin:12px auto;
    border-radius:50%;
    box-shadow:inset -5px -7px 10px rgba(0,0,0,.12),0 5px 12px #d6d0ed;
  `;

  targetCard.append("Find this color!", targetCircle);
  game.appendChild(targetCard);

  const choices = document.createElement("div");

  choices.style.cssText = `
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:12px;
  `;

  game.appendChild(choices);

  const message = document.createElement("p");

  message.style.cssText = `
    min-height:45px;
    text-align:center;
    color:#6548d4;
    font-weight:bold;
    font-size:18px;
  `;

  game.appendChild(message);

  const next = document.createElement("button");

  next.type = "button";
  next.textContent = "Next Round ➜";

  next.style.cssText = `
    display:block;
    margin:12px auto 0;
    padding:13px 22px;
    border-radius:22px;
    background:#8060ed;
    color:white;
    font-weight:bold;
  `;

  next.hidden = true;
  game.appendChild(next);
  area.appendChild(game);

  function newRound() {
    answered = false;
    message.textContent = "";
    next.hidden = true;
    choices.innerHTML = "";

    const shuffled = [...colors].sort(() => Math.random() - .5);

    target = shuffled[Math.floor(Math.random() * 3)];

    targetCard.firstChild.textContent = `Round ${round + 1} — Find this color!`;
    targetCircle.style.background = target.color;

    shuffled.forEach(color => {
      const button = document.createElement("button");

      button.type = "button";
      button.setAttribute("aria-label", color.name);

      button.style.cssText = `
        min-height:95px;
        border:4px solid white;
        border-radius:23px;
        background:${color.color};
        box-shadow:0 5px 12px rgba(70,60,130,.18);
        color:#28263a;
        font-weight:bold;
        font-size:12px;
      `;

      button.textContent = color.name;

      button.addEventListener("click", () => {
        if (answered) return;

        if (color.name === target.name) {
          answered = true;
          round++;
          score++;

          message.textContent = "Correct! Wonderful matching! 🌟";
          button.style.outline = "4px solid #6548d4";
          next.hidden = false;

          if (round % 3 === 0) awardStar();

          if (round >= 5) {
            message.textContent = "🎉 You completed all five rounds!";
            next.textContent = "Play Again ↻";
            bubblyState.completedGames++;
          }
        } else {
          message.textContent = "Good try! Look at the target again. 💜";
        }
      });

      choices.appendChild(button);
    });
  }

  next.addEventListener("click", () => {
    if (round >= 5) round = 0;
    newRound();
  });

  newRound();
}

/* ==========================================
   SHAPE SORTER — DRAG SHAPES INTO HOLES
========================================== */

function setupShapeSorter() {
  const { area } = prepareGame(
    "Shape Sorter",
    "Put the shapes in the right holes!",
    "Drag each shape to its matching hole, or tap a shape and then its hole."
  );

  if (!area) return;

  const shapes = [
    { id: "circle", symbol: "●", label: "Circle", color: "#ff454e" },
    { id: "triangle", symbol: "▲", label: "Triangle", color: "#16b5ff" },
    { id: "square", symbol: "■", label: "Square", color: "#19c99d" },
    { id: "star", symbol: "★", label: "Star", color: "#ffcf32" }
  ];

  let completed = 0;
  let dragging = null;
  let ghost = null;
  let selected = null;
  let pointerId = null;
  let running = true;

  area.style.display = "block";
  area.style.gridTemplateColumns = "none";

  area.innerHTML = `
    <div class="shape-game">
      <div class="shape-game-header">
        <button class="shape-round-button" type="button"
          data-action="back" aria-label="Back to games">‹</button>
        <h3>Shape Sorter</h3>
        <button class="shape-round-button" type="button"
          data-action="restart" aria-label="Restart game">↻</button>
      </div>

      <div class="shape-prompt">Put the shapes in the right holes!</div>

      <div class="shape-garden">
        <div class="shape-board" aria-label="Shape holes">
          ${shapes.map(shape => `
            <button type="button" class="shape-hole"
              data-hole="${shape.id}" aria-label="${shape.label} hole">
              <span class="shape-symbol" aria-hidden="true">${shape.symbol}</span>
            </button>
          `).join("")}
        </div>

        <div class="shape-tray" aria-label="Shapes to move">
          ${[...shapes].sort(() => Math.random() - .5).map(shape => `
            <button type="button" class="shape-piece"
              data-shape="${shape.id}" aria-label="Move ${shape.label}">
              <span class="shape-symbol" aria-hidden="true">${shape.symbol}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <p class="shape-feedback" aria-live="polite">
        Pick up a shape and find its hole! 🧩
      </p>
    </div>
  `;

  const game = area.querySelector(".shape-game");
  const message = game.querySelector(".shape-feedback");
  const tray = game.querySelector(".shape-tray");
  const holes = [...game.querySelectorAll(".shape-hole")];

  holes.forEach(hole => {
    const shape = shapes.find(item => item.id === hole.dataset.hole);
    hole.innerHTML = `
      <span class="shape-symbol" aria-hidden="true">${shape.symbol}</span>
    `;
  });

  function say(text) {
    message.textContent = text;
  }

  function clearDrag() {
    if (ghost) ghost.remove();
    ghost = null;

    if (dragging) dragging.classList.remove("dragging");
    dragging = null;
    pointerId = null;

    holes.forEach(hole => hole.classList.remove("drag-over"));
  }

  function placeShape(piece, hole) {
    if (!piece || !hole || !running) return;

    if (piece.dataset.shape !== hole.dataset.hole) {
      say("Good try! Find the matching shape. 💜");
      return;
    }

    const shape = shapes.find(item => item.id === piece.dataset.shape);

    hole.classList.add("filled");
    hole.innerHTML = `
      <span class="shape-symbol" aria-label="${shape.label}">
        ${shape.symbol}
      </span>
    `;

    piece.remove();

    if (selected === piece) selected = null;

    completed++;

    say(completed === shapes.length
      ? "Amazing! You matched every shape! 🌟"
      : `Great job! You found the ${shape.label.toLowerCase()}! ✨`
    );

    if (completed === shapes.length) {
      bubblyState.completedGames++;
      awardStar();

      tray.innerHTML = `
        <div class="shape-game-complete" style="grid-column:1/-1">
          🎉 You did it! All shapes fit! 🌟
          <br>
          <button type="button" class="shape-round-button"
            data-action="again" style="width:auto;padding:0 20px;margin-top:12px">
            Play Again ↻
          </button>
        </div>
      `;

      tray.querySelector('[data-action="again"]').addEventListener("click", () => {
        setupShapeSorter();
      });
    }
  }

  function moveGhost(x, y) {
    if (!ghost) return;

    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;

    holes.forEach(hole => {
      const rect = hole.getBoundingClientRect();

      hole.classList.toggle(
        "drag-over",
        x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom
      );
    });
  }

  function onPointerMove(event) {
    if (!dragging || event.pointerId !== pointerId) return;
    event.preventDefault();
    moveGhost(event.clientX, event.clientY);
  }

  function onPointerUp(event) {
    if (!dragging || event.pointerId !== pointerId) return;

    const piece = dragging;
    const x = event.clientX;
    const y = event.clientY;

    if (ghost) ghost.style.display = "none";

    const target = document.elementFromPoint(x, y);
    const hole = target && target.closest(".shape-hole");

    clearDrag();

    if (hole && game.contains(hole)) {
      placeShape(piece, hole);
    } else {
      say("Move the shape into its matching hole! 😊");
    }
  }

  function onPointerCancel(event) {
    if (pointerId !== null && event.pointerId !== pointerId) return;
    clearDrag();
  }

  tray.addEventListener("pointerdown", event => {
    const piece = event.target.closest(".shape-piece");

    if (!piece || !tray.contains(piece)) return;

    event.preventDefault();

    dragging = piece;
    pointerId = event.pointerId;

    ghost = document.createElement("div");
    ghost.className = "shape-drag-ghost";

    const symbol = piece.querySelector(".shape-symbol");

    ghost.innerHTML = `
      <span class="shape-symbol"
        style="color:${getComputedStyle(symbol).color}">
        ${symbol.textContent}
      </span>
    `;

    document.body.appendChild(ghost);
    piece.classList.add("dragging");

    moveGhost(event.clientX, event.clientY);

    document.addEventListener("pointermove", onPointerMove, {
      passive: false
    });
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
  });

  tray.addEventListener("click", event => {
    const piece = event.target.closest(".shape-piece");

    if (!piece || dragging) return;

    if (selected) selected.classList.remove("selected");

    if (selected === piece) {
      selected = null;
      say("Choose a shape to move. 😊");
      return;
    }

    selected = piece;
    selected.classList.add("selected");

    say(`Now tap the ${piece.dataset.shape} hole! 👆`);
  });

  holes.forEach(hole => {
    hole.addEventListener("click", () => {
      if (!selected) return;

      const piece = selected;

      if (piece.dataset.shape !== hole.dataset.hole) {
        say("Good try! Tap the matching hole. 💜");
        return;
      }

      selected = null;
      placeShape(piece, hole);
    });
  });

  game.querySelector('[data-action="back"]').addEventListener("click", () => {
    goTo("games");
  });

  game.querySelector('[data-action="restart"]').addEventListener("click", () => {
    setupShapeSorter();
  });

  gameCleanup = () => {
    running = false;
    clearDrag();

    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
  };
}

/* ==========================================
   STARTUP
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  updateRewards();

  // Ensure the original navigation remains usable.
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const screen = item.dataset.screen;
      if (screen) goTo(screen);
    });
  });
});
