
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  let currentScreen = "home";
  let currentGame = "bubble";
  let score = 0;
  let round = 0;
  let paused = false;
  let soundOn = true;
  let bestScore = Number(localStorage.getItem("bubblyBest") || 0);
  let activities = Number(localStorage.getItem("bubblyActivities") || 0);
  let stars = Number(localStorage.getItem("bubblyStars") || 0);
  let dailyCount = Number(localStorage.getItem("bubblyDaily") || 0);
  let gameTimer = null;
  let toastTimer = null;

  const totalRounds = 5;

  const games = {
    bubble: {
      title: "Bubble Pop!",
      prompt: "Pop the floating bubbles!",
      instructions: "Tap five bubbles to earn a star.",
      encouragement: "Wonderful popping! 🫧"
    },
    color: {
      title: "Color Match!",
      prompt: "Find the matching color!",
      instructions: "Tap the circle with the same color.",
      encouragement: "You have a colorful imagination! 🌈"
    },
    shape: {
      title: "Shape Sorter!",
      prompt: "Find the matching shape!",
      instructions: "Tap the shape that matches the target.",
      encouragement: "Great shape sorting! 🔺"
    }
  };

  function saveProgress() {
    localStorage.setItem("bubblyBest", bestScore);
    localStorage.setItem("bubblyActivities", activities);
    localStorage.setItem("bubblyStars", stars);
    localStorage.setItem("bubblyDaily", dailyCount);
    updateProgress();
  }

  function updateProgress() {
    if ($("dailyCount")) {
      $("dailyCount").textContent = Math.min(dailyCount, 5);
    }

    if ($("dailyBar")) {
      $("dailyBar").style.width =
        Math.min(dailyCount / 5 * 100, 100) + "%";
    }

    if ($("starTotal")) $("starTotal").textContent = stars + " stars";
    if ($("activityTotal")) $("activityTotal").textContent = activities;
    if ($("bestTotal")) $("bestTotal").textContent = bestScore;
    if ($("profileStars")) $("profileStars").textContent = stars;
    if ($("profileActs")) $("profileActs").textContent = activities;
  }

  function showToast(message) {
    const toast = $("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  function stopGame() {
    clearInterval(gameTimer);
    gameTimer = null;
  }

  function showScreen(name) {
    stopGame();

    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.remove("active");
    });

    const target = $(name);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(button => {
      button.classList.toggle("active", button.dataset.nav === name);
    });

    currentScreen = name;
    updateProgress();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToGame(game) {
    if (!games[game]) return;

    currentGame = game;
    showScreen("play");
    startGame();
  }

  document.querySelectorAll("[data-nav]").forEach(button => {
    button.addEventListener("click", () => {
      showScreen(button.dataset.nav);
    });
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      showScreen(button.dataset.go);
    });
  });

  document.querySelectorAll("[data-game]").forEach(button => {
    button.addEventListener("click", () => {
      goToGame(button.dataset.game);
    });
  });

  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      showToast(button.dataset.category + " activities are coming soon! 💜");
    });
  });

  // Sound button
  if ($("soundBtn")) {
    $("soundBtn").addEventListener("click", () => {
      soundOn = !soundOn;
      $("soundBtn").textContent = soundOn ? "🔊" : "🔇";
      showToast(soundOn ? "Sound is on!" : "Sound is off!");
    });
  }

  // Gentle sound effect using browser audio
  function playSound(frequency = 550) {
    if (!soundOn) return;

    try {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) return;

      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gain.gain.setValueAtTime(0.12, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + 0.18
      );

      oscillator.start();
      oscillator.stop(audio.currentTime + 0.18);

      oscillator.onended = () => audio.close();
    } catch (error) {
      // Game remains playable if audio is unavailable.
    }
  }

  function updateGameScore() {
    if ($("score")) $("score").textContent = score;

    if ($("gameBar")) {
      $("gameBar").style.width =
        Math.min(round / totalRounds * 100, 100) + "%";
    }

    if ($("roundText")) {
      $("roundText").textContent =
        Math.min(round, totalRounds) + " of " + totalRounds;
    }
  }

  function randomPosition() {
    return {
      x: 8 + Math.random() * 72,
      y: 12 + Math.random() * 68
    };
  }

  function makeButton(className, content, x, y, callback) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = content;
    button.style.left = x + "%";
    button.style.top = y + "%";

    button.addEventListener("click", callback);

    $("playArea").appendChild(button);
    return button;
  }

  function startGame() {
    stopGame();

    score = 0;
    round = 0;
    paused = false;

    $("gameTitle").textContent = games[currentGame].title;
    $("prompt").textContent = games[currentGame].prompt;
    $("instructions").textContent = games[currentGame].instructions;
    $("feedback").textContent = "Let's have fun! 💜";
    $("encouragement").textContent = "Every try is a little win!";
    $("pauseBtn").textContent = "Pause";

    $("playArea").innerHTML = "";
    updateGameScore();

    if (currentGame === "bubble") {
      createBubbleGame();
    } else if (currentGame === "color") {
      createColorGame();
    } else if (currentGame === "shape") {
      createShapeGame();
    }
  }

  // BUBBLE POP
  function createBubbleGame() {
    const colors = [
      ["#d9caff", "#9d83ee"],
      ["#ffcce5", "#ec8dbd"],
      ["#b9ebdd", "#68c7a8"],
      ["#ffe6ad", "#f2b74f"],
      ["#bfe2ff", "#76b6eb"]
    ];

    for (let i = 0; i < 6; i++) {
      const position = randomPosition();
      const bubble = makeButton(
        "play-bubble",
        "🫧",
        position.x,
        position.y,
        () => {
          if (paused || bubble.disabled) return;

          bubble.disabled = true;
          bubble.style.transform = "scale(0)";
          bubble.style.opacity = "0";

          score++;
          round++;

          playSound(500 + score * 90);
          $("feedback").textContent = [
            "Pop! Wonderful! 🫧",
            "Amazing! Keep going! ⭐",
            "You're a bubble star! 💜",
            "Fantastic popping! 🎉",
            "You did it! Five bubbles! 🌟"
          ][Math.min(round - 1, 4)];

          updateGameScore();

          if (round >= totalRounds) {
            finishGame();
          } else {
            setTimeout(() => {
              if (bubble.isConnected) {
                const next = randomPosition();
                bubble.style.left = next.x + "%";
                bubble.style.top = next.y + "%";
                bubble.style.opacity = "1";
                bubble.style.transform = "scale(1)";
                bubble.disabled = false;
              }
            }, 300);
          }
        }
      );

      const color = colors[i % colors.length];
      bubble.style.background =
        "radial-gradient(circle at 30% 25%, white, " +
        color[0] + ", " + color[1] + ")";
      bubble.setAttribute("aria-label", "Pop bubble " + (i + 1));
    }
  }

  // COLOR MATCH
  function createColorGame() {
    const choices = [
      { name: "Red", emoji: "🔴" },
      { name: "Yellow", emoji: "🟡" },
      { name: "Blue", emoji: "🔵" },
      { name: "Green", emoji: "🟢" },
      { name: "Purple", emoji: "🟣" }
    ];

    function nextRound() {
      if (round >= totalRounds) {
        finishGame();
        return;
      }

      $("playArea").innerHTML = "";

      const answer = choices[round % choices.length];

      $("prompt").textContent = "Find " + answer.name + "!";
      $("instructions").textContent = "Tap the matching color.";

      const shuffled = [...choices].sort(() => Math.random() - 0.5);

      shuffled.forEach((choice, index) => {
        const positions = [
          { x: 12, y: 22 },
          { x: 60, y: 22 },
          { x: 12, y: 62 },
          { x: 60, y: 62 },
          { x: 36, y: 42 }
        ];

        const position = positions[index];

        makeButton(
          "color-choice",
          choice.emoji,
          position.x,
          position.y,
          () => {
            if (paused) return;

            if (choice.name === answer.name) {
              score++;
              round++;
              playSound(650);
              $("feedback").textContent = "Yes! " + answer.name + "! 🌈";
              updateGameScore();

              setTimeout(nextRound, 650);
            } else {
              $("feedback").textContent = "Almost! Try again, little star! 💜";
              playSound(250);
            }
          }
        );
      });
    }

    nextRound();
  }

  // SHAPE SORTER
  function createShapeGame() {
    const shapes = [
      { name: "Triangle", emoji: "🔺" },
      { name: "Square", emoji: "🟦" },
      { name: "Circle", emoji: "🔵" },
      { name: "Star", emoji: "⭐" },
      { name: "Heart", emoji: "❤️" }
    ];

    function nextRound() {
      if (round >= totalRounds) {
        finishGame();
        return;
      }

      $("playArea").innerHTML = "";

      const answer = shapes[round % shapes.length];

      $("prompt").textContent = "Find the " + answer.name + "!";
      $("instructions").textContent = "Tap the matching shape.";

      const shuffled = [...shapes].sort(() => Math.random() - 0.5);

      shuffled.forEach((shape, index) => {
        const positions = [
          { x: 12, y: 22 },
          { x: 60, y: 22 },
          { x: 12, y: 62 },
          { x: 60, y: 62 },
          { x: 36, y: 42 }
        ];

        const position = positions[index];

        makeButton(
          "shape-choice",
          shape.emoji,
          position.x,
          position.y,
          () => {
            if (paused) return;

            if (shape.name === answer.name) {
              score++;
              round++;
              playSound(700);
              $("feedback").textContent =
                "Brilliant! That's the " + answer.name + "! ⭐";

              updateGameScore();
              setTimeout(nextRound, 650);
            } else {
              $("feedback").textContent =
                "Good try! Look for the " + answer.name + ". 💜";
              playSound(250);
            }
          }
        );
      });
    }

    nextRound();
  }

  function finishGame() {
    stopGame();

    $("prompt").textContent = "You did it! 🎉";
    $("instructions").textContent = "What a wonderful little learner!";
    $("feedback").textContent = "You earned a star! ⭐";
    $("encouragement").textContent = games[currentGame].encouragement;

    stars++;
    activities++;
    dailyCount++;

    if (score > bestScore) bestScore = score;

    saveProgress();
    updateGameScore();
    playSound(850);

    const message = document.createElement("div");
    message.className = "game-finished";
    message.innerHTML =
      "<span>🏆</span><b>Wonderful work!</b><small>+1 star earned</small>";

    $("playArea").appendChild(message);

    if ($("restartBtn")) {
      $("restartBtn").textContent = "Play again ↻";
    }
  }

  // PAUSE / RESUME
  $("pauseBtn").addEventListener("click", () => {
    paused = !paused;
    $("pauseBtn").textContent = paused ? "Resume" : "Pause";

    $("feedback").textContent = paused
      ? "Take a little break. 🌼"
      : "Let's keep playing! 💜";
  });

  $("restartBtn").addEventListener("click", startGame);

  $("backBtn").addEventListener("click", () => {
    stopGame();
    showScreen("games");
  });

  // STORY MODAL
  function closeStory() {
    $("modal").hidden = true;
  }

  $("storyBtn").addEventListener("click", () => {
    $("modal").hidden = false;
  });

  $("closeModal").addEventListener("click", closeStory);
  $("storyDone").addEventListener("click", () => {
    closeStory();
    showToast("Lovely listening! 📖");
  });

  $("modal").addEventListener("click", event => {
    if (event.target === $("modal")) closeStory();
  });

  // RESET PROGRESS
  $("resetBtn").addEventListener("click", () => {
    const confirmed = window.confirm(
      "Would you like to reset your stars and game progress?"
    );

    if (!confirmed) return;

    activities = 0;
    stars = 0;
    dailyCount = 0;
    bestScore = 0;

    saveProgress();
    showToast("Your progress has been reset.");
  });

  updateProgress();
});
