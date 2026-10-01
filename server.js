const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");
const path = require("path");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
const app = express();

app.use(cors());
app.use(express.json());

// Website folder
const websitePath = __dirname;

app.use(express.static(websitePath));

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
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Email already registered."
                        });
                    }

                    return res.status(500).json({
                        message: "Database error."
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

   console.error("REGISTER DATABASE ERROR:", err);

return res.status(500).json({
    message: "Database error.",
    error: err.message,
    code: err.code
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
                    plan: user.plan
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

const crypto = require("crypto");

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
// Railway provides PORT automatically
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
