const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log("--- Checking Brands Table ---");
db.all("PRAGMA table_info(Brands)", [], (err, rows) => {
    if (err) {
        console.error("Error checking schema:", err);
        return;
    }
    console.log("Schema:", JSON.stringify(rows, null, 2));
    
    db.all("SELECT * FROM Brands LIMIT 5", [], (err, rows) => {
        if (err) {
            console.error("Error fetching data:", err);
            return;
        }
        console.log("Data sample:", JSON.stringify(rows, null, 2));
        db.close();
    });
});
