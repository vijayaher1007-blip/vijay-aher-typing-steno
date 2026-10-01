const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
    res.send("SERVER OK");
});
app.use(express.static("C:/Users/Dell/Documents/typing website/Website"));
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "../" });
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
                    plan: user.plan
                }
            });
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error."
        });
    }
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});