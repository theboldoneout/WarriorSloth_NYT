/* =========================================================
   APOLOGY GAMES
   WORDLE → CONNECTIONS → STRANDS
   ========================================================= */


/* =========================================================
   START
   ========================================================= */

function startGame() {
    document.getElementById("intro").classList.add("hidden");
    document.getElementById("wordle").classList.remove("hidden");

    createWordle();
}


/* =========================================================
   WORDLE
   ========================================================= */

const wordleAnswer = "SORRY";

let wordleRow = 0;
let wordleGuess = "";

const maxWordleRows = 6;


/* ---------- CREATE WORDLE ---------- */

function createWordle() {

    const board =
        document.getElementById("wordle-board");

    board.innerHTML = "";

    wordleRow = 0;
    wordleGuess = "";


    for (let row = 0; row < maxWordleRows; row++) {

        for (let col = 0; col < 5; col++) {

            const tile =
                document.createElement("div");

            tile.classList.add("wordle-tile");

            tile.id =
                `wordle-${row}-${col}`;

            board.appendChild(tile);
        }
    }


    createWordleKeyboard();


    document.getElementById(
        "wordle-message"
    ).innerHTML =
        "Six tries. Five letters. You probably know this one.";
}


/* ---------- KEYBOARD ---------- */

function createWordleKeyboard() {

    const oldKeyboard =
        document.getElementById(
            "wordle-keyboard"
        );

    if (oldKeyboard) {
        oldKeyboard.remove();
    }


    const keyboard =
        document.createElement("div");

    keyboard.id =
        "wordle-keyboard";


    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];


    rows.forEach(rowLetters => {

        const row =
            document.createElement("div");

        row.classList.add(
            "keyboard-row"
        );


        rowLetters.split("").forEach(letter => {

            const key =
                document.createElement("button");

            key.innerText = letter;

            key.classList.add(
                "wordle-key"
            );

            key.dataset.key = letter;

            key.onclick = () =>
                addWordleLetter(letter);

            row.appendChild(key);
        });


        keyboard.appendChild(row);
    });


    const controls =
        document.createElement("div");

    controls.classList.add(
        "keyboard-row"
    );


    const enter =
        document.createElement("button");

    enter.innerText = "ENTER";

    enter.classList.add(
        "wordle-key",
        "wide-key"
    );

    enter.onclick =
        submitWordleGuess;


    const backspace =
        document.createElement("button");

    backspace.innerText = "⌫";

    backspace.classList.add(
        "wordle-key",
        "wide-key"
    );

    backspace.onclick =
        deleteWordleLetter;


    controls.appendChild(enter);
    controls.appendChild(backspace);

    keyboard.appendChild(controls);


    document
        .getElementById("wordle-board")
        .after(keyboard);
}


/* ---------- TYPE ---------- */

function addWordleLetter(letter) {

    if (wordleGuess.length >= 5) {
        return;
    }

    wordleGuess += letter;

    updateWordleTiles();
}


function deleteWordleLetter() {

    wordleGuess =
        wordleGuess.slice(0, -1);

    updateWordleTiles();
}


function updateWordleTiles() {

    for (let col = 0; col < 5; col++) {

        const tile =
            document.getElementById(
                `wordle-${wordleRow}-${col}`
            );

        tile.innerText =
            wordleGuess[col] || "";
    }
}


/* ---------- KEYBOARD INPUT ---------- */

document.addEventListener(
    "keydown",
    function(event) {

        const wordleScreen =
            document.getElementById("wordle");

        if (
            wordleScreen &&
            !wordleScreen.classList.contains("hidden")
        ) {

            const key =
                event.key.toUpperCase();


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
    }
);


/* ---------- SUBMIT ---------- */

function submitWordleGuess() {

    if (wordleGuess.length !== 5) {

        document.getElementById(
            "wordle-message"
        ).innerText =
            "Five letters. That's all I'm asking.";

        return;
    }


    const guess =
        wordleGuess;


    const answerLetters =
        wordleAnswer.split("");


    const results =
        Array(5).fill("absent");


    /* CORRECT LETTERS */

    for (let i = 0; i < 5; i++) {

        if (
            guess[i] ===
            wordleAnswer[i]
        ) {

            results[i] =
                "correct";

            answerLetters[i] =
                null;
        }
    }


    /* PRESENT LETTERS */

    for (let i = 0; i < 5; i++) {

        if (
            results[i] ===
            "correct"
        ) {
            continue;
        }


        const index =
            answerLetters.indexOf(
                guess[i]
            );


        if (index !== -1) {

            results[i] =
                "present";

            answerLetters[index] =
                null;
        }
    }


    /* TILE ANIMATION */

    for (let i = 0; i < 5; i++) {

        const tile =
            document.getElementById(
                `wordle-${wordleRow}-${i}`
            );


        setTimeout(() => {

            tile.classList.add(
                results[i]
            );

        }, i * 120);
    }


    /* GREY OUT ONLY INCORRECT KEYBOARD LETTERS */

    for (let i = 0; i < 5; i++) {

        const letter =
            guess[i];


        if (
            !wordleAnswer.includes(letter)
        ) {

            setTimeout(() => {

                const key =
                    document.querySelector(
                        `.wordle-key[data-key="${letter}"]`
                    );


                if (key) {
                    key.classList.add(
                        "key-absent"
                    );
                }

            }, i * 120);
        }
    }


    /* CORRECT */

    if (guess === wordleAnswer) {

        setTimeout(() => {

            document.getElementById(
                "wordle-message"
            ).innerHTML = `
                <strong>SORRY.</strong><br><br>

                Correct.<br><br>

                And unfortunately, this is one of those
                words that means considerably more than
                five letters.
            `;


            setTimeout(
                showConnections,
                3000
            );

        }, 900);


        return;
    }


    /* NEXT ROW */

    wordleRow++;


    if (
        wordleRow >=
        maxWordleRows
    ) {

        setTimeout(() => {

            document.getElementById(
                "wordle-message"
            ).innerHTML = `
                The answer was <strong>SORRY</strong>.<br><br>

                You shouldn't have had to guess what I meant.
            `;


            setTimeout(
                showConnections,
                3500
            );

        }, 900);


        return;
    }


    wordleGuess = "";


    setTimeout(() => {

        document.getElementById(
            "wordle-message"
        ).innerText =
            "Not quite. Try again.";

    }, 700);
}


/* =========================================================
   CONNECTIONS
   ========================================================= */

const connectionGroups = [

    {
        title:
            "Things I should have protected",

        words: [
            "PROMISE",
            "TRUST",
            "SAFETY",
            "CONSIDERATION"
        ],

        message: `
            <strong>You told me these things mattered to you.</strong>
            <br><br>
            I heard you.
            <br><br>
            But I did fail consistently translating
            hearing you into behaviour.
        `
    },


    {
        title:
            "Things I should have done more often",

        words: [
            "TEXT",
            "UPDATE",
            "EFFORT",
            "SURPRISES"
        ],

        message: `
            <strong>Communication isn't a grand romantic gesture.</strong>
            <br><br>
            It's the little things and living a shared life.
        `
    },


    {
        title:
            "Things I have learned from you",

        words: [
            "LOVE",
            "STACK OF UNDENIABLE EVIDENCE",
            "PERSEVERANCE",
            "HOW TO BE A GOOD PARTNER"
        ],

        message: `
            <strong>CORRECT.</strong>
            <br><br>
            You are significantly more complicated than
            “boy who likes video games.”
            <br><br>
            I've spent more than four years learning from
            you and growing with you.
        `
    },


    {
        title:
            "Things I never want to take for granted",

        words: [
            "MOVIES",
            "FOOD",
            "DATES",
            "MEMORIES"
        ],

        message: `
            <strong>The life we've built isn't something
            I want to treat casually.</strong>
        `
    }

];


let connectionWords = [];

let selectedConnectionWords = [];

let solvedConnectionGroups = [];

let connectionAttempts = 0;

const maxConnectionAttempts = 6;

let connectionChecking = false;


/* ---------- SHOW CONNECTIONS ---------- */

function showConnections() {

    document
        .getElementById("wordle")
        .classList.add("hidden");


    document
        .getElementById("connections")
        .classList.remove("hidden");


    createConnections();
}


/* ---------- CREATE CONNECTIONS ---------- */

function createConnections() {

    connectionAttempts = 0;

    selectedConnectionWords = [];

    solvedConnectionGroups = [];

    connectionChecking = false;


    connectionWords = [];


    connectionGroups.forEach(group => {

        group.words.forEach(word => {

            connectionWords.push({
                word: word,
                group: group.title
            });

        });

    });


    shuffleArray(connectionWords);


    renderConnections();


    updateConnectionsMessage(
        "Find four groups of four.",
        true
    );
}


/* ---------- SHUFFLE ---------- */

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];
    }
}


/* =========================================================
   IMPORTANT:
   RENDER THE CONNECTIONS BOARD FROM SCRATCH
   EVERY TIME A GROUP IS SOLVED.
   ========================================================= */

function renderConnections() {

    const grid =
        document.getElementById(
            "connections-grid"
        );


    grid.innerHTML = "";


    /* ---------- SOLVED GROUPS ---------- */

    solvedConnectionGroups.forEach(
        (groupTitle, index) => {

            const group =
                connectionGroups.find(
                    g =>
                        g.title ===
                        groupTitle
                );


            if (!group) return;


            const solvedBox =
                document.createElement(
                    "div"
                );


            solvedBox.classList.add(
                "connection-solved-group"
            );


            solvedBox.classList.add(
                `group-${index + 1}`
            );


            const title =
                document.createElement(
                    "div"
                );

            title.classList.add(
                "solved-title"
            );

            title.innerText =
                group.title;


            const words =
                document.createElement(
                    "div"
                );

            words.classList.add(
                "solved-words"
            );

            words.innerText =
                group.words.join(" • ");


            solvedBox.appendChild(title);

            solvedBox.appendChild(words);


            grid.appendChild(
                solvedBox
            );
        }
    );


    /* ---------- REMAINING WORDS ---------- */

    const remainingWords =
        connectionWords.filter(
            item =>
                !solvedConnectionGroups.includes(
                    item.group
                )
        );


    shuffleArray(
        remainingWords
    );


    remainingWords.forEach(item => {

        const tile =
            document.createElement(
                "button"
            );


        tile.classList.add(
            "connection-tile"
        );


        tile.innerText =
            item.word;


        tile.dataset.word =
            item.word;


        tile.type =
            "button";


        tile.onclick = () =>
            selectConnectionTile(tile);


        grid.appendChild(tile);

    });
}


/* ---------- SELECT TILE ---------- */

function selectConnectionTile(tile) {

    if (
        connectionChecking ||
        tile.disabled
    ) {
        return;
    }


    const word =
        tile.dataset.word;


    /* DESELECT */

    if (
        tile.classList.contains(
            "selected"
        )
    ) {

        tile.classList.remove(
            "selected"
        );


        selectedConnectionWords =
            selectedConnectionWords.filter(
                w => w !== word
            );


        updateConnectionsMessage();

        return;
    }


    /* MAX 4 */

    if (
        selectedConnectionWords.length >= 4
    ) {
        return;
    }


    tile.classList.add(
        "selected"
    );


    selectedConnectionWords.push(
        word
    );


    updateConnectionsMessage();


    /* AUTOMATICALLY CHECK AFTER 4 */

    if (
        selectedConnectionWords.length === 4
    ) {

        connectionChecking = true;


        setTimeout(
            checkConnectionGroup,
            350
        );
    }
}


/* ---------- CHECK GROUP ---------- */

function checkConnectionGroup() {

    const selectedGroup =
        connectionGroups.find(
            group => {

                return group.words.every(
                    word =>
                        selectedConnectionWords.includes(
                            word
                        )
                );

            }
        );


    /* =====================================================
       CORRECT
       ===================================================== */

    if (selectedGroup) {

        revealConnectionGroup(
            selectedGroup
        );

        return;
    }


    /* =====================================================
       WRONG
       ===================================================== */

    connectionAttempts++;


    const selectedTiles =
        document.querySelectorAll(
            ".connection-tile.selected"
        );


    selectedTiles.forEach(tile => {

        tile.classList.add(
            "wrong"
        );

    });


    const remaining =
        maxConnectionAttempts -
        connectionAttempts;


    if (
        remaining > 0
    ) {

        setTimeout(() => {

            selectedTiles.forEach(
                tile => {

                    tile.classList.remove(
                        "selected",
                        "wrong"
                    );

                }
            );


            selectedConnectionWords = [];

            connectionChecking = false;


            updateConnectionsMessage(
                `Not quite.<br><br>
                 <strong>${remaining}
                 ${remaining === 1 ? "try" : "tries"}
                 remaining.</strong>`,
                false
            );

        }, 700);


        return;
    }


    /* =====================================================
       SIX FAILED ATTEMPTS
       ===================================================== */

    setTimeout(() => {

        selectedConnectionWords = [];

        connectionChecking = false;

        revealRemainingConnections();

    }, 700);
}


/* =========================================================
   REVEAL CORRECT GROUP
   ========================================================= */

function revealConnectionGroup(
    group
) {

    if (
        solvedConnectionGroups.includes(
            group.title
        )
    ) {
        return;
    }


    solvedConnectionGroups.push(
        group.title
    );


    /* IMPORTANT:
       Clear selection BEFORE rebuilding board.
    */

    selectedConnectionWords = [];

    connectionChecking = false;


    /* REBUILD THE BOARD */

    renderConnections();


    /* SHOW MESSAGE */

    updateConnectionsMessage(
        group.message,
        false
    );


    /* ALL FOUR GROUPS SOLVED */

    if (
        solvedConnectionGroups.length === 4
    ) {

        setTimeout(() => {

            document.getElementById(
                "connections-message"
            ).innerHTML += `
                <br><br>

                <strong>Four out of four.</strong>

                <br><br>

                Unfortunately, relationships don't come
                with a satisfying little "solved" box.

                <br><br>

                The work continues after the game ends.
            `;


            setTimeout(
                showStrands,
                4500
            );

        }, 1500);
    }
}


/* =========================================================
   REVEAL REMAINING GROUPS AFTER 6 ATTEMPTS
   ========================================================= */

function revealRemainingConnections() {

    connectionGroups.forEach(
        group => {

            if (
                !solvedConnectionGroups.includes(
                    group.title
                )
            ) {

                solvedConnectionGroups.push(
                    group.title
                );

            }

        }
    );


    renderConnections();


    document.getElementById(
        "connections-message"
    ).innerHTML = `
        <strong>Six tries.</strong>
        <br><br>

        The remaining groups have been revealed.
        <br><br>

        Sometimes the answer is obvious in hindsight.
    `;


    setTimeout(
        showStrands,
        5000
    );
}


/* ---------- MESSAGE ---------- */

function updateConnectionsMessage(
    message = null,
    includeAttempts = false
) {

    const element =
        document.getElementById(
            "connections-message"
        );


    if (message) {

        element.innerHTML =
            message;


        return;
    }


    const remaining =
        maxConnectionAttempts -
        connectionAttempts;


    element.innerHTML =
        `
        Select four.

        <br><br>

        <strong>
            ${remaining} tries remaining.
        </strong>
        `;
}


/* =========================================================
   STRANDS
   ========================================================= */

const strandsSearchWords = [
  "LIFEPARTNER",
  "HUSBAND",
  "PROTECTOR",
  "THERAPIST",
  "COACH",
  "LIFEOFTHEPARTY"
];

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

/* ---------- SHOW STRANDS ---------- */

function showStrands() {

    document
        .getElementById("connections")
        .classList.add("hidden");


    document
        .getElementById("strands")
        .classList.remove("hidden");


    createStrands();
}


/* ---------- CREATE STRANDS ---------- */

function createStrands() {

    const board =
        document.getElementById(
            "strands-board"
        );


    board.innerHTML = "";


    selectedStrandIndices = [];

    foundStrandWords = [];

    strandsAttempts = 0;


    strandsRows.forEach(
        (row, rowIndex) => {

            row.split("").forEach(
                (letter, colIndex) => {

                    const index =
                        rowIndex * 11 +
                        colIndex;


                    const tile =
                        document.createElement(
                            "button"
                        );


                    tile.classList.add(
                        "strand-letter"
                    );


                    tile.innerText =
                        letter;


                    tile.dataset.index =
                        index;


                    tile.type =
                        "button";


                    tile.onclick = () =>
                        selectStrandLetter(
                            tile
                        );


                    board.appendChild(
                        tile
                    );

                }
            );
        }
    );


    /* ---------- TRIES ---------- */

    let counter =
        document.getElementById(
            "strands-tries"
        );


    if (!counter) {

        counter =
            document.createElement(
                "div"
            );

        counter.id =
            "strands-tries";


        board.after(
            counter
        );
    }


    counter.innerText =
        "Unlimited tries";


    /* ---------- SUBMIT ---------- */

    let submit =
        document.getElementById(
            "strands-submit"
        );


    if (!submit) {

        submit =
            document.createElement(
                "button"
            );


        submit.id =
            "strands-submit";


        submit.innerText =
            "SUBMIT";


        submit.onclick =
            submitStrandWord;


        counter.after(
            submit
        );
    }


    submit.disabled = true;


    document.getElementById(
        "strands-message"
    ).innerHTML = `
        <strong>Theme: REBUILDING TRUST</strong>
        <br><br>

        Find the hidden words by connecting adjacent letters.
    `;
}


/* ---------- SELECT LETTER ---------- */

function selectStrandLetter(tile) {

    if (
        tile.classList.contains(
            "found"
        )
    ) {
        return;
    }


    const index =
        Number(
            tile.dataset.index
        );


    /* UNSELECT LAST LETTER */

    if (
        selectedStrandIndices.length > 0 &&
        selectedStrandIndices[
            selectedStrandIndices.length - 1
        ] === index
    ) {

        selectedStrandIndices.pop();

        tile.classList.remove(
            "selected"
        );

        updateStrandsSubmit();

        return;
    }


    /* DON'T SELECT SAME LETTER TWICE */

    if (
        selectedStrandIndices.includes(
            index
        )
    ) {
        return;
    }


    /* CHECK ADJACENCY */

    if (
        selectedStrandIndices.length > 0
    ) {

        const previous =
            selectedStrandIndices[
                selectedStrandIndices.length - 1
            ];


        if (
            !areAdjacent(
                previous,
                index
            )
        ) {

            resetStrandSelection();


            document.getElementById(
                "strands-message"
            ).innerText =
                "That letter isn't connected. Start a new word.";


            updateStrandsSubmit();

            return;
        }
    }


    selectedStrandIndices.push(
        index
    );


    tile.classList.add(
        "selected"
    );


    updateStrandsSubmit();
}


/* ---------- ADJACENCY ---------- */

function areAdjacent(
    index1,
    index2
) {

    const row1 =
        Math.floor(
            index1 / 11
        );


    const col1 =
        index1 % 11;


    const row2 =
        Math.floor(
            index2 / 11
        );


    const col2 =
        index2 % 11;


    return (
        Math.abs(row1 - row2) <= 1 &&
        Math.abs(col1 - col2) <= 1 &&
        !(row1 === row2 &&
          col1 === col2)
    );
}


/* ---------- SUBMIT BUTTON ---------- */

function updateStrandsSubmit() {

    const submit =
        document.getElementById(
            "strands-submit"
        );


    if (!submit) {
        return;
    }


    submit.disabled =
        selectedStrandIndices.length === 0;
}


/* ---------- GET WORD ---------- */

function getSelectedStrandWord() {

    return selectedStrandIndices
        .map(index => {

            const row =
                Math.floor(
                    index / 11
                );


            const col =
                index % 11;


            return strandsRows[row][col];

        })
        .join("");
}


/* ---------- SUBMIT STRANDS ---------- */

function submitStrandWord() {

    if (
        selectedStrandIndices.length === 0
    ) {
        return;
    }


    const selectedWord =
        getSelectedStrandWord();


    /* CORRECT */

    if (
        strandsWords.includes(
            selectedWord
        ) &&
        !foundStrandWords.includes(
            selectedWord
        )
    ) {

        foundStrandWords.push(
            selectedWord
        );


        selectedStrandIndices.forEach(
            index => {

                const tile =
                    document.querySelector(
                        `.strand-letter[data-index="${index}"]`
                    );


                if (tile) {

                    tile.classList.remove(
                        "selected"
                    );


                    tile.classList.add(
                        "found"
                    );
                }

            }
        );


        selectedStrandIndices = [];


        document.getElementById(
            "strands-message"
        ).innerHTML = `
            <strong>${selectedWord}</strong> ✓
            <br><br>

            ${foundStrandWords.length}
            of
            ${strandsWords.length}
            found.
        `;


        updateStrandsSubmit();


        if (
            foundStrandWords.length ===
            strandsWords.length
        ) {

            finishStrands();
        }


        return;
    }


    /* WRONG — UNLIMITED */

    strandsAttempts++;


    resetStrandSelection();


    document.getElementById(
        "strands-message"
    ).innerHTML = `
        <strong>Not quite.</strong>
        <br><br>

        "${selectedWord}" isn't one of them.
        <br><br>

        Keep looking.
    `;


    document.getElementById(
        "strands-tries"
    ).innerText =
        "Unlimited tries";


    updateStrandsSubmit();
}


/* ---------- RESET STRANDS SELECTION ---------- */

function resetStrandSelection() {

    selectedStrandIndices.forEach(
        index => {

            const tile =
                document.querySelector(
                    `.strand-letter[data-index="${index}"]`
                );


            if (tile) {

                tile.classList.remove(
                    "selected"
                );
            }

        }
    );


    selectedStrandIndices = [];


    updateStrandsSubmit();
}


/* ---------- FINISH STRANDS ---------- */

function finishStrands() {

    document.getElementById(
        "strands-message"
    ).innerHTML = `
        <strong>STRANDS COMPLETE.</strong>
        <br><br>

        That's the thing about trust.
        <br><br>

        It isn't rebuilt in one grand gesture.
        It's rebuilt in small things, repeatedly.
    `;


    document.getElementById(
        "strands-submit"
    ).disabled = true;


    setTimeout(
        showFinal,
        4000
    );
}


/* =========================================================
   FINAL
   ========================================================= */

function showFinal() {

    document
        .getElementById("strands")
        .classList.add("hidden");


    document
        .getElementById("final")
        .classList.remove("hidden");
}
