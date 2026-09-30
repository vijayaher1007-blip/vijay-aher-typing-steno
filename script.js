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

    const data =
        courtData[court];

    if (!data.current) return;


    const typing =
        document.getElementById(
            court === "district"
                ? "districtTyping"
                : "highTyping"
        );


    const typed =
        typing.value;

    const target =
        data.current.content;


    const stats =
        getCharacterStats(
            typed,
            target
        );


    const duration =
        Number(
            document.getElementById(
                court === "district"
                    ? "districtDuration"
                    : "highDuration"
            ).value
        );


    const elapsed =
        Math.max(
            1,
            duration * 60 -
            data.remaining
        );


    const minutes =
        elapsed / 60;


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
                stats.errors /
                5 /
                minutes
            )
        );


    const prefix =
        court === "district"
            ? "district"
            : "high";


    document.getElementById(
        prefix + "Gross"
    ).textContent =
        isFinite(gross)
            ? gross
            : 0;


    document.getElementById(
        prefix + "Net"
    ).textContent =
        isFinite(net)
            ? net
            : 0;


    document.getElementById(
        prefix + "Accuracy"
    ).textContent =
        accuracy + "%";


    document.getElementById(
        prefix + "Errors"
    ).textContent =
        stats.errors;


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

    ["district", "high"]
        .forEach(court => {

            const data =
                getCourtStenoPassages(
                    court
                );

            courtStenoData[court]
                .passages = data;

            const select =
                document.getElementById(
                    court === "district"
                        ? "districtStenoPassage"
                        : "highStenoPassage"
                );

            select.innerHTML =
                '<option value="">Select Passage</option>';

            data.forEach(p => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    p.id;

                option.textContent =
                    `${p.title} (${p.speed} WPM)`;

                select.appendChild(
                    option
                );

            });

            select.onchange =
                () => {

                    const selected =
                        data.find(
                            p =>
                            String(p.id) ===
                            String(select.value)
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

                        audio.src =
                            selected.audio;

                        document.getElementById(
                            court === "district"
                                ? "districtStenoStatus"
                                : "highStenoStatus"
                        ).textContent =
                            "Audio loaded. Audio पूर्ण झाल्यावर transcription section उघडेल.";

                        audio.onended =
                            () => openCourtStenoTranscription(
                                court
                            );
                    }
                };

        });
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
        data.current.reference;

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
        function() {

            stenoPassages.push({

                id: Date.now(),

                title,

                speed,

                audio:
                    reader.result,

                reference

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
                "Steno passage saved."
            );
        };

    reader.readAsDataURL(file);
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

loadPassages();

loadStenoPassages();

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

        const response =
            await fetch(
                /api/register
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        message.textContent =
            data.message;


        if (response.ok) {

            document.getElementById(
                "registerName"
            ).value = "";

            document.getElementById(
                "registerEmail"
            ).value = "";

            document.getElementById(
                "registerPassword"
            ).value = "";

            document.getElementById(
                "registerConfirmPassword"
            ).value = "";

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
   PREMIUM SECTION LOCK
   ===================================================== */

function openPremiumSection(sectionId) {

    const user = getCurrentUser();


    if (!user) {

        alert(
            "🔐 ही सुविधा वापरण्यासाठी Login करा."
        );

        showLogin();

        return;
    }


    if (!isSubscriptionActive(user)) {

        alert(
            "🔒 तुमची subscription expired आहे."
        );

        showDashboard();

        return;
    }


    if (user.plan === "Free") {

        alert(
            "🔒 ही Premium सुविधा आहे. कृपया Premium Plan घ्या."
        );

        showDashboard();

        return;
    }


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
            await fetch(
                /api/login
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


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

function showDashboard() {

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

        dashboardBox.classList.add("hidden");

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


    if (plan)
        plan.textContent = user.plan || "Free";

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
        alert("⚠️ कृपया आधी Login करा.");
        showLogin();
        return;
    }

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

        if (!response.ok || !data.success) {
            alert("❌ Order तयार करता आला नाही.");
            return;
        }

        const user = JSON.parse(userData);

        const options = {
            key: data.key,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "VIJAY AHER",
            description: plan + " Subscription",
            order_id: data.order.id,

            prefill: {
                name: user.name || "",
                email: user.email || ""
            },

            theme: {
                color: "#0d6efd"
            },

           handler: async function (response) {
    try {
        const userData =
            localStorage.getItem("loggedInUser");

        const user =
            JSON.parse(userData);

        const verifyResponse =
            await fetch("/api/verify-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    razorpay_order_id:
                        response.razorpay_order_id,

                    razorpay_payment_id:
                        response.razorpay_payment_id,

                    razorpay_signature:
                        response.razorpay_signature,

                    user_id: user.id,

                    plan: plan
                })
            });

        const verifyData =
            await verifyResponse.json();

        if (!verifyResponse.ok ||
            !verifyData.success) {

            alert(
                "❌ Payment verification failed.\n" +
                verifyData.message
            );

            return;
        }

        alert(
            "🎉 Payment Successful!\n\n" +
            "Plan: " + verifyData.plan +
            "\nSubscription Activated!"
        );

        user.plan =
            verifyData.plan;

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );

        showDashboard();

    } catch (error) {

        console.error(
            "Verification Error:",
            error
        );

        alert(
            "❌ Payment verification error."
        );
    }
},
            modal: {
                ondismiss: function () {
                    console.log("Payment window closed.");
                }
            }
        };

        const rzp = new Razorpay(options);

        rzp.on("payment.failed", function (response) {
            console.error("Payment Failed:", response.error);

            alert(
                "❌ Payment Failed.\n" +
                response.error.description
            );
        });

        rzp.open();

    } catch (error) {
        console.error("Payment Error:", error);

        alert(
            "❌ Payment सुरू करता आले नाही."
        );
    }
}
