
const screens = ["home", "learn", "games", "rewards", "profile", "play"];

const state = {
  game: "bubble",
  score: 0,
  activities: 0,
  stars: 0,
  badges: 0,
  popped: 0,
  round: 0,
  target: "",
  paused: false,
  roundComplete: false
};

const $ = id => document.getElementById(id);
const playArea = $("playArea");
const scene = $("gameScene");
let toastTimer;
let feedbackTimer;

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function goTo(id) {
  if (!screens.includes(id)) return;

  screens.forEach(screen => {
    $(screen).classList.toggle("active", screen === id);
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.nav === id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id !== "play") state.paused = false;
  updateStats();
}

document.querySelectorAll("[data-nav]").forEach(button => {
  button.addEventListener("click", () => goTo(button.dataset.nav));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => goTo(button.dataset.go));
});

$("menuBtn").addEventListener("click", () => {
  showToast("Welcome to Bubbly Play! 💜 Choose a section below.");
});

$("searchBtn").addEventListener("click", () => goTo("games"));

$("storyBtn").addEventListener("click", () => {
  showToast("🦁 Welcome to the Jungle Adventure! Ask your grown-up to read along.");
  completeActivity(1);
});

["storiesBtn", "mathBtn", "scienceBtn", "artsBtn"].forEach(id => {
  $(id).addEventListener("click", () => {
    const names = {
      storiesBtn: "Story Time 📚",
      mathBtn: "Counting Fun 🔢",
      scienceBtn: "Little Scientists 🧪",
      artsBtn: "Creative Arts 🎨"
    };
    showToast(names[id] + " — more activities coming soon!");
    completeActivity(1);
  });
});

document.querySelectorAll("[data-game]").forEach(button => {
  button.addEventListener("click", () => startGame(button.dataset.game));
});

$("backGames").addEventListener("click", () => {
  state.paused = false;
  goTo("games");
});

$("restartBtn").addEventListener("click", () => resetGame());

$("pauseBtn").addEventListener("click", () => {
  state.paused = !state.paused;
  scene.classList.toggle("paused", state.paused);
  $("pauseBtn").textContent = state.paused ? "▶" : "Ⅱ";
  $("pauseBtn").setAttribute(
    "aria-label", state.paused ? "Resume game" : "Pause game"
  );

  playArea.querySelectorAll("button").forEach(button => {
    button.disabled = state.paused || state.roundComplete;
  });

  if (state.paused) {
    $("playEncouragement").textContent = "Take your time. Tap ▶ when you're ready! 💜";
  } else {
    $("playEncouragement").textContent = "Let's keep playing! 🌟";
  }
});

function startGame(game) {
  state.game = game;
  state.paused = false;
  state.score = 0;
  state.popped = 0;
  state.round = 0;
  state.roundComplete = false;

  goTo("play");
  resetGame();
}

function resetGame() {
  state.paused = false;
  state.roundComplete = false;
  state.score = 0;
  state.popped = 0;

  scene.classList.remove("paused", "success");
  $("pauseBtn").textContent = "Ⅱ";
  $("pauseBtn").setAttribute("aria-label", "Pause game");
  $("gameScore").textContent = "0";
  $("gameProgress").style.width = "0%";
  $("playFeedback").textContent = "";
  $("playEncouragement").textContent = "You're doing great! Every try is a win. 💜";
  playArea.innerHTML = "";

  if (state.game === "bubble") setupBubblePop();
  if (state.game === "color") setupColorMatch();
  if (state.game === "shape") setupShapeSorter();
}

function setGameHeader(title, prompt, instructions) {
  $("playTitle").textContent = title;
  $("playPrompt").textContent = prompt;
  $("playInstructions").textContent = instructions;
}

function setFeedback(message) {
  $("playFeedback").textContent = message;
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    if (!state.roundComplete) $("playFeedback").textContent = "";
  }, 1700);
}

function addPoints(points = 1) {
  state.score += points;
  $("gameScore").textContent = state.score;
  $("gameProgress").style.width =
    Math.min(100, (state.score / 10) * 100) + "%";
}

function completeActivity(starsEarned = 1) {
  state.activities++;
  state.stars += starsEarned;

  // Award each badge only once.
  if (state.activities >= 1 && state.badges < 1) state.badges = 1;
  if (state.activities >= 5 && state.badges < 2) state.badges = 2;
  if (state.activities >= 10 && state.badges < 3) state.badges = 3;
  if (state.activities >= 20 && state.badges < 4) state.badges = 4;

  updateStats();
}

function updateStats() {
  $("dailyText").textContent =
    `${Math.min(state.activities, 5)} / 5 activities`;
  $("dailyBar").style.width =
    `${Math.min(100, (state.activities / 5) * 100)}%`;

  $("statActivities").textContent = state.activities;
  $("statStars").textContent = state.stars;
  $("statBadges").textContent = state.badges;
  $("profileStars").textContent = state.stars;
  $("profileActivities").textContent = state.activities;
  $("profileBadges").textContent = state.badges;

  $("challengeBar").style.width =
    `${Math.min(100, (state.activities / 10) * 100)}%`;
}

// BUBBLE POP: bubbles float continuously and pop on touch.
const bubbleColors = [
  ["#ff9cdb", "#ec4aa6"],
  ["#ffe18a", "#ffb42f"],
  ["#83efb7", "#27bd86"],
  ["#83dcff", "#349be7"],
  ["#c6a0ff", "#8759e7"],
  ["#ffb49a", "#f47768"],
  ["#a9c6ff", "#637fe9"]
];

function setupBubblePop() {
  setGameHeader(
    "Bubble Pop",
    "Tap the bubbles! 🫧",
    "Watch them float, then pop them!"
  );

  $("playEncouragement").textContent =
    "Pop a bubble and watch it sparkle! ✨";

  const positions = [
    [5, 8], [37, 4], [68, 10],
    [17, 28], [51, 27], [76, 34],
    [3, 51], [34, 49], [61, 56],
    [17, 72], [48, 75], [74, 73]
  ];

  positions.forEach((position, index) => {
    const bubble = document.createElement("button");
    const colors = bubbleColors[index % bubbleColors.length];
    const size = 48 + Math.round(Math.random() * 21);

    bubble.className = "play-bubble";
    bubble.style.setProperty("--x", position[0] + "%");
    bubble.style.setProperty("--y", position[1] + "%");
    bubble.style.setProperty("--size", size + "px");
    bubble.style.setProperty("--bubble", colors[0]);
    bubble.style.setProperty("--bubble-dark", colors[1]);
    bubble.style.setProperty("--duration", (2.2 + Math.random() * 2) + "s");
    bubble.style.setProperty("--drift", (Math.random() * 22 - 11) + "px");
    bubble.style.animationDelay = (-Math.random() * 3) + "s";
    bubble.setAttribute("aria-label", "Pop bubble");
    bubble.textContent = "";

    bubble.addEventListener("click", () => {
      if (state.paused || state.roundComplete || bubble.disabled) return;

      bubble.disabled = true;
      bubble.classList.add("popped");

      const rect = bubble.getBoundingClientRect();
      const areaRect = playArea.getBoundingClientRect();
      const sparkle = document.createElement("span");

      sparkle.className = "pop-sparkle";
      sparkle.textContent = ["✨", "⭐", "💖", "✦"][Math.floor(Math.random() * 4)];
      sparkle.style.left = (rect.left - areaRect.left + size / 2) + "px";
      sparkle.style.top = (rect.top - areaRect.top + size / 2) + "px";
      playArea.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 750);
      setTimeout(() => bubble.remove(), 320);

      state.popped++;
      addPoints(1);
      setFeedback(["Pop! ✨", "Amazing! ⭐", "Lovely! 💜", "Yay! 🫧"][state.popped % 4]);

      if (state.popped >= positions.length) {
        finishRound("Amazing! You popped every bubble! 🌟");
      }
    });

    playArea.appendChild(bubble);
  });
}

// COLOR MATCH: find the color named at the top.
const colors = [
  { name: "Red", value: "#ff6578" },
  { name: "Yellow", value: "#ffce49" },
  { name: "Blue", value: "#39b9f5" },
  { name: "Green", value: "#39ce94" }
];

function setupColorMatch() {
  setGameHeader(
    "Color Match",
    "Find the same color!",
    "Look at the color name and tap its color."
  );

  nextColorRound();
}

function nextColorRound() {
  state.roundComplete = false;
  playArea.innerHTML = "";
  scene.classList.remove("success");

  const target = colors[Math.floor(Math.random() * colors.length)];
  state.target = target.name;
  $("playPrompt").textContent = `Find ${target.name}!`;
  $("playInstructions").textContent = "Tap the matching color.";

  const choices = [...colors].sort(() => Math.random() - 0.5);

  const grid = document.createElement("div");
  grid.className = "color-options";

  choices.forEach(color => {
    const button = document.createElement("button");
    button.className = "color-choice";
    button.style.background =
      `radial-gradient(circle at 30% 25%, white 0%, ${color.value} 30%, ${color.value} 100%)`;
    button.setAttribute("aria-label", color.name + " color");
    button.textContent = "";

    button.addEventListener("click", () => {
      if (state.paused || state.roundComplete) return;

      if (color.name === state.target) {
        addPoints(1);
        setFeedback("Yes! You found it! ⭐");

        if (state.round >= 4) {
          finishRound("Wonderful! You matched the colors! 🌈");
        } else {
          state.round++;
          state.roundComplete = true;
          setTimeout(() => {
            if (state.game === "color" && !state.paused) {
              nextColorRound();
            }
          }, 850);
        }
      } else {
        setFeedback("Good try! Find " + state.target + ". 💜");
        button.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(5px)" },
            { transform: "translateX(0)" }
          ],
          { duration: 250 }
        );
      }
    });

    grid.appendChild(button);
  });

  playArea.appendChild(grid);
}

// SHAPE SORTER: match the requested shape.
const shapes = [
  { name: "Circle", symbol: "●", color: "#ff719c" },
  { name: "Triangle", symbol: "▲", color: "#3fa9ff" },
  { name: "Square", symbol: "■", color: "#30c99a" },
  { name: "Star", symbol: "★", color: "#ffbc42" }
];

function setupShapeSorter() {
  setGameHeader(
    "Shape Sorter",
    "Find the right shape!",
    "Tap the shape that matches the target."
  );

  nextShapeRound();
}

function nextShapeRound() {
  state.roundComplete = false;
  playArea.innerHTML = "";
  scene.classList.remove("success");

  const target = shapes[Math.floor(Math.random() * shapes.length)];
  state.target = target.name;

  $("playPrompt").textContent = `Find the ${target.name}!`;
  $("playInstructions").textContent = "Which shape looks the same?";

  const targetBox = document.createElement("div");
  targetBox.className = "shape-target";
  targetBox.style.color = target.color;
  targetBox.textContent = target.symbol;
  targetBox.setAttribute("aria-label", "Target shape: " + target.name);
  playArea.appendChild(targetBox);

  const grid = document.createElement("div");
  grid.className = "shape-options";

  [...shapes].sort(() => Math.random() - 0.5).forEach(shape => {
    const button = document.createElement("button");
    button.className = "shape-choice";
    button.style.color = shape.color;
    button.textContent = shape.symbol;
    button.setAttribute("aria-label", shape.name);

    button.addEventListener("click", () => {
      if (state.paused || state.roundComplete) return;

      if (shape.name === state.target) {
        addPoints(1);
        setFeedback("Perfect match! ⭐");

        if (state.round >= 4) {
          finishRound("Amazing! You sorted the shapes! 🔺");
        } else {
          state.round++;
          state.roundComplete = true;
          setTimeout(() => {
            if (state.game === "shape" && !state.paused) {
              nextShapeRound();
            }
          }, 850);
        }
      } else {
        setFeedback("Nice try! Look for the " + state.target + ". 💜");
      }
    });

    grid.appendChild(button);
  });

  playArea.appendChild(grid);
}

function finishRound(message) {
  state.roundComplete = true;
  scene.classList.add("success");

  playArea.querySelectorAll("button").forEach(button => {
    button.disabled = true;
  });

  $("playPrompt").textContent = "You did it! 🎉";
  $("playInstructions").textContent = "You are a little superstar!";
  $("playFeedback").textContent = message;
  $("playEncouragement").textContent =
    "Wonderful playing! You can play again whenever you like. 💜";

  completeActivity(Math.max(1, Math.ceil(state.score / 5)));

  for (let i = 0; i < 7; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "pop-sparkle";
    sparkle.textContent = ["⭐", "✨", "💖"][i % 3];
    sparkle.style.left = (10 + Math.random() * 80) + "%";
    sparkle.style.top = (15 + Math.random() * 65) + "%";
    playArea.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1200);
  }
}

// Initial values
updateStats();
