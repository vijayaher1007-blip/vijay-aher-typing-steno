const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Razorpay = require("razorpay");

// =====================================================
// AUTH TOKEN VERIFICATION
// =====================================================

function verifyAuthToken(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization || "";

        if (
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        const token =
            authHeader.substring(7);


        const parts =
            token.split(".");


        if (parts.length !== 2) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authentication token."

            });

        }


        const tokenPayload =
            parts[0];

        const receivedSignature =
            parts[1];


        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.AUTH_SECRET
                )
                .update(tokenPayload)
                .digest("hex");


        if (
            receivedSignature !==
            expectedSignature
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authentication token."

            });

        }


        const userData =
            JSON.parse(
                Buffer.from(
                    tokenPayload,
                    "base64"
                ).toString("utf8")
            );


        if (!userData.id) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid user information."

            });

        }


        req.authUser =
            userData;


        next();


    } catch (error) {

        console.error(
            "AUTH TOKEN ERROR:",
            error
        );


        return res.status(401).json({

            success: false,

            message:
                "Authentication failed."

        });

    }

}

// =====================================================
// ADMIN ONLY AUTHORIZATION
// =====================================================

function requireAdmin(req, res, next) {

    if (
        !req.authUser ||
        Number(req.authUser.is_admin) !== 1
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Admin access required."

        });

    }

    next();

}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// COURT STENO AUDIO UPLOAD
// ==========================================

const uploadDir =
    path.join(
        __dirname,
        "uploads",
        "court-steno"
    );

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(
        uploadDir,
        {
            recursive: true
        }
    );

}

const storage =
    multer.diskStorage({

        destination:
            function (req, file, cb) {

                cb(
                    null,
                    uploadDir
                );

            },

        filename:
            function (req, file, cb) {

                const ext =
                    path.extname(
                        file.originalname
                    );

                const filename =
                    "court-steno-" +
                    Date.now() +
                    ext;

                cb(
                    null,
                    filename
                );

            }

    });

const uploadCourtSteno =
    multer({

        storage: storage,

        limits: {
            fileSize:
                100 * 1024 * 1024
        },

    });

// ==========================================
// MAIN STENO DICTATION AUDIO UPLOAD
// ==========================================

const mainStenoUploadDir =
    path.join(
        __dirname,
        "uploads",
        "steno"
    );

if (!fs.existsSync(mainStenoUploadDir)) {

    fs.mkdirSync(
        mainStenoUploadDir,
        {
            recursive: true
        }
    );

}

const mainStenoStorage =
    multer.diskStorage({

        destination:
            function (req, file, cb) {

                cb(
                    null,
                    mainStenoUploadDir
                );

            },

        filename:
            function (req, file, cb) {

                const ext =
                    path.extname(
                        file.originalname
                    );

                const filename =
                    "steno-" +
                    Date.now() +
                    ext;

                cb(
                    null,
                    filename
                );

            }

    });

const uploadMainSteno =
    multer({

        storage:
            mainStenoStorage,

        limits: {
            fileSize:
                100 * 1024 * 1024
        }

    });


// Website folder

const websitePath =
    __dirname;


// Uploaded audio serve करा

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


// Website serve करा

app.use(
    express.static(
        websitePath
    )
);
app.get("/api/court-steno/test", (req, res) => {
    res.json({
        success: true,
        message: "COURT STENO ROUTE OK"
    });
});
   
// =====================================================
// DELETE COURT STENO PASSAGE
// =====================================================

app.delete(
    "/api/court-steno/passages/:id",
    (req, res) => {

        const id =
            Number(req.params.id);

        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid passage ID."

            });

        }

        const sql = `
            DELETE FROM court_steno_passages
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {

                    console.error(
                        "COURT STENO DELETE ERROR:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Court Steno passage delete failed.",

                        error:
                            err.message

                    });

                }

                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Passage not found."

                    });

                }

                res.json({

                    success: true,

                    message:
                        "Court Steno passage deleted successfully."

                });

            }
        );

    }
);
// ==========================================
// DISTRICT COURT STENO AUDIO UPLOAD
// MYSQL + ADMIN SECURITY
// ==========================================

app.post(
    "/api/court-steno/upload",
    verifyAuthToken,
    requireAdmin,
    uploadCourtSteno.single("audio"),
    async (req, res) => {

        try {

            // ==========================================
            // CHECK AUDIO FILE
            // ==========================================

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Audio file is required."
                });
            }


            // ==========================================
            // DISTRICT COURT ONLY
            // ==========================================

            const court = "district";


            // ==========================================
            // GET FORM DATA
            // ==========================================

            const title =
                (req.body.title || "").trim();

            const speed =
                Number(
                    req.body.speed || 0
                );

            const referenceText =
                (
                    req.body.referenceText ||
                    ""
                ).trim();


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!title) {

                return res.status(400).json({
                    success: false,
                    message: "Passage title is required."
                });
            }


            if (
                ![60, 80, 100, 120].includes(speed)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid Steno speed. Use 60, 80, 100 or 120 WPM."
                });
            }


            if (!referenceText) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Reference dictation text is required."
                });
            }


            // ==========================================
            // AUDIO URL
            // ==========================================

            const audioUrl =
                "/uploads/court-steno/" +
                req.file.filename;


            console.log(
                "COURT STENO UPLOAD:",
                {
                    admin:
                        req.authUser?.email,

                    title:
                        title,

                    speed:
                        speed,

                    audio:
                        audioUrl
                }
            );


            // ==========================================
            // INSERT INTO MYSQL
            // ==========================================

            const insertSql = `
                INSERT INTO court_steno_passages
                (
                    court,
                    title,
                    speed,
                    audio,
                    reference_text
                )
                VALUES (?, ?, ?, ?, ?)
            `;


            db.query(
                insertSql,

                [
                    court,
                    title,
                    speed,
                    githubAudioUrl
                    referenceText
                ],

                (dbErr, result) => {

                    if (dbErr) {

                        console.error(
                            "COURT STENO DATABASE INSERT ERROR:",
                            dbErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Court Steno passage database मध्ये save होऊ शकला नाही.",

                            error:
                                dbErr.message
                        });
                    }


                    // ==========================================
                    // SUCCESS
                    // ==========================================

                    console.log(
                        "COURT STENO SAVED:",
                        result.insertId
                    );


                    return res.status(201).json({

                        success: true,

                        message:
                            "District Court Steno passage successfully saved.",

                        passage: {

                            id:
                                result.insertId,

                            court:
                                court,

                            title:
                                title,

                            speed:
                                speed,

                            audio:
                                audioUrl,

                            referenceText:
                                referenceText
                        }
                    });

                }
            );

        } catch (error) {

            console.error(
                "COURT STENO UPLOAD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "District Court Steno upload failed.",

                error:
                    error.message
            });
        }

    }
);

                
app.get(
    "/api/court-steno/passages/:court",
    (req, res) => {

        const court =
            req.params.court;

       if (court !== "district") {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid court."

            });

        }

        const sql = `
            SELECT
                id,
                court,
                title,
                speed,
                audio,
                reference_text,
                created_at,
                updated_at
            FROM court_steno_passages
            WHERE court = ?
            ORDER BY id DESC
        `;

        db.query(
            sql,
            [court],
            (err, results) => {

                if (err) {

                    console.error(
                        "COURT STENO FETCH ERROR:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Court Steno passages load failed.",

                        error:
                            err.message

                    });

                }

                res.json({

                    success: true,

                    passages:
                        results

                });

            }
        );

    }
);

// =====================================================
// MAIN STENO DICTATION - MYSQL API
// =====================================================

// LOAD MAIN STENO PASSAGES
app.get(
    "/api/steno-passages",
    (req, res) => {

        const sql = `
            SELECT
id,
title,
speed,
audio,
reference_text,
hidden,
created_at,
updated_at
FROM steno_passages
            ORDER BY id DESC
        `;
        
        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.error(
                        "MAIN STENO FETCH ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Main Steno passages load failed.",
                        error:
                            err.message
                    });
                }

                return res.json({
                    success: true,
                    passages: results
                });

            }
        );

    }
);


// ADD MAIN STENO PASSAGE
// =====================================================
// MAIN STENO DICTATION - AUDIO UPLOAD + MYSQL
// =====================================================

app.post(
    "/api/steno-passages",
    verifyAuthToken,
    requireAdmin,
    uploadMainSteno.single("audio"),
    async (req, res) => {

        try {

            // ==========================================
            // CHECK AUDIO
            // ==========================================

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Steno audio file is required."
                });

            }


            // ==========================================
            // FORM DATA
            // ==========================================

            const title =
                (req.body.title || "").trim();

            const speed =
                Number(
                    req.body.speed || 0
                );

            const referenceText =
                (
                    req.body.referenceText ||
                    ""
                ).trim();


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!title) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Steno passage title is required."
                });

            }


            if (
                ![60, 80, 100, 120].includes(speed)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid Steno speed."
                });

            }


            if (!referenceText) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Reference dictation text is required."
                });

            }


            // ==========================================
            // AUDIO URL
            // ==========================================

            const audioUrl =
                "/uploads/steno/" +
                req.file.filename;
// ==========================================
// UPLOAD MAIN STENO AUDIO TO GITHUB
// ==========================================

const githubToken =
    process.env.GITHUB_TOKEN;

if (!githubToken) {

    throw new Error(
        "GITHUB_TOKEN is not configured."
    );

}

const audioBuffer =
    fs.readFileSync(
        req.file.path
    );

const githubPath =
    "uploads/steno/" +
    req.file.filename;

const githubResponse =
    await fetch(
        "https://api.github.com/repos/vijayaher1007-blip/vijay-aher-typing-steno/contents/" +
        githubPath,
        {
            method: "PUT",

            headers: {
                "Authorization":
                    "Bearer " + githubToken,

                "Accept":
                    "application/vnd.github+json",

                "X-GitHub-Api-Version":
                    "2022-11-28",

                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({
                    message:
                        "Upload Main Steno audio",

                    content:
                        audioBuffer.toString(
                            "base64"
                        )
                })
        }
    );

if (!githubResponse.ok) {

    const githubError =
        await githubResponse.text();

    throw new Error(
        "GitHub audio upload failed: " +
        githubError
    );

}

const githubAudioUrl =
    "https://raw.githubusercontent.com/" +
    "vijayaher1007-blip/" +
    "vijay-aher-typing-steno/" +
    "refs/heads/main/" +
    githubPath;

console.log(
    "MAIN STENO GITHUB AUDIO:",
    githubAudioUrl
);

            // ==========================================
            // SAVE MYSQL
            // ==========================================

            const sql = `
                INSERT INTO steno_passages
                (
                    title,
                    speed,
                    audio,
                    reference_text
                )
                VALUES (?, ?, ?, ?)
            `;


            db.query(
                sql,
                [
                    title,
                    speed,
                    audioUrl,
                    referenceText
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "MAIN STENO INSERT ERROR:",
                            err
                        );

                        // Delete uploaded file
                        // if database save fails
                        try {

                            fs.unlinkSync(
                                req.file.path
                            );

                        } catch (deleteError) {

                            console.error(
                                "AUDIO CLEANUP ERROR:",
                                deleteError
                            );

                        }


                        return res.status(500).json({
                            success: false,
                            message:
                                "Main Steno passage save failed.",
                            error:
                                err.message
                        });

                    }


                    console.log(
                        "MAIN STENO SAVED:",
                        {
                            id:
                                result.insertId,

                            title:
                                title,

                            speed:
                                speed,

                            audio:
                                audioUrl
                        }
                    );


                    return res.status(201).json({

                        success: true,

                        message:
                            "Main Steno passage successfully saved.",

                        passage: {

                            id:
                                result.insertId,

                            title:
                                title,

                            speed:
                                speed,

                            audio:
                                audioUrl,

                            referenceText:
                                referenceText

                        }

                    });

                }
            );

        } catch (error) {

            console.error(
                "MAIN STENO SAVE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Main Steno save failed.",
                error:
                    error.message
            });

        }

    }
);

// =====================================================
// UPDATE MAIN STENO PASSAGE
// =====================================================

app.put(
    "/api/steno-passages/:id",
    verifyAuthToken,
    requireAdmin,
    (req, res) => {

        const id =
            Number(req.params.id);

        const title =
            (req.body.title || "").trim();

        const speed =
            Number(req.body.speed || 0);

        const referenceText =
            (req.body.referenceText || "").trim();


        if (!id) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Steno passage ID."
            });

        }


        if (
            !title ||
            ![60, 80, 100, 120].includes(speed) ||
            !referenceText
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Title, valid speed and reference text are required."
            });

        }


        const sql = `
            UPDATE steno_passages
            SET
                title = ?,
                speed = ?,
                reference_text = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                title,
                speed,
                referenceText,
                id
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "MAIN STENO UPDATE ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Main Steno passage update failed.",
                        error:
                            err.message
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Main Steno passage not found."
                    });

                }


                return res.json({
                    success: true,
                    message:
                        "Main Steno passage updated successfully."
                });

            }
        );

    }
);

// =====================================================
// HIDE / UNHIDE MAIN STENO PASSAGE
// =====================================================

app.put(
    "/api/steno-passages/:id/visibility",
    verifyAuthToken,
    requireAdmin,
    (req, res) => {

        const id =
            Number(req.params.id);

        const hidden =
            req.body.hidden === true ||
            req.body.hidden === 1;


        if (!id) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Steno passage ID."
            });

        }


        const sql = `
            UPDATE steno_passages
            SET
                hidden = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                hidden ? 1 : 0,
                id
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "MAIN STENO VISIBILITY ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Main Steno visibility update failed.",
                        error:
                            err.message
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Main Steno passage not found."
                    });

                }


                return res.json({
                    success: true,

                    message:
                        hidden
                        ? "Main Steno passage hidden successfully."
                        : "Main Steno passage visible successfully.",

                    hidden:
                        hidden
                });

            }
        );

    }
);

// DELETE MAIN STENO PASSAGE
app.delete(
    "/api/steno-passages/:id",
    verifyAuthToken,
    requireAdmin,
    (req, res) => {

        const id =
            Number(req.params.id);

        if (!id) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Steno passage ID."
            });

        }


        const sql = `
            DELETE FROM steno_passages
            WHERE id = ?
        `;


        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {

                    console.error(
                        "MAIN STENO DELETE ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Main Steno passage delete failed.",
                        error:
                            err.message
                    });

                }


                return res.json({
                    success: true,
                    message:
                        "Main Steno passage deleted."
                });

            }
        );

    }
);

app.get("/test", (req, res) => {
    res.send("SERVER OK");
});

app.get("/", (req, res) => {

    res.sendFile(path.join(websitePath, "index.html"));
});

app.post("/api/register", async (req, res) => {
    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const trialStart =
            new Date();

        const trialExpiry =
            new Date(trialStart);

        trialExpiry.setDate(
            trialExpiry.getDate() + 7
        );

        const sql = `
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                plan,
                subscription_start,
                subscription_expiry
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                name,
                email,
                hashedPassword,
                "Free Trial",
                trialStart,
                trialExpiry
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "REGISTER DATABASE ERROR:",
                        err
                    );

                    if (err.code === "ER_DUP_ENTRY") {

                        return res.status(409).json({
                            message:
                                "Email already registered."
                        });

                    }

                    return res.status(500).json({
                        message:
                            "Database error.",
                        error:
                            err.message,
                        code:
                            err.code
                    });
                }

                res.status(201).json({

                    message:
                        "Registration successful! 7 Days Free Trial started.",

                    userId:
                        result.insertId,

                    plan:
                        "Free Trial",

                    subscription_start:
                        trialStart,

                    subscription_expiry:
                        trialExpiry
                });

            }
        );

    } catch (error) {

        console.error(
            "REGISTER SERVER ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Server error."
        });

    }
});

// =====================================================
// UPDATE COURT STENO PASSAGE
// =====================================================

app.put(
    "/api/court-steno/passages/:id",
    (req, res) => {

        const id =
            Number(req.params.id);

        const title =
            (req.body.title || "").trim();

        const speed =
            Number(req.body.speed || 0);

        const referenceText =
            (req.body.referenceText || "").trim();


        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid passage ID."

            });

        }


        if (
            !title ||
            !speed ||
            !referenceText
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Title, speed and reference text are required."

            });

        }


        const sql = `
            UPDATE court_steno_passages
            SET
                title = ?,
                speed = ?,
                reference_text = ?
            WHERE id = ?
        `;


        db.query(
            sql,

            [
                title,
                speed,
                referenceText,
                id
            ],

            (err, result) => {

                if (err) {

                    console.error(
                        "COURT STENO UPDATE ERROR:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Court Steno passage update failed.",

                        error:
                            err.message

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Passage not found."

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Court Steno passage updated successfully."

                });

            }
        );

    }
);

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], async (err, results) => {
            if (err) {
    console.error("LOGIN DATABASE ERROR:", err);

return res.status(500).json({
    message: "Database error."
});
}

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password."
                });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password."
                });
            }

            const tokenData = {
    id: user.id,
    email: user.email,
    is_admin: Number(user.is_admin) === 1
};

const tokenPayload =
    Buffer.from(
        JSON.stringify(tokenData)
    ).toString("base64");

const signature =
    crypto
        .createHmac(
            "sha256",
            process.env.AUTH_SECRET
        )
        .update(tokenPayload)
        .digest("hex");

const authToken =
    `${tokenPayload}.${signature}`;


res.json({
    message: "Login successful!",

    token: authToken,

    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        is_admin: user.is_admin
    }
});
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// ================================
// RAZORPAY ORDER API
// ================================

app.post("/api/create-order", async (req, res) => {
    try {
        const { plan } = req.body;

        let amount;
        let planName;

        if (plan === "Monthly") {
            amount = 9900; // ₹99 in paise
            planName = "Monthly";
        } 
        else if (plan === "Yearly") {
            amount = 99900; // ₹999 in paise
            planName = "Yearly";
        } 
        else {
            return res.status(400).json({
                message: "Invalid plan."
            });
        }

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                plan: planName
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: order,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Razorpay Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order."
        });
    }
});

// =====================================================
// CLOUD TYPING PASSAGE API
// =====================================================

// GET ALL TYPING PASSAGES
app.get("/api/typing-passages", (req, res) => {

    const sql = `
        SELECT
            id,
            title,
            language,
            content,
            created_at,
            updated_at
        FROM typing_passages
        ORDER BY id ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "TYPING PASSAGES FETCH ERROR:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Typing passages load failed.",
                error: err.message
            });
        }

        res.json({
            success: true,
            passages: results
        });

    });

});


// ADD TYPING PASSAGE
app.post(
    "/api/typing-passages",
    verifyAuthToken,
    requireAdmin,
    (req, res) => {

    const {
        title,
        language,
        content
    } = req.body;

    if (
        !title ||
        !language ||
        !content
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Title, language and content are required."
        });

    }

    const sql = `
        INSERT INTO typing_passages
        (
            title,
            language,
            content
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            language,
            content
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "TYPING PASSAGE ADD ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Typing passage could not be saved.",
                    error:
                        err.message
                });

            }

            res.status(201).json({

                success: true,

                message:
                    "Typing passage saved successfully.",

                passageId:
                    result.insertId

            });

        }
    );

});


// UPDATE TYPING PASSAGE
app.put(
    "/api/typing-passages/:id",
    verifyAuthToken,
    requireAdmin,
    (req, res) => {

    const id =
        Number(req.params.id);

    const {
        title,
        language,
        content
    } = req.body;

    if (!id) {

        return res.status(400).json({
            success: false,
            message: "Valid passage ID is required."
        });

    }

    if (
        !title ||
        !language ||
        !content
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Title, language and content are required."
        });

    }

    const sql = `
        UPDATE typing_passages
        SET
            title = ?,
            language = ?,
            content = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            title,
            language,
            content,
            id
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "TYPING PASSAGE UPDATE ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Typing passage could not be updated.",
                    error:
                        err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Typing passage not found."
                });

            }

            res.json({

                success: true,

                message:
                    "Typing passage updated successfully."

            });

        }
    );

});


// DELETE TYPING PASSAGE
app.delete(
    "/api/typing-passages/:id",
    verifyAuthToken,
    requireAdmin,
    (req, res) => {

    const id =
        Number(req.params.id);

    if (!id) {

        return res.status(400).json({
            success: false,
            message: "Valid passage ID is required."
        });

    }

    const sql = `
        DELETE FROM typing_passages
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    "TYPING PASSAGE DELETE ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Typing passage could not be deleted.",
                    error:
                        err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Typing passage not found."
                });

            }

            res.json({

                success: true,

                message:
                    "Typing passage deleted successfully."

            });

        }
    );

});

// ================================
// RAZORPAY PAYMENT VERIFICATION
// ================================


app.get("/api/subscription/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
    id,
    name,
    email,
    plan,
    subscription_start,
    subscription_expiry,
    is_admin
FROM users
WHERE id = ?
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error(
                "SUBSCRIPTION DATABASE ERROR:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Database error."
            });
        }

        if (results.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = results[0];

        const now = new Date();

        let active = false;

        if (
            user.plan &&
            user.plan !== "Free" &&
            user.subscription_expiry
        ) {

            const expiry =
                new Date(user.subscription_expiry);

            if (expiry > now) {
                active = true;
            }
        }

        res.json({
            success: true,

            user: {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan || "Free",
    subscription_start: user.subscription_start,
    subscription_expiry: user.subscription_expiry,
    is_admin: user.is_admin,
    active: active
}
        });
    });
});
app.post("/api/verify-payment", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            user_id,
            plan
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !user_id ||
            !plan
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are incomplete."
            });
        }

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id +
                "|" +
                razorpay_payment_id
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed."
            });
        }

       let amount;
let expiryDays;

if (plan === "Monthly") {
    amount = 99;
    expiryDays = 30;
} else if (plan === "Yearly") {
    amount = 999;
    expiryDays = 365;
} else {
            return res.status(400).json({
                success: false,
                message: "Invalid plan."
            });
        }

        const startDate = new Date();
        const expiryDate = new Date();

        expiryDate.setDate(
            expiryDate.getDate() + expiryDays
        );

        const paymentSql = `
            INSERT INTO payments
            (user_id, plan, amount, payment_id, order_id, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            paymentSql,
            [
                user_id,
                plan,
                amount,
                razorpay_payment_id,
                razorpay_order_id,
                "paid"
            ],
            (paymentErr) => {

                if (paymentErr) {
                    console.error(paymentErr);

                    return res.status(500).json({
                        success: false,
                        message: "Payment record could not be saved."
                    });
                }

                const userSql = `
                    UPDATE users
                    SET plan = ?,
                        subscription_start = ?,
                        subscription_expiry = ?
                    WHERE id = ?
                `;

                db.query(
                    userSql,
                    [
                        plan,
                        startDate,
                        expiryDate,
                        user_id
                    ],
                    (userErr) => {

                        if (userErr) {
                            console.error(userErr);

                            return res.status(500).json({
                                success: false,
                                message: "Subscription could not be activated."
                            });
                        }

                        res.json({
                            success: true,
                            message: "Payment verified and subscription activated.",
                            plan: plan,
                            expiry: expiryDate
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error(
            "Payment Verification Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error during payment verification."
        });
    }
});

/* =====================================================
   ADMIN UPDATE USER SUBSCRIPTION API
===================================================== */

app.put("/api/admin/users/:adminId/update-user", (req, res) => {

    const adminId = req.params.adminId;

    const {
        userId,
        plan,
        subscription_start,
        subscription_expiry
    } = req.body;

    if (!userId || !plan) {

        return res.status(400).json({
            success: false,
            message: "User ID and plan are required."
        });

    }

    const adminCheckSql = `
        SELECT is_admin
        FROM users
        WHERE id = ?
    `;

    db.query(
        adminCheckSql,
        [adminId],
        (adminErr, adminResults) => {

            if (adminErr) {

                console.error(
                    "ADMIN UPDATE CHECK ERROR:",
                    adminErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });

            }

            if (
                adminResults.length === 0 ||
                Number(adminResults[0].is_admin) !== 1
            ) {

                return res.status(403).json({
                    success: false,
                    message: "Admin access required."
                });

            }

            const updateSql = `
                UPDATE users
                SET
                    plan = ?,
                    subscription_start = ?,
                    subscription_expiry = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [
                    plan,
                    subscription_start || null,
                    subscription_expiry || null,
                    userId
                ],
                (updateErr, result) => {

                    if (updateErr) {

                        console.error(
                            "ADMIN USER UPDATE ERROR:",
                            updateErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "User update failed."
                        });

                    }

                    res.json({
                        success: true,
                        message: "User subscription updated successfully."
                    });

                }
            );

        }
    );

});
// Railway provides PORT automatically
/* =====================================================
   PAYMENT HISTORY API
===================================================== */

app.get("/api/payment-history/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            id,
            plan,
            amount,
            payment_id,
            order_id,
            status,
            created_at
        FROM payments
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {

            console.error(
                "PAYMENT HISTORY DATABASE ERROR:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Payment history database error."
            });
        }

        res.json({
            success: true,
            payments: results
        });

    });

});

app.get("/api/test-payment", (req, res) => {
    res.json({
        success: true,
        message: "Payment API route is working"
    });
});

/* =====================================================
   ADMIN USERS API
===================================================== */

app.get("/api/admin/users/:userId", (req, res) => {

    const userId = req.params.userId;

    const adminCheckSql = `
        SELECT is_admin
        FROM users
        WHERE id = ?
    `;

    db.query(
        adminCheckSql,
        [userId],
        (adminErr, adminResults) => {

            if (adminErr) {

                console.error(
                    "ADMIN CHECK ERROR:",
                    adminErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (
                adminResults.length === 0 ||
                Number(adminResults[0].is_admin) !== 1
            ) {

                return res.status(403).json({
                    success: false,
                    message: "Admin access required."
                });
            }

            const usersSql = `
                SELECT
                    id,
                    name,
                    email,
                    plan,
                    subscription_start,
                    subscription_expiry,
                    is_admin,
                    created_at
                FROM users
                ORDER BY id DESC
            `;

            db.query(
                usersSql,
                (usersErr, users) => {

                    if (usersErr) {

                        console.error(
                            "ADMIN USERS ERROR:",
                            usersErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Users could not be loaded."
                        });
                    }

                    res.json({
                        success: true,
                        users: users
                    });

                }
            );

        }
    );

});

/* =====================================================
   ADMIN REVENUE API
===================================================== */

app.get("/api/admin/revenue/:adminId", (req, res) => {

    const adminId = req.params.adminId;

    const adminCheckSql = `
        SELECT is_admin
        FROM users
        WHERE id = ?
    `;

    db.query(
        adminCheckSql,
        [adminId],
        (adminErr, adminResults) => {

            if (adminErr) {

                console.error(
                    "ADMIN REVENUE CHECK ERROR:",
                    adminErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (
                adminResults.length === 0 ||
                Number(adminResults[0].is_admin) !== 1
            ) {

                return res.status(403).json({
                    success: false,
                    message: "Admin access required."
                });
            }

            const revenueSql = `
                SELECT
                    COALESCE(SUM(amount), 0) AS totalRevenue
                FROM payments
                WHERE status = 'paid'
            `;

            db.query(
                revenueSql,
                (revenueErr, results) => {

                    if (revenueErr) {

                        console.error(
                            "ADMIN REVENUE ERROR:",
                            revenueErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Revenue could not be calculated."
                        });
                    }

                    res.json({
                        success: true,
                        totalRevenue:
                            Number(
                                results[0].totalRevenue || 0
                            )
                    });

                }
            );

        }
    );

});

// =====================================================
// SAVE STENO TEST RESULT API
// =====================================================

app.post(
    "/api/steno-test-results",
    (req, res) => {

        const {
    user_id,
    court,
    passage_id,
    passage_title,
    speed,
    total_words,
    correct_words,
    errors,
    accuracy,
    wpm,
    time_used,
    reference_text,
    typed_text
} = req.body;

        if (
            !user_id ||
            !court ||
            total_words === undefined ||
            correct_words === undefined ||
            errors === undefined ||
            accuracy === undefined ||
            wpm === undefined ||
            time_used === undefined
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Required Steno result data is missing."
            });

        }

        const sql = `
            INSERT INTO steno_test_results
(
    user_id,
    court,
    passage_id,
    passage_title,
    speed,
    total_words,
    correct_words,
    errors,
    accuracy,
    wpm,
    time_used,
    reference_text,
    typed_text
)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
    user_id,
    court,
    passage_id || null,
    passage_title || null,
    speed || null,
    total_words,
    correct_words,
    errors,
    accuracy,
    wpm,
    time_used,
    reference_text || null,
    typed_text || null
],
            (err, result) => {

                if (err) {

                    console.error(
                        "STENO RESULT SAVE ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Steno test result could not be saved.",
                        error:
                            err.message
                    });

                }

                res.json({
                    success: true,
                    message:
                        "Steno test result saved successfully.",
                    resultId:
                        result.insertId
                });

            }
        );

    }
);

// =====================================================
// GET STENO TEST HISTORY API
// =====================================================

app.get(
    "/api/steno-test-history/:userId",
    (req, res) => {

        const userId =
            Number(req.params.userId);

        if (!userId) {

            return res.status(400).json({
                success: false,
                message:
                    "Valid user ID is required."
            });

        }

        const sql = `
            SELECT
                id,
                court,
                passage_id,
                passage_title,
                speed,
                total_words,
                correct_words,
                errors,
                accuracy,
                wpm,
                time_used,
reference_text,
typed_text,
created_at
            FROM steno_test_results
            WHERE user_id = ?
            ORDER BY id DESC
        `;

        db.query(
            sql,
            [userId],
            (err, results) => {

                if (err) {

                    console.error(
                        "STENO HISTORY FETCH ERROR:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Steno test history load failed.",
                        error:
                            err.message
                    });

                }

                res.json({
                    success: true,
                    history: results
                });

            }
        );

    }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
