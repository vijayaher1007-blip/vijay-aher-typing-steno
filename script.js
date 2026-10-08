/* =====================================================
   VIJAY AHER
   ADVANCED TYPING & STENO TEST
   ===================================================== */


/* =====================================================
   GENERAL NAVIGATION
   ===================================================== */

function showSection(id) {

    document.querySelectorAll(".main-section")
        .forEach(section => section.classList.add("hidden"));

    const section = document.getElementById(id);

    if (section) {
        section.classList.remove("hidden");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


/* =====================================================
   TYPING PASSAGES
   CLOUD / MYSQL DATA
   ===================================================== */

let passages = [];

/* =====================================================
   MAIN TYPING VARIABLES
   ===================================================== */

let currentPassage = null;
let timerInterval = null;
let remainingSeconds = 0;
let testStarted = false;
let editingId = null;

let questionZoom = 20;
let typingZoom = 20;
let answerZoom = 20;


/* =====================================================
   MAIN ELEMENTS
   ===================================================== */

const language = document.getElementById("language");
const duration = document.getElementById("duration");
const passageSelect = document.getElementById("passageSelect");

const typingArea = document.getElementById("typingArea");
const typingMirror = document.getElementById("typingMirror");
const questionText = document.getElementById("questionText");

const timerDisplay = document.getElementById("timer");
const grossWpm = document.getElementById("grossWpm");
const netWpm = document.getElementById("netWpm");
const accuracyDisplay = document.getElementById("accuracy");
const errorsDisplay = document.getElementById("errors");

const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");

const backspaceMode = document.getElementById("backspaceMode");
const arrowMode = document.getElementById("arrowMode");


/* =====================================================
   LOAD PASSAGES
   ===================================================== */

/* =====================================================
   CLOUD TYPING PASSAGES
   ===================================================== */

async function loadPassages() {

    try {

        const response =
            await fetch("/api/typing-passages");

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.message || "Passages load failed."
            );

        }

        passages =
            data.passages || [];

        populatePassageSelect();
        displayPassages();

        loadCourtTypingPassages();

    } catch (error) {

        console.error(
            "CLOUD TYPING PASSAGES LOAD ERROR:",
            error
        );

        alert(
            "Typing passages cloud मधून load झाले नाहीत."
        );

    }

}


/* =====================================================
   SAVE PASSAGES
   ===================================================== */

async function savePassages() {

    console.log(
        "Cloud passage save is handled by API."
    );

}

/* =====================================================
   PASSAGE DROPDOWN
   ===================================================== */

function populatePassageSelect() {

    const selectedLanguage = language.value;

    passageSelect.innerHTML = "";

    passages
        .filter(p => p.language === selectedLanguage)
        .forEach(p => {

            const option = document.createElement("option");

            option.value = p.id;
            option.textContent = p.title;

            passageSelect.appendChild(option);

        });

    loadSelectedPassage();
}


/* =====================================================
   LOAD SELECTED PASSAGE
   ===================================================== */

function loadSelectedPassage() {

    const id = Number(passageSelect.value);

    currentPassage = passages.find(
        p => p.id === id
    );

    if (!currentPassage) {

        questionText.textContent =
            "No passage available.";

        return;
    }

    questionText.textContent =
        currentPassage.content;

    setTypingFont();
}


/* =====================================================
   FONT
   ===================================================== */

function setTypingFont() {

    questionText.classList.remove(
        "english-font",
        "kruti-font"
    );

    typingArea.classList.remove(
        "english-font",
        "kruti-font"
    );

    if (language.value === "English") {

        questionText.classList.add("english-font");
        typingArea.classList.add("english-font");

    } else {

        questionText.classList.add("kruti-font");
typingArea.classList.add("kruti-font");

questionText.style.fontFamily =
    '"KrutiDev055", sans-serif';

typingArea.style.fontFamily =
    '"KrutiDev055", sans-serif';

    }
}

/* =====================================================
   UNICODE → KRUTI DEV 055
   TEST FUNCTION
   ===================================================== */

function unicodeToKrutiDev(text) {

    if (!text) return "";

    // Temporary test
    // Actual Kruti Dev mapping आपण पुढच्या step मध्ये लावू.

    return text;
}

/* =====================================================
   CHANGE EVENTS
   ===================================================== */

language.addEventListener(
    "change",
    populatePassageSelect
);

passageSelect.addEventListener(
    "change",
    loadSelectedPassage
);


function startMainTyping() {

    if (!currentPassage) {

        alert("Please select a passage.");

        return;
    }

    clearInterval(timerInterval);

    const minutes =
        Number(duration.value);

    remainingSeconds =
        minutes * 60;

    testStarted = false;

    typingArea.value = "";
    typingArea.disabled = true;

    startBtn.disabled = true;
    submitBtn.disabled = true;

    document.getElementById(
        "resultBox"
    ).classList.add("hidden");

    updateTimerDisplay();

    startTypingCountdown();
}


/* START BUTTON */
document.getElementById("startBtn").addEventListener(
    "click",
    startMainTyping
);


/* =====================================================
   15 SECOND TYPING COUNTDOWN
   ===================================================== */

let typingCountdownTimer = null;
let typingCountdownSeconds = 15;

function startTypingCountdown() {

    const countdown =
        document.getElementById(
            "typingCountdown"
        );

    const number =
        document.getElementById(
            "countdownNumber"
        );

    const skipBtn =
        document.getElementById(
            "skipCountdownBtn"
        );

    if (!countdown || !number) {

        startTypingAfterCountdown();

        return;
    }

    clearInterval(
        typingCountdownTimer
    );

    typingCountdownSeconds = 15;

    number.textContent =
        typingCountdownSeconds;

    countdown.classList.remove(
        "hidden"
    );

    if (skipBtn) {

        skipBtn.onclick =
            skipTypingCountdown;

    }

    typingCountdownTimer =
        setInterval(
            function () {

                typingCountdownSeconds--;

                number.textContent =
                    typingCountdownSeconds;

                if (
                    typingCountdownSeconds <= 0
                ) {

                    clearInterval(
                        typingCountdownTimer
                    );

                    startTypingAfterCountdown();

                }

            },
            1000
        );
}


/* =====================================================
   SKIP COUNTDOWN
   ===================================================== */

function skipTypingCountdown() {

    clearInterval(
        typingCountdownTimer
    );

    startTypingAfterCountdown();
}


/* =====================================================
   START TYPING AFTER COUNTDOWN
   ===================================================== */

function formatTypingTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}
function startTypingAfterCountdown() {

    const countdown =
        document.getElementById(
            "typingCountdown"
        );

    if (countdown) {

        countdown.classList.add(
            "hidden"
        );

    }

document.body.classList.add("typing-test-active");
    testStarted = true;

    typingArea.disabled = false;

    typingArea.focus();

    submitBtn.disabled = false;

    updateTimerDisplay();
// ==========================================
// SHOW FULLSCREEN TYPING TIMER
// ==========================================

const fullscreenTimer =
    document.getElementById(
        "fullscreenTypingTimer"
    );

const fullscreenTime =
    document.getElementById(
        "fullscreenTimeRemaining"
    );

if (
    fullscreenTimer &&
    fullscreenTime
) {

    fullscreenTimer.style.display =
        "inline-flex";

    fullscreenTime.textContent =
        formatTypingTime(
            remainingSeconds
        );
}
    timerInterval =
        setInterval(
            mainTimerTick,
            1000
        );

    updateMainStats();

    const panels = document.querySelectorAll(
        "#typingWorkspace > .test-panel"
    );

    if (panels.length >= 2) {

        panels[0].style.setProperty(
            "grid-column",
            "1",
            "important"
        );

        panels[0].style.setProperty(
            "grid-row",
            "1",
            "important"
        );

        panels[1].style.setProperty(
            "grid-column",
            "2",
            "important"
        );

        panels[1].style.setProperty(
            "grid-row",
            "1",
            "important"
        );
    }
}

    /* =====================================================
   ACTIVATE FULL SCREEN TYPING MODE
   ===================================================== */

document.body.classList.add(
    "typing-test-active"
);
const typingWorkspace =
    document.getElementById(
        "typingWorkspace"
    );

if (typingWorkspace) {

    typingWorkspace.style.setProperty(
        "display",
        "grid",
        "important"
    );

    typingWorkspace.style.setProperty(
        "grid-template-columns",
        "1fr 1fr",
        "important"
    );

    typingWorkspace.style.setProperty(
        "grid-template-rows",
        "1fr",
        "important"
    );

    const panels =
        typingWorkspace.querySelectorAll(
            ":scope > .test-panel"
        );

    if (panels.length >= 2) {

        panels[0].style.setProperty(
            "grid-column",
            "1",
            "important"
        );

        panels[0].style.setProperty(
            "grid-row",
            "1",
            "important"
        );

        panels[1].style.setProperty(
            "grid-column",
            "2",
            "important"
        );

        panels[1].style.setProperty(
            "grid-row",
            "1",
            "important"
        );
    }
}

/* =====================================================
   MAIN TIMER
   ===================================================== */

function mainTimerTick() {

    remainingSeconds--;

    updateTimerDisplay();

const fullscreenTime =
    document.getElementById(
        "fullscreenTimeRemaining"
    );

if (fullscreenTime) {

    fullscreenTime.textContent =
        formatTypingTime(
            remainingSeconds
        );
}

    updateMainStats();

    if (remainingSeconds <= 0) {

        clearInterval(timerInterval);

        submitMainTyping();
    }
}
function createAnswerKey(typed, target) {

    let html = "";

    const maxLength =
        Math.max(
            typed.length,
            target.length
        );

    for (let i = 0; i < maxLength; i++) {

        const typedChar =
            typed[i] || "";

        const correctChar =
            target[i] || "";

        if (typedChar === correctChar) {

            html += `
                <span class="answer-correct">
                    ${escapeHTML(correctChar)}
                </span>
            `;

        } else {

            html += `
                <span class="answer-wrong"
                      title="तुम्ही: ${escapeHTML(typedChar || "[रिकामे]")} | योग्य: ${escapeHTML(correctChar || "[रिकामे]")}">
                    ${escapeHTML(correctChar || "□")}
                </span>
            `;
        }
    }

    return html;
}

function updateTimerDisplay() {

    const min =
        Math.floor(remainingSeconds / 60)
            .toString()
            .padStart(2, "0");

    const sec =
        (remainingSeconds % 60)
            .toString()
            .padStart(2, "0");

    timerDisplay.textContent =
        `${min}:${sec}`;
}


/* =====================================================
   MAIN TYPING INPUT
   ===================================================== */

typingArea.addEventListener(
    "input",
    function () {

        if (!testStarted) return;

        updateTypingMirror();
        updateMainStats();

    }
);


/* =====================================================
   CHARACTER CHECKING
   ===================================================== */

function getCharacterStats(text, target) {

    let correct = 0;
    let errors = 0;

    for (let i = 0; i < text.length; i++) {

        if (text[i] === target[i]) {
            correct++;
        } else {
            errors++;
        }

    }

    return {
        correct,
        errors
    };
}


/* =====================================================
   MAIN TYPING MIRROR
   ===================================================== */

function updateTypingMirror() {

    if (!typingArea || !typingMirror) return;

    /*
       Typing करताना Green / Red comparison दाखवायचा नाही.
       फक्त typed text normal स्वरूपात दाखवायचा.
    */

    typingMirror.textContent =
        typingArea.value;
}


/* =====================================================
   MAIN STATS
   ===================================================== */

function updateMainStats() {

    if (!currentPassage) return;

    const typed =
        typingArea.value;

    const target =
        currentPassage.content;

    const stats =
        getCharacterStats(
            typed,
            target
        );

    const elapsedSeconds =
        Math.max(
            1,
            (Number(duration.value) * 60)
            - remainingSeconds
        );

    const minutes =
        elapsedSeconds / 60;

    const gross =
        Math.round(
            typed.length / 5 / minutes
        );

    const accuracy =
        typed.length === 0
            ? 100
            : Math.round(
                (stats.correct /
                typed.length) * 100
            );

    const net =
        Math.max(
            0,
            Math.round(
                gross -
                (stats.errors / 5 / minutes)
            )
        );

    grossWpm.textContent =
        isFinite(gross) ? gross : 0;

    netWpm.textContent =
        isFinite(net) ? net : 0;

    accuracyDisplay.textContent =
        accuracy + "%";

    errorsDisplay.textContent =
        stats.errors;
}


/* =====================================================
   SUBMIT MAIN TYPING
   ===================================================== */

submitBtn.addEventListener(
    "click",
    submitMainTyping
);


function normalizeTypingWord(word) {

    return String(word || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

}


function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function submitMainTyping() {

    /* =====================================================
       EXIT FULL SCREEN TYPING MODE
       ===================================================== */

    document.body.classList.remove(
        "typing-test-active"
    );

    if (!currentPassage) return;


    clearInterval(timerInterval);

    testStarted = false;

    typingArea.disabled = true;

    startBtn.disabled = false;
    submitBtn.disabled = true;


    const typed =
        typingArea.value || "";

    const target =
        currentPassage.content || "";

    
    /* =================================================
       WORDS
       ================================================= */

    const targetWords =
        target.trim()
            ? target.trim().split(/\s+/)
            : [];

    const typedWords =
        typed.trim()
            ? typed.trim().split(/\s+/)
            : [];


    let correctWords = 0;
    let wrongWords = 0;

    let comparisonHTML = "";


    const maxWords =
        Math.max(
            targetWords.length,
            typedWords.length
        );


    /* =================================================
       WORD COMPARISON
       ================================================= */

    for (
        let i = 0;
        i < maxWords;
        i++
    ) {

        const correctWord =
            targetWords[i];

        const typedWord =
            typedWords[i];


        /* CORRECT */

        if (
            correctWord !== undefined &&
            typedWord !== undefined &&
            normalizeTypingWord(correctWord) ===
            normalizeTypingWord(typedWord)
        ) {

            correctWords++;


            comparisonHTML += `
                <span class="typing-word correct-word">
                    ${escapeHTML(typedWord)}
                </span>
            `;

        }


        /* WRONG */

        else if (
            correctWord !== undefined &&
            typedWord !== undefined
        ) {

            wrongWords++;


            comparisonHTML += `
                <span
                    class="typing-word wrong-word"
                    title="Correct: ${escapeHTML(correctWord)}">

                    ${escapeHTML(typedWord)}

                </span>
            `;

        }


        /* MISSING */

        else if (
            correctWord !== undefined &&
            typedWord === undefined
        ) {

            wrongWords++;


            comparisonHTML += `
                <span
                    class="typing-word missing-word"
                    title="Missing: ${escapeHTML(correctWord)}">

                    [${escapeHTML(correctWord)}]

                </span>
            `;

        }


        /* EXTRA */

        else if (
            correctWord === undefined &&
            typedWord !== undefined
        ) {

            wrongWords++;


            comparisonHTML += `
                <span
                    class="typing-word extra-word"
                    title="Extra word">

                    ${escapeHTML(typedWord)}

                </span>
            `;

        }

    }


    /* =================================================
       TOTAL WORDS
       ================================================= */

    const totalWords =
        targetWords.length;


    /* =================================================
       ACCURACY
       ================================================= */

    const accuracy =
        totalWords > 0
            ? (
                correctWords /
                totalWords
            ) * 100
            : 0;


    /* =================================================
       MARKS
       FULL MARKS = 20
       EVERY 4 WRONG = 1 MARK DEDUCTION
       ================================================= */

    const fullMarks = 20;


    const deduction =
        Math.floor(
            wrongWords / 4
        );


    const obtainedMarks =
        Math.max(
            0,
            fullMarks - deduction
        );


    /* =================================================
       PASS / FAIL
       10 MARKS = PASS
       ================================================= */

    const result =
        obtainedMarks >= 10
            ? "PASS"
            : "FAIL";


    /* =================================================
       RESULT BOX
       ================================================= */

    const resultBox =
        document.getElementById(
            "resultBox"
        );


    if (resultBox) {

        resultBox.classList.remove(
            "hidden"
        );

    }


    /* =================================================
       RESULT VALUES
       ================================================= */

    const rTotal =
        document.getElementById(
            "rTotal"
        );

    const rCorrect =
        document.getElementById(
            "rCorrect"
        );

    const rErrors =
        document.getElementById(
            "rErrors"
        );

    const rAccuracy =
        document.getElementById(
            "rAccuracy"
        );

    const rGross =
        document.getElementById(
            "rGross"
        );

    const rNet =
        document.getElementById(
            "rNet"
        );

    const rFullMarks =
        document.getElementById(
            "rFullMarks"
        );

    const rObtainedMarks =
        document.getElementById(
            "rObtainedMarks"
        );

    const passFail =
        document.getElementById(
            "typingPassFail"
        );


    if (rTotal)
        rTotal.textContent =
            totalWords;


    if (rCorrect)
        rCorrect.textContent =
            correctWords;


    if (rErrors)
        rErrors.textContent =
            wrongWords;


    if (rAccuracy)
        rAccuracy.textContent =
            accuracy.toFixed(2) + "%";


    if (rGross)
        rGross.textContent =
            grossWpm.textContent;


    if (rNet)
        rNet.textContent =
            netWpm.textContent;


    if (rFullMarks)
        rFullMarks.textContent =
            fullMarks;


    if (rObtainedMarks)
        rObtainedMarks.textContent =
            obtainedMarks +
            " / " +
            fullMarks;


    /* =================================================
       PASS / FAIL DISPLAY
       ================================================= */

    if (passFail) {

        passFail.textContent =
            result === "PASS"
                ? "🟢 PASS"
                : "🔴 FAIL";


        passFail.className =
            result === "PASS"
                ? "typing-pass"
                : "typing-fail";

    }


  /* =================================================
   FINAL QUESTION + ANSWER
   ================================================= */

const finalComparison =
    document.getElementById(
        "typingFinalComparison"
    );

if (finalComparison) {

    let answerKeyHTML = "";

    const maxWords =
        Math.max(
            targetWords.length,
            typedWords.length
        );


    for (
        let i = 0;
        i < maxWords;
        i++
    ) {

        const correctWord =
            targetWords[i] || "";

        const typedWord =
            typedWords[i] || "";


        /* ================================
           CORRECT WORD
           ================================ */

        if (
            correctWord &&
            typedWord &&
            normalizeTypingWord(correctWord) ===
            normalizeTypingWord(typedWord)
        ) {

            answerKeyHTML += `
                <span class="answer-correct-word">
                    ${escapeHTML(correctWord)}
                </span>
            `;

        }


        /* ================================
           WRONG WORD
           ================================ */

        else if (
            correctWord &&
            typedWord
        ) {

            answerKeyHTML += `
                <span
                    class="answer-wrong-word"
                    title="You typed: ${escapeHTML(typedWord)}">

                    ${escapeHTML(typedWord)}

                </span>
            `;

        }


        /* ================================
           MISSING WORD
           ================================ */

        else if (
            correctWord &&
            !typedWord
        ) {

            answerKeyHTML += `
                <span
                    class="answer-wrong-word"
                    title="Missing word">

                    ${escapeHTML(correctWord)}

                </span>
            `;

        }


        /* ================================
           EXTRA WORD
           ================================ */

        else if (
            !correctWord &&
            typedWord
        ) {

            answerKeyHTML += `
                <span
                    class="answer-extra-word"
                    title="Extra typed word">

                    ${escapeHTML(typedWord)}

                </span>
            `;

        }


        answerKeyHTML += " ";

    }


    finalComparison.innerHTML = `

        <div class="comparison-header">

            <h3>📄 Question Paper</h3>

            <h3>⌨ Answer Key</h3>

        </div>


        <div class="comparison-columns">


            <!-- LEFT SIDE : FULL QUESTION PAPER -->

            <div class="comparison-question">

                <div class="comparison-text">

                    ${escapeHTML(target)}

                </div>

            </div>


            <!-- RIGHT SIDE : SAME QUESTION PAPER
                 WITH WRONG WORDS RED -->

            <div class="comparison-answer">

                <div class="comparison-word-result">

                    ${answerKeyHTML}

                </div>

            </div>


        </div>


        <div class="comparison-legend">

            <span class="legend-correct">
                🟢 Correct
            </span>

            <span class="legend-wrong">
                🔴 Wrong
            </span>

        </div>

    `;

}

}

/* =====================================================
   BACKSPACE / ARROW CONTROL
   ===================================================== */

typingArea.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Backspace" &&
            backspaceMode.value === "off"
        ) {

            event.preventDefault();

        }


        const arrows = [
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown"
        ];


        if (
            arrows.includes(event.key) &&
            arrowMode.value === "off"
        ) {

            event.preventDefault();

        }

    }
);


/* =====================================================
   PASSAGE MANAGEMENT
   ===================================================== */

document.getElementById(
    "savePassageBtn"
).addEventListener(
    "click",
    saveNewPassage
);


async function saveNewPassage() {

    const lang =
        document.getElementById(
            "adminLanguage"
        ).value;

    const title =
        document.getElementById(
            "passageTitle"
        ).value.trim();

    const content =
        document.getElementById(
            "passageContent"
        ).value.trim();


    if (!title || !content) {

        alert(
            "Passage title आणि content भरा."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/api/typing-passages",
                {
                    method: "POST",

                   headers: {
    "Content-Type": "application/json",
    "Authorization":
        "Bearer " +
        localStorage.getItem("authToken")
},

                    body: JSON.stringify({

                        title:
                            title,

                        language:
                            lang,

                        content:
                            content

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Passage save failed."
            );

        }


        alert(
            "✅ Passage Cloud मध्ये successfully saved."
        );


        document.getElementById(
            "passageTitle"
        ).value = "";


        document.getElementById(
            "passageContent"
        ).value = "";


        await loadPassages();


        populatePassageSelect();


    } catch (error) {

        console.error(
            "CLOUD PASSAGE SAVE ERROR:",
            error
        );


        alert(
            "❌ Passage save झाला नाही.\n\n" +
            error.message
        );

    }

}

/* =====================================================
   DISPLAY PASSAGES
   ===================================================== */

function displayPassages(
    search = ""
) {

    const box =
        document.getElementById(
            "passageList"
        );

    if (!box) return;

    box.innerHTML = "";


    passages
        .filter(p =>
            p.title
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        )
        .forEach(p => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "passage-item";


            div.innerHTML = `

                <strong>
                    ${escapeHTML(p.title)}
                </strong>

                <small>
                    ${escapeHTML(p.language)}
                </small>

                <small>
                    ${escapeHTML(
                        p.content.substring(
                            0,
                            120
                        )
                    )}...
                </small>


                <button
                    onclick="usePassage(${p.id})"
                >
                    Use
                </button>


                <button
                    onclick="editPassage(${p.id})"
                >
                    Edit
                </button>


                <button
                    onclick="deletePassage(${p.id})"
                >
                    Delete
                </button>

            `;


            box.appendChild(
                div
            );

        });
}


/* =====================================================
   SEARCH
   ===================================================== */

document.getElementById(
    "searchPassage"
).addEventListener(
    "input",
    function() {

        displayPassages(
            this.value
        );

    }
);


/* =====================================================
   USE PASSAGE
   ===================================================== */

function usePassage(id) {

    const p =
    passages.find(
        x => Number(x.id) === Number(id)
    );

    if (!p) return;


    language.value =
        p.language;


    populatePassageSelect();


    passageSelect.value =
        String(p.id);


    loadSelectedPassage();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   EDIT PASSAGE
   ===================================================== */

function editPassage(id) {

   const p =
    passages.find(
        x => Number(x.id) === Number(id)
    );

    if (!p) return;


    editingId =
        id;


    document.getElementById(
        "adminLanguage"
    ).value =
        p.language;


    document.getElementById(
        "passageTitle"
    ).value =
        p.title;


    document.getElementById(
        "passageContent"
    ).value =
        p.content;


    document.getElementById(
        "savePassageBtn"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "updatePassageBtn"
    ).classList.remove(
        "hidden"
    );


    document.getElementById(
        "cancelEditBtn"
    ).classList.remove(
        "hidden"
    );
}


/* =====================================================
   UPDATE PASSAGE - CLOUD
   ===================================================== */

document.getElementById(
    "updatePassageBtn"
).addEventListener(
    "click",
    async function() {

        const title =
            document.getElementById(
                "passageTitle"
            ).value.trim();

        const content =
            document.getElementById(
                "passageContent"
            ).value.trim();

        const language =
            document.getElementById(
                "adminLanguage"
            ).value;


        if (!title || !content) {

            alert(
                "Passage title आणि content भरा."
            );

            return;
        }


        if (!editingId) {

            alert(
                "❌ Passage ID मिळाला नाही."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `/api/typing-passages/${editingId}`,
                    {
                        method: "PUT",

                        headers: {
    "Content-Type": "application/json",
    "Authorization":
        "Bearer " +
        localStorage.getItem("authToken")
},

                        body:
                            JSON.stringify({

                                title:
                                    title,

                                language:
                                    language,

                                content:
                                    content

                            })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Passage update failed."
                );

            }


            alert(
                "✅ Passage Cloud मध्ये successfully updated."
            );


            cancelEdit();


            await loadPassages();


        } catch (error) {

            console.error(
                "CLOUD PASSAGE UPDATE ERROR:",
                error
            );


            alert(
                "❌ Passage update झाला नाही.\n\n" +
                error.message
            );

        }

    }
);

/* =====================================================
   CANCEL EDIT
   ===================================================== */

document.getElementById(
    "cancelEditBtn"
).addEventListener(
    "click",
    cancelEdit
);


function cancelEdit() {

    editingId =
        null;


    document.getElementById(
        "passageTitle"
    ).value = "";


    document.getElementById(
        "passageContent"
    ).value = "";


    document.getElementById(
        "savePassageBtn"
    ).classList.remove(
        "hidden"
    );


    document.getElementById(
        "updatePassageBtn"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "cancelEditBtn"
    ).classList.add(
        "hidden"
    );
}


/* =====================================================
   DELETE PASSAGE - CLOUD
   ===================================================== */

async function deletePassage(id) {

    if (
        !confirm(
            "हा passage delete करायचा आहे का?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/typing-passages/${id}`,
                {
    method: "DELETE",

    headers: {
        "Authorization":
            "Bearer " +
            localStorage.getItem("authToken")
    }
}
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Passage delete failed."
            );

        }


        alert(
            "✅ Passage Cloud मधून successfully deleted."
        );


        await loadPassages();


    } catch (error) {

        console.error(
            "CLOUD PASSAGE DELETE ERROR:",
            error
        );


        alert(
            "❌ Passage delete झाला नाही.\n\n" +
            error.message
        );

    }

}

/* =====================================================
   COURT STATS
   ===================================================== */

function updateCourtStats(court) {

    const data = courtData.district;

    if (!data.current) return;

    const typing =
        document.getElementById("districtTyping");

    if (!typing) return;

    const typed = typing.value;
    const target = data.current.content;

    const stats =
        getCharacterStats(
            typed,
            target
        );

    let elapsedSeconds = 1;

    if (data.startTime) {
        elapsedSeconds =
            Math.max(
                1,
                (Date.now() - data.startTime) / 1000
            );
    }

    const minutes =
        elapsedSeconds / 60;

    const gross =
        Math.round(
            typed.length / 5 / minutes
        );

    const accuracy =
        typed.length === 0
            ? 100
            : Math.round(
                stats.correct /
                typed.length *
                100
            );

    const net =
        Math.max(
            0,
            Math.round(
                gross -
                (
                    stats.errors /
                    5 /
                    minutes
                )
            )
        );

    const grossElement =
        document.getElementById(
            "districtGross"
        );

    const netElement =
        document.getElementById(
            "districtNet"
        );

    const accuracyElement =
        document.getElementById(
            "districtAccuracy"
        );

    const errorsElement =
        document.getElementById(
            "districtErrors"
        );

    if (grossElement) {
        grossElement.textContent =
            isFinite(gross)
                ? gross
                : 0;
    }

    if (netElement) {
        netElement.textContent =
            isFinite(net)
                ? net
                : 0;
    }

    if (accuracyElement) {
        accuracyElement.textContent =
            accuracy + "%";
    }

    if (errorsElement) {
        errorsElement.textContent =
            stats.errors;
    }

    updateCourtMirror("district");
}

function updateCourtMirror(court) {

    const typing =
        document.getElementById(
            "districtTyping"
        );

    const mirror =
        document.getElementById(
            "districtMirror"
        );

    if (!typing || !mirror) return;

    /*
       Typing करताना Green / Red comparison नाही.
    */

    mirror.textContent =
        typing.value;
}

/* =====================================================
   SUBMIT COURT TYPING
   ===================================================== */
function startCourtTyping(court) {

    const data = courtData.district;

    if (!data) {
        console.error("District Court data not found.");
        return;
    }

    if (!data.current) {
        alert("Please select a passage first.");
        return;
    }

    const typing =
        document.getElementById(
            "districtTyping"
        );

    if (!typing) {
        console.error("District typing area not found.");
        return;
    }

    typing.value = "";
    typing.disabled = false;
    typing.focus();

    data.testStarted = true;
    data.startTime = Date.now();

    const timeSelect =
        document.getElementById(
            "districtTime"
        );

    let minutes = 5;

    if (timeSelect && timeSelect.value) {
        minutes =
            Number(timeSelect.value) || 5;
    }

    data.remaining =
        minutes * 60;

    if (data.timer) {
        clearInterval(data.timer);
    }

    data.timer =
        setInterval(function () {

            if (data.remaining <= 0) {

                clearInterval(data.timer);

                data.timer = null;
                data.testStarted = false;

                typing.disabled = true;

                alert("Time is over!");

                return;
            }

            data.remaining--;

            const minutesLeft =
                Math.floor(
                    data.remaining / 60
                );

            const secondsLeft =
                data.remaining % 60;

            const timeText =
                String(minutesLeft).padStart(2, "0") +
                ":" +
                String(secondsLeft).padStart(2, "0");

            const timerElement =
                document.getElementById(
                    "districtTimer"
                );

            if (timerElement) {
                timerElement.textContent =
                    timeText;
            }

        }, 1000);

    const timerElement =
        document.getElementById(
            "districtTimer"
        );

    if (timerElement) {
        timerElement.textContent =
            String(minutes).padStart(2, "0") +
            ":00";
    }

    console.log(
        "DISTRICT Court Typing Test Started"
    );
}


function submitCourtTyping(court) {

    const data =
        courtData.district;

    if (!data.current) return;

    clearInterval(data.timer);

    data.testStarted = false;

    const typing =
        document.getElementById(
            "districtTyping"
        );

    if (!typing) return;

    typing.disabled = true;

    const submitButton =
        document.getElementById(
            "districtSubmit"
        );

    if (submitButton) {
        submitButton.disabled = true;
    }

    updateCourtStats("district");

    const typed =
        typing.value;

    const stats =
        getCharacterStats(
            typed,
            data.current.content
        );

    const accuracy =
        typed.length
            ? Math.round(
                stats.correct /
                typed.length *
                100
            )
            : 0;

    const result =
        document.getElementById(
            "districtTypingResult"
        );

    if (!result) return;

    result.classList.remove(
        "hidden"
    );

    result.innerHTML = `

        <h4>📊 District Court Typing Result</h4>

        <div class="court-result-grid">

            <div class="court-result-card">
                Total Characters
                <b>${typed.length}</b>
            </div>

            <div class="court-result-card">
                Correct
                <b>${stats.correct}</b>
            </div>

            <div class="court-result-card">
                Errors
                <b>${stats.errors}</b>
            </div>

            <div class="court-result-card">
                Accuracy
                <b>${accuracy}%</b>
            </div>

        </div>
    `;
}

/* =====================================================
   COURT STENO
   ===================================================== */
let courtData = {

    district: {
        current: null,
        timer: null,
        remaining: 0,
        testStarted: false
    },

    high: {
        current: null,
        timer: null,
        remaining: 0,
        testStarted: false
    }

};
let courtStenoData = {

    district: {
        passages: [],
        current: null,
        timer: null,
        remaining: 0
    },

    high: {
        passages: [],
        current: null,
        timer: null,
        remaining: 0
    }

};


/* =====================================================
   LOAD COURT STENO
   ===================================================== */
function initializeCourtStenoPassages() {

    const districtKey =
        "gccDistrictCourtSteno";

   

    const districtPassages = [
        {
            id: Date.now() + 101,
            title: "District Court Steno - 60 WPM",
            speed: 60,
            audio: "",
            text:
                "The court is responsible for administering justice according to law. Every citizen has the right to approach the court for protection of legal rights."
        },
        {
            id: Date.now() + 102,
            title: "District Court Steno - 80 WPM",
            speed: 80,
            audio: "",
            text:
                "The judicial system plays an important role in protecting the rights of citizens and maintaining the rule of law."
        },
        {
            id: Date.now() + 103,
            title: "District Court Steno - 100 WPM",
            speed: 100,
            audio: "",
            text:
                "The administration of justice requires fairness, independence and adherence to established legal procedures."
        },
        {
            id: Date.now() + 104,
            title: "District Court Steno - 120 WPM",
            speed: 120,
            audio: "",
            text:
                "Courts are responsible for protecting legal rights and ensuring that justice is administered fairly and efficiently."
        }
    ];


    

    function hasPassages(key) {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

            return Array.isArray(saved) &&
                   saved.length > 0;

        } catch (error) {

            return false;
        }
    }


    if (!hasPassages(districtKey)) {

        localStorage.setItem(
            districtKey,
            JSON.stringify(
                districtPassages
            )
        );
    }

  }


async function loadCourtStenoLists() {

    courtStenoData.district.passages = [];

    const select =
        document.getElementById(
            "districtStenoPassage"
        );

    const speedSelect =
        document.getElementById(
            "districtStenoSpeed"
        );

    if (!select) return;

    try {

        const response =
            await fetch(
                "/api/court-steno/passages/district"
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "District Court Steno Load Error:",
                data
            );

            return;
        }

        const passages =
            Array.isArray(data.passages)
                ? data.passages
                : [];

        courtStenoData.district.passages =
            passages;

        function fillPassages() {

            select.innerHTML =
                '<option value="">Select Passage</option>';

            const selectedSpeed =
                speedSelect
                    ? Number(speedSelect.value)
                    : 60;

            passages
                .filter(function(passage) {

                    return Number(
                        passage.speed
                    ) === selectedSpeed;

                })
                .forEach(function(passage) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        passage.id;

                    option.textContent =
                        `${passage.title} (${passage.speed} WPM)`;

                    select.appendChild(
                        option
                    );

                });
        }

        fillPassages();

        if (speedSelect) {

            speedSelect.onchange =
                function() {

                    fillPassages();

                    courtStenoData.district.current =
                        null;

                    const audio =
                        document.getElementById(
                            "districtStenoAudio"
                        );

                    if (audio) {

                        audio.pause();

                        audio.removeAttribute(
                            "src"
                        );

                        audio.load();
                    }

                    const status =
                        document.getElementById(
                            "districtStenoStatus"
                        );

                    if (status) {

                        status.textContent =
                            "Select passage.";
                    }

                    const transSection =
                        document.getElementById(
                            "districtStenoTransSection"
                        );

                    if (transSection) {

                        transSection.classList.add(
                            "hidden"
                        );
                    }
                };
        }

        select.onchange =
            function() {

                const selected =
                    passages.find(
                        function(passage) {

                            return String(
                                passage.id
                            ) ===
                            String(
                                select.value
                            );

                        }
                    );

                if (!selected) {

                    courtStenoData.district.current =
                        null;

                    return;
                }

                courtStenoData.district.current = {

                    id:
                        selected.id,

                    title:
                        selected.title,

                    speed:
                        Number(
                            selected.speed
                        ),

                    audio:
                        selected.audio,

                    text:
                        selected.reference_text || ""

                };

                const audio =
                    document.getElementById(
                        "districtStenoAudio"
                    );

                if (audio) {

                    audio.src =
                        selected.audio;

                    audio.load();

                    audio.onended =
                        function() {

                            openCourtStenoTranscription(
                                "district"
                            );

                        };
                }

                const status =
                    document.getElementById(
                        "districtStenoStatus"
                    );

                if (status) {

                    status.textContent =
                        "Audio loaded. Audio पूर्ण झाल्यावर transcription section उघडेल.";
                }
            };

    } catch (error) {

        console.error(
            "District Court Steno API Error:",
            error
        );
    }

    displayCourtStenoAdminLists();
}

/* =====================================================
   OPEN COURT STENO TRANSCRIPTION
   ===================================================== */

function openCourtStenoTranscription(court) {

    const section =
        document.getElementById(
            "districtStenoTransSection"
        );

    if (!section) return;

    section.classList.remove(
        "hidden"
    );

    const text =
        document.getElementById(
            "districtStenoText"
        );

    if (text) {
        text.focus();
    }

    startCourtSteno("district");
}

/* =====================================================
   START COURT STENO
   ===================================================== */

function startCourtSteno(court) {

    const data =
        courtStenoData.district;

    if (!data || !data.current) {

        alert("Steno passage select करा.");

        return;
    }

    clearInterval(
        data.timer
    );

    data.remaining =
        55 * 60;

    updateCourtStenoTimer(
        "district"
    );

    const text =
        document.getElementById(
            "districtStenoText"
        );

    const submit =
        document.getElementById(
            "districtStenoSubmit"
        );

    if (text) {
        text.disabled = false;
    }

    if (submit) {
        submit.disabled = false;
    }

    data.timer =
        setInterval(
            function() {

                data.remaining--;

                updateCourtStenoTimer(
                    "district"
                );

                if (
                    data.remaining <= 0
                ) {

                    clearInterval(
                        data.timer
                    );

                    data.timer = null;

                    submitCourtSteno(
                        "district"
                    );
                }

            },
            1000
        );

    if (text) {
        text.focus();
    }
}

/* =====================================================
   COURT STENO TIMER
   ===================================================== */

function updateCourtStenoTimer(court) {

    const data =
        courtStenoData.district;

    if (!data) return;

    const seconds =
        data.remaining;

    const min =
        Math.floor(
            seconds / 60
        )
        .toString()
        .padStart(2, "0");

    const sec =
        (seconds % 60)
        .toString()
        .padStart(2, "0");

    const timer =
        document.getElementById(
            "districtStenoTimer"
        );

    if (timer) {
        timer.textContent =
            `${min}:${sec}`;
    }
}

/* =====================================================
   SUBMIT COURT STENO
   ===================================================== */


async function submitCourtSteno(court) {

    console.log(
        "DISTRICT STENO SUBMIT CLICKED"
    );

    const data =
        courtStenoData.district;

    if (!data || !data.current) return;

    clearInterval(
        data.timer
    );

    data.timer = null;

    const textElement =
        document.getElementById(
            "districtStenoText"
        );

    if (!textElement) return;

    const typed =
        textElement.value;

    const reference =
        data.current.text;

    const result =
        compareSteno(
            reference,
            typed
        );

    /* =========================
       TIME CALCULATION
    ========================= */

    let usedSeconds = 0;

    if (data.remaining !== undefined) {

        usedSeconds =
            (55 * 60) -
            data.remaining;

    }

    usedSeconds =
        Math.max(
            1,
            usedSeconds
        );

    const usedMinutes =
        usedSeconds / 60;

    const grossWPM =
        Math.round(
            typed.length /
            5 /
            usedMinutes
        );

    /* =========================
       DISABLE TEST
    ========================= */

    textElement.disabled =
        true;

    const submitButton =
        document.getElementById(
            "districtStenoSubmit"
        );

    if (submitButton) {

        submitButton.disabled =
            true;
    }

    /* =========================
       RESULT BOX
    ========================= */

    const resultBox =
        document.getElementById(
            "districtStenoResult"
        );

    if (!resultBox) return;

    resultBox.classList.remove(
        "hidden"
    );

    resultBox.innerHTML = `

        <h4>
            📊 District Court Steno Result
        </h4>

        <div class="court-result-grid">

            <div class="court-result-card">
                📝 Total Words
                <b>
                    ${result.total}
                </b>
            </div>

            <div class="court-result-card">
                🟢 Correct Words
                <b>
                    ${result.correct}
                </b>
            </div>

            <div class="court-result-card">
                🔴 Errors
                <b>
                    ${result.errors}
                </b>
            </div>

            <div class="court-result-card">
                🎯 Accuracy
                <b>
                    ${result.accuracy}%
                </b>
            </div>

            <div class="court-result-card">
                ⚡ Typing Speed
                <b>
                    ${isFinite(grossWPM)
                        ? grossWPM
                        : 0} WPM
                </b>
            </div>

            <div class="court-result-card">
                ⏱️ Time Used
                <b>
                    ${Math.floor(
                        usedSeconds / 60
                    )
                    .toString()
                    .padStart(2, "0")}
                    :
                    ${(usedSeconds % 60)
                    .toString()
                    .padStart(2, "0")}
                </b>
            </div>

        </div>

        <hr>

        <h4>
            📄 Detailed Checking
        </h4>

        <div class="court-steno-checked-text">
            ${result.html}
        </div>

        <hr>

        <div class="court-steno-legend">

            <span class="court-correct">
                🟢 Correct
            </span>

            <span class="court-wrong">
                🔴 Wrong
            </span>

            <span class="court-missing">
                🟣 Missing
            </span>

            <span class="court-extra">
                🟠 Extra
            </span>

        </div>
    `;

    /* =========================
       SAVE RESULT TO MYSQL
    ========================= */

    try {

console.log("🔵 STENO SAVE BLOCK STARTED");
        const savedUser =
            JSON.parse(
                localStorage.getItem(
    "loggedInUser"
) || "null"
            );

        if (!savedUser || !savedUser.id) {

            console.warn(
                "User not logged in. Result not saved."
            );

            return;
        }

        const response =
            await fetch(
                "/api/steno-test-results",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            savedUser.id,

                        court:
                            "district",

                        passage_id:
                            data.current.id,

                        passage_title:
                            data.current.title,

                        speed:
                            data.current.speed,

                        total_words:
                            result.total,

                        correct_words:
                            result.correct,

                        errors:
                            result.errors,

                        accuracy:
                            result.accuracy,

                       wpm:
    isFinite(grossWPM)
        ? grossWPM
        : 0,

time_used:
    usedSeconds,

reference_text:
    reference,

typed_text:
    typed
                    })
                }
            );

        const saveData =
            await response.json();

        if (
            response.ok &&
            saveData.success
        ) {

            console.log(
                "✅ Steno result saved to MySQL:",
                saveData
            );

        } else {

            console.error(
                "❌ Steno result save failed:",
                saveData
            );
        }

    } catch (error) {

        console.error(
            "❌ Steno result API error:",
            error
        );

    }

}

/* =====================================================
   STENO COMPARE
   ===================================================== */

function normalizeWords(text) {
    return text
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .filter(Boolean);
}
function compareSteno(reference, typed) {

    const referenceWords = normalizeWords(reference);
    const typedWords = normalizeWords(typed);

    const total = referenceWords.length;

    let correct = 0;
    let html = "";

    const max = Math.max(
        referenceWords.length,
        typedWords.length
    );

    for (let i = 0; i < max; i++) {

        const expected = referenceWords[i] || "";
        const actual = typedWords[i] || "";

        if (
            expected.toLowerCase() ===
            actual.toLowerCase()
        ) {

            correct++;

            html += `
                <span class="court-correct">
                    ${escapeHTML(actual)}
                </span>
            `;

        } else {

            if (actual && expected) {

                html += `
                    <span class="court-wrong"
                          title="Correct Word: ${escapeHTML(expected)}">
                        ${escapeHTML(actual)}
                    </span>
                `;

            } else if (!actual && expected) {

                html += `
                    <span class="court-missing"
                          title="Missing Word: ${escapeHTML(expected)}">
                        [Missing: ${escapeHTML(expected)}]
                    </span>
                `;

            } else if (actual && !expected) {

                html += `
                    <span class="court-extra"
                          title="Extra Word">
                        [Extra: ${escapeHTML(actual)}]
                    </span>
                `;
            }
        }
    }

    const errors = Math.max(total - correct, 0);

    const accuracy = total
        ? Math.round((correct / total) * 100)
        : 0;

    return {
        total,
        correct,
        errors,
        accuracy,
        html
    };
}

function compareMainSteno(reference, typed) {

    const referenceWords =
        normalizeWords(reference);

    const typedWords =
        normalizeWords(typed);

    const total =
        referenceWords.length;

    let correct = 0;
    let fullMistakes = 0;
    let halfMistakes = 0;

    let referenceHTML = "";
    let typedHTML = "";


    /* =====================================================
       WORD + PUNCTUATION SEPARATION
       ===================================================== */

    function splitWordAndPunctuation(token) {

        const match =
            token.match(
                /^([\s\S]*?)([.,!?;:"'()[\]{}\-–—…]*)$/
            );

        if (!match) {

            return {
                word: token,
                punctuation: ""
            };

        }

        return {
            word: match[1],
            punctuation: match[2]
        };
    }


    /* =====================================================
       PREPARE WORD DATA
       ===================================================== */

    const referenceParts =
        referenceWords.map(
            token =>
                splitWordAndPunctuation(token)
        );

    const typedParts =
        typedWords.map(
            token =>
                splitWordAndPunctuation(token)
        );


    /* =====================================================
       SEQUENCE ALIGNMENT - DP TABLE
       ===================================================== */

    const n =
        referenceParts.length;

    const m =
        typedParts.length;

    const dp =
        Array.from(
            {
                length: n + 1
            },
            () =>
                Array(m + 1).fill(0)
        );


    /*
     * Initial missing words
     */

    for (
        let i = 0;
        i <= n;
        i++
    ) {

        dp[i][0] = i;

    }


    /*
     * Initial extra words
     */

    for (
        let j = 0;
        j <= m;
        j++
    ) {

        dp[0][j] = j;

    }


    /*
     * Build DP table
     */

    for (
        let i = 1;
        i <= n;
        i++
    ) {

        for (
            let j = 1;
            j <= m;
            j++
        ) {

            const expected =
                referenceParts[
                    i - 1
                ].word.toLowerCase();

            const actual =
                typedParts[
                    j - 1
                ].word.toLowerCase();


            const replaceCost =
                expected === actual
                    ? 0
                    : 1;


            dp[i][j] =
                Math.min(

                    /*
                     * Correct / wrong word
                     */
                    dp[i - 1][j - 1] +
                    replaceCost,

                    /*
                     * Missing reference word
                     */
                    dp[i - 1][j] + 1,

                    /*
                     * Extra typed word
                     */
                    dp[i][j - 1] + 1

                );

        }

    }


    /* =====================================================
       BACKTRACE
       ===================================================== */

    const operations = [];

    let i = n;
    let j = m;


    while (
        i > 0 ||
        j > 0
    ) {


        /*
         * Correct / Wrong
         */

        if (
            i > 0 &&
            j > 0
        ) {

            const expected =
                referenceParts[
                    i - 1
                ].word.toLowerCase();

            const actual =
                typedParts[
                    j - 1
                ].word.toLowerCase();

            const replaceCost =
                expected === actual
                    ? 0
                    : 1;


            if (
                dp[i][j] ===
                dp[i - 1][j - 1] +
                replaceCost
            ) {

                operations.unshift({

                    type:
                        expected === actual
                            ? "correct"
                            : "wrong",

                    expected:
                        referenceParts[
                            i - 1
                        ],

                    actual:
                        typedParts[
                            j - 1
                        ]

                });

                i--;
                j--;

                continue;

            }

        }


        /*
         * Missing word
         */

        if (
            i > 0 &&
            dp[i][j] ===
            dp[i - 1][j] + 1
        ) {

            operations.unshift({

                type: "missing",

                expected:
                    referenceParts[
                        i - 1
                    ],

                actual: null

            });

            i--;

            continue;

        }


        /*
         * Extra word
         */

        if (
            j > 0
        ) {

            operations.unshift({

                type: "extra",

                expected: null,

                actual:
                    typedParts[
                        j - 1
                    ]

            });

            j--;

            continue;

        }

    }


    /* =====================================================
       BUILD REFERENCE + TYPED RESULT
       ===================================================== */

    operations.forEach(
        operation => {

            const expected =
                operation.expected;

            const actual =
                operation.actual;


            /* =============================================
               REFERENCE SIDE
               ============================================= */

            if (expected) {

                referenceHTML += `
                    <span class="steno-reference-word">
                        ${escapeHTML(
                            expected.word
                        )}${escapeHTML(
                            expected.punctuation
                        )}
                    </span>
                `;

            }

            else {

                /*
                 * Extra typed word साठी
                 * reference side मध्ये blank
                 */

                referenceHTML += `
                    <span class="steno-reference-empty">
                        &nbsp;
                    </span>
                `;

            }


            /* =============================================
               CORRECT WORD
               ============================================= */

            if (
                operation.type ===
                "correct"
            ) {

                correct++;

                typedHTML += `
                    <span class="steno-correct">
                        ${escapeHTML(
                            actual.word
                        )}
                    </span>
                `;

            }


            /* =============================================
               WRONG / MISSPELT / CHANGED WORD
               ============================================= */

            else if (
                operation.type ===
                "wrong"
            ) {

                fullMistakes++;

                typedHTML += `
                    <span class="steno-wrong"
                          title="Correct Word: ${escapeHTML(
                              expected.word
                          )}">
                        ${escapeHTML(
                            actual.word
                        )}
                    </span>
                `;

            }


            /* =============================================
               MISSING / SKIPPED WORD
               ============================================= */

            else if (
                operation.type ===
                "missing"
            ) {

                fullMistakes++;

                typedHTML += `
                    <span class="steno-missing"
                          title="Missing Word: ${escapeHTML(
                              expected.word
                          )}">
                        [Missing: ${escapeHTML(
                            expected.word
                        )}]
                    </span>
                `;

            }


            /* =============================================
               EXTRA WORD
               ============================================= */

            else if (
                operation.type ===
                "extra"
            ) {

                fullMistakes++;

                typedHTML += `
                    <span class="steno-extra"
                          title="Extra Word">
                        ${escapeHTML(
                            actual.word
                        )}
                    </span>
                `;

            }


            /* =============================================
               PUNCTUATION
               ============================================= */

            if (
                expected &&
                operation.type !==
                "extra"
            ) {

                const expectedPunctuation =
                    expected.punctuation;

                const actualPunctuation =
                    actual
                        ? actual.punctuation
                        : "";


                /*
                 * Compare punctuation character-by-character
                 */

                const punctuationMax =
                    Math.max(
                        expectedPunctuation.length,
                        actualPunctuation.length
                    );


                for (
                    let p = 0;
                    p < punctuationMax;
                    p++
                ) {

                    const expectedChar =
                        expectedPunctuation[p] ||
                        "";

                    const actualChar =
                        actualPunctuation[p] ||
                        "";


                    if (
                        expectedChar !==
                        actualChar
                    ) {

                        /*
                         * Every punctuation error
                         * = 1 Half Mistake
                         */

                        halfMistakes++;


                        if (
                            actualChar
                        ) {

                            typedHTML += `
                                <span
                                    class="steno-punctuation-wrong"
                                    title="Correct punctuation: ${escapeHTML(
                                        expectedChar
                                    )}">
                                    ${escapeHTML(
                                        actualChar
                                    )}
                                </span>
                            `;

                        }

                        else if (
                            expectedChar
                        ) {

                            typedHTML += `
                                <span
                                    class="steno-punctuation-missing"
                                    title="Missing punctuation: ${escapeHTML(
                                        expectedChar
                                    )}">
                                    [${escapeHTML(
                                        expectedChar
                                    )}]
                                </span>
                            `;

                        }

                    }

                    else if (
                        expectedChar
                    ) {

                        typedHTML += `
                            <span
                                class="steno-punctuation-correct">
                                ${escapeHTML(
                                    actualChar
                                )}
                            </span>
                        `;

                    }

                }

            }

        }
    );


    /* =====================================================
       EXTRA TYPED WORDS
       ===================================================== */

    /*
     * Extra words आधीच operations मध्ये
     * full mistake म्हणून मोजले आहेत.
     */


    /* =====================================================
       MARK CALCULATION
       ===================================================== */

    const totalMarks = 80;


    const deductedMarks =
        fullMistakes +
        (
            halfMistakes * 0.5
        );


    let obtainedMarks =
        totalMarks -
        deductedMarks;


    if (
        obtainedMarks < 0
    ) {

        obtainedMarks = 0;

    }


    obtainedMarks =
        Number(
            obtainedMarks.toFixed(1)
        );


    /* =====================================================
       PASS / FAIL
       ===================================================== */

    const resultStatus =
        obtainedMarks >= 40
            ? "PASS"
            : "FAIL";


    /* =====================================================
       ACCURACY
       ===================================================== */

    const accuracy =
        total
            ? Math.round(
                (
                    correct /
                    total
                ) * 100
            )
            : 0;


    /* =====================================================
       TOTAL ERRORS
       ===================================================== */

    const errors =
        fullMistakes +
        halfMistakes;


    /* =====================================================
       RETURN
       ===================================================== */

    return {

        total,

        correct,

        errors,

        accuracy,

        fullMistakes,

        halfMistakes,

        totalMarks,

        deductedMarks,

        obtainedMarks,

        resultStatus,

        referenceHTML,

        typedHTML

    };

}

/* =====================================================
   MAIN STENO
   ===================================================== */

let stenoPassages = [];
let currentSteno = null;
let stenoTimer = null;
let stenoRemaining = 55 * 60;

/* =====================================================
   DISPLAY MAIN STENO PASSAGES - ADMIN
   ===================================================== */

window.displayStenoPassages = function () {

    const list =
        document.getElementById("stenoPassageList");

    if (!list) return;

    list.innerHTML = "";

    if (!stenoPassages || stenoPassages.length === 0) {

        list.innerHTML =
            "<p>No Steno Passages Found.</p>";

        return;
    }

    stenoPassages.forEach(function (passage) {

        const item =
            document.createElement("div");

        item.className =
            "steno-passage-item";

        const isHidden =
            passage.hidden === true ||
            passage.visible === false;

        item.innerHTML = `

            <div class="steno-passage-info">

                <strong>
                    ${escapeHTML(
                        passage.title || ""
                    )}
                </strong>

                <span>
                    ${passage.speed || 0} WPM
                </span>

                <span class="steno-visibility-status
                    ${isHidden ? "hidden-status" : "visible-status"}">

                    ${
                        isHidden
                        ? "🔒 Hidden"
                        : "🟢 Visible"
                    }

                </span>

            </div>

            <div class="steno-passage-actions">

                <button
                    type="button"
                    class="edit-steno-btn"
                    onclick="editStenoPassage(${passage.id})">

                    ✏️ Edit

                </button>

                <button
                    type="button"
                    class="delete-steno-btn"
                    onclick="deleteStenoPassage(${passage.id})">

                    🗑️ Delete

                </button>

                <button
                    type="button"
                    class="toggle-steno-btn"
                    onclick="toggleStenoVisibility(${passage.id}, ${isHidden})">

                    ${
                        isHidden
                        ? "👁️ Unhide"
                        : "🙈 Hide"
                    }

                </button>

            </div>
        `;

        list.appendChild(item);

    });
};

/* =====================================================
   STENO EDIT / DELETE - PLACEHOLDER
   ===================================================== */



/* =====================================================
   MAIN STENO EDIT
   ===================================================== */

function editStenoPassage(id) {

    const passage =
        stenoPassages.find(
            p => Number(p.id) === Number(id)
        );

    if (!passage) {

        alert("❌ Steno passage सापडला नाही.");

        return;
    }

    // Save edit ID
    window.editingMainSteno =
        passage.id;

    // Load data into form
    document.getElementById(
        "stenoTitle"
    ).value =
        passage.title || "";

    document.getElementById(
        "stenoAdminSpeed"
    ).value =
        passage.speed || "";

    document.getElementById(
        "stenoReferenceText"
    ).value =
        passage.reference || "";

    // Audio file cannot be filled automatically
    document.getElementById(
        "stenoAudioFile"
    ).value = "";

    // Change save button text
    const saveBtn =
        document.getElementById(
            "saveStenoPassageBtn"
        );

    if (saveBtn) {

        saveBtn.textContent =
            "✏️ Update Steno Passage";

    }

    // Scroll to form
    const form =
        document.getElementById(
            "stenoTitle"
        );

    if (form) {

        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        form.focus();

    }

    console.log(
        "MAIN STENO EDIT MODE:",
        passage
    );
}

/* =====================================================
   MAIN STENO DELETE
   ===================================================== */

async function deleteStenoPassage(id) {

    const passage =
        stenoPassages.find(
            p => Number(p.id) === Number(id)
        );

    if (!passage) {
        alert("❌ Steno passage सापडला नाही.");
        return;
    }

    const confirmDelete =
        confirm(
            `तुम्हाला "${passage.title}" हा Steno Passage delete करायचा आहे का?`
        );

    if (!confirmDelete) {
        return;
    }

    const authToken =
        localStorage.getItem("authToken");

    if (!authToken) {
        alert(
            "❌ Login session सापडले नाही. कृपया पुन्हा Login करा."
        );
        return;
    }

    try {

        const response =
            await fetch(
                "/api/steno-passages/" + passage.id,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization":
                            "Bearer " + authToken
                    }
                }
            );

        const responseText =
            await response.text();

        let data = {};

        try {
            data =
                JSON.parse(responseText);
        } catch (error) {
            console.error(
                "DELETE SERVER RESPONSE:",
                responseText
            );
        }

        if (
            !response.ok ||
            !data.success
        ) {
            alert(
                "❌ Steno passage delete झाला नाही.\n\n" +
                (
                    data.message ||
                    "Server error."
                )
            );
            return;
        }

        await loadStenoPassages();

        alert(
            "✅ Steno passage successfully deleted."
        );

    } catch (error) {

        console.error(
            "MAIN STENO DELETE ERROR:",
            error
        );

        alert(
            "❌ Delete करताना error आला.\n\n" +
            error.message
        );
    }
}

/* =====================================================
   MAIN STENO HIDE / UNHIDE
   ===================================================== */

async function toggleStenoVisibility(id, currentlyHidden) {

    const passage =
        stenoPassages.find(
            p => Number(p.id) === Number(id)
        );

    if (!passage) {
        alert("❌ Steno passage सापडला नाही.");
        return;
    }

    const authToken =
        localStorage.getItem("authToken");

    if (!authToken) {
        alert(
            "❌ Login session सापडले नाही. कृपया पुन्हा Login करा."
        );
        return;
    }

    try {

        const response =
            await fetch(
                "/api/steno-passages/" + passage.id + "/visibility",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + authToken
                    },

                    body:
                        JSON.stringify({
                            hidden: !currentlyHidden
                        })
                }
            );

        const responseText =
            await response.text();

        let data = {};

        try {

            data =
                JSON.parse(responseText);

        } catch (error) {

            console.error(
                "VISIBILITY SERVER RESPONSE:",
                responseText
            );

        }

        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                "❌ Steno visibility change झाला नाही.\n\n" +
                (
                    data.message ||
                    "Server error."
                )
            );

            return;
        }

        await loadStenoPassages();

    } catch (error) {

        console.error(
            "MAIN STENO VISIBILITY ERROR:",
            error
        );

        alert(
            "❌ Hide/Unhide करताना error आला.\n\n" +
            error.message
        );

    }
}
  

/* =====================================================
   STENO SELECT
   ===================================================== */

const stenoPassageSelect =
    document.getElementById(
        "stenoPassageSelect"
    );

async function loadStenoPassages() {

    try {

        const response =
            await fetch(
                "/api/steno-passages"
            );

        const responseText =
            await response.text();

        let data = {};

        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            console.error(
                "MAIN STENO LOAD RESPONSE:",
                responseText
            );

            throw new Error(
                "Server returned invalid response."
            );

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Main Steno passages load failed."
            );

        }


        // =====================================
        // CLOUD DATA → FRONTEND FORMAT
        // =====================================

        stenoPassages =
    (data.passages || []).map(
        p => ({
            id: p.id,
            title: p.title,
            speed: Number(p.speed),
            audio: p.audio,
            reference: p.reference_text,

            hidden:
                Number(p.hidden) === 1,

            visible:
                Number(p.hidden) !== 1
        })
    );


        // =====================================
        // PASSAGE DROPDOWN
        // =====================================

        stenoPassageSelect.innerHTML =
            '<option value="">Select Passage</option>';


        stenoPassages
    .filter(p => !p.hidden && p.visible !== false)
    .forEach(
        p => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    p.id;

                option.textContent =
                    `${p.title} (${p.speed} WPM)`;

                stenoPassageSelect.appendChild(
                    option
                );

            }
        );
       

        // =====================================
        // DISPLAY PASSAGES
        // =====================================
displayStenoPassages();


        console.log(
            "MAIN STENO CLOUD PASSAGES LOADED:",
            stenoPassages
        );


    } catch (error) {

        console.error(
            "MAIN STENO LOAD ERROR:",
            error
        );


        stenoPassages = [];


        stenoPassageSelect.innerHTML =
            '<option value="">Select Passage</option>';


        // Do not show an alert during
        // initial page loading.

        console.warn(
            "Main Steno passages could not be loaded."
        );

    }

}

/* =====================================================
   START MAIN STENO
   ===================================================== */

document.getElementById(
    "startTranscriptionBtn"
).addEventListener(
    "click",
    startMainSteno
);


function startMainSteno() {

    if (!currentSteno) {

        alert(
            "Please select steno passage."
        );

        return;
    }

    clearInterval(
        stenoTimer
    );

    stenoRemaining =
        55 * 60;

    document.getElementById(
        "stenoTranscription"
    ).disabled = false;

    document.getElementById(
        "submitTranscriptionBtn"
    ).disabled = false;

    updateMainStenoTimer();

    stenoTimer =
        setInterval(
            () => {

                stenoRemaining--;

                updateMainStenoTimer();

                if (
                    stenoRemaining <= 0
                ) {

                    clearInterval(
                        stenoTimer
                    );

                    submitMainSteno();
                }

            },
            1000
        );

    document.getElementById(
        "stenoTranscription"
    ).focus();
}


/* =====================================================
   MAIN STENO TIMER
   ===================================================== */

function updateMainStenoTimer() {

    const min =
        Math.floor(
            stenoRemaining / 60
        )
        .toString()
        .padStart(2, "0");

    const sec =
        (stenoRemaining % 60)
        .toString()
        .padStart(2, "0");

    document.getElementById(
        "stenoTimer"
    ).textContent =
        `${min}:${sec}`;
}


/* =====================================================
   MAIN STENO SUBMIT
   ===================================================== */

const submitTranscriptionBtn =
    document.getElementById(
        "submitTranscriptionBtn"
    );

if (submitTranscriptionBtn) {

    submitTranscriptionBtn.addEventListener(
        "click",
        submitMainSteno
    );

}


function submitMainSteno() {

    if (!currentSteno) return;

    clearInterval(stenoTimer);

    const typed =
        document.getElementById(
            "stenoTranscription"
        ).value;

    const result =
    compareMainSteno(
        currentSteno.reference,
        typed
    );

    document.getElementById(
        "stenoTranscription"
    ).disabled = true;

    document.getElementById(
        "submitTranscriptionBtn"
    ).disabled = true;

    document.getElementById(
        "stenoResult"
    ).classList.remove(
        "hidden"
    );

    document.getElementById(
        "stenoTotalWords"
    ).textContent =
        result.total;

    document.getElementById(
        "stenoCorrectWords"
    ).textContent =
        result.correct;

    document.getElementById(
    "stenoFullMistakes"
).textContent =
    result.fullMistakes;

document.getElementById(
    "stenoHalfMistakes"
).textContent =
    result.halfMistakes;

document.getElementById(
    "stenoDeductedMarks"
).textContent =
    result.deductedMarks.toFixed(1);

document.getElementById(
    "stenoTotalMarks"
).textContent =
    result.totalMarks;

document.getElementById(
    "stenoObtainedMarks"
).textContent =
    result.obtainedMarks.toFixed(1);

const passFail =
    document.getElementById(
        "stenoPassFail"
    );

passFail.textContent =
    result.resultStatus === "PASS"
        ? "✅ PASS"
        : "❌ FAIL";

    document.getElementById(
        "stenoAccuracy"
    ).textContent =
        result.accuracy + "%";

    document.getElementById(
    "stenoErrorDisplay"
).innerHTML = `

    <div class="comparison-header">

        <h3>📄 Reference Text</h3>

        <h3>⌨ Typed Answer</h3>

    </div>

    <div class="comparison-columns">

        <div class="comparison-question">

            <div class="comparison-text">
                ${escapeHTML(currentSteno.reference)}
            </div>

        </div>

        <div class="comparison-answer">

            <div class="comparison-word-result">

                ${result.typedHTML}

            </div>

        </div>

    </div>

    <div class="comparison-legend">

        <span class="legend-correct">
            🟢 Correct
        </span>

        <span class="legend-wrong">
            🔴 Wrong
        </span>

    </div>
`;
}


/* =====================================================
   SAVE MAIN STENO
   ===================================================== */
const saveStenoPassageBtn =
    document.getElementById(
        "saveStenoPassageBtn"
    );

if (saveStenoPassageBtn) {

    saveStenoPassageBtn.addEventListener(
        "click",
        saveStenoPassage
    );

}
async function saveStenoPassage() {

const editingId =
    window.editingMainSteno || null;
    const title =
        document.getElementById(
            "stenoTitle"
        ).value.trim();

    const speed =
        Number(
            document.getElementById(
                "stenoAdminSpeed"
            ).value
        );

    const reference =
        document.getElementById(
            "stenoReferenceText"
        ).value.trim();

    const file =
        document.getElementById(
            "stenoAudioFile"
        ).files[0];


    // ==============================
    // VALIDATION
    // ==============================

   if (!title || !reference) {
    alert(
        "Title आणि Reference Text भरा."
    );
    return;
}

if (!editingId && !file) {
    alert(
        "नवीन Steno Passage साठी Audio file आवश्यक आहे."
    );
    return;
}


    if (
        ![60, 80, 100, 120].includes(speed)
    ) {

        alert(
            "Invalid Steno speed."
        );

        return;
    }


    // ==============================
    // AUTH TOKEN
    // ==============================

    const authToken =
        localStorage.getItem(
            "authToken"
        );


    if (!authToken) {

        alert(
            "Login session सापडले नाही. कृपया पुन्हा Login करा."
        );

        return;
    }


    // ==============================
// EDIT MODE
// ==============================

if (editingId) {

    try {

        const response =
            await fetch(
                "/api/steno-passages/" + editingId,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + authToken
                    },

                    body:
                        JSON.stringify({
                            title: title,
                            speed: speed,
                            referenceText: reference
                        })
                }
            );

        const responseText =
            await response.text();

        let data = {};

        try {

            data =
                JSON.parse(responseText);

        } catch (error) {

            console.error(
                "UPDATE SERVER RESPONSE:",
                responseText
            );

        }

        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                "❌ Steno passage update झाला नाही.\n\n" +
                (
                    data.message ||
                    "Server error."
                )
            );

            return;
        }

        window.editingMainSteno = null;

        document.getElementById(
            "stenoTitle"
        ).value = "";

document.getElementById(
    "stenoAdminSpeed"
).value = "";

        document.getElementById(
            "stenoReferenceText"
        ).value = "";

        document.getElementById(
            "stenoAudioFile"
        ).value = "";

        const saveBtn =
            document.getElementById(
                "saveStenoPassageBtn"
            );

        if (saveBtn) {

            saveBtn.textContent =
                "Save Steno Passage";

        }

        await loadStenoPassages();

        alert(
            "✅ Main Steno passage successfully updated."
        );

        return;

    } catch (error) {

        console.error(
            "MAIN STENO UPDATE ERROR:",
            error
        );

        alert(
            "❌ Steno passage update करताना error आला.\n\n" +
            error.message
        );

        return;
    }
}


// ==============================
// FORM DATA - NEW PASSAGE
// ==============================

const formData =
    new FormData();

formData.append(
    "title",
    title
);

formData.append(
    "speed",
    speed
);

formData.append(
    "referenceText",
    reference
);

formData.append(
    "audio",
    file
);


    // ==============================
    // UPLOAD TO SERVER
    // ==============================

    try {

        const response =
            await fetch(
                "/api/steno-passages",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            "Bearer " +
                            authToken
                    },

                    body:
                        formData
                }
            );


        const responseText =
            await response.text();

        let data = {};

        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            console.error(
                "SERVER RESPONSE:",
                responseText
            );

        }


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                "❌ Main Steno passage save झाला नाही.\n\n" +
                (
                    data.message ||
                    "Server error."
                )
            );

            return;
        }


        // ==============================
        // CLEAR FORM
        // ==============================

        document.getElementById(
            "stenoTitle"
        ).value = "";

        document.getElementById(
            "stenoReferenceText"
        ).value = "";

        document.getElementById(
            "stenoAudioFile"
        ).value = "";


        // ==============================
        // RELOAD PASSAGES
        // ==============================

        if (
            typeof loadStenoPassages ===
            "function"
        ) {

            await loadStenoPassages();

        }


        alert(
            "✅ Main Steno passage successfully saved."
        );


    } catch (error) {

        console.error(
            "MAIN STENO SAVE ERROR:",
            error
        );

        alert(
            "❌ Steno passage save करताना error आला.\n\n" +
            error.message
        );

    }

}

// ==========================================
// SAVE / EDIT DISTRICT COURT STENO PASSAGE
// MYSQL + ADMIN AUTHENTICATION
// ==========================================

async function saveCourtStenoPassage(court) {

    // District Court only
    court = "district";

    const prefix = "districtSteno";

    const titleElement =
        document.getElementById(
            prefix + "Title"
        );

    const speedElement =
        document.getElementById(
            prefix + "AdminSpeed"
        );

    const referenceElement =
        document.getElementById(
            prefix + "ReferenceText"
        );

    const fileElement =
        document.getElementById(
            prefix + "AudioFile"
        );


    // ==========================================
    // CHECK FORM ELEMENTS
    // ==========================================

    if (
        !titleElement ||
        !speedElement ||
        !referenceElement ||
        !fileElement
    ) {

        alert(
            "❌ District Court Steno form elements सापडले नाहीत."
        );

        return;
    }


    // ==========================================
    // GET FORM VALUES
    // ==========================================

    const title =
        titleElement.value.trim();

    const speed =
        Number(
            speedElement.value
        );

    const reference =
        referenceElement.value.trim();

    const file =
        fileElement.files[0];


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!title) {

        alert(
            "❌ Passage Title भरा."
        );

        return;
    }


    if (!speed) {

        alert(
            "❌ Speed निवडा."
        );

        return;
    }


    if (!reference) {

        alert(
            "❌ Reference Dictation Text भरा."
        );

        return;
    }


    // ==========================================
    // AUTH TOKEN
    // ==========================================

    const authToken =
        localStorage.getItem(
            "authToken"
        );


    if (!authToken) {

        alert(
            "❌ Login session सापडले नाही. कृपया पुन्हा Login करा."
        );

        return;
    }


    const authHeaders = {
        "Authorization":
            "Bearer " + authToken
    };


    // ==========================================
    // CHECK EDIT MODE
    // ==========================================

    const editing =
        window.editingCourtSteno;


    // ==========================================
    // EDIT EXISTING PASSAGE
    // ==========================================

    if (
        editing &&
        String(editing.court) === "district"
    ) {

        const passageId =
            Number(
                editing.id
            );


        if (!passageId) {

            alert(
                "❌ Invalid Passage ID."
            );

            return;
        }


        try {

            // ==========================================
            // EDIT + NEW AUDIO
            // ==========================================

            if (file) {

                const formData =
                    new FormData();


                formData.append(
                    "court",
                    "district"
                );

                formData.append(
                    "title",
                    title
                );

                formData.append(
                    "speed",
                    speed
                );

                formData.append(
                    "referenceText",
                    reference
                );

                formData.append(
                    "audio",
                    file
                );


                alert(
                    "⏳ नवीन Audio server वर upload होत आहे..."
                );


                const uploadResponse =
                    await fetch(
                        "/api/court-steno/upload",
                        {
                            method: "POST",

                            headers:
                                authHeaders,

                            body: formData
                        }
                    );


                const uploadData =
                    await uploadResponse.json();


                if (
                    !uploadResponse.ok ||
                    !uploadData.success
                ) {

                    alert(
                        "❌ New Audio upload failed.\n\n" +
                        (
                            uploadData.message ||
                            "Unknown server error."
                        )
                    );

                    return;
                }


                // ==========================================
                // DELETE OLD PASSAGE
                // ==========================================

                const deleteResponse =
                    await fetch(
                        "/api/court-steno/passages/" +
                        passageId,
                        {
                            method: "DELETE",

                            headers:
                                authHeaders
                        }
                    );


                const deleteData =
                    await deleteResponse.json();


                if (
                    !deleteResponse.ok ||
                    !deleteData.success
                ) {

                    alert(
                        "⚠️ नवीन Audio save झाला आहे, पण जुना passage delete करता आला नाही."
                    );

                    return;
                }


                // ==========================================
                // CLEAR EDIT MODE
                // ==========================================

                window.editingCourtSteno =
                    null;


                titleElement.value = "";

                referenceElement.value = "";

                fileElement.value = "";


                // ==========================================
                // REFRESH
                // ==========================================

                await loadCourtStenoLists();

                await displayCourtStenoAdminLists();


                alert(
                    "✅ District Court Steno Passage Successfully Updated!"
                );


                return;
            }


            // ==========================================
            // EDIT WITHOUT NEW AUDIO
            // ==========================================

            const response =
                await fetch(
                    "/api/court-steno/passages/" +
                    passageId,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " +
                                authToken
                        },

                        body:
                            JSON.stringify({

                                title:
                                    title,

                                speed:
                                    speed,

                                referenceText:
                                    reference

                            })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    "❌ Passage update झाला नाही.\n\n" +
                    (
                        data.message ||
                        "Update API उपलब्ध नाही किंवा server error."
                    )
                );

                return;
            }


            // ==========================================
            // CLEAR EDIT MODE
            // ==========================================

            window.editingCourtSteno =
                null;


            titleElement.value = "";

            referenceElement.value = "";

            fileElement.value = "";


            // ==========================================
            // REFRESH
            // ==========================================

            await loadCourtStenoLists();

            await displayCourtStenoAdminLists();


            alert(
                "✅ District Court Steno Passage Successfully Updated!"
            );


            return;

        } catch (error) {

            console.error(
                "District Court Steno Edit Error:",
                error
            );


            alert(
                "❌ Server connection failed."
            );


            return;
        }
    }


    // ==========================================
    // ADD NEW PASSAGE
    // ==========================================

    if (!file) {

        alert(
            "❌ New Passage साठी Audio file आवश्यक आहे."
        );

        return;
    }


    try {

        const formData =
            new FormData();


        formData.append(
            "court",
            "district"
        );

        formData.append(
            "title",
            title
        );

        formData.append(
            "speed",
            speed
        );

        formData.append(
            "referenceText",
            reference
        );

        formData.append(
            "audio",
            file
        );


        alert(
            "⏳ Audio server वर upload होत आहे..."
        );


        // ==========================================
        // UPLOAD AUDIO
        // ==========================================

        const response =
            await fetch(
                "/api/court-steno/upload",
                {
                    method: "POST",

                    headers:
                        authHeaders,

                    body: formData
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                "❌ Audio upload failed.\n\n" +
                (
                    data.message ||
                    "Unknown server error."
                )
            );

            return;
        }


        // ==========================================
        // CLEAR FORM
        // ==========================================

        titleElement.value = "";

        referenceElement.value = "";

        fileElement.value = "";


        // ==========================================
        // REFRESH LIST
        // ==========================================

        await loadCourtStenoLists();

        await displayCourtStenoAdminLists();


        alert(
            "✅ District Court Steno Passage Successfully Saved!"
        );


    } catch (error) {

        console.error(
            "District Court Steno Upload Error:",
            error
        );


        alert(
            "❌ Server connection failed.\n\n" +
            error.message
        );
    }
}

        
/* =====================================================
   UTILITY
   ===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   INITIALIZE
   ===================================================== */

/* =====================================================
   USER LOGIN / REGISTER / SUBSCRIPTION SYSTEM
   FRONTEND VERSION
   ===================================================== */

const USER_STORAGE_KEY = "vijayAherUsers";
const CURRENT_USER_KEY = "vijayAherCurrentUser";

initializeCourtStenoPassages();

loadCourtStenoLists();

loadPassages();

loadStenoPassages();

setupCourtPassageEvents();

updateMainStenoTimer();

showSection(
    "typingSection"
);

function getUsers() {
    return JSON.parse(
        localStorage.getItem(USER_STORAGE_KEY) || "[]"
    );
}


function saveUsers(users) {
    localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(users)
    );
}


function getCurrentUser() {
    return JSON.parse(
        localStorage.getItem(CURRENT_USER_KEY) || "null"
    );
}


function saveCurrentUser(user) {
    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(user)
    );
}


/* =====================================================
   SHOW LOGIN
   ===================================================== */

function showLogin() {

    document.getElementById("loginBox")
        ?.classList.remove("hidden");

    document.getElementById("registerBox")
        ?.classList.add("hidden");

    document.getElementById("dashboardBox")
        ?.classList.add("hidden");
}


/* =====================================================
   SHOW REGISTER
   ===================================================== */

function showRegister() {

    document.getElementById("loginBox")
        ?.classList.add("hidden");

    document.getElementById("registerBox")
        ?.classList.remove("hidden");

    document.getElementById("dashboardBox")
        ?.classList.add("hidden");
}


/* =====================================================
   REGISTER - BACKEND / MYSQL
   ===================================================== */

async function registerUser() {

    const name =
        document.getElementById("registerName").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    const confirmPassword =
        document.getElementById("registerConfirmPassword").value;

    const message =
        document.getElementById("registerMessage");

    if (!name || !email || !password || !confirmPassword) {
        message.textContent =
            "⚠️ सर्व माहिती भरा.";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent =
            "❌ Password आणि Confirm Password समान नाहीत.";
        return;
    }

    if (password.length < 6) {
        message.textContent =
            "⚠️ Password कमीत कमी 6 characters असावा.";
        return;
    }

    message.textContent =
        "⏳ Registration होत आहे...";

    try {

        const response = await fetch("/api/register", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {

            document.getElementById("registerName").value = "";
            document.getElementById("registerEmail").value = "";
            document.getElementById("registerPassword").value = "";
            document.getElementById("registerConfirmPassword").value = "";

            alert("✅ Registration Successful!");
        }

    } catch (error) {

        message.textContent =
            "❌ Server connection failed.";

        console.error(error);
    }
}
/* =====================================================
   LOGIN
   ===================================================== */


/* =====================================================
   DASHBOARD
   ===================================================== */

function showDashboard() {

    const user = getCurrentUser();

    if (!user) {

        showLogin();

        return;
    }


    document.getElementById("loginBox")
        ?.classList.add("hidden");

    document.getElementById("registerBox")
        ?.classList.add("hidden");

    document.getElementById("dashboardBox")
        ?.classList.remove("hidden");


    document.getElementById("dashboardName").textContent =
        user.name;

    document.getElementById("dashboardEmail").textContent =
        user.email;


    checkSubscription(user);


    updateDashboard(user);

}


/* =====================================================
   DASHBOARD UPDATE
   ===================================================== */

function updateDashboard(user) {

    const plan =
        document.getElementById("currentPlan");

    const status =
        document.getElementById("subscriptionStatus");

    const expiry =
        document.getElementById("subscriptionExpiry");


    if (plan)
        plan.textContent = user.plan || "Free";


    if (expiry) {

        expiry.textContent =
            formatDate(user.subscriptionExpiry);

    }


    if (status) {

        if (isSubscriptionActive(user)) {

            status.textContent = "Active";

        } else {

            status.textContent = "Expired";

        }

    }

}


/* =====================================================
   SUBSCRIPTION CHECK
   ===================================================== */

function isSubscriptionActive(user) {

    if (!user || !user.subscriptionExpiry)
        return false;


    return new Date(user.subscriptionExpiry) > new Date();

}


/* =====================================================
   SUBSCRIPTION EXPIRY
   ===================================================== */

function checkSubscription(user) {

    if (!isSubscriptionActive(user)) {

        user.plan = "Free";

        user.subscriptionExpiry =
            getDateAfterDays(0);

        updateStoredUser(user);

    }

}


/* =====================================================
   SELECT PLAN
   ===================================================== */

function selectPlan(planName, days) {

    const user = getCurrentUser();

    if (!user) {

        alert("कृपया आधी Login/Register करा.");

        showLogin();

        return;
    }


    if (planName === "Free") {

        alert(
            "Free Plan आधीपासून उपलब्ध आहे."
        );

        return;
    }


    /*
       IMPORTANT:
       हा सध्या DEMO subscription activation आहे.

       Real website मध्ये येथे Payment Gateway
       उघडला जाईल.
    */


    const message =
        document.getElementById("paymentMessage");


    if (message) {

        message.innerHTML = `
            <strong>💳 ${planName} Plan</strong><br>
            Payment Gateway जोडण्यासाठी हा भाग तयार आहे.<br>
            सध्या Demo Mode मध्ये subscription activate
            करण्यासाठी खालील button वापरा.
            <br><br>

            <button onclick="activateDemoSubscription('${planName}', ${days})">
                ✅ Demo Payment Success
            </button>
        `;

    }

}


/* =====================================================
   DEMO PAYMENT SUCCESS
   ===================================================== */

function activateDemoSubscription(planName, days) {

    const user = getCurrentUser();

    if (!user)
        return;


    user.plan = planName;

    user.subscriptionStart =
        new Date().toISOString();

    user.subscriptionExpiry =
        getDateAfterDays(days);


    updateStoredUser(user);

    saveCurrentUser(user);


    updateDashboard(user);


    const message =
        document.getElementById("paymentMessage");


    if (message) {

        message.innerHTML =
            `✅ ${planName} Plan successfully activated.`;

    }


    alert(
        `${planName} Plan Activated Successfully!`
    );

}


/* =====================================================
   UPDATE USER
   ===================================================== */

function updateStoredUser(user) {

    const users = getUsers();

    const index =
        users.findIndex(
            item => item.id === user.id
        );


    if (index !== -1) {

        users[index] = user;

        saveUsers(users);

    }

}


/* =====================================================
   LOGOUT
   ===================================================== */

function logoutUser() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );


    showLogin();


    alert("आपण Logout केले आहे.");

}


/* =====================================================
   DATE FUNCTIONS
   ===================================================== */

function getDateAfterDays(days) {

    const date = new Date();

    date.setDate(
        date.getDate() + days
    );

    return date.toISOString();

}


function formatDate(dateString) {

    if (!dateString)
        return "-";


    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =====================================================
   PREMIUM SECTION ACCESS
   ===================================================== */

function openPremiumSection(sectionId) {

    const userData =
        localStorage.getItem("loggedInUser");

    if (!userData) {

        alert(
            "🔐 ही सुविधा वापरण्यासाठी Login करा."
        );

        showLogin();

        return;
    }

    const user =
        JSON.parse(userData);

    /*
       Database मधून आलेला active status तपासा
    */

    if (!user.active) {

        alert(
            "🔒 तुमची subscription active नाही."
        );

        showDashboard();

        return;
    }

    /*
       Paid plan असल्यास Premium section उघडा
    */

    if (
    user.plan !== "Monthly" &&
    user.plan !== "Yearly" &&
    user.plan !== "Free Trial"
) {

    alert(
        "🔒 ही Premium सुविधा वापरण्यासाठी Free Trial किंवा Premium Plan आवश्यक आहे."
    );

    showDashboard();

    return;
}

    /*
       Premium section show करा
    */

    showSection(sectionId);
}

/* =====================================================
   LOGIN STATE ON PAGE LOAD
   ===================================================== */

function initializeUserSystem() {

    const user = getCurrentUser();


    if (user) {

        if (isSubscriptionActive(user)) {

            showDashboard();

        } else {

            updateStoredUser(user);

            showDashboard();

        }

    } else {

        showLogin();

    }

}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeUserSystem();

    }
);


/* =====================================================
   BACKEND LOGIN
   ===================================================== */

window.loginUser = async function loginUser() {


    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const message =
        document.getElementById("loginMessage");


    if (!email || !password) {

        message.textContent =
            "⚠️ Email आणि Password भरा.";

        return;
    }


    message.textContent =
        "⏳ Login होत आहे...";


    try {

        const response =
    await fetch("/api/login", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })
    });


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                "❌ " + data.message;

            return;
        }


        localStorage.setItem(
    "loggedInUser",
    JSON.stringify(data.user)
);

localStorage.setItem(
    "authToken",
    data.token
);

        message.textContent =
            "✅ Login Successful!";


        showDashboard();


    } catch (error) {

        console.error(error);

        message.textContent =
            "❌ Server connection failed.";

    }

}


/* =====================================================
   SHOW DASHBOARD
   ===================================================== */

async function showDashboard() {

    const userData =
        localStorage.getItem("loggedInUser");

    if (!userData) {
        showLogin();
        return;
    }

    const user =
        JSON.parse(userData);

    document
        .getElementById("loginBox")
        ?.classList.add("hidden");

    document
        .getElementById("registerBox")
        ?.classList.add("hidden");

    const dashboard =
        document.getElementById("dashboardSection");

    if (dashboard) {
        dashboard.style.display = "block";
    }

   const dashboardBox =
    document.getElementById("dashboardBox");

if (dashboardBox) {
    dashboardBox.classList.remove("hidden");
}

    const name =
        document.getElementById("dashboardName");

    const email =
        document.getElementById("dashboardEmail");

    const plan =
        document.getElementById("dashboardPlan");

    if (name)
        name.textContent = user.name || "-";

    if (email)
        email.textContent = user.email || "-";

    // Database मधून latest subscription तपासा
    try {

        const response =
            await fetch(
                "/api/subscription/" + user.id
            );

        const data =
            await response.json();

        if (response.ok && data.success) {

    const latestUser =
        data.user;

    // Subscription expiry date तपासा
   let subscriptionActive = false;

if (
    latestUser.plan &&
    (
        latestUser.plan === "Free Trial" ||
        latestUser.plan === "Monthly" ||
        latestUser.plan === "Yearly"
    ) &&
    latestUser.subscription_expiry
) {

    const expiryDate =
        new Date(
            latestUser.subscription_expiry
        );

    const currentDate =
        new Date();

    subscriptionActive =
        expiryDate > currentDate;
}

latestUser.active =
    subscriptionActive;

    // Latest subscription data LocalStorage मध्ये save करा
    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(latestUser)
    );
loadStenoTestHistory(latestUser.id);

    if (plan) {

        plan.textContent =
            subscriptionActive
                ? latestUser.plan
                : "Free";
    }
// Subscription Details
const statusElement =
    document.getElementById("subscriptionStatus");

const planElement =
    document.getElementById("subscriptionPlan");

const startElement =
    document.getElementById("subscriptionStart");

const expiryElement =
    document.getElementById("subscriptionExpiry");

const daysElement =
    document.getElementById("subscriptionDays");


if (statusElement) {

    statusElement.textContent =
        subscriptionActive
            ? "🟢 Active"
            : "🔴 Expired";
}


if (planElement) {

    planElement.textContent =
        subscriptionActive
            ? latestUser.plan
            : "Free";
}


if (startElement) {

    startElement.textContent =
        latestUser.subscription_start
            ? new Date(
                latestUser.subscription_start
              ).toLocaleDateString("en-IN")
            : "-";
}


if (expiryElement) {

    expiryElement.textContent =
        latestUser.subscription_expiry
            ? new Date(
                latestUser.subscription_expiry
              ).toLocaleDateString("en-IN")
            : "-";
}


if (daysElement) {

    if (
        subscriptionActive &&
        latestUser.subscription_expiry
    ) {

        const expiry =
            new Date(
                latestUser.subscription_expiry
            );

        const today =
            new Date();

        const difference =
            expiry.getTime() -
            today.getTime();

        const remainingDays =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );

        daysElement.textContent =
            remainingDays + " Days";

    } else {

        daysElement.textContent =
            "0 Days";
    }
}

    // Premium access update करा
    updatePremiumAccess(
        subscriptionActive,
        latestUser.plan
    );

loadPaymentHistory(user.id);

const adminButton =
    document.getElementById("adminPanelButton");

if (adminButton) {

    if (Number(latestUser.is_admin) === 1) {

        adminButton.classList.remove("hidden");

    } else {

        adminButton.classList.add("hidden");

    }
}


        } else {

            if (plan)
                plan.textContent = "Free";

            updatePremiumAccess(false, "Free");
        }

    } catch (error) {

        console.error(
            "Subscription Check Error:",
            error
        );

        updatePremiumAccess(false, "Free");
    }
}

function updatePremiumAccess(isActive, plan) {

    const premiumSections =
        document.querySelectorAll(".premium-section");

    premiumSections.forEach(function(section) {

        let lockBox =
            section.querySelector(".premium-lock-box");

        if (isActive) {

            section.classList.remove("premium-locked");

            section
                .querySelectorAll("button")
                .forEach(function(button) {
                    button.disabled = false;
                    button.style.pointerEvents = "auto";
                });

            if (lockBox) {
                lockBox.remove();
            }

        } else {

            section.classList.add("premium-locked");

            section
                .querySelectorAll("button")
                .forEach(function(button) {
                    button.disabled = true;
                });

            if (!lockBox) {

                lockBox =
                    document.createElement("div");

                lockBox.className =
                    "premium-lock-box";

                lockBox.innerHTML = `
                    <div class="premium-lock-icon">🔒</div>

                    <h3>Premium Test Locked</h3>

                    <p>
                        ही सुविधा वापरण्यासाठी
                        Premium Subscription आवश्यक आहे.
                    </p>

                    <div class="premium-price">
                        <span>⭐ Monthly ₹99</span>
                        <span>👑 Yearly ₹999</span>
                    </div>

                    <div class="premium-lock-buttons">

                        <button
                            class="premium-subscribe-btn"
                            onclick="subscribePlan('Monthly')">
                            ⭐ Subscribe Monthly ₹99
                        </button>

                        <button
                            class="premium-subscribe-btn"
                            onclick="subscribePlan('Yearly')">
                            👑 Subscribe Yearly ₹999
                        </button>

                    </div>
                `;

                section.appendChild(lockBox);
            }
        }
    });
}

/* =====================================================
   LOAD PAYMENT HISTORY
===================================================== */

async function loadPaymentHistory(userId) {

    const content =
        document.getElementById("paymentHistoryContent");

    if (!content) return;

    content.innerHTML =
        "<p>Loading payment history...</p>";

    try {

        const response = await fetch(
            "/api/payment-history/" + userId
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            content.innerHTML =
                "<p>❌ Payment history could not be loaded.</p>";

            return;
        }

        if (!data.payments || data.payments.length === 0) {

            content.innerHTML =
                "<p>No payment history found.</p>";

            return;
        }

        let html = `
            <div class="payment-history-table-wrapper">

                <table class="payment-history-table">

                    <thead>
                        <tr>
                            <th>Plan</th>
<th>Amount</th>
<th>Payment Date</th>
<th>Payment ID</th>
<th>Order ID</th>
<th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
        `;

        data.payments.forEach(function(payment) {

            const paymentDate =
                payment.created_at
                    ? new Date(
                        payment.created_at
                      ).toLocaleString("en-IN")
                    : "-";

            html += `
                <tr>
                    <td>${payment.plan || "-"}</td>

<td>
    ₹${payment.amount || "0.00"}
</td>

<td>
    ${paymentDate}
</td>

<td>
    ${payment.payment_id || "-"}
</td>

<td>
    ${payment.order_id || "-"}
</td>

<td>
    <span class="payment-status">
        ${payment.status || "-"}
    </span>
</td>
                </tr>
            `;

        });

        html += `
                    </tbody>

                </table>

            </div>
        `;

        content.innerHTML = html;

    } catch (error) {

        console.error(
            "Payment History Error:",
            error
        );

        content.innerHTML =
            "<p>❌ Payment history connection failed.</p>";
    }
}

/* =====================================================
   LOGOUT
   ===================================================== */

function logoutUser() {

    localStorage.removeItem(
        "loggedInUser"
    );


    const dashboard =
        document.getElementById("dashboardSection");


    if (dashboard) {

        dashboard.style.display = "none";

    }


    showLogin();

}


/* =====================================================
   LOGIN / REGISTER SWITCH
   ===================================================== */

function showLogin() {

    document
        .getElementById("loginBox")
        ?.classList.remove("hidden");


    document
        .getElementById("registerBox")
        ?.classList.add("hidden");


    const dashboard =
        document.getElementById("dashboardSection");


    if (dashboard) {

        dashboard.style.display = "none";

    }

}


function showRegister() {

    document
        .getElementById("loginBox")
        ?.classList.add("hidden");


    document
        .getElementById("registerBox")
        ?.classList.remove("hidden");


    const dashboard =
        document.getElementById("dashboardSection");


    if (dashboard) {

        dashboard.style.display = "none";

    }

}


/* =====================================================
   PAGE LOAD
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const userData =
            localStorage.getItem("loggedInUser");


        if (userData) {

            showDashboard();

        } else {

            showLogin();

        }

    }
);


/* =====================================================
   SUBSCRIPTION PLAN
   ===================================================== */

async function subscribePlan(plan) {

    const userData = localStorage.getItem("loggedInUser");

    if (!userData) {
        alert("⚠️ Please login first.");
        return;
    }

    const user = JSON.parse(userData);

    try {

        const response = await fetch("/api/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                plan: plan
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert("❌ " + (data.message || "Unable to create order."));
            return;
        }

        const options = {
            key: data.key,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "VIJAY AHER",
            description: plan + " Subscription",
            order_id: data.order.id,

            handler: async function (paymentResponse) {

                const verifyResponse = await fetch(
                    "/api/verify-payment",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            razorpay_order_id:
                                paymentResponse.razorpay_order_id,

                            razorpay_payment_id:
                                paymentResponse.razorpay_payment_id,

                            razorpay_signature:
                                paymentResponse.razorpay_signature,

                            user_id: user.id,
                            plan: plan
                        })
                    }
                );

                const verifyData =
                    await verifyResponse.json();

                if (!verifyResponse.ok) {
                    alert(
                        "❌ " +
                        (verifyData.message ||
                        "Payment verification failed.")
                    );
                    return;
                }

                alert(
                    "✅ Payment Successful!\n" +
                    "Plan: " + plan
                );

                user.plan = plan;

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                showDashboard();

            },

            prefill: {
                name: user.name || "",
                email: user.email || ""
            },

            theme: {
                color: "#6c5ce7"
            }
        };

        const razorpay =
            new Razorpay(options);

        razorpay.open();

    } catch (error) {

        console.error(
            "Subscription Error:",
            error
        );

        alert(
            "❌ Payment system connection failed."
        );
    }
}

/* =====================================================
   OPEN ADMIN DASHBOARD
===================================================== */

async function openAdminDashboard() {

    const userData =
        localStorage.getItem("loggedInUser");

    if (!userData) {

        alert("🔐 Please login first.");
        showLogin();
        return;
    }

    const user =
        JSON.parse(userData);

    if (Number(user.is_admin) !== 1) {

        alert("⛔ Admin access required.");
        return;
    }

    document
        .querySelectorAll(".main-section")
        .forEach(function(section) {
            section.classList.add("hidden");
        });

    const adminSection =
        document.getElementById(
            "adminDashboardSection"
        );

    if (adminSection) {

        adminSection.classList.remove("hidden");

        adminSection.style.display = "block";
    }

    await loadAdminDashboard();
}

/* =====================================================
   LOAD ADMIN DASHBOARD
===================================================== */

var adminUsersData = [];

async function loadAdminDashboard() {

    const userData =
        localStorage.getItem("loggedInUser");

    if (!userData) {
        showLogin();
        return;
    }

    const user =
        JSON.parse(userData);

    if (Number(user.is_admin) !== 1) {

        alert("⛔ Admin access required.");
        return;
    }

    try {

        const response =
            await fetch(
                "/api/admin/users/" + user.id
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            alert(
                "❌ Admin data could not be loaded."
            );

            return;
        }

        adminUsersData =
            data.users || [];

       updateAdminStatistics(
    adminUsersData
);

displayAdminUsers(
    adminUsersData
);

await loadAdminRevenue(
    user.id
);

    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        alert(
            "❌ Admin dashboard connection failed."
        );
    }
}

async function loadAdminRevenue(adminId) {

    const revenueElement =
        document.getElementById(
            "adminTotalRevenue"
        );

    if (!revenueElement) return;

    try {

        const response =
            await fetch(
                "/api/admin/revenue/" +
                adminId
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success
        ) {

            const revenue =
                Number(
                    data.totalRevenue || 0
                );

            revenueElement.textContent =
                "₹" +
                revenue.toLocaleString("en-IN");

        } else {

            revenueElement.textContent =
                "₹0";
        }

    } catch (error) {

        console.error(
            "Admin Revenue Error:",
            error
        );

        revenueElement.textContent =
            "₹0";
    }
}

/* =====================================================
   ADMIN STATISTICS
===================================================== */

function updateAdminStatistics(users) {

    const totalUsers =
        users.length;

    let activeUsers = 0;
    let expiredUsers = 0;
    let totalRevenue = 0;

    const now =
        new Date();

    users.forEach(function(user) {

        if (
            user.plan &&
            user.plan !== "Free" &&
            user.subscription_expiry
        ) {

            const expiry =
                new Date(
                    user.subscription_expiry
                );

            if (expiry > now) {
                activeUsers++;
            } else {
                expiredUsers++;
            }

        } else {

            expiredUsers++;
        }

        // Revenue from paid plans
        if (user.plan === "Monthly") {
            totalRevenue += 99;
        }

        if (user.plan === "Yearly") {
            totalRevenue += 999;
        }

    });


    const totalElement =
        document.getElementById(
            "adminTotalUsers"
        );

    const activeElement =
        document.getElementById(
            "adminActiveUsers"
        );

    const expiredElement =
        document.getElementById(
            "adminExpiredUsers"
        );

    const revenueElement =
        document.getElementById(
            "adminTotalRevenue"
        );


    if (totalElement)
        totalElement.textContent =
            totalUsers;


    if (activeElement)
        activeElement.textContent =
            activeUsers;


    if (expiredElement)
        expiredElement.textContent =
            expiredUsers;


    if (revenueElement)
        revenueElement.textContent =
            "₹" +
            totalRevenue.toLocaleString("en-IN");
}

/* =====================================================
   DISPLAY ADMIN USERS
===================================================== */

function displayAdminUsers(users) {

    const tbody =
        document.getElementById(
            "adminUsersTableBody"
        );

    if (!tbody) return;


    if (!users.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No users found.
                </td>
            </tr>
        `;

        return;
    }


    let html = "";


    users.forEach(function(user) {

        const startDate =
            user.subscription_start
                ? new Date(
                    user.subscription_start
                  ).toLocaleDateString("en-IN")
                : "-";


        const expiryDate =
            user.subscription_expiry
                ? new Date(
                    user.subscription_expiry
                  ).toLocaleDateString("en-IN")
                : "-";


        html += `
            <tr>

                <td>
                    ${user.id}
                </td>

                <td>
                    ${user.name || "-"}
                </td>

                <td>
                    ${user.email || "-"}
                </td>

                <td>
                    ${user.plan || "Free"}
                </td>

                <td>
                    ${startDate}
                </td>

                <td>
                    ${expiryDate}
                </td>

                <td>
                    ${
                        Number(user.is_admin) === 1
                            ? "👑 Admin"
                            : "User"
                    }
                </td>
<td>
    <button
        class="admin-manage-btn"
        onclick="manageAdminUser(${user.id})">
        ✏️ Manage
    </button>
</td>

            </tr>
        `;

    });


    tbody.innerHTML =
        html;
}


/* =====================================================
   FILTER ADMIN USERS
===================================================== */

function filterAdminUsers() {

    const searchInput =
        document.getElementById(
            "adminUserSearch"
        );

    if (!searchInput) return;


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filteredUsers =
        adminUsersData.filter(function(user) {

            const name =
                (user.name || "")
                    .toLowerCase();

            const email =
                (user.email || "")
                    .toLowerCase();

            return (
                name.includes(search) ||
                email.includes(search)
            );

        });


    displayAdminUsers(
        filteredUsers
    );
}

function manageAdminUser(userId) {

    const user =
        adminUsersData.find(function(item) {
            return Number(item.id) === Number(userId);
        });

    if (!user) {

        alert("❌ User details not found.");
        return;
    }

    const currentPlan =
        user.plan || "Free";

    const currentStart =
        user.subscription_start
            ? new Date(user.subscription_start)
                .toISOString()
                .split("T")[0]
            : "";

    const currentExpiry =
        user.subscription_expiry
            ? new Date(user.subscription_expiry)
                .toISOString()
                .split("T")[0]
            : "";

    const newPlan =
        prompt(
            "Plan निवडा:\n\n" +
            "Free\n" +
            "Monthly\n" +
            "Yearly\n\n" +
            "Current Plan: " +
            currentPlan,
            currentPlan
        );

    if (newPlan === null) {
        return;
    }

    const plan =
        newPlan.trim();

    if (
        plan !== "Free" &&
        plan !== "Monthly" &&
        plan !== "Yearly"
    ) {

        alert(
            "❌ Invalid plan.\n\n" +
            "Free, Monthly किंवा Yearly वापरा."
        );

        return;
    }

    let expiry = currentExpiry;

    if (plan === "Free") {

        expiry = "";

    } else {

        expiry =
            prompt(
                "Subscription Expiry Date द्या:\n\n" +
                "Format: YYYY-MM-DD",
                currentExpiry
            );

        if (expiry === null) {
            return;
        }

        expiry = expiry.trim();

        if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {

            alert(
                "❌ Date format चुकीचा आहे.\n\n" +
                "उदा. 2026-10-31"
            );

            return;
        }
    }

    const confirmUpdate =
        confirm(
            "Update User?\n\n" +
            "Name: " + (user.name || "-") + "\n" +
            "Email: " + (user.email || "-") + "\n" +
            "Plan: " + plan + "\n" +
            "Expiry: " + (expiry || "-")
        );

    if (!confirmUpdate) {
        return;
    }

    updateAdminUserSubscription(
        user.id,
        plan,
        currentStart,
        expiry
    );
}

async function updateAdminUserSubscription(
    userId,
    plan,
    subscriptionStart,
    subscriptionExpiry
) {

    const userData =
        localStorage.getItem("loggedInUser");

    if (!userData) {

        alert("🔐 Please login first.");
        return;
    }

    const admin =
        JSON.parse(userData);

    if (Number(admin.is_admin) !== 1) {

        alert("⛔ Admin access required.");
        return;
    }

    try {

        const response =
            await fetch(
                "/api/admin/users/" +
                admin.id +
                "/update-user",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            userId,

                        plan:
                            plan,

                        subscription_start:
                            subscriptionStart || null,

                        subscription_expiry:
                            subscriptionExpiry || null

                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            alert(
                "❌ Update failed:\n" +
                (data.message || "Unknown error.")
            );

            return;
        }

        alert(
            "✅ User subscription updated successfully!"
        );

        await loadAdminDashboard();

    } catch (error) {

        console.error(
            "Admin User Update Error:",
            error
        );

        alert(
            "❌ Server connection failed."
        );
    }
}

/* =====================================================
   COURT TYPING PASSAGE DROPDOWNS
===================================================== */

function loadCourtTypingPassages() {

    const districtSelect =
        document.getElementById("districtPassage");

    function fillSelect(select) {

        if (!select) return;

        select.innerHTML =
            '<option value="">Select Passage</option>';

        passages.forEach(function(passage) {

            const option =
                document.createElement("option");

            option.value =
                passage.id;

            option.textContent =
                `${passage.title} (${passage.language})`;

            select.appendChild(option);

        });
    }

    fillSelect(districtSelect);
}

/* =====================================================
   COURT PASSAGE CHANGE
===================================================== */

function setupCourtPassageEvents() {

    const districtSelect =
        document.getElementById("districtPassage");

    

    if (districtSelect) {

        districtSelect.addEventListener(
            "change",
            function() {

                const selected =
                    passages.find(
                        p =>
                        String(p.id) ===
                        String(this.value)
                    );

                if (typeof courtData !== "undefined") {

                    courtData.district.current =
                        selected || null;
                }

                const question =
                    document.getElementById(
                        "districtQuestion"
                    );

                if (question) {

                    question.textContent =
                        selected
                            ? selected.content
                            : "No passage available.";
                }

            }
        );
    }

}

// ==========================================
// DELETE COURT STENO PASSAGE - MYSQL
// ==========================================

async function deleteCourtStenoPassage(court, passageId) {

    if (!confirm("हा Steno Passage delete करायचा आहे का?")) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/court-steno/passages/" + passageId,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                "❌ Passage delete झाला नाही.\n\n" +
                (
                    data.message ||
                    "Unknown server error."
                )
            );

            return;
        }

        // MySQL मधून delete झाल्यानंतर
        // नवीन passage list पुन्हा load करा

        await loadCourtStenoLists();

        displayCourtStenoAdminLists();

        alert(
            "✅ Steno Passage Successfully Deleted!"
        );

    } catch (error) {

        console.error(
            "Court Steno Delete Error:",
            error
        );

        alert(
            "❌ Server connection failed."
        );
    }
}
// ==========================================
// DISPLAY COURT STENO ADMIN PASSAGES
// ==========================================

// ==========================================
// DISPLAY COURT STENO ADMIN PASSAGES - MYSQL
// ==========================================

function previewCourtStenoAudio(court, passageId) {

    const passages =
        courtStenoData.district?.passages || [];

    const passage =
        passages.find(function(item) {

            return String(item.id) ===
                String(passageId);

        });

    if (!passage) {

        alert("❌ Steno passage सापडला नाही.");

        return;
    }

    const audio =
        document.getElementById(
            "districtStenoAudio"
        );

    if (!audio) {

        alert("❌ Audio player सापडला नाही.");

        return;
    }

    audio.src =
        passage.audio;

    audio.load();

    audio.play().catch(function(error) {

        console.log(
            "Preview play blocked:",
            error
        );

        alert(
            "▶️ Audio player मध्ये Preview तयार आहे. Play button क्लिक करा."
        );

    });
}

async function displayCourtStenoAdminLists() {

    const container =
        document.getElementById(
            "districtStenoAdminList"
        );

    if (!container) return;

    try {

        const response =
            await fetch(
                "/api/court-steno/passages/district"
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            container.innerHTML =
                "<p>❌ Steno passages load failed.</p>";

            return;
        }

        const passages =
            Array.isArray(data.passages)
                ? data.passages
                : [];

        if (passages.length === 0) {

            container.innerHTML =
                "<p>No Steno passages available.</p>";

            return;
        }

        let html = `
            <h4>📋 Saved District Court Steno Passages</h4>

            <div class="court-steno-admin-list-table">
        `;

        passages.forEach(function(passage) {

            html += `
                <div class="court-steno-admin-item">

                    <div class="steno-admin-info">

                        <strong>
                            ${escapeHTML(
                                passage.title ||
                                "Untitled"
                            )}
                        </strong>

                        <span>
                            ${passage.speed || 0} WPM
                        </span>

                    </div>

                    <div class="steno-admin-actions">

                        <button
                            type="button"
                            class="steno-preview-btn"
                            onclick="previewCourtStenoAudio(
                                'district',
                                '${passage.id}'
                            )">
                            🎧 Preview
                        </button>

                        <button
                            type="button"
                            class="steno-edit-btn"
                            onclick="editCourtStenoPassage(
                                'district',
                                '${passage.id}'
                            )">
                            ✏️ Edit
                        </button>

                        <button
                            type="button"
                            class="steno-delete-btn"
                            onclick="deleteCourtStenoPassage(
                                'district',
                                '${passage.id}'
                            )">
                            🗑 Delete
                        </button>

                    </div>

                </div>
            `;
        });

        html += `
            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            "District Court Steno Admin List Error:",
            error
        );

        container.innerHTML =
            "<p>❌ Server connection failed.</p>";
    }
}

async function editCourtStenoPassage(court, passageId) {

    if (court !== "district") {
        alert("❌ Only District Court Steno is available.");
        return;
    }

    try {

        const response = await fetch(
            `/api/court-steno/passages/district`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert("❌ Steno passages load failed.");
            return;
        }

        const passages = Array.isArray(data.passages)
            ? data.passages
            : [];

        const passage = passages.find(function(item) {
            return String(item.id) === String(passageId);
        });

        if (!passage) {
            alert("❌ Steno passage सापडला नाही.");
            return;
        }

        const titleElement =
            document.getElementById("districtStenoTitle");

        const speedElement =
            document.getElementById("districtStenoAdminSpeed");

        const referenceElement =
            document.getElementById(
                "districtStenoReferenceText"
            );

        if (titleElement) {
            titleElement.value =
                passage.title || "";
        }

        if (speedElement) {
            speedElement.value =
                String(passage.speed || 60);
        }

        if (referenceElement) {
            referenceElement.value =
                passage.reference_text || "";
        }

        window.editingCourtSteno = {
            court: "district",
            id: passage.id
        };

        const saveButton =
            document.querySelector(
                'button[onclick*="saveCourtStenoPassage"]'
            );

        if (saveButton) {
            saveButton.textContent =
                "✏️ Update District Steno Passage";
        }

        alert(
            "✏️ Edit Mode सुरू झाला. Passage details बदलून Update करा."
        );

    } catch (error) {

        console.error(
            "Edit District Court Steno Error:",
            error
        );

        alert(
            "❌ Edit करताना server error आला."
        );
    }
}

/* =====================================================
   LOAD STENO TEST HISTORY
===================================================== */

async function loadStenoTestHistory(userId) {

    const container =
        document.getElementById(
            "stenoHistoryContainer"
        );

    if (!container) return;

    if (!userId) {

        container.innerHTML =
            "<p>⚠️ User information not found.</p>";

        return;
    }

    container.innerHTML =
        "<p>⏳ Loading Steno Test History...</p>";

    try {

        const response =
            await fetch(
                "/api/steno-test-history/" + userId
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            container.innerHTML =
                "<p>❌ Steno history load failed.</p>";

            console.error(
                "Steno History API Error:",
                data
            );

            return;
        }

        const history =
            Array.isArray(data.history)
                ? data.history
                : [];

        if (history.length === 0) {

            container.innerHTML =
                "<p>📭 No Steno Test History Found.</p>";

            return;
        }

        let html = `
            <div class="steno-history-table-wrap">

                <table class="steno-history-table">

                    <thead>
                        <tr>
                            <th>Date</th>
<th>Court</th>
<th>Passage</th>
<th>Speed</th>
<th>WPM</th>
<th>Accuracy</th>
<th>Errors</th>
<th>Time</th>
<th>Result</th>
                        </tr>
                    </thead>

                    <tbody>
        `;

        history.forEach(function(item) {

            const date =
                item.created_at
                    ? new Date(
                        item.created_at
                    ).toLocaleString("en-IN")
                    : "-";

            const timeUsed =
                Number(
                    item.time_used || 0
                );

            const minutes =
                Math.floor(
                    timeUsed / 60
                )
                .toString()
                .padStart(2, "0");

            const seconds =
                (timeUsed % 60)
                .toString()
                .padStart(2, "0");

            html += `
                <tr>

                    <td>
                        ${escapeHTML(date)}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.court || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.passage_title || "-"
                        )}
                    </td>

                    <td>
                        ${item.speed || 0} WPM
                    </td>

                    <td>
                        ${item.wpm || 0}
                    </td>

                    <td>
                        ${item.accuracy || 0}%
                    </td>

                    <td>
                        ${item.errors || 0}
                    </td>

                    <td>
                        ${minutes}:${seconds}
                    </td>

<td>
    <button
        type="button"
        class="view-steno-result-btn"
        onclick="viewStenoResult('${item.id}')">
        👁 View Result
    </button>
</td>

                </tr>
            `;
        });

        html += `
                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            "Steno History Error:",
            error
        );

        container.innerHTML =
            "<p>❌ Server connection failed.</p>";
    }
}

/* =====================================================
   VIEW STENO RESULT
===================================================== */

function viewStenoResult(resultId) {

    const container =
        document.getElementById(
            "stenoHistoryContainer"
        );

    if (!container) return;

    const loggedInUser =
        JSON.parse(
            localStorage.getItem(
                "loggedInUser"
            )
        );

    if (
        !loggedInUser ||
        !loggedInUser.id
    ) {

        alert(
            "❌ User information not found."
        );

        return;
    }

    fetch(
        "/api/steno-test-history/" +
        loggedInUser.id
    )
        .then(function(response) {
            return response.json();
        })

        .then(function(data) {

            if (!data.success) {

                alert(
                    "❌ Result load failed."
                );

                return;
            }

            const result =
                data.history.find(
                    function(item) {

                        return String(
                            item.id
                        ) === String(
                            resultId
                        );

                    }
                );

            if (!result) {

                alert(
                    "❌ Result सापडला नाही."
                );

                return;
            }

            const reference =
                result.reference_text || "";

            const typed =
                result.typed_text || "";

            const hasDetailedText =
                Boolean(
                    reference ||
                    typed
                );

            let comparison = {
                html: ""
            };

            if (hasDetailedText) {

                comparison =
                    compareSteno(
                        reference,
                        typed
                    );

            }

            container.innerHTML = `

                <div class="steno-detailed-result">

                    <h3>
                        📊 Detailed Steno Result
                    </h3>

                    <div class="steno-result-summary">

                        <div>
                            <strong>
                                Passage
                            </strong>

                            <span>
                                ${escapeHTML(
                                    result.passage_title || "-"
                                )}
                            </span>
                        </div>

                        <div>
                            <strong>
                                Speed
                            </strong>

                            <span>
                                ${result.speed || 0} WPM
                            </span>
                        </div>

                        <div>
                            <strong>
                                WPM
                            </strong>

                            <span>
                                ${result.wpm || 0}
                            </span>
                        </div>

                        <div>
                            <strong>
                                Accuracy
                            </strong>

                            <span>
                                ${result.accuracy || 0}%
                            </span>
                        </div>

                        <div>
                            <strong>
                                Errors
                            </strong>

                            <span>
                                ${result.errors || 0}
                            </span>
                        </div>

                    </div>


                    <h4>
                        📄 Reference Dictation
                    </h4>

                    ${
                        hasDetailedText
                            ? `
                                <div class="steno-reference-text">
                                    ${escapeHTML(
                                        reference
                                    )}
                                </div>
                              `
                            : `
                                <div class="steno-reference-text">
                                    ⚠️ या जुन्या test साठी
                                    Reference Dictation उपलब्ध नाही.
                                </div>
                              `
                    }


                    <div class="steno-result-legend">

                        <span class="legend-correct">
                            🟢 Correct
                        </span>

                        <span class="legend-wrong">
                            🔴 Wrong
                        </span>

                        <span class="legend-missing">
                            🟣 Missing
                        </span>

                        <span class="legend-extra">
                            🟠 Extra
                        </span>

                    </div>


                    <h4>
                        ⌨ Your Transcription
                    </h4>

                    ${
                        hasDetailedText
                            ? `
                                <div class="steno-typed-result">
                                    ${comparison.html}
                                </div>
                              `
                            : `
                                <div class="steno-typed-result">
                                    ⚠️ या जुन्या test साठी
                                    Your Transcription उपलब्ध नाही.
                                </div>
                              `
                    }


                    <button
                        type="button"
                        onclick="loadStenoTestHistory(${loggedInUser.id})">
                        ↩ Back to History
                    </button>

                </div>

            `;

        })

        .catch(function(error) {

            console.error(
                "View Steno Result Error:",
                error
            );

            alert(
                "❌ Server connection error."
            );

        });
}

/* =====================================================
   STENO HISTORY WPM FILTER
===================================================== */

function filterStenoHistory() {

    const filter =
        document.getElementById(
            "stenoWpmFilter"
        );

    const selectedWpm =
        filter ? filter.value : "all";

    const rows =
        document.querySelectorAll(
            ".steno-history-table tbody tr"
        );

    rows.forEach(function(row) {

        if (selectedWpm === "all") {

            row.style.display = "";

            return;
        }

        const speedCell =
            row.querySelector(
                "td:nth-child(4)"
            );

        if (!speedCell) return;

        const rowSpeed =
            speedCell.textContent
                .replace("WPM", "")
                .trim();

        if (
            String(rowSpeed) ===
            String(selectedWpm)
        ) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });
}

// ==========================================
// MAIN STENO DICTATION - PASSAGE SELECT
// ==========================================

const mainStenoSelect =
    document.getElementById("stenoPassageSelect");

if (mainStenoSelect) {

    mainStenoSelect.addEventListener(
        "change",
        function () {

            currentSteno =
                stenoPassages.find(
                    p =>
                        String(p.id) ===
                        String(this.value)
                );

            if (!currentSteno) {
                console.warn(
                    "MAIN STENO: Passage not selected."
                );
                return;
            }

            console.log(
                "MAIN STENO SELECTED:",
                currentSteno
            );

            const audio =
                document.getElementById(
                    "stenoAudio"
                );

            if (!audio) {
                console.error(
                    "MAIN STENO AUDIO ELEMENT NOT FOUND."
                );
                return;
            }

            audio.src =
                currentSteno.audio;

            audio.load();

            document.getElementById(
                "audioStatus"
            ).textContent =
                "Audio loaded. Dictation सुरू करा.";

            console.log(
                "MAIN STENO AUDIO URL:",
                audio.src
            );

            audio.onended =
                function () {

                    const transcriptionSection =
                        document.getElementById(
                            "transcriptionSection"
                        );

                    if (transcriptionSection) {

                        transcriptionSection.classList.remove(
                            "hidden"
                        );

                    }

                    if (
                        typeof startMainSteno ===
                        "function"
                    ) {
                        startMainSteno();
                    }

                };

        }
    );

}

// ==========================================
// MAIN STENO - SPEED FILTER
// ==========================================

const mainStenoSpeed =
    document.getElementById("stenoSpeed");

if (mainStenoSpeed) {

    mainStenoSpeed.addEventListener(
        "change",
        function () {

            const selectedSpeed =
                Number(this.value);

            stenoPassageSelect.innerHTML =
                '<option value="">Select Passage</option>';

            stenoPassages
                .filter(
                    p =>
                        !p.hidden &&
                        p.visible !== false &&
                        Number(p.speed) === selectedSpeed
                )
                .forEach(
                    p => {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            p.id;

                        option.textContent =
                            `${p.title} (${p.speed} WPM)`;

                        stenoPassageSelect.appendChild(
                            option
                        );

                    }
                );

            // Reset current passage
            currentSteno = null;

            // Reset audio
            const audio =
                document.getElementById(
                    "stenoAudio"
                );

            if (audio) {

                audio.pause();
                audio.removeAttribute("src");
                audio.load();

            }

            document.getElementById(
                "audioStatus"
            ).textContent =
                "Select a steno passage.";

            console.log(
                "MAIN STENO SPEED FILTER:",
                selectedSpeed
            );

        }
    );

}
