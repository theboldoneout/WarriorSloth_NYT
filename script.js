/* APOLOGY GAMES */

/* =========================
   GAME FLOW
========================= */

function startGame() {
  showGame("wordle");
  startWordle();
}

function showGame(game) {
  const wordle = document.getElementById("wordleGame");
  const connections = document.getElementById("connectionsGame");
  const strands = document.getElementById("strandsGame");

  if (wordle) wordle.style.display = "none";
  if (connections) connections.style.display = "none";
  if (strands) strands.style.display = "none";

  if (game === "wordle" && wordle) wordle.style.display = "block";
  if (game === "connections" && connections) connections.style.display = "block";
  if (game === "strands" && strands) strands.style.display = "block";
}


/* =========================
   WORDLE
========================= */

const wordleAnswer = "SORRY";

let wordleGuesses = [];
let currentWordleGuess = "";
let wordleGameOver = false;

const wordleKeys = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"]
];

function startWordle() {
  document.getElementById("gameTitle").textContent = "WORDLE";
  document.getElementById("gameInstruction").textContent =
    "Six tries. One word.";

  wordleGuesses = [];
  currentWordleGuess = "";
  wordleGameOver = false;

  renderWordle();
  renderWordleKeyboard();
}

function renderWordle() {
  const board = document.getElementById("wordleBoard");
  if (!board) return;

  board.innerHTML = "";

  for (let row = 0; row < 6; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "wordle-row";

    const guess = wordleGuesses[row] || "";

    for (let col = 0; col < 5; col++) {
      const tile = document.createElement("div");
      tile.className = "wordle-tile";

      if (row < wordleGuesses.length) {
        const letter = guess[col];
        tile.textContent = letter;

        const result = getWordleResult(guess, col);

        if (result === "correct") {
          tile.classList.add("correct");
        } else if (result === "present") {
          tile.classList.add("present");
        } else {
          tile.classList.add("absent");
        }
      } else if (row === wordleGuesses.length && col < currentWordleGuess.length) {
        tile.textContent = currentWordleGuess[col];
      }

      rowDiv.appendChild(tile);
    }

    board.appendChild(rowDiv);
  }
}

function getWordleResult(guess, index) {
  if (guess[index] === wordleAnswer[index]) {
    return "correct";
  }

  if (wordleAnswer.includes(guess[index])) {
    return "present";
  }

  return "absent";
}

function renderWordleKeyboard() {
  const keyboard = document.getElementById("wordleKeyboard");
  if (!keyboard) return;

  keyboard.innerHTML = "";

  wordleKeys.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "wordle-key-row";

    row.forEach(key => {
      const button = document.createElement("button");
      button.className = "wordle-key";
      button.textContent = key;

      if (key === "ENTER" || key === "⌫") {
        button.classList.add("wide");
      }

      /*
       * Only grey out letters that are definitely absent.
       * Correct/present letters remain their original keyboard colour.
       */
      if (
        key.length === 1 &&
        wordleGuesses.some(guess => {
          const upperGuess = guess.toUpperCase();

          for (let i = 0; i < upperGuess.length; i++) {
            if (
              upperGuess[i] === key &&
              !wordleAnswer.includes(key)
            ) {
              return true;
            }
          }

          return false;
        })
      ) {
        button.classList.add("key-absent");
      }

      button.addEventListener("click", () => handleWordleKey(key));
      rowDiv.appendChild(button);
    });

    keyboard.appendChild(rowDiv);
  });
}

function handleWordleKey(key) {
  if (wordleGameOver) return;

  if (key === "ENTER") {
    submitWordleGuess();
    return;
  }

  if (key === "⌫") {
    currentWordleGuess = currentWordleGuess.slice(0, -1);
    renderWordle();
    return;
  }

  if (/^[A-Z]$/.test(key) && currentWordleGuess.length < 5) {
    currentWordleGuess += key;
    renderWordle();
  }
}

function submitWordleGuess() {
  if (currentWordleGuess.length !== 5) {
    showGameMessage("wordleMessage", "You need five letters.");
    return;
  }

  wordleGuesses.push(currentWordleGuess);

  const submittedGuess = currentWordleGuess;
  currentWordleGuess = "";

  renderWordle();
  renderWordleKeyboard();

  if (submittedGuess === wordleAnswer) {
    wordleGameOver = true;

    setTimeout(() => {
      showGameMessage(
        "wordleMessage",
        "SORRY. ❤️"
      );

      setTimeout(() => {
        showGame("connections");
        startConnections();
      }, 2200);
    }, 500);

    return;
  }

  if (wordleGuesses.length >= 6) {
    wordleGameOver = true;

    setTimeout(() => {
      showGameMessage(
        "wordleMessage",
        "The answer was SORRY."
      );

      setTimeout(() => {
        showGame("connections");
        startConnections();
      }, 2200);
    }, 500);
  }
}


/* =========================
   CONNECTIONS
========================= */

const connectionGroups = [
  {
    title: "Things I should have protected",
    words: ["PROMISE", "TRUST", "SAFETY", "CONSIDERATION"],
    message:
      "You told me these things mattered to you.<br><br>" +
      "I heard you.<br><br>" +
      "But I did fail consistently translating hearing you into behaviour."
  },
  {
    title: "Things I should have done more often",
    words: ["TEXT", "UPDATE", "EFFORT", "SURPRISES"],
    message:
      "Communication isn't a grand romantic gesture.<br><br>" +
      "It's the little things and living a shared life."
  },
  {
    title: "Things I have learned from you",
    words: [
      "LOVE",
      "STACK OF UNDENIABLE EVIDENCE",
      "PERSEVERANCE",
      "HOW TO BE A GOOD PARTNER"
    ],
    message:
      "<strong>CORRECT.</strong><br><br>" +
      "You are significantly more complicated than “boy who likes video games.”<br><br>" +
      "I've spent more than four years learning from you and growing with you."
  },
  {
    title: "Things I never want to take for granted",
    words: ["MOVIES", "FOOD", "DATES", "MEMORIES"],
    message:
      "The life we've built isn't something I want to treat casually."
  }
];

let selectedConnectionWords = [];
let solvedConnectionGroups = [];
let connectionAttempts = 0;
const maxConnectionAttempts = 6;
let connectionChecking = false;

function startConnections() {
  document.getElementById("gameTitle").textContent = "CONNECTIONS";
  document.getElementById("gameInstruction").textContent =
    "Find four groups of four.";

  selectedConnectionWords = [];
  solvedConnectionGroups = [];
  connectionAttempts = 0;
  connectionChecking = false;

  renderConnections();
  showGameMessage("connectionsMessage", "");
}

function getRemainingConnectionWords() {
  const words = [];

  connectionGroups.forEach((group, groupIndex) => {
    if (!solvedConnectionGroups.includes(groupIndex)) {
      group.words.forEach(word => {
        words.push({
          word,
          groupIndex
        });
      });
    }
  });

  return words;
}

function renderConnections() {
  const grid = document.getElementById("connectionsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  /*
   * Solved groups are rendered first as full-width boxes.
   */
  solvedConnectionGroups.forEach(groupIndex => {
    const group = connectionGroups[groupIndex];

    const solvedBox = document.createElement("div");
    solvedBox.className =
      `connection-solved-group group-${groupIndex + 1}`;

    const title = document.createElement("div");
    title.className = "connection-solved-title";
    title.textContent = group.title;

    const words = document.createElement("div");
    words.className = "connection-solved-words";
    words.textContent = group.words.join(" • ");

    solvedBox.appendChild(title);
    solvedBox.appendChild(words);

    grid.appendChild(solvedBox);
  });

  /*
   * Remaining tiles are freshly rendered every time.
   * This fixes the issue where tiles became unclickable
   * after solving the first group.
   */
  const remainingWords = getRemainingConnectionWords();

  remainingWords.forEach(item => {
    const button = document.createElement("button");
    button.className = "connection-tile";
    button.textContent = item.word;

    if (selectedConnectionWords.includes(item.word)) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      selectConnectionWord(item.word);
    });

    grid.appendChild(button);
  });

  updateConnectionStatus();
}

function updateConnectionStatus() {
  const status = document.getElementById("connectionsStatus");
  if (!status) return;

  status.textContent =
    `${selectedConnectionWords.length}/4 selected`;
}

function selectConnectionWord(word) {
  if (connectionChecking) return;

  if (selectedConnectionWords.includes(word)) {
    selectedConnectionWords =
      selectedConnectionWords.filter(item => item !== word);
  } else {
    if (selectedConnectionWords.length >= 4) {
      return;
    }

    selectedConnectionWords.push(word);
  }

  renderConnections();

  if (selectedConnectionWords.length === 4) {
    checkConnectionGroup();
  }
}

function checkConnectionGroup() {
  if (connectionChecking) return;

  connectionChecking = true;

  const selectedSet =
    new Set(selectedConnectionWords);

  let matchedGroupIndex = -1;

  connectionGroups.forEach((group, index) => {
    if (solvedConnectionGroups.includes(index)) return;

    const groupSet = new Set(group.words);

    if (
      group.words.length === selectedSet.size &&
      group.words.every(word => selectedSet.has(word))
    ) {
      matchedGroupIndex = index;
    }
  });

  if (matchedGroupIndex !== -1) {
    setTimeout(() => {
      revealConnectionGroup(matchedGroupIndex);
    }, 450);
  } else {
    connectionAttempts++;

    const grid = document.getElementById("connectionsGrid");

    if (grid) {
      grid.classList.add("connection-wrong");

      setTimeout(() => {
        grid.classList.remove("connection-wrong");
      }, 500);
    }

    setTimeout(() => {
      selectedConnectionWords = [];
      connectionChecking = false;

      renderConnections();

      if (connectionAttempts >= maxConnectionAttempts) {
        setTimeout(() => {
          revealRemainingConnections();
        }, 700);
      } else {
        showGameMessage(
          "connectionsMessage",
          `Not quite. ${maxConnectionAttempts - connectionAttempts} tries left.`
        );
      }
    }, 550);
  }
}

function revealConnectionGroup(groupIndex) {
  if (solvedConnectionGroups.includes(groupIndex)) return;

  solvedConnectionGroups.push(groupIndex);
  selectedConnectionWords = [];
  connectionChecking = false;

  renderConnections();

  const group = connectionGroups[groupIndex];

  showGameMessage(
    "connectionsMessage",
    group.message
  );

  if (solvedConnectionGroups.length === 4) {
    setTimeout(() => {
      showGame("strands");
      startStrands();
    }, 4000);
  }
}

function revealRemainingConnections() {
  connectionChecking = false;

  connectionGroups.forEach((group, index) => {
    if (!solvedConnectionGroups.includes(index)) {
      solvedConnectionGroups.push(index);
    }
  });

  selectedConnectionWords = [];

  renderConnections();

  showGameMessage(
    "connectionsMessage",
    "Sometimes the point isn't getting every answer right.<br><br>" +
    "Sometimes it's understanding what the answers mean."
  );

  setTimeout(() => {
    showGame("strands");
    startStrands();
  }, 5000);
}


/* =========================
   STRANDS
   UPDATED ONLY
========================= */

const strandsWords = [
  "LIFE PARTNER",
  "HUSBAND",
  "PROTECTOR",
  "THERAPIST",
  "COACH",
  "LIFE OF THE PARTY"
];

/*
 * Spaces are ignored when building/searching the board.
 */
const strandsSearchWords = [
  "LIFEPARTNER",
  "HUSBAND",
  "PROTECTOR",
  "THERAPIST",
  "COACH",
  "LIFEOFTHEPARTY"
];

/*
 * 11 x 11 board.
 *
 * Each of the six answers is placed as a connected
 * horizontal path. The remaining letters are filler.
 */
const strandsBoardLetters = [
  "QXMZPLKJHVR",
  "LIFEPARTNER",
  "ZKXQMBRPLSD",
  "HUSBANDQWEQ",
  "PROTECTORAB",
  "THERAPISTXY",
  "COACHQWERTY",
  "LIFEOFTHEPARTY",
  "ZXCVBNMASDF",
  "GHJKLQWERTYU",
  "POIUYTRMNBC"
];

/*
 * We use a larger board for LIFE OF THE PARTY,
 * so the playable board is 14 columns x 11 rows.
 *
 * Every row is normalised to 14 cells.
 */
const strandsBoard = [
  "QXMZPLKJHVRQWE",
  "LIFEPARTNERQWE",
  "ZKXQMBRPLSDABC",
  "HUSBANDQWERTYU",
  "PROTECTORABCDE",
  "THERAPISTXYZAB",
  "COACHQWERTYUIO",
  "LIFEOFTHEPARTY",
  "ZXCVBNMASDFGHJ",
  "GHJKLQWERTYUIO",
  "POIUYTRMNBCVXZ"
];

const strandsPaths = {
  "LIFE PARTNER": [
    14,15,16,17,18,19,20,21,22,23,24
  ],

  "HUSBAND": [
    42,43,44,45,46,47,48
  ],

  "PROTECTOR": [
    56,57,58,59,60,61,62,63,64
  ],

  "THERAPIST": [
    70,71,72,73,74,75,76,77,78
  ],

  "COACH": [
    84,85,86,87,88
  ],

  "LIFE OF THE PARTY": [
    98,99,100,101,102,103,104,105,106,107,108,109,110,111
  ]
};

let strandsFound = new Set();
let strandsSelected = [];
let strandsAttempts = 0;
let strandsGameOver = false;

function startStrands() {
  document.getElementById("gameTitle").textContent = "STRANDS";

  /*
   * The user specifically wanted him to know there
   * are six words to find.
   */
  document.getElementById("gameInstruction").textContent =
    "HOW I VIEW YOU — Find all 6 words.";

  strandsFound = new Set();
  strandsSelected = [];
  strandsAttempts = 0;
  strandsGameOver = false;

  renderStrands();

  showGameMessage(
    "strandsMessage",
    "Unlimited tries."
  );
}

function renderStrands() {
  const board = document.getElementById("strandsBoard");
  if (!board) return;

  board.innerHTML = "";

  strandsBoard.forEach((row, rowIndex) => {
    [...row].forEach((letter, colIndex) => {
      const index = rowIndex * 14 + colIndex;

      const button = document.createElement("button");
      button.className = "strands-letter";
      button.textContent = letter;

      if (strandsSelected.includes(index)) {
        button.classList.add("selected");
      }

      const foundWord = getFoundWordForIndex(index);

      if (foundWord) {
        button.classList.add("found");
      }

      button.addEventListener("click", () => {
        selectStrandsLetter(index);
      });

      board.appendChild(button);
    });
  });

  updateStrandsStatus();
}

function getFoundWordForIndex(index) {
  for (const word of strandsFound) {
    const path = strandsPaths[word];

    if (path && path.includes(index)) {
      return word;
    }
  }

  return null;
}

function areStrandsAdjacent(index1, index2) {
  const row1 = Math.floor(index1 / 14);
  const col1 = index1 % 14;

  const row2 = Math.floor(index2 / 14);
  const col2 = index2 % 14;

  return (
    Math.abs(row1 - row2) <= 1 &&
    Math.abs(col1 - col2) <= 1 &&
    !(row1 === row2 && col1 === col2)
  );
}

function selectStrandsLetter(index) {
  if (strandsGameOver) return;

  if (strandsFound.size === strandsWords.length) return;

  /*
   * Clicking an already-selected letter removes it.
   */
  if (strandsSelected.includes(index)) {
    strandsSelected = strandsSelected.filter(
      selected => selected !== index
    );

    renderStrands();
    return;
  }

  /*
   * A new letter must be adjacent to the previous one.
   */
  if (strandsSelected.length > 0) {
    const previous =
      strandsSelected[strandsSelected.length - 1];

    if (!areStrandsAdjacent(previous, index)) {
      showGameMessage(
        "strandsMessage",
        "Letters need to connect."
      );
      return;
    }
  }

  strandsSelected.push(index);

  renderStrands();

  checkSelectedStrandsWord();
}

function getSelectedStrandsText() {
  return strandsSelected
    .map(index => {
      const row = Math.floor(index / 14);
      const col = index % 14;

      return strandsBoard[row][col];
    })
    .join("");
}

function checkSelectedStrandsWord() {
  const selectedText = getSelectedStrandsText();

  const matchingWord = strandsSearchWords.find(
    searchWord => searchWord === selectedText
  );

  if (!matchingWord) return;

  const wordIndex =
    strandsSearchWords.indexOf(matchingWord);

  const actualWord =
    strandsWords[wordIndex];

  if (strandsFound.has(actualWord)) return;

  strandsFound.add(actualWord);
  strandsAttempts++;

  strandsSelected = [];

  renderStrands();

  showGameMessage(
    "strandsMessage",
    `<strong>${actualWord}</strong> found.`
  );

  if (strandsFound.size === strandsWords.length) {
    setTimeout(() => {
      finishStrands();
    }, 1000);
  }
}

function updateStrandsStatus() {
  const status = document.getElementById("strandsStatus");
  if (!status) return;

  status.textContent =
    `${strandsFound.size}/6 words found`;
}

function finishStrands() {
  if (strandsGameOver) return;

  strandsGameOver = true;
  strandsSelected = [];

  renderStrands();

  showGameMessage(
    "strandsMessage",
    "<strong>HOW I VIEW YOU</strong><br><br>" +
    "Six words. Six ways I see you.<br><br>" +
    "And somehow, even these six don't quite cover it."
  );

  setTimeout(() => {
    finishGame();
  }, 4000);
}


/* =========================
   FINAL MESSAGE
========================= */

function finishGame() {
  const gameContainer =
    document.getElementById("gameContainer");

  if (gameContainer) {
    gameContainer.innerHTML = `
      <div class="final-message">
        <h1>I'm sorry.</h1>

        <p>
          Not because I want to tick off a list of things
          I should have done differently —
          but because you matter to me,
          and so does everything we've built together.
        </p>

        <p>
          I love you. ❤️
        </p>
      </div>
    `;

    return;
  }

  /*
   * Fallback if your HTML uses a different final-message
   * container.
   */
  document.getElementById("gameTitle").textContent =
    "I'm sorry.";

  document.getElementById("gameInstruction").innerHTML =
    "Not because I want to tick off a list of things I should have done differently — " +
    "but because you matter to me, and so does everything we've built together.<br><br>" +
    "I love you. ❤️";
}


/* =========================
   MESSAGE HELPER
========================= */

function showGameMessage(elementId, message) {
  const element = document.getElementById(elementId);

  if (element) {
    element.innerHTML = message;
  }
}


/* =========================
   INITIALISE
========================= */

document.addEventListener("DOMContentLoaded", () => {
  /*
   * The game starts when the existing Start button
   * calls startGame().
   */
});
/* =========================================================
   GLOBAL FALLBACKS
   These expose functions for inline onclick attributes.
   ========================================================= */

window.startGame = startGame;
window.submitWordleGuess = submitWordleGuess;
window.submitConnectionsGuess = submitConnectionsGuess;
window.submitStrandsSelection = submitStrandsSelection;
