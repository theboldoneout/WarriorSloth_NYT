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

function normalizeWord(value) {
    return String(value).replace(/\s+/g, "").toUpperCase();
}

function startGame() {
    showScreen("wordle");
    initWordle();
}

/* =========================================================
   WORDLE
   ========================================================= */

const WORDLE_TARGET = "SORRY";
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
            tile.setAttribute("aria-label", `Wordle row ${row + 1}, letter ${col + 1}`);
            board.appendChild(tile);
        }
    }

    createWordleKeyboard();

    if (!physicalKeyboardAttached) {
        document.addEventListener("keydown", handlePhysicalKeyboard);
        physicalKeyboardAttached = true;
    }

    setMessage("wordle-message", "Guess the five-letter word. Hint: the first thing I need to say.");
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
    key.setAttribute("aria-label", label === "⌫" ? "Backspace" : label);
    key.addEventListener("click", () => handleWordleKey(label));
    return key;
}

function handlePhysicalKeyboard(event) {
    const wordleScreen = document.getElementById("wordle");
    if (!wordleScreen || wordleScreen.classList.contains("hidden")) return;

    if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        handleWordleKey(event.key.toUpperCase());
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
        handleWordleKey("ENTER");
        return;
    }

    if (event.key === "Backspace") {
        event.preventDefault();
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
        shakeCurrentWordleRow();
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
        setMessage("wordle-message", "Yes. Sorry. I mean it completely.");

        setTimeout(() => {
            showScreen("connections");
            initConnections();
        }, 1400);

        return;
    }

    wordleCurrentRow += 1;
    wordleCurrentGuess = "";

    if (wordleCurrentRow >= WORDLE_ROWS) {
        setMessage("wordle-message", `The word was ${WORDLE_TARGET}. I should have said it better from the start.`);

        setTimeout(() => {
            showScreen("connections");
            initConnections();
        }, 1800);
    } else {
        setMessage("wordle-message", "Keep going.");
    }
}

function shakeCurrentWordleRow() {
    for (let col = 0; col < WORDLE_COLS; col += 1) {
        const tile = document.querySelector(
            `.wordle-tile[data-row="${wordleCurrentRow}"][data-col="${col}"]`
        );

        if (tile) {
            tile.classList.add("invalid");
            setTimeout(() => tile.classList.remove("invalid"), 400);
        }
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
   Original 4 groups kept intact + 6 total submissions
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

const CONNECTION_MAX_TRIES = 6;

let connectionTiles = [];
let selectedConnectionWords = [];
let solvedConnectionGroups = [];
let connectionTriesUsed = 0;
let connectionsInitialized = false;
let connectionsLocked = false;

function initConnections() {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    if (connectionsInitialized) return;

    connectionTiles = shuffleArray(CONNECTION_GROUPS.flatMap((group) => group.words));
    selectedConnectionWords = [];
    solvedConnectionGroups = [];
    connectionTriesUsed = 0;
    connectionsLocked = false;

    createConnectionsControls();
    renderConnections();
    updateConnectionsMessage();

    connectionsInitialized = true;
}

function createConnectionsControls() {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    let controls = document.getElementById("connections-controls");

    if (!controls) {
        controls = document.createElement("div");
        controls.id = "connections-controls";
        controls.style.display = "flex";
        controls.style.gap = "10px";
        controls.style.justifyContent = "center";
        controls.style.flexWrap = "wrap";
        controls.style.margin = "0 auto 18px";

        const submitButton = document.createElement("button");
        submitButton.type = "button";
        submitButton.id = "connections-submit";
        submitButton.textContent = "SUBMIT";
        submitButton.addEventListener("click", submitConnectionsGuess);

        const shuffleButton = document.createElement("button");
        shuffleButton.type = "button";
        shuffleButton.id = "connections-shuffle";
        shuffleButton.className = "secondary";
        shuffleButton.textContent = "SHUFFLE";
        shuffleButton.addEventListener("click", shuffleConnectionsTiles);

        const deselectButton = document.createElement("button");
        deselectButton.type = "button";
        deselectButton.id = "connections-deselect";
        deselectButton.className = "secondary";
        deselectButton.textContent = "DESELECT";
        deselectButton.addEventListener("click", deselectAllConnections);

        controls.appendChild(submitButton);
        controls.appendChild(shuffleButton);
        controls.appendChild(deselectButton);

        grid.insertAdjacentElement("afterend", controls);
    }
}

function renderConnections() {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    grid.innerHTML = "";

    solvedConnectionGroups.forEach((groupIndex) => {
        const group = CONNECTION_GROUPS[groupIndex];
        const solvedBox = document.createElement("div");
        solvedBox.className = `connection-solved-group group-${groupIndex + 1}`;

        const title = document.createElement("div");
        title.className = "solved-title";
        title.textContent = group.title;

        const words = document.createElement("div");
        words.className = "solved-words";
        words.textContent = group.words.join(", ");

        solvedBox.appendChild(title);
        solvedBox.appendChild(words);
        grid.appendChild(solvedBox);
    });

    connectionTiles.forEach((word) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "connection-tile";
        tile.textContent = word;
        tile.dataset.word = word;

        if (selectedConnectionWords.includes(word)) {
            tile.classList.add("selected");
        }

        tile.addEventListener("click", () => toggleConnectionWord(word));
        grid.appendChild(tile);
    });

    updateConnectionsButtons();
}

function toggleConnectionWord(word) {
    if (connectionsLocked) return;

    if (selectedConnectionWords.includes(word)) {
        selectedConnectionWords = selectedConnectionWords.filter((selected) => selected !== word);
    } else {
        if (selectedConnectionWords.length >= 4) {
            setMessage("connections-message", "You can only select four words.");
            return;
        }

        selectedConnectionWords.push(word);
    }

    renderConnections();
    updateConnectionsMessage();
}

function submitConnectionsGuess() {
    if (connectionsLocked) return;

    if (selectedConnectionWords.length !== 4) {
        setMessage("connections-message", `Select exactly four words. ${CONNECTION_MAX_TRIES - connectionTriesUsed} tries left.`);
        return;
    }

    connectionTriesUsed += 1;

    const matchedGroupIndex = CONNECTION_GROUPS.findIndex((group, index) => {
        if (solvedConnectionGroups.includes(index)) return false;
        return selectedConnectionWords.every((word) => group.words.includes(word));
    });

    if (matchedGroupIndex !== -1) {
        solvedConnectionGroups.push(matchedGroupIndex);
        connectionTiles = connectionTiles.filter(
            (word) => !CONNECTION_GROUPS[matchedGroupIndex].words.includes(word)
        );
        selectedConnectionWords = [];
        renderConnections();

        if (solvedConnectionGroups.length === CONNECTION_GROUPS.length) {
            connectionsLocked = true;
            updateConnectionsButtons();
            setMessage("connections-message", "You found all four groups.");

            setTimeout(() => {
                showScreen("strands");
                initStrands();
            }, 1400);

            return;
        }

        updateConnectionsMessage(`Correct: ${CONNECTION_GROUPS[matchedGroupIndex].title}.`);
        return;
    }

    flashWrongConnectionTiles();
    selectedConnectionWords = [];

    if (connectionTriesUsed >= CONNECTION_MAX_TRIES) {
        connectionsLocked = true;
        revealRemainingConnectionGroups();
        renderConnections();
        updateConnectionsButtons();
        setMessage("connections-message", "That was the last try. Here are the groups.");

        setTimeout(() => {
            showScreen("strands");
            initStrands();
        }, 2200);

        return;
    }

    renderConnections();
    updateConnectionsMessage("Not quite. Try another connection.");
}

function flashWrongConnectionTiles() {
    selectedConnectionWords.forEach((word) => {
        const tile = document.querySelector(`.connection-tile[data-word="${CSS.escape(word)}"]`);
        if (tile) {
            tile.classList.add("wrong");
            setTimeout(() => tile.classList.remove("wrong"), 450);
        }
    });
}

function shuffleConnectionsTiles() {
    if (connectionsLocked) return;
    connectionTiles = shuffleArray(connectionTiles);
    renderConnections();
}

function deselectAllConnections() {
    if (connectionsLocked) return;
    selectedConnectionWords = [];
    renderConnections();
    updateConnectionsMessage();
}

function revealRemainingConnectionGroups() {
    CONNECTION_GROUPS.forEach((group, index) => {
        if (!solvedConnectionGroups.includes(index)) {
            solvedConnectionGroups.push(index);
        }
    });

    connectionTiles = [];
    selectedConnectionWords = [];
}

function updateConnectionsMessage(prefix = "") {
    const triesLeft = CONNECTION_MAX_TRIES - connectionTriesUsed;
    const solvedCount = solvedConnectionGroups.length;
    const selectedCount = selectedConnectionWords.length;

    const base = `${triesLeft} ${triesLeft === 1 ? "try" : "tries"} left. ${solvedCount}/4 groups solved. ${selectedCount}/4 selected.`;
    setMessage("connections-message", prefix ? `${prefix} ${base}` : base);
}

function updateConnectionsButtons() {
    const submitButton = document.getElementById("connections-submit");
    const shuffleButton = document.getElementById("connections-shuffle");
    const deselectButton = document.getElementById("connections-deselect");

    if (submitButton) {
        submitButton.disabled = connectionsLocked || selectedConnectionWords.length !== 4;
    }

    if (shuffleButton) {
        shuffleButton.disabled = connectionsLocked;
    }

    if (deselectButton) {
        deselectButton.disabled = connectionsLocked || selectedConnectionWords.length === 0;
    }
}

/* =========================================================
   STRANDS
   Theme: How I see you
   Words: HUSBAND, LIFE PARTNER, COACH, THERAPIST,
          LIFE OF THE PARTY, PROTECTOR
   ========================================================= */

const STRANDS_THEME = "How I see you";
const STRANDS_WORDS = [
    "HUSBAND",
    "LIFE PARTNER",
    "COACH",
    "THERAPIST",
    "LIFE OF THE PARTY",
    "PROTECTOR"
];

const STRANDS_ROWS = 8;
const STRANDS_COLS = 8;

const STRANDS_LAYOUT = [
    ["H", "U", "S", "B", "A", "N", "D", "X"],
    ["R", "E", "N", "T", "R", "A", "P", "E"],
    ["W", "Q", "L", "I", "F", "E", "M", "T"],
    ["P", "R", "O", "T", "E", "C", "T", "O"],
    ["H", "C", "A", "O", "C", "H", "R", "P"],
    ["T", "Y", "A", "P", "A", "R", "T", "Y"],
    ["H", "E", "R", "A", "P", "I", "S", "T"],
    ["L", "I", "F", "E", "O", "F", "T", "H"]
];

const STRANDS_PATHS = {
    HUSBAND: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
    LIFEPARTNER: [[2, 2], [2, 3], [2, 4], [2, 5], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [1, 0]],
    COACH: [[4, 4], [4, 3], [4, 2], [4, 1], [4, 0]],
    THERAPIST: [[7, 6], [6, 7], [6, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0]],
    LIFEOFTHEPARTY: [[7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [6, 7], [5, 7], [5, 6], [5, 5], [5, 4], [5, 3]],
    PROTECTOR: [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [4, 7]]
};

let strandsInitialized = false;
let selectedStrandCells = [];
let foundStrandWords = [];
let foundStrandCellKeys = new Set();

function initStrands() {
    const board = document.getElementById("strands-board");
    if (!board) return;

    if (strandsInitialized) return;

    selectedStrandCells = [];
    foundStrandWords = [];
    foundStrandCellKeys = new Set();

    createStrandsHeader();
    createStrandsControls();
    renderStrandsBoard();
    updateStrandsMessage();

    strandsInitialized = true;
}

function createStrandsHeader() {
    const strandsScreen = document.getElementById("strands");
    const board = document.getElementById("strands-board");
    if (!strandsScreen || !board) return;

    let themeBox = document.getElementById("strands-theme-box");

    if (!themeBox) {
        themeBox = document.createElement("div");
        themeBox.id = "strands-theme-box";
        themeBox.style.margin = "0 auto 16px";
        themeBox.style.maxWidth = "520px";
        themeBox.style.fontFamily = "Arial, sans-serif";
        themeBox.style.lineHeight = "1.5";
        board.insertAdjacentElement("beforebegin", themeBox);
    }

    themeBox.innerHTML = `
        <div style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #7d1f2c; font-weight: 700; margin-bottom: 6px;">
            Theme
        </div>
        <div style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">
            ${STRANDS_THEME}
        </div>
        <div id="strands-counter" style="font-size: 14px; color: #5d5550;">
            Find 6 words. 0/6 found.
        </div>
    `;
}

function createStrandsControls() {
    const board = document.getElementById("strands-board");
    if (!board) return;

    let controls = document.getElementById("strands-controls");

    if (!controls) {
        controls = document.createElement("div");
        controls.id = "strands-controls";
        controls.style.display = "flex";
        controls.style.gap = "10px";
        controls.style.justifyContent = "center";
        controls.style.flexWrap = "wrap";
        controls.style.margin = "0 auto 18px";

        const submitButton = document.createElement("button");
        submitButton.type = "button";
        submitButton.id = "strands-submit";
        submitButton.textContent = "SUBMIT";
        submitButton.addEventListener("click", submitStrandsSelection);

        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.id = "strands-clear";
        clearButton.className = "secondary";
        clearButton.textContent = "CLEAR";
        clearButton.addEventListener("click", clearStrandsSelection);

        controls.appendChild(submitButton);
        controls.appendChild(clearButton);
        board.insertAdjacentElement("afterend", controls);
    }
}

function renderStrandsBoard() {
    const board = document.getElementById("strands-board");
    if (!board) return;

    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${STRANDS_COLS}, 1fr)`;

    for (let row = 0; row < STRANDS_ROWS; row += 1) {
        for (let col = 0; col < STRANDS_COLS; col += 1) {
            const cell = document.createElement("button");
            cell.type = "button";
            cell.className = "strand-letter";
            cell.textContent = STRANDS_LAYOUT[row][col];
            cell.dataset.row = String(row);
            cell.dataset.col = String(col);
            cell.dataset.key = getStrandCellKey(row, col);
            cell.setAttribute("aria-label", `Letter ${STRANDS_LAYOUT[row][col]} at row ${row + 1}, column ${col + 1}`);

            if (foundStrandCellKeys.has(cell.dataset.key)) {
                cell.classList.add("found");
            }

            if (selectedStrandCells.some((selected) => selected.row === row && selected.col === col)) {
                cell.classList.add("selected");
            }

            cell.addEventListener("click", () => toggleStrandCell(row, col));
            board.appendChild(cell);
        }
    }

    updateStrandsButtons();
    updateStrandsCounter();
}

function toggleStrandCell(row, col) {
    const key = getStrandCellKey(row, col);

    if (foundStrandCellKeys.has(key)) {
        setMessage("strands-message", "That letter is already part of a found word.");
        return;
    }

    const existingIndex = selectedStrandCells.findIndex(
        (cell) => cell.row === row && cell.col === col
    );

    if (existingIndex !== -1) {
        selectedStrandCells = selectedStrandCells.slice(0, existingIndex);
        renderStrandsBoard();
        updateStrandsMessage();
        return;
    }

    if (selectedStrandCells.length > 0) {
        const previousCell = selectedStrandCells[selectedStrandCells.length - 1];

        if (!areAdjacentStrandCells(previousCell, { row, col })) {
            setMessage("strands-message", "Choose touching letters, just like Strands.");
            return;
        }
    }

    selectedStrandCells.push({ row, col });
    renderStrandsBoard();
    updateStrandsMessage();
}

function submitStrandsSelection() {
    if (selectedStrandCells.length === 0) {
        setMessage("strands-message", "Select letters to make a word.");
        return;
    }

    const selectedWord = selectedStrandCells
        .map((cell) => STRANDS_LAYOUT[cell.row][cell.col])
        .join("");

    const reversedWord = selectedWord.split("").reverse().join("");
    const normalizedTargets = STRANDS_WORDS.map(normalizeWord);

    let foundNormalizedWord = "";

    if (normalizedTargets.includes(selectedWord)) {
        foundNormalizedWord = selectedWord;
    } else if (normalizedTargets.includes(reversedWord)) {
        foundNormalizedWord = reversedWord;
    }

    if (!foundNormalizedWord) {
        setMessage("strands-message", `"${selectedWord}" is not one of the hidden words.`);
        clearStrandsSelection(false);
        return;
    }

    if (foundStrandWords.includes(foundNormalizedWord)) {
        setMessage("strands-message", "You already found that word.");
        clearStrandsSelection(false);
        return;
    }

    foundStrandWords.push(foundNormalizedWord);

    selectedStrandCells.forEach((cell) => {
        foundStrandCellKeys.add(getStrandCellKey(cell.row, cell.col));
    });

    const displayWord = STRANDS_WORDS.find((word) => normalizeWord(word) === foundNormalizedWord) || foundNormalizedWord;
    selectedStrandCells = [];
    renderStrandsBoard();

    if (foundStrandWords.length === STRANDS_WORDS.length) {
        setMessage("strands-message", "You found all 6 words. That is exactly how I see you.");

        setTimeout(() => {
            showScreen("final");
        }, 1600);

        return;
    }

    setMessage("strands-message", `Found: ${displayWord}. ${STRANDS_WORDS.length - foundStrandWords.length} left.`);
}

function clearStrandsSelection(showDefaultMessage = true) {
    selectedStrandCells = [];
    renderStrandsBoard();

    if (showDefaultMessage) {
        updateStrandsMessage();
    }
}

function areAdjacentStrandCells(a, b) {
    const rowDistance = Math.abs(a.row - b.row);
    const colDistance = Math.abs(a.col - b.col);
    return rowDistance <= 1 && colDistance <= 1 && rowDistance + colDistance > 0;
}

function getStrandCellKey(row, col) {
    return `${row}-${col}`;
}

function updateStrandsMessage() {
    const selectedWord = selectedStrandCells
        .map((cell) => STRANDS_LAYOUT[cell.row][cell.col])
        .join("");

    const foundDisplayWords = foundStrandWords.map((normalizedWord) => {
        return STRANDS_WORDS.find((word) => normalizeWord(word) === normalizedWord) || normalizedWord;
    });

    if (selectedWord) {
        setMessage("strands-message", `Selected: ${selectedWord}`);
        return;
    }

    if (foundDisplayWords.length > 0) {
        setMessage("strands-message", `Found ${foundDisplayWords.length}/6: ${foundDisplayWords.join(", ")}`);
        return;
    }

    setMessage("strands-message", "Find 6 hidden words. Theme: How I see you.");
}

function updateStrandsCounter() {
    const counter = document.getElementById("strands-counter");
    if (counter) {
        counter.textContent = `Find 6 words. ${foundStrandWords.length}/6 found.`;
    }
}

function updateStrandsButtons() {
    const submitButton = document.getElementById("strands-submit");
    const clearButton = document.getElementById("strands-clear");

    if (submitButton) {
        submitButton.disabled = selectedStrandCells.length === 0;
    }

    if (clearButton) {
        clearButton.disabled = selectedStrandCells.length === 0;
    }
}

/* =========================================================
   GLOBAL FALLBACKS
   These expose functions for inline onclick attributes.
   ========================================================= */

window.startGame = startGame;
window.submitWordleGuess = submitWordleGuess;
window.submitConnectionsGuess = submitConnectionsGuess;
window.submitStrandsSelection = submitStrandsSelection;
