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
   DEFAULT PASSAGES
   ===================================================== */

let passages = JSON.parse(
    localStorage.getItem("gccAdvancedPassages") || "null"
);

if (!passages) {

    passages = [

        {
            id: Date.now() + 1,
            title: "English General Passage",
            language: "English",
            content:
            "India is a democratic country. The Constitution provides fundamental rights and duties to every citizen. The rule of law is an important principle of democratic administration. Courts protect the rights of citizens and ensure justice according to law."
        },

        {
            id: Date.now() + 2,
            title: "Marathi General Passage",
            language: "Marathi",
            content:
            "भारत हा लोकशाही देश आहे. भारतीय संविधान प्रत्येक नागरिकाला मूलभूत अधिकार आणि कर्तव्ये प्रदान करते. कायद्याचे राज्य हे लोकशाही व्यवस्थेचे महत्त्वाचे तत्त्व आहे. न्यायालये नागरिकांच्या अधिकारांचे संरक्षण करून कायद्यानुसार न्याय देण्याचे कार्य करतात."
        },

        {
            id: Date.now() + 3,
            title: "Hindi General Passage",
            language: "Hindi",
            content:
            "भारत एक लोकतांत्रिक देश है। भारतीय संविधान प्रत्येक नागरिक को मौलिक अधिकार और कर्तव्य प्रदान करता है। कानून का शासन लोकतांत्रिक व्यवस्था का महत्वपूर्ण सिद्धांत है। न्यायालय नागरिकों के अधिकारों की रक्षा करते हैं और कानून के अनुसार न्याय प्रदान करते हैं।"
        }

    ];

    localStorage.setItem(
        "gccAdvancedPassages",
        JSON.stringify(passages)
    );
}


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

function loadPassages() {

    passages = JSON.parse(
        localStorage.getItem("gccAdvancedPassages") || "[]"
    );

    populatePassageSelect();
    displayPassages();

    loadCourtTypingPassages();
}

/* =====================================================
   SAVE PASSAGES
   ===================================================== */

function savePassages() {

    localStorage.setItem(
        "gccAdvancedPassages",
        JSON.stringify(passages)
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

    }
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


/* =====================================================
   START MAIN TYPING
   ===================================================== */

startBtn.addEventListener(
    "click",
    startMainTyping
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

    testStarted = true;

    typingArea.value = "";

    typingArea.disabled = false;

    typingArea.focus();

    startBtn.disabled = true;
    submitBtn.disabled = false;

    document.getElementById(
        "resultBox"
    ).classList.add("hidden");

    updateTimerDisplay();

    timerInterval = setInterval(
        mainTimerTick,
        1000
    );

    updateMainStats();
}


/* =====================================================
   MAIN TIMER
   ===================================================== */

function mainTimerTick() {

    remainingSeconds--;

    updateTimerDisplay();

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


function submitMainTyping() {

    if (!currentPassage) return;

    clearInterval(timerInterval);

    testStarted = false;

    typingArea.disabled = true;

    startBtn.disabled = false;
    submitBtn.disabled = true;

    updateMainStats();

    const typed =
        typingArea.value;

    const target =
        currentPassage.content;

    const stats =
        getCharacterStats(
            typed,
            target
        );

    const total =
        typed.length;

    const accuracy =
        total === 0
            ? 0
            : Math.round(
                stats.correct /
                total * 100
            );


    /* =================================================
       RESULT
       ================================================= */

    const resultBox =
        document.getElementById(
            "resultBox"
        );

    resultBox.classList.remove(
        "hidden"
    );

    document.getElementById(
        "rTotal"
    ).textContent =
        total;

    document.getElementById(
        "rCorrect"
    ).textContent =
        stats.correct;

    document.getElementById(
        "rErrors"
    ).textContent =
        stats.errors;

    document.getElementById(
        "rAccuracy"
    ).textContent =
        accuracy + "%";

    document.getElementById(
        "rGross"
    ).textContent =
        grossWpm.textContent;

    document.getElementById(
        "rNet"
    ).textContent =
        netWpm.textContent;


    /* =================================================
       QUESTION PAPER + ANSWER KEY
       ================================================= */

    const answerSection =
        document.getElementById(
            "answerSection"
        );

    const answerKey =
        document.getElementById(
            "answerKey"
        );

    if (answerSection && answerKey) {

        answerSection.classList.remove(
            "hidden"
        );

        answerKey.innerHTML = `

            <div class="answer-comparison">

                <h3>📄 Question Paper</h3>

                <div class="answer-question">
                    ${escapeHTML(target)}
                </div>


                <h3>
                    🔍 Answer Key / Mistake Comparison
                </h3>

                <div class="answer-instruction">

                    <span class="answer-correct">
                        Correct
                    </span>

                    <span class="answer-wrong">
                        Wrong
                    </span>

                </div>


                <div class="answer-key-text">

                    ${createAnswerKey(
                        typed,
                        target
                    )}

                </div>

            </div>

        `;
    }

}


/* =====================================================
   ANSWER KEY
   ===================================================== */

function createAnswerKey(typed, target) {
    const answerSection = document.getElementById("answerSection");
    const answerKey = document.getElementById("answerKey");

    if (!answerSection || !answerKey) return;

    let correctHTML = "";
    let typedHTML = "";

    const maxLength = Math.max(target.length, typed.length);

    for (let i = 0; i < maxLength; i++) {
        const correctChar = target[i] ?? "";
        const typedChar = typed[i] ?? "";

        // LEFT SIDE - Correct Answer
        if (correctChar) {
            correctHTML += escapeHTML(correctChar);
        }
    }

    // RIGHT SIDE - Typed Answer
    for (let i = 0; i < maxLength; i++) {
        const correctChar = target[i] ?? "";
        const typedChar = typed[i] ?? "";

        if (typedChar === correctChar) {
            typedHTML += escapeHTML(typedChar);
        } else {
            typedHTML += `<span class="answer-wrong">${escapeHTML(typedChar || "␠")}</span>`;
        }
    }

    answerKey.innerHTML = `
        <div class="answer-compare">

            <div class="answer-column">
                <div class="answer-column-title">
                    ✅ Correct Answer
                </div>

                <div class="answer-content">
                    ${correctHTML}
                </div>
            </div>

            <div class="answer-column">
                <div class="answer-column-title">
                    ⌨️ Typed Answer
                </div>

                <div class="answer-content">
                    ${typedHTML}
                </div>
            </div>

        </div>
    `;

    answerSection.classList.remove("hidden");
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


function saveNewPassage() {

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


    const newPassage = {

        id:
            Date.now(),

        title:
            title,

        language:
            lang,

        content:
            content

    };


    passages.push(
        newPassage
    );


    savePassages();


    document.getElementById(
        "passageTitle"
    ).value = "";

    document.getElementById(
        "passageContent"
    ).value = "";


    loadPassages();


    /*
       Saved passage लगेच dropdown मध्ये
       available राहील.
    */

    language.value =
        lang;

    populatePassageSelect();

    passageSelect.value =
        String(newPassage.id);

    loadSelectedPassage();


    alert(
        "✅ Passage successfully saved."
    );
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
            x => x.id === id
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
            x => x.id === id
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
   UPDATE PASSAGE
   ===================================================== */

document.getElementById(
    "updatePassageBtn"
).addEventListener(
    "click",
    function() {

        const p =
            passages.find(
                x => x.id === editingId
            );

        if (!p) return;


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


        p.language =
            document.getElementById(
                "adminLanguage"
            ).value;

        p.title =
            title;

        p.content =
            content;


        savePassages();

        cancelEdit();

        loadPassages();


        alert(
            "✅ Passage updated."
        );

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
   DELETE PASSAGE
   ===================================================== */

function deletePassage(id) {

    if (
        !confirm(
            "हा passage delete करायचा आहे का?"
        )
    ) return;


    passages =
        passages.filter(
            p => p.id !== id
        );


    savePassages();

    loadPassages();
}
/* =====================================================
   COURT STATS
   ===================================================== */

function updateCourtStats(court) {

    const data = courtData[court];

    if (!data.current) return;

    const typing =
        document.getElementById(
            court === "district"
                ? "districtTyping"
                : "highTyping"
        );

    if (!typing) return;

    const typed = typing.value;

    const target = data.current.content;

    const stats =
        getCharacterStats(
            typed,
            target
        );

    /*
     * Calculate actual elapsed time
     * using test start timestamp.
     */
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

    /*
     * Standard typing calculation:
     * 5 characters = 1 word
     */
    const gross =
        Math.round(
            typed.length /
            5 /
            minutes
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

    const prefix =
        court === "district"
            ? "district"
            : "high";

    const grossElement =
        document.getElementById(
            prefix + "Gross"
        );

    const netElement =
        document.getElementById(
            prefix + "Net"
        );

    const accuracyElement =
        document.getElementById(
            prefix + "Accuracy"
        );

    const errorsElement =
        document.getElementById(
            prefix + "Errors"
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

    updateCourtMirror(court);
}
/* =====================================================
   COURT MIRROR
   ===================================================== */

function updateCourtMirror(court) {

    const typing =
        document.getElementById(
            court === "district"
                ? "districtTyping"
                : "highTyping"
        );


    const mirror =
        document.getElementById(
            court === "district"
                ? "districtMirror"
                : "highMirror"
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

    const data = courtData[court];

    if (!data) {
        console.error("Court data not found:", court);
        return;
    }

    if (!data.current) {
        alert("Please select a passage first.");
        return;
    }

    const typing =
        document.getElementById(
            court === "district"
                ? "districtTyping"
                : "highTyping"
        );

    if (!typing) {
        console.error("Typing area not found:", court);
        return;
    }

    // Clear previous typing
    typing.value = "";

    // Enable typing area
    typing.disabled = false;
    typing.focus();

    // Start test
    data.testStarted = true;
data.startTime = Date.now();

    // Get selected time
    const timeSelect =
        document.getElementById(
            court === "district"
                ? "districtTime"
                : "highTime"
        );

    let minutes = 5;

    if (timeSelect && timeSelect.value) {
        minutes = Number(timeSelect.value) || 5;
    }

    data.remaining = minutes * 60;

    // Stop previous timer
    if (data.timer) {
        clearInterval(data.timer);
    }

    data.timer = setInterval(function () {

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
            Math.floor(data.remaining / 60);

        const secondsLeft =
            data.remaining % 60;

        const timeText =
            String(minutesLeft).padStart(2, "0") +
            ":" +
            String(secondsLeft).padStart(2, "0");

        const timerElement =
            document.getElementById(
                court === "district"
                    ? "districtTimer"
                    : "highTimer"
            );

        if (timerElement) {
            timerElement.textContent = timeText;
        }

    }, 1000);

    // Initial timer display
    const timerElement =
        document.getElementById(
            court === "district"
                ? "districtTimer"
                : "highTimer"
        );

    if (timerElement) {
        timerElement.textContent =
            String(minutes).padStart(2, "0") + ":00";
    }

    console.log(
        court.toUpperCase() +
        " Court Typing Test Started"
    );
}

function submitCourtTyping(court) {

    const data =
        courtData[court];

    if (!data.current) return;

    clearInterval(data.timer);

    data.started = false;

    const typing =
        document.getElementById(
            court === "district"
                ? "districtTyping"
                : "highTyping"
        );

    typing.disabled = true;

    document.getElementById(
        court === "district"
            ? "districtSubmit"
            : "highSubmit"
    ).disabled = true;

    updateCourtStats(court);

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
                typed.length * 100
            )
            : 0;

    const prefix =
        court === "district"
            ? "district"
            : "high";

    const result =
        document.getElementById(
            prefix + "TypingResult"
        );

    result.classList.remove(
        "hidden"
    );

    result.innerHTML = `

        <h4>📊 ${court === "district"
            ? "District Court"
            : "High Court"} Typing Result</h4>

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

    const highKey =
        "gccHighCourtSteno";


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


    const highPassages = [
        {
            id: Date.now() + 201,
            title: "High Court Steno - 60 WPM",
            speed: 60,
            audio: "",
            text:
                "The High Court exercises jurisdiction according to the Constitution and the laws applicable within its jurisdiction."
        },
        {
            id: Date.now() + 202,
            title: "High Court Steno - 80 WPM",
            speed: 80,
            audio: "",
            text:
                "The High Court has an important responsibility to protect fundamental rights and ensure justice according to law."
        },
        {
            id: Date.now() + 203,
            title: "High Court Steno - 100 WPM",
            speed: 100,
            audio: "",
            text:
                "Justice must be administered fairly and efficiently. Courts are responsible for interpreting laws and protecting legal rights."
        },
        {
            id: Date.now() + 204,
            title: "High Court Steno - 120 WPM",
            speed: 120,
            audio: "",
            text:
                "The administration of justice requires fairness, independence and adherence to constitutional principles and established legal procedures."
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


    if (!hasPassages(highKey)) {

        localStorage.setItem(
            highKey,
            JSON.stringify(
                highPassages
            )
        );
    }

}

function getCourtStenoPassages(court) {

    const key =
        court === "district"
            ? "gccDistrictCourtSteno"
            : "gccHighCourtSteno";

    let data =
        JSON.parse(
            localStorage.getItem(key)
            || "null"
        );

    if (!data) {

        data = [];

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );
    }

    return data;
}

function loadCourtStenoLists() {

    ["district", "high"].forEach(function(court) {

        const data =
            getCourtStenoPassages(court);

        courtStenoData[court].passages =
            data;

        const select =
            document.getElementById(
                court === "district"
                    ? "districtStenoPassage"
                    : "highStenoPassage"
            );

        const speedSelect =
            document.getElementById(
                court === "district"
                    ? "districtStenoSpeed"
                    : "highStenoSpeed"
            );

        if (!select) return;

        function fillPassages() {

            select.innerHTML =
                '<option value="">Select Passage</option>';

            const selectedSpeed =
                speedSelect
                    ? Number(speedSelect.value)
                    : 60;

            data
                .filter(function(passage) {

                    return Number(passage.speed) ===
                           selectedSpeed;

                })
                .forEach(function(passage) {

                    const option =
                        document.createElement("option");

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

                    courtStenoData[court]
                        .current = null;

                    const audio =
                        document.getElementById(
                            court === "district"
                                ? "districtStenoAudio"
                                : "highStenoAudio"
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
                            court === "district"
                                ? "districtStenoStatus"
                                : "highStenoStatus"
                        );

                    if (status) {

                        status.textContent =
                            "Select passage.";
                    }

                    const transSection =
                        document.getElementById(
                            court === "district"
                                ? "districtStenoTransSection"
                                : "highStenoTransSection"
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
                    data.find(
                        function(passage) {

                            return String(
                                passage.id
                            ) ===
                            String(
                                select.value
                            );

                        }
                    );

                courtStenoData[court]
                    .current =
                    selected || null;

                if (selected) {

                    const audio =
                        document.getElementById(
                            court === "district"
                                ? "districtStenoAudio"
                                : "highStenoAudio"
                        );

                    if (audio) {

                        audio.src =
                            selected.audio;

                        audio.load();

                        audio.onended =
                            function() {

                                openCourtStenoTranscription(
                                    court
                                );

                            };
                    }

                    const status =
                        document.getElementById(
                            court === "district"
                                ? "districtStenoStatus"
                                : "highStenoStatus"
                        );

                    if (status) {

                        status.textContent =
                            "Audio loaded. Audio पूर्ण झाल्यावर transcription section उघडेल.";
                    }
                }
            };

        });

    displayCourtStenoAdminLists();
}

/* =====================================================
   OPEN COURT STENO TRANSCRIPTION
   ===================================================== */

function openCourtStenoTranscription(court) {

    const section =
        document.getElementById(
            court === "district"
                ? "districtStenoTransSection"
                : "highStenoTransSection"
        );

    section.classList.remove(
        "hidden"
    );

    const text =
        document.getElementById(
            court === "district"
                ? "districtStenoText"
                : "highStenoText"
        );

    text.focus();

    startCourtSteno(court);
}


/* =====================================================
   START COURT STENO
   ===================================================== */

function startCourtSteno(court) {

    const data =
        courtStenoData[court];

    if (!data.current) {

        alert("Steno passage select करा.");

        return;
    }

    clearInterval(data.timer);

    data.remaining =
        55 * 60;

    updateCourtStenoTimer(court);

    document.getElementById(
        court === "district"
            ? "districtStenoText"
            : "highStenoText"
    ).disabled = false;

    document.getElementById(
        court === "district"
            ? "districtStenoSubmit"
            : "highStenoSubmit"
    ).disabled = false;

    data.timer =
        setInterval(
            () => {

                data.remaining--;

                updateCourtStenoTimer(
                    court
                );

                if (
                    data.remaining <= 0
                ) {

                    clearInterval(
                        data.timer
                    );

                    submitCourtSteno(
                        court
                    );
                }

            },
            1000
        );

    document.getElementById(
        court === "district"
            ? "districtStenoText"
            : "highStenoText"
    ).focus();
}


/* =====================================================
   COURT STENO TIMER
   ===================================================== */

function updateCourtStenoTimer(court) {

    const seconds =
        courtStenoData[court]
            .remaining;

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

    document.getElementById(
        court === "district"
            ? "districtStenoTimer"
            : "highStenoTimer"
    ).textContent =
        `${min}:${sec}`;
}


/* =====================================================
   SUBMIT COURT STENO
   ===================================================== */


function submitCourtSteno(court) {

    console.log("SUBMIT CLICKED:", court);

    const data =
        courtStenoData[court];

    if (!data.current) return;

    clearInterval(data.timer);

    const typed =
        document.getElementById(
            court === "district"
                ? "districtStenoText"
                : "highStenoText"
        ).value;

    const reference =
        data.current.text;

    const result =
        compareSteno(
            reference,
            typed
        );

    document.getElementById(
        court === "district"
            ? "districtStenoText"
            : "highStenoText"
    ).disabled = true;

    document.getElementById(
        court === "district"
            ? "districtStenoSubmit"
            : "highStenoSubmit"
    ).disabled = true;

    const resultBox =
        document.getElementById(
            court === "district"
                ? "districtStenoResult"
                : "highStenoResult"
        );

    resultBox.classList.remove(
        "hidden"
    );

    resultBox.innerHTML = `

        <h4>📊 Steno Result</h4>

        <div class="court-result-grid">

            <div class="court-result-card">
                Total Words
                <b>${result.total}</b>
            </div>

            <div class="court-result-card">
                Correct Words
                <b>${result.correct}</b>
            </div>

            <div class="court-result-card">
                Errors
                <b>${result.errors}</b>
            </div>

            <div class="court-result-card">
                Accuracy
                <b>${result.accuracy}%</b>
            </div>

        </div>

        <hr>

        <div>
            ${result.html}
        </div>
    `;
}


/* =====================================================
   STENO COMPARE
   ===================================================== */

function compareSteno(
    reference,
    typed
) {

    const referenceWords =
        normalizeWords(
            reference
        );

    const typedWords =
        normalizeWords(
            typed
        );

    const total =
        referenceWords.length;

    let correct = 0;

    let html = "";

    const max =
        Math.max(
            referenceWords.length,
            typedWords.length
        );

    for (
        let i = 0;
        i < max;
        i++
    ) {

        const expected =
            referenceWords[i] || "";

        const actual =
            typedWords[i] || "";

        if (
            expected.toLowerCase() ===
            actual.toLowerCase()
        ) {

            correct++;

            html +=
                `<span class="court-correct">${escapeHTML(actual)}</span>`;

        } else {

            html +=
                `<span class="court-wrong" title="Correct: ${escapeHTML(expected)}">${escapeHTML(actual || "[Missing]")}</span>`;
        }
    }

    const errors =
        Math.max(
            total - correct,
            0
        );

    const accuracy =
        total
            ? Math.round(
                correct /
                total * 100
            )
            : 0;

    return {
        total,
        correct,
        errors,
        accuracy,
        html
    };
}


function normalizeWords(text) {

    return text
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .filter(Boolean);
}


/* =====================================================
   MAIN STENO
   ===================================================== */

let stenoPassages =
    JSON.parse(
        localStorage.getItem(
            "gccStenoPassages"
        ) || "[]"
    );

let currentSteno = null;
let stenoTimer = null;
let stenoRemaining = 55 * 60;


/* =====================================================
   STENO SELECT
   ===================================================== */

const stenoPassageSelect =
    document.getElementById(
        "stenoPassageSelect"
    );

function loadStenoPassages() {

    stenoPassages =
        JSON.parse(
            localStorage.getItem(
                "gccStenoPassages"
            ) || "[]"
        );

    stenoPassageSelect.innerHTML =
        '<option value="">Select Passage</option>';

    stenoPassages.forEach(p => {

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

    });

    displayStenoPassages();
}


stenoPassageSelect.addEventListener(
    "change",
    function() {

        currentSteno =
            stenoPassages.find(
                p =>
                String(p.id) ===
                String(this.value)
            );

        if (!currentSteno) return;

        const audio =
            document.getElementById(
                "stenoAudio"
            );

        audio.src =
            currentSteno.audio;

        document.getElementById(
            "audioStatus"
        ).textContent =
            "Audio loaded. Audio पूर्ण झाल्यावर transcription automatically सुरू होईल.";

        audio.onended =
            () => {

                document.getElementById(
                    "transcriptionSection"
                ).classList.remove(
                    "hidden"
                );

                startMainSteno();
            };
    }
);


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

document.getElementById(
    "submitTranscriptionBtn"
).addEventListener(
    "click",
    submitMainSteno
);


function submitMainSteno() {

    if (!currentSteno) return;

    clearInterval(stenoTimer);

    const typed =
        document.getElementById(
            "stenoTranscription"
        ).value;

    const result =
        compareSteno(
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
        "stenoErrors"
    ).textContent =
        result.errors;

    document.getElementById(
        "stenoAccuracy"
    ).textContent =
        result.accuracy + "%";

    document.getElementById(
        "stenoErrorDisplay"
    ).innerHTML =
        result.html;
}


/* =====================================================
/* =====================================================
   SAVE MAIN STENO
   ===================================================== */

document.getElementById(
    "saveStenoPassageBtn"
).addEventListener(
    "click",
    saveStenoPassage
);

function saveStenoPassage() {

    const title =
        document.getElementById(
            "stenoTitle"
        ).value.trim();

    const speed =
        document.getElementById(
            "stenoAdminSpeed"
        ).value;

    const reference =
        document.getElementById(
            "stenoReferenceText"
        ).value.trim();

    const file =
        document.getElementById(
            "stenoAudioFile"
        ).files[0];

    if (
        !title ||
        !reference ||
        !file
    ) {

        alert(
            "Title, Audio आणि Reference Text भरा."
        );

        return;
    }

    const reader =
        new FileReader();

    reader.onload =
        function () {

            stenoPassages.push({

                id: Date.now(),

                title: title,

                speed: speed,

                audio: reader.result,

                reference: reference

            });

            localStorage.setItem(
                "gccStenoPassages",
                JSON.stringify(
                    stenoPassages
                )
            );

            document.getElementById(
                "stenoTitle"
            ).value = "";

            document.getElementById(
                "stenoReferenceText"
            ).value = "";

            document.getElementById(
                "stenoAudioFile"
            ).value = "";

            loadStenoPassages();

            alert(
                "✅ Steno passage saved."
            );

        };

    reader.readAsDataURL(file);
}


/* =====================================================
   SAVE COURT STENO
   SERVER AUDIO UPLOAD
   ===================================================== */

async function saveCourtStenoPassage(court) {

    const prefix =
        court === "district"
            ? "districtSteno"
            : "highSteno";

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

    if (
        !titleElement ||
        !speedElement ||
        !referenceElement ||
        !fileElement
    ) {

        alert(
            "❌ Court Steno form elements सापडले नाहीत."
        );

        return;
    }

    const title =
        titleElement.value.trim();

    const speed =
        Number(speedElement.value);

    const reference =
        referenceElement.value.trim();

    const file =
        fileElement.files[0];

    if (!title || !reference) {

        alert(
            "❌ Passage Title आणि Reference Text भरा."
        );

        return;
    }

    const editing =
        window.editingCourtSteno;

    // ==========================================
    // EDIT EXISTING PASSAGE
    // ==========================================

    if (
        editing &&
        editing.court === court
    ) {

        const key =
            court === "district"
                ? "gccDistrictCourtSteno"
                : "gccHighCourtSteno";

        let passages = [];

        try {

            passages =
                JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

            if (!Array.isArray(passages)) {
                passages = [];
            }

        } catch (error) {

            alert(
                "❌ Passage data read failed."
            );

            return;
        }

        const index =
            passages.findIndex(function(passage) {

                return String(passage.id) ===
                       String(editing.id);

            });

        if (index === -1) {

            alert(
                "❌ Editing passage सापडला नाही."
            );

            return;
        }

        passages[index].title =
            title;

        passages[index].speed =
            speed;

        passages[index].text =
            reference;

        // नवीन Audio दिला असेल तरच update करा
        if (file) {

            const formData =
                new FormData();

            formData.append(
                "court",
                court
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

            try {

                const response =
                    await fetch(
                        "/api/court-steno/upload",
                        {
                            method: "POST",
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
                        "❌ New Audio upload failed."
                    );

                    return;
                }

                passages[index].audio =
                    data.passage.audio;

            } catch (error) {

                console.error(
                    "Edit Audio Error:",
                    error
                );

                alert(
                    "❌ Audio server connection failed."
                );

                return;
            }
        }

        localStorage.setItem(
            key,
            JSON.stringify(passages)
        );

        window.editingCourtSteno =
            null;

        titleElement.value = "";
        referenceElement.value = "";
        fileElement.value = "";

        loadCourtStenoLists();

        displayCourtStenoAdminLists();

        alert(
            "✅ Court Steno Passage Successfully Updated!"
        );

        return;
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

    const formData =
        new FormData();

    formData.append(
        "court",
        court
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

    try {

        alert(
            "⏳ Audio server वर upload होत आहे..."
        );

        const response =
            await fetch(
                "/api/court-steno/upload",
                {
                    method: "POST",
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

        const key =
            court === "district"
                ? "gccDistrictCourtSteno"
                : "gccHighCourtSteno";

        let passages = [];

        try {

            passages =
                JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

            if (!Array.isArray(passages)) {
                passages = [];
            }

        } catch (error) {

            passages = [];
        }

        const newPassage = {

            id: Date.now(),

            title:
                data.passage.title,

            speed:
                Number(
                    data.passage.speed
                ),

            audio:
                data.passage.audio,

            text:
                data.passage.text
        };

        passages.push(
            newPassage
        );

        localStorage.setItem(
            key,
            JSON.stringify(passages)
        );

        titleElement.value = "";
        referenceElement.value = "";
        fileElement.value = "";

        loadCourtStenoLists();

        displayCourtStenoAdminLists();

        alert(
            "✅ Court Steno Passage आणि Audio Successfully Saved!"
        );

    } catch (error) {

        console.error(
            "Court Steno Upload Error:",
            error
        );

        alert(
            "❌ Server connection failed."
        );
    }
}
/* =====================================================
   DISPLAY MAIN STENO
   ===================================================== */
function displayStenoPassages() {

    const box =
        document.getElementById(
            "stenoPassageList"
        );

    box.innerHTML = "";

    stenoPassages.forEach(p => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "steno-item";

        div.innerHTML = `

            <strong>
                ${escapeHTML(p.title)}
            </strong>

            <small>
                Speed: ${p.speed} WPM
            </small>

            <button onclick="useSteno(${p.id})">
                Use
            </button>

            <button onclick="deleteSteno(${p.id})">
                Delete
            </button>
        `;

        box.appendChild(div);

    });
}


/* =====================================================
   USE STENO
   ===================================================== */

function useSteno(id) {

    stenoPassageSelect.value =
        id;

    stenoPassageSelect.dispatchEvent(
        new Event("change")
    );

    showSection(
        "stenoSection"
    );
}


/* =====================================================
   DELETE STENO
   ===================================================== */

function deleteSteno(id) {

    if (
        !confirm(
            "हा steno passage delete करायचा आहे का?"
        )
    ) return;

    stenoPassages =
        stenoPassages.filter(
            p => p.id !== id
        );

    localStorage.setItem(
        "gccStenoPassages",
        JSON.stringify(
            stenoPassages
        )
    );

    loadStenoPassages();
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
        user.plan !== "Yearly"
    ) {

        alert(
            "🔒 ही Premium सुविधा आहे. कृपया Premium Plan घ्या."
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

async function loginUser() {

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
        latestUser.plan !== "Free" &&
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

    // Database + expiry दोन्ही तपासले
    latestUser.active =
        subscriptionActive;

    // Latest subscription data LocalStorage मध्ये save करा
    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(latestUser)
    );

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
                        <span>⭐ Monthly ₹299</span>
                        <span>👑 Yearly ₹1,999</span>
                    </div>

                    <div class="premium-lock-buttons">

                        <button
                            class="premium-subscribe-btn"
                            onclick="subscribePlan('Monthly')">
                            ⭐ Subscribe Monthly ₹299
                        </button>

                        <button
                            class="premium-subscribe-btn"
                            onclick="subscribePlan('Yearly')">
                            👑 Subscribe Yearly ₹1,999
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

let adminUsersData = [];

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

        // Revenue from active/paid plans
        if (user.plan === "Monthly") {
            totalRevenue += 299;
        }

        if (user.plan === "Yearly") {
            totalRevenue += 1999;
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

    const highSelect =
        document.getElementById("highPassage");


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

    fillSelect(highSelect);
}


/* =====================================================
   COURT PASSAGE CHANGE
===================================================== */

function setupCourtPassageEvents() {

    const districtSelect =
        document.getElementById("districtPassage");

    const highSelect =
        document.getElementById("highPassage");


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


    if (highSelect) {

        highSelect.addEventListener(
            "change",
            function() {

                const selected =
                    passages.find(
                        p =>
                        String(p.id) ===
                        String(this.value)
                    );

                if (typeof courtData !== "undefined") {

                    courtData.high.current =
                        selected || null;
                }

                const question =
                    document.getElementById(
                        "highQuestion"
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
// DELETE COURT STENO PASSAGE
// ==========================================

function deleteCourtStenoPassage(court, passageId) {

    const key =
        court === "district"
            ? "gccDistrictCourtSteno"
            : "gccHighCourtSteno";

    if (!confirm("हा Steno Passage delete करायचा आहे का?")) {
        return;
    }

    let passages = [];

    try {

        passages = JSON.parse(
            localStorage.getItem(key) || "[]"
        );

        if (!Array.isArray(passages)) {
            passages = [];
        }

    } catch (error) {

        console.error(
            "Steno Passage Read Error:",
            error
        );

        return;
    }

    passages = passages.filter(function(passage) {

        return String(passage.id) !==
               String(passageId);

    });

    localStorage.setItem(
        key,
        JSON.stringify(passages)
    );

    // Dropdown पुन्हा load करा
   
loadCourtStenoLists();

displayCourtStenoAdminLists();

loadPassages();

    alert("✅ Steno Passage Successfully Deleted!");
}

// ==========================================
// DISPLAY COURT STENO ADMIN PASSAGES
// ==========================================

function displayCourtStenoAdminLists() {

    ["district", "high"].forEach(function(court) {

        const key =
            court === "district"
                ? "gccDistrictCourtSteno"
                : "gccHighCourtSteno";

        const container =
            document.getElementById(
                court === "district"
                    ? "districtStenoAdminList"
                    : "highStenoAdminList"
            );

        if (!container) return;

        let passages = [];

        try {

            passages = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            if (!Array.isArray(passages)) {
                passages = [];
            }

        } catch (error) {

            passages = [];
        }

        if (passages.length === 0) {

            container.innerHTML =
                "<p>No Steno passages available.</p>";

            return;
        }

        let html = `
            <h4>📋 Saved Steno Passages</h4>

            <div class="court-steno-admin-list-table">
        `;

        passages.forEach(function(passage) {

            html += `
                <div class="court-steno-admin-item">

                    <div class="steno-admin-info">

                        <strong>
                            ${escapeHTML(
                                passage.title || "Untitled"
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
                                '${court}',
                                '${passage.id}'
                            )">
                            🎧 Preview
                        </button>

                        <button
                            type="button"
                            class="steno-edit-btn"
                            onclick="editCourtStenoPassage(
                                '${court}',
                                '${passage.id}'
                            )">
                            ✏️ Edit
                        </button>

                        <button
                            type="button"
                            class="steno-delete-btn"
                            onclick="deleteCourtStenoPassage(
                                '${court}',
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

        container.innerHTML = html;
    });
}

function editCourtStenoPassage(court, passageId) {

    const key =
        court === "district"
            ? "gccDistrictCourtSteno"
            : "gccHighCourtSteno";

    let passages = [];

    try {

        passages = JSON.parse(
            localStorage.getItem(key) || "[]"
        );

        if (!Array.isArray(passages)) {
            passages = [];
        }

    } catch (error) {

        alert("❌ Passage data read failed.");
        return;
    }

    const passage =
        passages.find(function(p) {

            return String(p.id) ===
                   String(passageId);

        });

    if (!passage) {

        alert("❌ Passage सापडला नाही.");
        return;
    }

    const prefix =
        court === "district"
            ? "districtSteno"
            : "highSteno";

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

    if (titleElement) {

        titleElement.value =
            passage.title || "";
    }

    if (speedElement) {

        speedElement.value =
            passage.speed || 60;
    }

    if (referenceElement) {

        referenceElement.value =
            passage.text || "";
    }

    // Editing passage ID store करा
    window.editingCourtSteno = {
        court: court,
        id: passageId
    };

    alert(
        "✏️ Passage Edit Mode मध्ये आला आहे.\n\n" +
        "Title / Speed / Reference Text बदलून Save करा."
    );
}