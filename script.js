/* =========================================================
   FOR YOU ❤️
   WORDLE → CONNECTIONS → STRANDS
   ========================================================= */


/* =========================================================
   GENERAL NAVIGATION
   ========================================================= */

function startGame() {
    document.getElementById("intro").classList.add("hidden");
    document.getElementById("wordle").classList.remove("hidden");

    createWordle();
}


/* =========================================================
   WORDLE
   ANSWER: SORRY
   ========================================================= */

const wordleAnswer = "SORRY";
let wordleRow = 0;
let wordleGuess = "";
const maxWordleRows = 6;

const wordleKeyboardStatus = {};


/* -------------------------
   CREATE WORDLE
   ------------------------- */

function createWordle() {

    const board = document.getElementById("wordle-board");

    board.innerHTML = "";

    wordleRow = 0;
    wordleGuess = "";

    // Create 6 x 5 board
    for (let row = 0; row < maxWordleRows; row++) {

        for (let col = 0; col < 5; col++) {

            const tile = document.createElement("div");

            tile.classList.add("wordle-tile");

            tile.id = `wordle-${row}-${col}`;

            board.appendChild(tile);
        }
    }

    createWordleKeyboard();

    document.getElementById("wordle-message").innerHTML =
        "Six tries. Five letters. You probably know this one.";
}


/* -------------------------
   WORDLE KEYBOARD
   ------------------------- */

function createWordleKeyboard() {

    const oldKeyboard = document.getElementById("wordle-keyboard");

    if (oldKeyboard) {
        oldKeyboard.remove();
    }

    // Reset keyboard colours
    Object.keys(wordleKeyboardStatus).forEach(key => {
        delete wordleKeyboardStatus[key];
    });

    const keyboard = document.createElement("div");

    keyboard.id = "wordle-keyboard";

    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    rows.forEach(rowLetters => {

        const row = document.createElement("div");

        row.classList.add("keyboard-row");

        rowLetters.split("").forEach(letter => {

            const key = document.createElement("button");

            key.innerText = letter;

            key.classList.add("wordle-key");

            key.dataset.key = letter;

            key.onclick = () => addWordleLetter(letter);

            row.appendChild(key);
        });

        keyboard.appendChild(row);
    });

    // Bottom row
    const controls = document.createElement("div");

    controls.classList.add("keyboard-row");

    const enter = document.createElement("button");

    enter.innerText = "ENTER";
    enter.classList.add("wordle-key", "wide-key");
    enter.onclick = submitWordleGuess;

    const backspace = document.createElement("button");

    backspace.innerText = "⌫";
    backspace.classList.add("wordle-key", "wide-key");
    backspace.onclick = deleteWordleLetter;

    controls.appendChild(enter);
    controls.appendChild(backspace);

    keyboard.appendChild(controls);

    document.getElementById("wordle-board").after(keyboard);
}


/* -------------------------
   WORDLE INPUT
   ------------------------- */

function addWordleLetter(letter) {

    if (wordleGuess.length >= 5) {
        return;
    }

    wordleGuess += letter;

    updateWordleTiles();
}


function deleteWordleLetter() {

    wordleGuess = wordleGuess.slice(0, -1);

    updateWordleTiles();
}


function updateWordleTiles() {

    for (let col = 0; col < 5; col++) {

        const tile = document.getElementById(
            `wordle-${wordleRow}-${col}`
        );

        tile.innerText = wordleGuess[col] || "";
    }
}


/* -------------------------
   COMPUTER KEYBOARD
   ------------------------- */

document.addEventListener("keydown", function(event) {

    const wordleScreen = document.getElementById("wordle");

    if (
        wordleScreen &&
        !wordleScreen.classList.contains("hidden")
    ) {

        const key = event.key.toUpperCase();

        if (/^[A-Z]$/.test(key)) {
            addWordleLetter(key);
        }

        if (event.key === "Backspace") {
            deleteWordleLetter();
        }

        if (event.key === "Enter") {
            submitWordleGuess();
        }
    }
});


/* -------------------------
   CHECK WORDLE
   ------------------------- */

function submitWordleGuess() {

    if (wordleGuess.length !== 5) {

        document.getElementById("wordle-message").innerText =
            "Five letters. That's all I'm asking.";

        return;
    }

    const guess = wordleGuess;

    const answerLetters = wordleAnswer.split("");

    const letterResults = Array(5).fill("absent");

    // First pass: exact matches
    for (let i = 0; i < 5; i++) {

        if (guess[i] === wordleAnswer[i]) {

            letterResults[i] = "correct";

            answerLetters[i] = null;
        }
    }

    // Second pass: letters that exist elsewhere
    for (let i = 0; i < 5; i++) {

        if (letterResults[i] === "correct") {
            continue;
        }

        const letterIndex = answerLetters.indexOf(guess[i]);

        if (letterIndex !== -1) {

            letterResults[i] = "present";

            answerLetters[letterIndex] = null;
        }
    }

    // Apply colours with slight delay
    for (let i = 0; i < 5; i++) {

        const tile = document.getElementById(
            `wordle-${wordleRow}-${i}`
        );

        setTimeout(() => {

            tile.classList.add(letterResults[i]);

        }, i * 120);

        updateKeyboard(
            guess[i],
            letterResults[i]
        );
    }

    // Correct
    if (guess === wordleAnswer) {

        setTimeout(() => {

            document.getElementById("wordle-message").innerHTML = `
                <strong>SORRY.</strong><br><br>
                Correct.<br><br>
                And unfortunately, this is one of those
                words that means considerably more than
                five letters.
            `;

            setTimeout(showConnections, 3000);

        }, 900);

        return;
    }

    wordleRow++;

    if (wordleRow >= maxWordleRows) {

        setTimeout(() => {

            document.getElementById("wordle-message").innerHTML = `
                The answer was <strong>SORRY</strong>.<br><br>
                You shouldn't have had to guess what I meant.
            `;

            setTimeout(showConnections, 3500);

        }, 900);

        return;
    }

    wordleGuess = "";

    setTimeout(() => {

        document.getElementById("wordle-message").innerText =
            "Not quite. Try again.";

    }, 700);
}


/* -------------------------
   UPDATE KEYBOARD
   ------------------------- */

function updateKeyboard(letter, status) {

    const currentStatus = wordleKeyboardStatus[letter];

    // Green always wins
    if (currentStatus === "correct") {
        return;
    }

    // Yellow wins over grey
    if (
        currentStatus === "present" &&
        status === "absent"
    ) {
        return;
    }

    wordleKeyboardStatus[letter] = status;

    const key = document.querySelector(
        `.wordle-key[data-key="${letter}"]`
    );

    if (!key) {
        return;
    }

    key.classList.remove(
        "key-correct",
        "key-present",
        "key-absent"
    );

    if (status === "correct") {
        key.classList.add("key-correct");
    }

    if (status === "present") {
        key.classList.add("key-present");
    }

    if (status === "absent") {
        key.classList.add("key-absent");
    }
}


/* =========================================================
   CONNECTIONS
   ========================================================= */

const connectionGroups = [

    {
        title: "Things I should have protected",

        words: [
            "PROMISE",
            "TRUST",
            "SAFETY",
            "CONSIDERATION"
        ],

        message: `
            <strong>You told me these things mattered to you.</strong><br><br>
            I heard you.<br><br>
            But I did fail consistently translating hearing you into behaviour.
        `
    },

    {
        title: "Things I should have done more often",

        words: [
            "TEXT",
            "UPDATE",
            "EFFORT",
            "SURPRISES"
        ],

        message: `
            <strong>Communication isn't a grand romantic gesture.</strong><br><br>
            It's the little things and living a shared life.
        `
    },

    {
        title: "Things I have learned from you",

        words: [
            "LOVE",
            "STACK OF UNDENIABLE EVIDENCE",
            "PERSEVERANCE",
            "HOW TO BE A GOOD PARTNER"
        ],

        message: `
            <strong>CORRECT.</strong><br><br>
            You are significantly more complicated than
            “boy who likes video games.”<br><br>
            I've spent more than four years learning from you
            and growing with you.
        `
    },

    {
        title: "Things I never want to take for granted",

        words: [
            "MOVIES",
            "FOOD",
            "DATES",
            "MEMORIES"
        ],

        message: `
            <strong>The life we've built isn't something I want
            to treat casually.</strong>
        `
    }

];

let connectionWords = [];
let selectedConnectionWords = [];
let solvedConnectionGroups = [];


/* -------------------------
   SHOW CONNECTIONS
   ------------------------- */

function showConnections() {

    document.getElementById("wordle").classList.add("hidden");

    document.getElementById("connections").classList.remove("hidden");

    createConnections();
}


/* -------------------------
   CREATE CONNECTIONS
   ------------------------- */

function createConnections() {

    const grid = document.getElementById("connections-grid");

    grid.innerHTML = "";

    connectionWords = [];
    selectedConnectionWords = [];
    solvedConnectionGroups = [];

    connectionGroups.forEach(group => {

        group.words.forEach(word => {

            connectionWords.push({
                word: word,
                group: group.title
            });

        });

    });

    // Shuffle
    connectionWords.sort(() => Math.random() - 0.5);

    connectionWords.forEach(item => {

        const tile = document.createElement("button");

        tile.classList.add("connection-tile");

        tile.innerText = item.word;

        tile.dataset.word = item.word;

        tile.onclick = () => selectConnectionTile(tile);

        grid.appendChild(tile);
    });

    document.getElementById("connections-message").innerHTML =
        "Find four groups of four.";
}


/* -------------------------
   SELECT TILE
   ------------------------- */

function selectConnectionTile(tile) {

    if (tile.disabled) {
        return;
    }

    const word = tile.dataset.word;

    if (tile.classList.contains("selected")) {

        tile.classList.remove("selected");

        selectedConnectionWords =
            selectedConnectionWords.filter(w => w !== word);

    } else {

        if (selectedConnectionWords.length >= 4) {
            return;
        }

        tile.classList.add("selected");

        selectedConnectionWords.push(word);
    }

    // Four selected → automatically check
    if (selectedConnectionWords.length === 4) {

        setTimeout(checkConnectionGroup, 350);
    }
}


/* -------------------------
   CHECK GROUP
   ------------------------- */

function checkConnectionGroup() {

    const selectedGroup = connectionGroups.find(group => {

        return group.words.every(word =>
            selectedConnectionWords.includes(word)
        );

    });

    if (selectedGroup) {

        revealConnectionGroup(selectedGroup);

    } else {

        document.getElementById("connections-message").innerHTML =
            "Not quite. Try another combination.";

        const selectedTiles =
            document.querySelectorAll(
                ".connection-tile.selected"
            );

        selectedTiles.forEach(tile => {

            tile.classList.add("wrong");

            setTimeout(() => {
                tile.classList.remove("selected", "wrong");
            }, 500);
        });

        selectedConnectionWords = [];
    }
}


/* -------------------------
   REVEAL SOLVED GROUP
   ------------------------- */

function revealConnectionGroup(group) {

    solvedConnectionGroups.push(group.title);

    const grid = document.getElementById("connections-grid");

    const tiles = Array.from(
        document.querySelectorAll(".connection-tile")
    );

    // Remove the four solved tiles
    tiles.forEach(tile => {

        if (group.words.includes(tile.dataset.word)) {

            tile.remove();
        }
    });

    // Create NYT-style solved box
    const solvedBox = document.createElement("div");

    solvedBox.classList.add(
        "connection-solved-group",
        `group-${solvedConnectionGroups.length}`
    );

    const title = document.createElement("div");

    title.classList.add("solved-title");

    title.innerText = group.title;

    const words = document.createElement("div");

    words.classList.add("solved-words");

    words.innerText = group.words.join(" • ");

    solvedBox.appendChild(title);
    solvedBox.appendChild(words);

    // Insert at the beginning
    grid.prepend(solvedBox);

    document.getElementById("connections-message").innerHTML =
        group.message;

    // All groups solved
    if (solvedConnectionGroups.length === 4) {

        setTimeout(() => {

            document.getElementById("connections-message").innerHTML += `
                <br><br>
                <strong>Four out of four.</strong><br><br>
                Unfortunately, relationships don't come with
                a satisfying little "solved" box.
                <br><br>
                The work continues after the game ends.
            `;

            setTimeout(showStrands, 4500);

        }, 1500);
    }
}


/* =========================================================
   STRANDS
   =========================================================

   11 x 11 grid.

   Hidden words:
   CONSISTENCY
   PATIENCE
   HONESTY
   EFFORT
   TRUST

   The words physically intersect with one another.
   ========================================================= */


/* -------------------------
   BOARD
   ------------------------- */

const strandsRows = [
    "XYPATIENCEQ",
    "ABCRDMNOPQX",
    "ZXCVBNMASDF",
    "QWEHONESTYU",
    "RTEFFORTIOP",
    "CONSISTENCY",
    "GHJTRUSTKL",
    "MNBVCXZQWE",
    "ASDFGHJKLPO",
    "QWERTYUIOPA",
    "ZXCVBNMASDF"
];


/*
   Word paths.

   Each number is:
   row * 11 + column

   Rows and columns are zero-indexed.
*/

const strandsWordPaths = {

    "PATIENCE": [
        1, 12, 23, 34, 45, 56, 67, 78
    ],

    "HONESTY": [
        36, 37, 38, 39, 40, 41, 42
    ],

    "EFFORT": [
        46, 47, 48, 49, 50, 51
    ],

    "CONSISTENCY": [
        55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65
    ],

    "TRUST": [
        61, 72, 83, 94, 105
    ]
};

const strandsWords = Object.keys(strandsWordPaths);

let selectedStrandIndices = [];
let foundStrandWords = [];


/* -------------------------
   SHOW STRANDS
   ------------------------- */

function showStrands() {

    document.getElementById("connections").classList.add("hidden");

    document.getElementById("strands").classList.remove("hidden");

    createStrands();
}


/* -------------------------
   CREATE BOARD
   ------------------------- */

function createStrands() {

    const board = document.getElementById("strands-board");

    board.innerHTML = "";

    selectedStrandIndices = [];
    foundStrandWords = [];

    strandsRows.forEach((row, rowIndex) => {

        row.split("").forEach((letter, colIndex) => {

            const index = rowIndex * 11 + colIndex;

            const tile = document.createElement("button");

            tile.classList.add("strand-letter");

            tile.innerText = letter;

            tile.dataset.index = index;

            tile.onclick = () =>
                selectStrandLetter(tile);

            board.appendChild(tile);
        });
    });

    document.getElementById("strands-message").innerHTML = `
        <strong>Theme: REBUILDING TRUST</strong><br><br>
        Find the hidden words.
    `;
}


/* -------------------------
   SELECT STRANDS LETTER
   ------------------------- */

function selectStrandLetter(tile) {

    const index = Number(tile.dataset.index);

    // Already found
    if (tile.classList.contains("found")) {
        return;
    }

    // Clicking the previous letter removes it
    if (
        selectedStrandIndices.length > 0 &&
        selectedStrandIndices[
            selectedStrandIndices.length - 1
        ] === index
    ) {

        selectedStrandIndices.pop();

        tile.classList.remove("selected");

        return;
    }

    // Don't select the same tile twice
    if (selectedStrandIndices.includes(index)) {
        return;
    }

    // Must be adjacent to previous letter
    if (selectedStrandIndices.length > 0) {

        const previous =
            selectedStrandIndices[
                selectedStrandIndices.length - 1
            ];

        if (!areAdjacent(previous, index)) {

            resetStrandSelection();

            document.getElementById("strands-message").innerText =
                "Those letters aren't connected. Try again.";

            return;
        }
    }

    selectedStrandIndices.push(index);

    tile.classList.add("selected");

    checkStrandSelection();
}


/* -------------------------
   ADJACENCY
   ------------------------- */

function areAdjacent(index1, index2) {

    const row1 = Math.floor(index1 / 11);
    const col1 = index1 % 11;

    const row2 = Math.floor(index2 / 11);
    const col2 = index2 % 11;

    return (
        Math.abs(row1 - row2) <= 1 &&
        Math.abs(col1 - col2) <= 1 &&
        !(row1 === row2 && col1 === col2)
    );
}


/* -------------------------
   CHECK WORD
   ------------------------- */

function checkStrandSelection() {

    const selectedWord = selectedStrandIndices
        .map(index => {

            const row = Math.floor(index / 11);
            const col = index % 11;

            return strandsRows[row][col];

        })
        .join("");

    // Check if this is a complete word
    if (strandsWords.includes(selectedWord)) {

        if (!foundStrandWords.includes(selectedWord)) {

            foundStrandWords.push(selectedWord);

            selectedStrandIndices.forEach(index => {

                const tile = document.querySelector(
                    `.strand-letter[data-index="${index}"]`
                );

                tile.classList.remove("selected");

                tile.classList.add("found");
            });

            selectedStrandIndices = [];

            document.getElementById("strands-message").innerHTML = `
                <strong>${selectedWord}</strong> ✓
                <br><br>
                ${foundStrandWords.length} of ${strandsWords.length} found.
            `;

            if (
                foundStrandWords.length ===
                strandsWords.length
            ) {

                setTimeout(() => {

                    document.getElementById(
                        "strands-message"
                    ).innerHTML = `
                        <strong>STRANDS COMPLETE.</strong>
                        <br><br>
                        That's the thing about trust.
                        <br><br>
                        It isn't rebuilt in one grand gesture.
                        It's rebuilt in small things,
                        repeatedly.
                    `;

                    setTimeout(showFinal, 4000);

                }, 1200);
            }
        }
    }
}


/* -------------------------
   RESET STRAND SELECTION
   ------------------------- */

function resetStrandSelection() {

    selectedStrandIndices.forEach(index => {

        const tile = document.querySelector(
            `.strand-letter[data-index="${index}"]`
        );

        if (tile) {
            tile.classList.remove("selected");
        }
    });

    selectedStrandIndices = [];
}


/* =========================================================
   FINAL APOLOGY
   ========================================================= */

function showFinal() {

    document.getElementById("strands").classList.add("hidden");

    document.getElementById("final").classList.remove("hidden");
}
