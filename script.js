/* APOLOGY GAMES */

/* =========================
   GAME FLOW
========================= */
const SCREENS = ["intro", "wordle", "connections", "strands", "final"];

function showScreen(screenId) {
    SCREENS.forEach((id) => {
        const screen = document.getElementById(id);
        if (screen) {
            screen.classList.toggle("hidden", id !== screenId);
        }
    });
}

function setMessage(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function startGame() {
    showScreen("wordle");
    initWordle();
}

/* =========================================================
   WORDLE
   ========================================================= */

const WORDLE_TARGET = "TRUST";
const WORDLE_ROWS = 6;
const WORDLE_COLS = 5;
const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

let wordleCurrentGuess = "";
let wordleCurrentRow = 0;
let wordleSolved = false;
let wordleInitialized = false;
let physicalKeyboardAttached = false;

const wordleKeyStates = {};

function initWordle() {
    const board = document.getElementById("wordle-board");
    if (!board) return;

    if (wordleInitialized) return;

    board.innerHTML = "";

    for (let row = 0; row < WORDLE_ROWS; row += 1) {
        for (let col = 0; col < WORDLE_COLS; col += 1) {
            const tile = document.createElement("div");
            tile.className = "wordle-tile";
            tile.dataset.row = String(row);
            tile.dataset.col = String(col);
            board.appendChild(tile);
        }
    }

    createWordleKeyboard();

    if (!physicalKeyboardAttached) {
        document.addEventListener("keydown", handlePhysicalKeyboard);
        physicalKeyboardAttached = true;
    }

    setMessage("wordle-message", "Guess the five-letter word. Hint: what I need to rebuild.");
    wordleInitialized = true;
}

function createWordleKeyboard() {
    const board = document.getElementById("wordle-board");
    if (!board) return;

    let keyboard = document.getElementById("wordle-keyboard");

    if (!keyboard) {
        keyboard = document.createElement("div");
        keyboard.id = "wordle-keyboard";
        board.insertAdjacentElement("afterend", keyboard);
    }

    keyboard.innerHTML = "";

    KEYBOARD_ROWS.forEach((letters, rowIndex) => {
        const keyboardRow = document.createElement("div");
        keyboardRow.className = "keyboard-row";

        if (rowIndex === 2) {
            keyboardRow.appendChild(createWordleKey("ENTER", "wide-key"));
        }

        letters.split("").forEach((letter) => {
            keyboardRow.appendChild(createWordleKey(letter));
        });

        if (rowIndex === 2) {
            keyboardRow.appendChild(createWordleKey("⌫", "wide-key"));
        }

        keyboard.appendChild(keyboardRow);
    });
}

function createWordleKey(label, extraClass = "") {
    const key = document.createElement("button");
    key.type = "button";
    key.className = `wordle-key ${extraClass}`.trim();
    key.dataset.key = label;
    key.textContent = label;
    key.addEventListener("click", () => handleWordleKey(label));
    return key;
}

function handlePhysicalKeyboard(event) {
    const wordleScreen = document.getElementById("wordle");
    if (!wordleScreen || wordleScreen.classList.contains("hidden")) return;

    if (/^[a-zA-Z]$/.test(event.key)) {
        handleWordleKey(event.key.toUpperCase());
        return;
    }

    if (event.key === "Enter") {
        handleWordleKey("ENTER");
        return;
    }

    if (event.key === "Backspace") {
        handleWordleKey("⌫");
    }
}

function handleWordleKey(key) {
    if (wordleSolved || wordleCurrentRow >= WORDLE_ROWS) return;

    if (key === "ENTER") {
        submitWordleGuess();
        return;
    }

    if (key === "⌫") {
        wordleCurrentGuess = wordleCurrentGuess.slice(0, -1);
        drawCurrentWordleGuess();
        return;
    }

    if (/^[A-Z]$/.test(key) && wordleCurrentGuess.length < WORDLE_COLS) {
        wordleCurrentGuess += key;
        drawCurrentWordleGuess();
    }
}

function drawCurrentWordleGuess() {
    for (let col = 0; col < WORDLE_COLS; col += 1) {
        const tile = document.querySelector(
            `.wordle-tile[data-row="${wordleCurrentRow}"][data-col="${col}"]`
        );

        if (tile) {
            tile.textContent = wordleCurrentGuess[col] || "";
        }
    }
}

function submitWordleGuess() {
    if (wordleSolved || wordleCurrentRow >= WORDLE_ROWS) return;

    if (wordleCurrentGuess.length !== WORDLE_COLS) {
        setMessage("wordle-message", "Almost there — enter five letters.");
        return;
    }

    const score = scoreWordleGuess(wordleCurrentGuess, WORDLE_TARGET);

    score.forEach((state, col) => {
        const tile = document.querySelector(
            `.wordle-tile[data-row="${wordleCurrentRow}"][data-col="${col}"]`
        );

        if (tile) {
            tile.classList.add(state);
        }

        updateWordleKeyState(wordleCurrentGuess[col], state);
    });

    if (wordleCurrentGuess === WORDLE_TARGET) {
        wordleSolved = true;
        setMessage("wordle-message", "Yes. Trust. That is what I need to earn back.");

        setTimeout(() => {
            showScreen("connections");
            initConnections();
        }, 1400);

        return;
    }

    wordleCurrentRow += 1;
    wordleCurrentGuess = "";

    if (wordleCurrentRow >= WORDLE_ROWS) {
        setMessage("wordle-message", `The word was ${WORDLE_TARGET}. I know I have to rebuild it.`);

        setTimeout(() => {
            showScreen("connections");
            initConnections();
        }, 1800);
    } else {
        setMessage("wordle-message", "Keep going.");
    }
}

function scoreWordleGuess(guess, target) {
    const result = Array(WORDLE_COLS).fill("absent");
    const remainingLetters = target.split("");

    for (let i = 0; i < WORDLE_COLS; i += 1) {
        if (guess[i] === target[i]) {
            result[i] = "correct";
            remainingLetters[i] = null;
        }
    }

    for (let i = 0; i < WORDLE_COLS; i += 1) {
        if (result[i] === "correct") continue;

        const matchingIndex = remainingLetters.indexOf(guess[i]);

        if (matchingIndex !== -1) {
            result[i] = "present";
            remainingLetters[matchingIndex] = null;
        }
    }

    return result;
}

function updateWordleKeyState(letter, state) {
    const priority = {
        absent: 1,
        present: 2,
        correct: 3
    };

    const currentState = wordleKeyStates[letter];

    if ((priority[state] || 0) < (priority[currentState] || 0)) return;

    wordleKeyStates[letter] = state;

    const key = document.querySelector(`.wordle-key[data-key="${letter}"]`);
    if (!key) return;

    key.classList.remove("key-absent", "key-present", "key-correct");
    key.classList.add(`key-${state}`);
}

/* =========================================================
   CONNECTIONS
   ========================================================= */

const CONNECTION_GROUPS = [
    {
        title: "WHAT I OWE YOU",
        words: ["HONESTY", "PATIENCE", "CARE", "EFFORT"]
    },
    {
        title: "WHAT I WANT TO REBUILD",
        words: ["TRUST", "SAFETY", "PEACE", "US"]
    },
    {
        title: "DAILY PUZZLES",
        words: ["WORDLE", "STRANDS", "MINI", "CONNECTIONS"]
    },
    {
        title: "HOW I FEEL",
        words: ["SORRY", "GRATEFUL", "HOPEFUL", "LOVING"]
    }
];

let connectionTiles = [];
let selectedConnectionWords = [];
let solvedConnectionTitles = [];
let connectionsInitialized = false;

function initConnections() {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    if (connectionsInitialized) return;

    connectionTiles = shuffleArray(
        CONNECTION_GROUPS.flatMap((group) =>
            group.words.map((word) => ({
                word,
                title: group.title
            }))
        )
    );

    selectedConnectionWords = [];
    solvedConnectionTitles = [];

    drawConnections();
    createConnectionsControls();
    setMessage("connections-message", "Select four related words, then submit.");

    connectionsInitialized = true;
}

function drawConnections() {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    grid.innerHTML = "";

    solvedConnectionTitles.forEach((title, index) => {
        const group = CONNECTION_GROUPS.find((item) => item.title === title);
        if (!group) return;

        const solvedGroup = document.createElement("div");
        solvedGroup.className = `connection-solved-group group-${index + 1}`;

        const solvedTitle = document.createElement("div");
        solvedTitle.className = "solved-title";
        solvedTitle.textContent = group.title;

        const solvedWords = document.createElement("div");
        solvedWords.className = "solved-words";
        solvedWords.textContent = group.words.join(" · ");

        solvedGroup.appendChild(solvedTitle);
        solvedGroup.appendChild(solvedWords);
        grid.appendChild(solvedGroup);
    });

    connectionTiles
        .filter((tile) => !solvedConnectionTitles.includes(tile.title))
        .forEach((tile) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "connection-tile";
            button.textContent = tile.word;
            button.dataset.word = tile.word;
            button.addEventListener("click", () => toggleConnectionWord(tile.word));

            if (selectedConnectionWords.includes(tile.word)) {
                button.classList.add("selected");
            }

            grid.appendChild(button);
        });
}

function createConnectionsControls() {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    let controls = document.getElementById("connections-controls");

    if (!controls) {
        controls = document.createElement("div");
        controls.id = "connections-controls";
        controls.style.display = "flex";
        controls.style.justifyContent = "center";
        controls.style.gap = "10px";
        controls.style.flexWrap = "wrap";
        controls.style.marginBottom = "15px";
        grid.insertAdjacentElement("afterend", controls);
    }

    controls.innerHTML = "";

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent = "SUBMIT";
    submitButton.addEventListener("click", submitConnectionGuess);

    const shuffleButton = document.createElement("button");
    shuffleButton.type = "button";
    shuffleButton.textContent = "SHUFFLE";
    shuffleButton.addEventListener("click", shuffleConnections);

    controls.appendChild(submitButton);
    controls.appendChild(shuffleButton);
}

function toggleConnectionWord(word) {
    const tile = connectionTiles.find((item) => item.word === word);
    if (!tile || solvedConnectionTitles.includes(tile.title)) return;

    if (selectedConnectionWords.includes(word)) {
        selectedConnectionWords = selectedConnectionWords.filter((item) => item !== word);
    } else {
        if (selectedConnectionWords.length >= 4) {
            setMessage("connections-message", "Only four at a time.");
            return;
        }

        selectedConnectionWords.push(word);
    }

    drawConnections();
}

function submitConnectionGuess() {
    if (selectedConnectionWords.length !== 4) {
        setMessage("connections-message", "Select exactly four words.");
        return;
    }

    const matchedGroup = CONNECTION_GROUPS.find((group) => {
        if (solvedConnectionTitles.includes(group.title)) return false;

        return group.words.every((word) => selectedConnectionWords.includes(word));
    });

    if (matchedGroup) {
        solvedConnectionTitles.push(matchedGroup.title);
        selectedConnectionWords = [];
        drawConnections();

        if (solvedConnectionTitles.length === CONNECTION_GROUPS.length) {
            setMessage("connections-message", "You found them all. One more puzzle.");

            setTimeout(() => {
                showScreen("strands");
                initStrands();
            }, 1400);
        } else {
            setMessage("connections-message", matchedGroup.title);
        }

        return;
    }

    markWrongConnectionGuess();
    setMessage("connections-message", "Not quite. Try a different connection.");

    setTimeout(() => {
        selectedConnectionWords = [];
        drawConnections();
    }, 450);
}

function markWrongConnectionGuess() {
    selectedConnectionWords.forEach((word) => {
        const tile = document.querySelector(`.connection-tile[data-word="${word}"]`);
        if (tile) {
            tile.classList.add("wrong");
        }
    });
}

function shuffleConnections() {
    const unsolvedTiles = connectionTiles.filter((tile) => !solvedConnectionTitles.includes(tile.title));
    const solvedTiles = connectionTiles.filter((tile) => solvedConnectionTitles.includes(tile.title));

    connectionTiles = [...solvedTiles, ...shuffleArray(unsolvedTiles)];
    selectedConnectionWords = [];
    drawConnections();
    setMessage("connections-message", "Shuffled.");
}

/* =========================================================
   STRANDS
   ========================================================= */

const STRANDS_SIZE = 11;

const STRANDS_WORDS = [
    "SORRY",
    "TRUST",
    "LISTEN",
    "CHANGE",
    "LOVE"
];

const STRANDS_PLACEMENTS = [
    { word: "SORRY", row: 0, col: 0, direction: "right" },
    { word: "TRUST", row: 2, col: 2, direction: "right" },
    { word: "LISTEN", row: 4, col: 1, direction: "right" },
    { word: "CHANGE", row: 6, col: 3, direction: "right" },
    { word: "LOVE", row: 8, col: 4, direction: "right" }
];

let strandsGrid = [];
let selectedStrandCells = [];
let foundStrandsWords = [];
let foundStrandsCellKeys = new Set();
let strandsInitialized = false;

function initStrands() {
    const board = document.getElementById("strands-board");
    if (!board) return;

    if (strandsInitialized) return;

    strandsGrid = createStrandsGrid();
    selectedStrandCells = [];
    foundStrandsWords = [];
    foundStrandsCellKeys = new Set();

    drawStrandsBoard();
    createStrandsControls();
    setMessage("strands-message", `Find the hidden words: ${foundStrandsWords.length}/${STRANDS_WORDS.length}`);

    strandsInitialized = true;
}

function createStrandsGrid() {
    const fillerLetters = "AEIOULNRSTCHPGMYDFBK";
    const grid = Array.from({ length: STRANDS_SIZE }, (_, row) =>
        Array.from({ length: STRANDS_SIZE }, (_, col) => {
            const index = (row * 7 + col * 5 + row + col) % fillerLetters.length;
            return fillerLetters[index];
        })
    );

    STRANDS_PLACEMENTS.forEach((placement) => {
        placement.word.split("").forEach((letter, index) => {
            const position = getPositionFromPlacement(placement, index);
            grid[position.row][position.col] = letter;
        });
    });

    return grid;
}

function getPositionFromPlacement(placement, index) {
    if (placement.direction === "down") {
        return {
            row: placement.row + index,
            col: placement.col
        };
    }

    return {
        row: placement.row,
        col: placement.col + index
    };
}

function drawStrandsBoard() {
    const board = document.getElementById("strands-board");
    if (!board) return;

    board.innerHTML = "";

    for (let row = 0; row < STRANDS_SIZE; row += 1) {
        for (let col = 0; col < STRANDS_SIZE; col += 1) {
            const key = getStrandCellKey(row, col);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "strand-letter";
            button.textContent = strandsGrid[row][col];
            button.dataset.row = String(row);
            button.dataset.col = String(col);

            if (foundStrandsCellKeys.has(key)) {
                button.classList.add("found");
            }

            if (selectedStrandCells.some((cell) => cell.row === row && cell.col === col)) {
                button.classList.add("selected");
            }

            button.addEventListener("click", () => toggleStrandCell(row, col));
            board.appendChild(button);
        }
    }
}

function createStrandsControls() {
    const board = document.getElementById("strands-board");
    if (!board) return;

    let controls = document.getElementById("strands-controls");

    if (!controls) {
        controls = document.createElement("div");
        controls.id = "strands-controls";
        controls.style.display = "flex";
        controls.style.justifyContent = "center";
        controls.style.gap = "10px";
        controls.style.flexWrap = "wrap";
        controls.style.marginBottom = "15px";
        board.insertAdjacentElement("afterend", controls);
    }

    controls.innerHTML = "";

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent = "SUBMIT";
    submitButton.addEventListener("click", submitStrandsGuess);

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.textContent = "CLEAR";
    clearButton.addEventListener("click", clearStrandsSelection);

    controls.appendChild(submitButton);
    controls.appendChild(clearButton);
}

function toggleStrandCell(row, col) {
    const key = getStrandCellKey(row, col);

    if (foundStrandsCellKeys.has(key)) return;

    const selectedIndex = selectedStrandCells.findIndex(
        (cell) => cell.row === row && cell.col === col
    );

    if (selectedIndex !== -1) {
        selectedStrandCells.splice(selectedIndex, 1);
    } else {
        selectedStrandCells.push({ row, col });
    }

    drawStrandsBoard();
    updateCurrentStrandsMessage();
}

function updateCurrentStrandsMessage() {
    const currentWord = getSelectedStrandsWord();

    if (currentWord) {
        setMessage(
            "strands-message",
            `${currentWord} — found ${foundStrandsWords.length}/${STRANDS_WORDS.length}`
        );
    } else {
        setMessage(
            "strands-message",
            `Find the hidden words: ${foundStrandsWords.length}/${STRANDS_WORDS.length}`
        );
    }
}

function submitStrandsGuess() {
    const selectedWord = getSelectedStrandsWord();
    const reversedWord = selectedWord.split("").reverse().join("");

    const matchedWord = STRANDS_WORDS.find((word) =>
        !foundStrandsWords.includes(word) &&
        (word === selectedWord || word === reversedWord)
    );

    if (!matchedWord) {
        setMessage("strands-message", selectedWord ? "Not one of the hidden words. Try again." : "Select letters first.");
        return;
    }

    foundStrandsWords.push(matchedWord);

    selectedStrandCells.forEach((cell) => {
        foundStrandsCellKeys.add(getStrandCellKey(cell.row, cell.col));
    });

    selectedStrandCells = [];
    drawStrandsBoard();

    if (foundStrandsWords.length === STRANDS_WORDS.length) {
        setMessage("strands-message", "You found every word.");

        setTimeout(() => {
            showScreen("final");
        }, 1400);
    } else {
        setMessage(
            "strands-message",
            `Found ${matchedWord}. Keep going: ${foundStrandsWords.length}/${STRANDS_WORDS.length}`
        );
    }
}

function clearStrandsSelection() {
    selectedStrandCells = [];
    drawStrandsBoard();
    setMessage("strands-message", `Find the hidden words: ${foundStrandsWords.length}/${STRANDS_WORDS.length}`);
}

function getSelectedStrandsWord() {
    return selectedStrandCells
        .map((cell) => strandsGrid[cell.row][cell.col])
        .join("");
}

function getStrandCellKey(row, col) {
    return `${row}-${col}`;
}

/* =========================================================
   OPTIONAL SAFETY CHECK
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    showScreen("intro");
});
