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

    if ((priority[state] || 0) <= (priority[currentState] || 0)) {
        return;
    }

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
        title: "THINGS I SHOULD HAVE PROTECTED",
        words: ["PROMISE", "TRUST", "SAFETY", "CONSIDERATION"],
        reveal: "You told me these things mattered to you. I heard you. But I did fail consistently translating hearing you into behaviour."
    },
    {
        title: "THINGS I SHOULD HAVE DONE MORE OFTEN",
        words: ["TEXT", "UPDATE", "EFFORT", "SURPRISES"],
        reveal: "Communication isn't a grand romantic gesture. It's the little things and living a shared life."
    },
    {
        title: "THINGS I HAVE LEARNED FROM YOU",
        words: ["LOVE", "STACK OF UNDENIABLE EVIDENCE", "PERSEVERANCE", "HOW TO BE A GOOD PARTNER"],
        reveal: "CORRECT. You are significantly more complicated than “boy who likes video games.” I've spent more than four years learning from you and growing with you."
    },
    {
        title: "THINGS I NEVER WANT TO TAKE FOR GRANTED",
        words: ["MOVIES", "FOOD", "DATES", "MEMORIES"],
        reveal: "The life we've built isn't something I want to treat casually."
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

    grid.innerHTML = "";
    selectedConnectionWords = [];
    solvedConnectionGroups = [];
    connectionTriesUsed = 0;
    connectionsLocked = false;

    connectionTiles = shuffleArray(
        CONNECTION_GROUPS.flatMap((group, groupIndex) =>
            group.words.map((word) => ({
                word,
                groupIndex
            }))
        )
    );

    connectionTiles.forEach(({ word, groupIndex }) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "connection-tile";
        tile.textContent = word;
        tile.dataset.word = word;
        tile.dataset.groupIndex = String(groupIndex);
        tile.addEventListener("click", () => toggleConnectionTile(tile, word));
        grid.appendChild(tile);
    });

    createConnectionsControls();
    updateConnectionsMessage("Select four tiles. 6 tries remaining.");
    connectionsInitialized = true;
}

function createConnectionsControls() {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    let controls = document.getElementById("connections-controls");

    if (!controls) {
        controls = document.createElement("div");
        controls.id = "connections-controls";
        grid.insertAdjacentElement("afterend", controls);
    }

    controls.innerHTML = "";

    const shuffleButton = document.createElement("button");
    shuffleButton.type = "button";
    shuffleButton.textContent = "Shuffle";
    shuffleButton.className = "secondary";
    shuffleButton.addEventListener("click", shuffleConnectionsTiles);

    const deselectButton = document.createElement("button");
    deselectButton.type = "button";
    deselectButton.textContent = "Deselect all";
    deselectButton.className = "secondary";
    deselectButton.addEventListener("click", () => deselectConnections());

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent = "Submit";
    submitButton.addEventListener("click", submitConnectionsGuess);

    controls.appendChild(shuffleButton);
    controls.appendChild(deselectButton);
    controls.appendChild(submitButton);
}

function toggleConnectionTile(tile, word) {
    if (connectionsLocked) return;
    if (!tile || tile.classList.contains("solved")) return;

    const isSelected = tile.classList.contains("selected");

    if (isSelected) {
        tile.classList.remove("selected");
        selectedConnectionWords = selectedConnectionWords.filter((selectedWord) => selectedWord !== word);
        return;
    }

    if (selectedConnectionWords.length >= 4) {
        setMessage("connections-message", "Only four at a time.");
        return;
    }

    tile.classList.add("selected");
    selectedConnectionWords.push(word);
}

function submitConnectionsGuess() {
    if (connectionsLocked) return;

    if (selectedConnectionWords.length !== 4) {
        setMessage("connections-message", "Select exactly four words.");
        return;
    }

    const matchingGroupIndex = CONNECTION_GROUPS.findIndex((group, index) => {
        if (solvedConnectionGroups.includes(index)) return false;
        return sameWordSet(group.words, selectedConnectionWords);
    });

    connectionTriesUsed += 1;

    if (matchingGroupIndex !== -1) {
        revealConnectionGroup(matchingGroupIndex);
        selectedConnectionWords = [];

        if (solvedConnectionGroups.length === CONNECTION_GROUPS.length) {
            connectionsLocked = true;
            setMessage("connections-message", "You found every connection.");

            setTimeout(() => {
                showScreen("strands");
                initStrands();
            }, 2200);
            return;
        }

        updateConnectionsMessage("Correct.");
        return;
    }

    shakeSelectedConnections();

    if (connectionTriesUsed >= CONNECTION_MAX_TRIES) {
        connectionsLocked = true;
        deselectConnections();
        revealAllConnectionGroups();
        setMessage("connections-message", "That was 6 tries. I should make things easier, not harder.");

        setTimeout(() => {
            showScreen("strands");
            initStrands();
        }, 2600);
        return;
    }

    const oneAway = CONNECTION_GROUPS.some((group, index) => {
        if (solvedConnectionGroups.includes(index)) return false;
        const selectedSet = new Set(selectedConnectionWords);
        return group.words.filter((word) => selectedSet.has(word)).length === 3;
    });

    updateConnectionsMessage(oneAway ? "One away." : "Not quite.");
    deselectConnections(false);
}

function sameWordSet(a, b) {
    if (a.length !== b.length) return false;
    const normalizedB = b.map(normalizeWord).sort();
    return a.map(normalizeWord).sort().every((word, index) => word === normalizedB[index]);
}

function revealConnectionGroup(groupIndex) {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    solvedConnectionGroups.push(groupIndex);

    const group = CONNECTION_GROUPS[groupIndex];
    const groupBox = document.createElement("div");
    groupBox.className = `connection-solved-group group-${groupIndex + 1}`;
    groupBox.innerHTML = `
        <div class="solved-title">${group.title}</div>
        <div class="solved-words">${group.words.join(" / ")}</div>
        ${group.reveal ? `<div class="solved-reveal">${group.reveal}</div>` : ""}
    `;

    const selectedTiles = Array.from(grid.querySelectorAll(".connection-tile.selected"));
    selectedTiles.forEach((tile) => tile.remove());

    const firstUnsolvedTile = grid.querySelector(".connection-tile");
    if (firstUnsolvedTile) {
        grid.insertBefore(groupBox, firstUnsolvedTile);
    } else {
        grid.appendChild(groupBox);
    }
}

function revealAllConnectionGroups() {
    CONNECTION_GROUPS.forEach((_, groupIndex) => {
        if (!solvedConnectionGroups.includes(groupIndex)) {
            revealConnectionGroupFromRemaining(groupIndex);
        }
    });
}

function revealConnectionGroupFromRemaining(groupIndex) {
    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    solvedConnectionGroups.push(groupIndex);

    const group = CONNECTION_GROUPS[groupIndex];

    group.words.forEach((word) => {
        const tile = grid.querySelector(`.connection-tile[data-word="${CSS.escape(word)}"]`);
        if (tile) tile.remove();
    });

    const groupBox = document.createElement("div");
    groupBox.className = `connection-solved-group group-${groupIndex + 1}`;
    groupBox.innerHTML = `
        <div class="solved-title">${group.title}</div>
        <div class="solved-words">${group.words.join(" / ")}</div>
        ${group.reveal ? `<div class="solved-reveal">${group.reveal}</div>` : ""}
    `;

    grid.appendChild(groupBox);
}

function shakeSelectedConnections() {
    const selectedTiles = document.querySelectorAll(".connection-tile.selected");

    selectedTiles.forEach((tile) => {
        tile.classList.add("wrong");
        setTimeout(() => tile.classList.remove("wrong"), 400);
    });
}

function deselectConnections(updateMessage = true) {
    selectedConnectionWords = [];
    document.querySelectorAll(".connection-tile.selected").forEach((tile) => {
        tile.classList.remove("selected");
    });

    if (updateMessage) {
        updateConnectionsMessage();
    }
}

function shuffleConnectionsTiles() {
    if (connectionsLocked) return;

    const grid = document.getElementById("connections-grid");
    if (!grid) return;

    const unsolvedTiles = Array.from(grid.querySelectorAll(".connection-tile"));
    const shuffledTiles = shuffleArray(unsolvedTiles);

    shuffledTiles.forEach((tile) => grid.appendChild(tile));
}

function updateConnectionsMessage(prefix = "") {
    const remainingTries = Math.max(CONNECTION_MAX_TRIES - connectionTriesUsed, 0);
    const suffix = `${remainingTries} ${remainingTries === 1 ? "try" : "tries"} remaining.`;
    setMessage("connections-message", prefix ? `${prefix} ${suffix}` : suffix);
}

/* =========================================================
   STRANDS
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

const STRANDS_GRID = [
    ["H", "U", "S", "B", "A", "N", "D", "X", "C", "O", "A"],
    ["P", "R", "O", "T", "E", "C", "T", "O", "R", "C", "H"],
    ["L", "I", "F", "E", "P", "A", "R", "T", "N", "E", "R"],
    ["T", "H", "E", "R", "A", "P", "I", "S", "T", "Y", "Z"],
    ["L", "I", "F", "E", "O", "F", "T", "H", "E", "P", "A"],
    ["R", "T", "Y", "M", "E", "M", "O", "R", "Y", "L", "O"],
    ["C", "O", "A", "C", "H", "D", "A", "T", "E", "S", "V"]
];

const STRANDS_PATHS = {
    HUSBAND: ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "0-6"],
    PROTECTOR: ["1-0", "1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8"],
    LIFEPARTNER: ["2-0", "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8", "2-9", "2-10"],
    THERAPIST: ["3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "3-6", "3-7", "3-8"],
    LIFEOFTHEPARTY: ["4-0", "4-1", "4-2", "4-3", "4-4", "4-5", "4-6", "4-7", "4-8", "4-9", "4-10", "5-0", "5-1", "5-2"],
    COACH: ["6-0", "6-1", "6-2", "6-3", "6-4"]
};

let selectedStrandCells = [];
let foundStrandWords = [];
let strandsInitialized = false;

function initStrands() {
    const board = document.getElementById("strands-board");
    if (!board) return;

    if (strandsInitialized) return;

    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${STRANDS_GRID[0].length}, 1fr)`;

    STRANDS_GRID.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement("button");
            cell.type = "button";
            cell.className = "strand-letter";
            cell.textContent = letter;
            cell.dataset.position = `${rowIndex}-${colIndex}`;
            cell.dataset.row = String(rowIndex);
            cell.dataset.col = String(colIndex);
            cell.addEventListener("click", () => toggleStrandCell(cell));
            board.appendChild(cell);
        });
    });

    createStrandsControls();
    updateStrandsMessage();
    strandsInitialized = true;
}

function createStrandsControls() {
    const board = document.getElementById("strands-board");
    if (!board) return;

    let controls = document.getElementById("strands-controls");

    if (!controls) {
        controls = document.createElement("div");
        controls.id = "strands-controls";
        board.insertAdjacentElement("afterend", controls);
    }

    controls.innerHTML = "";

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent = "Submit word";
    submitButton.addEventListener("click", submitStrandsWord);

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.textContent = "Clear";
    clearButton.className = "secondary";
    clearButton.addEventListener("click", clearStrandSelection);

    controls.appendChild(submitButton);
    controls.appendChild(clearButton);
}

function toggleStrandCell(cell) {
    if (!cell || cell.classList.contains("found")) return;

    const position = cell.dataset.position;
    const existingIndex = selectedStrandCells.findIndex((selected) => selected.position === position);

    if (existingIndex !== -1) {
        selectedStrandCells.splice(existingIndex, 1);
        cell.classList.remove("selected");
        return;
    }

    selectedStrandCells.push({
        position,
        letter: cell.textContent
    });
    cell.classList.add("selected");
}

function submitStrandsWord() {
    if (!selectedStrandCells.length) {
        updateStrandsMessage("Select letters first.");
        return;
    }

    const selectedPositions = selectedStrandCells.map((cell) => cell.position);
    const matchedKey = Object.keys(STRANDS_PATHS).find((key) => {
        if (foundStrandWords.includes(key)) return false;
        return samePath(STRANDS_PATHS[key], selectedPositions);
    });

    if (!matchedKey) {
        markStrandSelectionWrong();
        updateStrandsMessage("Not one of the hidden words. Try again.");
        return;
    }

    foundStrandWords.push(matchedKey);

    selectedPositions.forEach((position) => {
        const cell = document.querySelector(`.strand-letter[data-position="${position}"]`);
        if (cell) {
            cell.classList.remove("selected");
            cell.classList.add("found");
        }
    });

    selectedStrandCells = [];

    if (foundStrandWords.length === STRANDS_WORDS.length) {
        updateStrandsMessage("You found all 6 words.");

        setTimeout(() => {
            showScreen("final");
        }, 1500);
        return;
    }

    updateStrandsMessage("Found one.");
}

function samePath(a, b) {
    if (a.length !== b.length) return false;

    const forward = a.every((position, index) => position === b[index]);
    const backward = a.every((position, index) => position === b[b.length - 1 - index]);

    return forward || backward;
}

function clearStrandSelection() {
    selectedStrandCells = [];
    document.querySelectorAll(".strand-letter.selected").forEach((cell) => {
        cell.classList.remove("selected");
    });
    updateStrandsMessage();
}

function markStrandSelectionWrong() {
    const selectedCells = document.querySelectorAll(".strand-letter.selected");

    selectedCells.forEach((cell) => {
        cell.classList.add("wrong");
        setTimeout(() => cell.classList.remove("wrong"), 400);
    });

    setTimeout(() => {
        clearStrandSelection();
    }, 450);
}

function updateStrandsMessage(prefix = "") {
    const baseMessage = `Theme: ${STRANDS_THEME}. Find 6 words. ${foundStrandWords.length}/6 found.`;
    setMessage("strands-message", prefix ? `${prefix} ${baseMessage}` : baseMessage);
}

/* =========================================================
   SAFETY EXPORTS FOR INLINE HTML ONCLICK ATTRIBUTES
   ========================================================= */

window.startGame = startGame;
window.submitWordleGuess = submitWordleGuess;
window.submitConnectionsGuess = submitConnectionsGuess;
window.submitStrandsWord = submitStrandsWord;
