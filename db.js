const mysql = require("mysql2");

const db = mysql.createPool(
    process.env.DATABASE_URL
);

db.getConnection((err, connection) => {
    if (err) {
        console.error(
            "❌ MySQL connection failed:",
            err.message
        );
    } else {
        console.log(
            "✅ MySQL database connected successfully!"
        );
        connection.release();
    }
});

module.exports = db;
