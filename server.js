const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Razorpay = require("razorpay");
const crypto = require("crypto");

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

app.post(
    "/api/court-steno/upload",
    uploadCourtSteno.single("audio"),
    (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Audio file is required."
                });

            }

            const court =
                req.body.court || "";

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

            if (
                !court ||
                !title ||
                !speed ||
                !referenceText
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Court, title, speed and reference text are required."

                });

            }

            const audioUrl =
    "/uploads/court-steno/" +
    req.file.filename;

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
        audioUrl,
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

        res.json({

            success: true,

            message:
                "Court Steno passage successfully saved in database.",

            passage: {

                id:
                    result.insertId,

                title:
                    title,

                speed:
                    speed,

                court:
                    court,

                text:
                    referenceText,

                audio:
                    audioUrl

            }

        });

    }
);

        } catch (error) {

            console.error(
                "Court Steno Upload Error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Audio upload failed."

            });

        }

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [name, email, hashedPassword],
            (err, result) => {
               if (err) {
    console.error("REGISTER DATABASE ERROR:", err);

    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            message: "Email already registered."
        });
    }

    return res.status(500).json({
        message: "Database error.",
        error: err.message,
        code: err.code
    });
}
                

                res.status(201).json({
                    message: "Registration successful!",
                    userId: result.insertId
                });
            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

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

            res.json({
                message: "Login successful!",
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
            amount = 29900; // ₹299 in paise
            planName = "Monthly";
        } 
        else if (plan === "Yearly") {
            amount = 199900; // ₹1999 in paise
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
            amount = 299;
            expiryDays = 30;
        } else if (plan === "Yearly") {
            amount = 1999;
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
