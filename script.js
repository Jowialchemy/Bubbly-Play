
function setupShapeSorter() {
  const area =
    document.getElementById("playArea") ||
    document.getElementById("play-area");

  const feedback =
    document.getElementById("playFeedback") ||
    document.getElementById("play-feedback");

  if (!area) {
    console.error("Bubbly Play: Shape Sorter game area not found.");
    return;
  }

  const shapes = [
    { id: "circle", symbol: "●", label: "Circle" },
    { id: "triangle", symbol: "▲", label: "Triangle" },
    { id: "square", symbol: "■", label: "Square" },
    { id: "star", symbol: "★", label: "Star" }
  ];

  let completed = 0;
  let dragging = null;
  let ghost = null;
  let startX = 0;
  let startY = 0;

  area.style.display = "block";
  area.style.gridTemplateColumns = "none";

  area.innerHTML = `
    <div class="shape-game">
      <div class="shape-game-header">
        <button class="shape-round-button"
          type="button" id="shapeBack" aria-label="Back to games">‹</button>

        <h3>Shape Sorter</h3>

        <button class="shape-round-button"
          type="button" id="shapeRestart" aria-label="Restart game">↻</button>
      </div>

      <div class="shape-prompt">
        Put the shapes in the right holes!
      </div>

      <div class="shape-garden">
        <div class="shape-board" aria-label="Shape holes">
          ${shapes.map(shape => `
            <div class="shape-hole"
              data-hole="${shape.id}"
              aria-label="${shape.label} hole"
              role="group">
              <span aria-hidden="true">⬤</span>
            </div>
          `).join("")}
        </div>

        <div class="shape-tray" aria-label="Shapes to move">
          ${[...shapes].sort(() => Math.random() - 0.5).map(shape => `
            <button class="shape-piece"
              type="button"
              data-shape="${shape.id}"
              aria-label="Move ${shape.label}"
              aria-grabbed="false">
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

  // Draw the recessed cutout shapes in the wooden board.
  holes.forEach(hole => {
    const shape = shapes.find(item => item.id === hole.dataset.hole);
    hole.innerHTML = `
      <span class="shape-symbol" aria-hidden="true">${shape.symbol}</span>
    `;
  });

  // Return to the games list.
  game.querySelector("#shapeBack").addEventListener("click", () => {
    if (typeof goTo === "function") goTo("games");
  });

  // Restart with a fresh board.
  game.querySelector("#shapeRestart").addEventListener("click", () => {
    setupShapeSorter();
  });

  function say(text) {
    message.textContent = text;

    if (feedback && feedback !== message) {
      feedback.textContent = text;
    }
  }

  function getShapeName(id) {
    return shapes.find(shape => shape.id === id)?.label || "shape";
  }

  function finishGame() {
    tray.innerHTML = `
      <div class="shape-game-complete" style="grid-column:1/-1">
        🎉 Amazing! You matched every shape! 🌟
        <br>
        <button type="button" class="shape-round-button"
          id="shapePlayAgain"
          style="width:auto;padding:0 20px;margin-top:12px">
          Play Again ↻
        </button>
      </div>
    `;

    tray.querySelector("#shapePlayAgain").addEventListener("click", () => {
      setupShapeSorter();
    });

    say("Wonderful work! You earned a star! ⭐");

    // Award a star only if your app already provides this function.
    if (typeof awardStar === "function") {
      awardStar();
    }
  }

  function placeShape(piece, hole) {
    if (!piece || !hole) return;

    if (piece.dataset.shape !== hole.dataset.hole) {
      say("Good try! Find the matching shape. 💜");
      hole.classList.remove("drag-over");
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
    completed++;

    say(
      completed === shapes.length
        ? "You did it! All the shapes fit! 🌟"
        : `Great job! You found the ${shape.label.toLowerCase()}! ✨`
    );

    if (completed === shapes.length) {
      finishGame();
    }
  }

  function clearDrag() {
    if (ghost) {
      ghost.remove();
      ghost = null;
    }

    if (dragging) {
      dragging.classList.remove("dragging");
      dragging.setAttribute("aria-grabbed", "false");
      dragging = null;
    }

    holes.forEach(hole => hole.classList.remove("drag-over"));
  }

  function moveGhost(x, y) {
    if (!ghost) return;

    ghost.style.left = x + "px";
    ghost.style.top = y + "px";

    // Highlight the hole underneath the moving shape.
    holes.forEach(hole => {
      const rect = hole.getBoundingClientRect();

      const over =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;

      hole.classList.toggle("drag-over", over);
    });
  }

  function onPointerMove(event) {
    if (!dragging) return;

    moveGhost(event.clientX, event.clientY);
  }

  function onPointerUp(event) {
    if (!dragging) return;

    const piece = dragging;
    const x = event.clientX;
    const y = event.clientY;

    // Temporarily remove the ghost so the real hole can be detected.
    if (ghost) ghost.style.display = "none";

    const target = document.elementFromPoint(x, y);
    const hole = target?.closest(".shape-hole");

    if (ghost) ghost.style.display = "";

    clearDrag();

    if (hole && game.contains(hole)) {
      placeShape(piece, hole);
    } else {
      say("Try moving the shape into its matching hole! 😊");
    }

    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
  }

  function onPointerCancel() {
    clearDrag();

    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
  }

  tray.addEventListener("pointerdown", event => {
    const piece = event.target.closest(".shape-piece");

    if (!piece || !tray.contains(piece)) return;

    event.preventDefault();

    dragging = piece;
    startX = event.clientX;
    startY = event.clientY;

    const symbol = piece.querySelector(".shape-symbol");

    ghost = document.createElement("div");
    ghost.className = "shape-drag-ghost";
    ghost.innerHTML = `
      <span class="shape-symbol"
        style="color:${getComputedStyle(symbol).color}">
        ${symbol.textContent}
      </span>
    `;

    document.body.appendChild(ghost);

    piece.classList.add("dragging");
    piece.setAttribute("aria-grabbed", "true");

    moveGhost(startX, startY);

    document.addEventListener("pointermove", onPointerMove, {
      passive: false
    });

    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
  });

  // Also let a child tap a shape, then tap its matching hole.
  // This provides an easier alternative for very young learners.
  let selectedPiece = null;

  tray.addEventListener("click", event => {
    const piece = event.target.closest(".shape-piece");

    if (!piece || dragging) return;

    if (selectedPiece === piece) {
      selectedPiece.classList.remove("selected");
      selectedPiece = null;
      say("Choose a shape to move. 😊");
      return;
    }

    if (selectedPiece) {
      selectedPiece.classList.remove("selected");
    }

    selectedPiece = piece;
    selectedPiece.classList.add("selected");
    say(`Now tap the ${getShapeName(piece.dataset.shape).toLowerCase()} hole! 👆`);
  });

  holes.forEach(hole => {
    hole.addEventListener("click", () => {
      if (!selectedPiece) return;

      const piece = selectedPiece;
      selectedPiece = null;
      placeShape(piece, hole);
    });
  });
}
