/* =========================================================
   FOR YOU ❤️
   WORDLE → CONNECTIONS → STRANDS
   ========================================================= */


/* =========================================================
   GENERAL GAME NAVIGATION
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

function createWordle() {

    const board = document.getElementById("wordle-board");

    board.innerHTML = "";

    // Create six rows
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

    const existingKeyboard = document.getElementById("wordle-keyboard");

    if (existingKeyboard) {
        existingKeyboard.remove();
    }

    const keyboard = document.createElement("div");

    keyboard.id = "wordle-keyboard";

    keyboard.style.marginTop = "20px";
    keyboard.style.display = "flex";
    keyboard.style.flexDirection = "column";
    keyboard.style.alignItems = "center";
    keyboard.style.gap = "6px";

    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    rows.forEach(rowLetters => {

        const row = document.createElement("div");

        row.style.display = "flex";
        row.style.gap = "5px";

        rowLetters.split("").forEach(letter => {

            const key = document.createElement("button");

            key.innerText = letter;

            key.style.padding = "10px 8px";
            key.style.background = "#e5dfd8";
            key.style.color = "#241f1c";
            key.style.border = "none";
            key.style.fontSize = "12px";
            key.style.letterSpacing = "0";
            key.style.transform = "none";

            key.onclick = () => addWordleLetter(letter);

            row.appendChild(key);
        });

        keyboard.appendChild(row);
    });

    // ENTER + BACKSPACE

    const controls = document.createElement("div");

    controls.style.display = "flex";
    controls.style.gap = "5px";
    controls.style.marginTop = "5px";

    const enter = document.createElement("button");

    enter.innerText = "ENTER";

    enter.style.padding = "10px 18px";
    enter.style.background = "#7d1f2c";
    enter.onclick = submitWordleGuess;

    const backspace = document.createElement("button");

    backspace.innerText = "⌫";

    backspace.style.padding = "10px 18px";
    backspace.style.background = "#817a75";
    backspace.onclick = deleteWordleLetter;

    controls.appendChild(enter);
    controls.appendChild(backspace);

    keyboard.appendChild(controls);

    document.getElementById("wordle-board").after(keyboard);
}


/* -------------------------
   WORDLE TYPING
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
   WORDLE KEYBOARD SUPPORT
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
            "Five letters. I promise this is the only requirement.";

        return;
    }

    const guess = wordleGuess;

    // Check each letter
    for (let i = 0; i < 5; i++) {

        const tile = document.getElementById(
            `wordle-${wordleRow}-${i}`
        );

        if (guess[i] === wordleAnswer[i]) {

            tile.classList.add("correct");

        } else if (wordleAnswer.includes(guess[i])) {

            tile.classList.add("present");

        } else {

            tile.classList.add("absent");
        }
    }

    // Correct answer
    if (guess === wordleAnswer) {

        setTimeout(() => {

            document.getElementById("wordle-message").innerHTML = `
                <strong>SORRY.</strong><br><br>
                Correct.<br><br>
                And unfortunately, this is one of those
                words that means considerably more than
                five letters.
            `;

            setTimeout(showConnections, 2500);

        }, 500);

        return;
    }

    wordleRow++;

    if (wordleRow >= maxWordleRows) {

        setTimeout(() => {

            document.getElementById("wordle-message").innerHTML = `
                The answer was <strong>SORRY</strong>.<br><br>
                You shouldn't have had to guess what I meant.
            `;

            setTimeout(showConnections, 3000);

        }, 500);

        return;
    }

    wordleGuess = "";

    document.getElementById("wordle-message").innerText =
        "Not quite. Try again.";
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
   CREATE GRID
   ------------------------- */

function createConnections() {

    const grid = document.getElementById("connections-grid");

    grid.innerHTML = "";

    connectionWords = [];

    connectionGroups.forEach(group => {

        group.words.forEach(word => {

            connectionWords.push({
                word: word,
                group: group.title
            });

        });

    });

    // Shuffle the words
    connectionWords.sort(() => Math.random() - 0.5);

    connectionWords.forEach(item => {

        const tile = document.createElement("button");

        tile.classList.add("connection-tile");

        tile.innerText = item.word;

        tile.dataset.word = item.word;

        tile.onclick = () => selectConnectionTile(tile);

        grid.appendChild(tile);
    });

    document.getElementById("connections-message").innerText =
        "Find four groups of four.";
}


/* -------------------------
   SELECT CONNECTION TILE
   ------------------------- */

function selectConnectionTile(tile) {

    const word = tile.dataset.word;

    if (tile.classList.contains("solved")) {
        return;
    }

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

    // Automatically check when 4 selected
    if (selectedConnectionWords.length === 4) {

        setTimeout(checkConnectionGroup, 400);
    }
}


/* -------------------------
   CHECK CONNECTION GROUP
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

        document.getElementById("connections-message").innerText =
            "Not quite. Try another combination.";

        document.querySelectorAll(".connection-tile.selected")
            .forEach(tile => {
                tile.classList.remove("selected");
            });

        selectedConnectionWords = [];
    }
}


/* -------------------------
   REVEAL GROUP
   ------------------------- */

function revealConnectionGroup(group) {

    solvedConnectionGroups.push(group.title);

    document.querySelectorAll(".connection-tile")
        .forEach(tile => {

            if (group.words.includes(tile.dataset.word)) {

                tile.classList.remove("selected");

                tile.classList.add("solved");

                tile.disabled = true;
            }
        });

    selectedConnectionWords = [];

    // Create revealed message
    const messageBox = document.getElementById("connections-message");

    messageBox.innerHTML = `
        <div class="connection-group">
            <strong>${group.title}</strong><br><br>
            ${group.message}
        </div>
    `;

    // If all four solved
    if (solvedConnectionGroups.length === 4) {

        setTimeout(() => {

            messageBox.innerHTML += `
                <br>
                <strong>Four out of four.</strong><br><br>
                Unfortunately, relationships aren't quite as
                satisfying as Connections.
                <br><br>
                There's no green square that makes everything fixed.
            `;

            setTimeout(showStrands, 4000);

        }, 1000);
    }
}


/* =========================================================
   STRANDS
   =========================================================

   A simplified Strands-style game.

   Theme: REBUILDING TRUST

   The player finds five hidden words.
   ========================================================= */

const strandsWords = [
    "LISTEN",
    "HONESTY",
    "EFFORT",
    "PATIENCE",
    "CONSISTENCY"
];

const strandsLetters = [
    "L","I","S","T","E","N","A",
    "H","O","N","E","S","T","Y",
    "E","F","F","O","R","T","B",
    "P","A","T","I","E","N","C",
    "E","C","O","N","S","I","S",
    "T","E","N","C","Y","R","E",
    "B","U","I","L","D","T","R",
    "U","S","T","A","G","A","I"
];

let selectedStrandLetters = [];
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
   CREATE STRANDS BOARD
   ------------------------- */

function createStrands() {

    const board = document.getElementById("strands-board");

    board.innerHTML = "";

    selectedStrandLetters = [];

    strandsLetters.forEach((letter, index) => {

        const tile = document.createElement("button");

        tile.classList.add("strand-letter");

        tile.innerText = letter;

        tile.dataset.index = index;

        tile.onclick = () => selectStrandLetter(tile);

        board.appendChild(tile);
    });

    document.getElementById("strands-message").innerHTML = `
        <strong>Theme: REBUILDING TRUST</strong><br><br>
        Find the words that matter.
    `;
}


/* -------------------------
   SELECT STRANDS LETTER
   ------------------------- */

function selectStrandLetter(tile) {

    const index = Number(tile.dataset.index);

    if (selectedStrandLetters.includes(index)) {

        selectedStrandLetters =
            selectedStrandLetters.filter(i => i !== index);

        tile.classList.remove("selected");

    } else {

        selectedStrandLetters.push(index);

        tile.classList.add("selected");
    }

    checkStrandSelection();
}


/* -------------------------
   CHECK STRANDS WORD
   ------------------------- */

function checkStrandSelection() {

    const selectedWord = selectedStrandLetters
        .map(index => strandsLetters[index])
        .join("");

    const reversedWord = selectedWord
        .split("")
        .reverse()
        .join("");

    const foundWord = strandsWords.find(word =>
        word === selectedWord ||
        word === reversedWord
    );

    if (foundWord && !foundStrandWords.includes(foundWord)) {

        foundStrandWords.push(foundWord);

        document.querySelectorAll(".strand-letter")
            .forEach(tile => {

                const index = Number(tile.dataset.index);

                if (selectedStrandLetters.includes(index)) {

                    tile.classList.remove("selected");

                    tile.classList.add("found");
                }
            });

        selectedStrandLetters = [];

        document.getElementById("strands-message").innerHTML = `
            <strong>${foundWord}</strong> ✓
            <br><br>
            ${foundStrandWords.length} of ${strandsWords.length} found.
        `;

        // All words found
        if (foundStrandWords.length === strandsWords.length) {

            setTimeout(() => {

                document.getElementById("strands-message").innerHTML = `
                    <strong>STRANDS COMPLETE.</strong><br><br>
                    That's the thing about trust.<br><br>
                    It isn't rebuilt in one grand gesture.
                    It's rebuilt in small things,
                    repeatedly.
                `;

                setTimeout(showFinal, 4000);

            }, 1200);
        }
    }
}


/* =========================================================
   FINAL APOLOGY
   ========================================================= */

function showFinal() {

    document.getElementById("strands").classList.add("hidden");

    document.getElementById("final").classList.remove("hidden");
}
