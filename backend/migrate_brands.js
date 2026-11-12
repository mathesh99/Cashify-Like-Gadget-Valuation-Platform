const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const BRANDS = [
  { name: 'Apple', accent: '#c8c8cc' },
  { name: 'Samsung', accent: '#1428A0' },
  { name: 'OnePlus', accent: '#F5010C' },
  { name: 'Google', accent: '#4285F4' },
  { name: 'Sony', accent: '#003087' },
  { name: 'Dell', accent: '#007DB8' },
  { name: 'HP', accent: '#0096D6' },
  { name: 'Lenovo', accent: '#E2231A' },
  { name: 'Xiaomi', accent: '#FF6900' },
  { name: 'LG', accent: '#A50034' },
];

db.serialize(() => {
  const createdAt = new Date().toLocaleString();
  const stmt = db.prepare("INSERT OR IGNORE INTO Brands (name, accentColor, createdAt) VALUES (?, ?, ?)");
  
  BRANDS.forEach(brand => {
    stmt.run(brand.name, brand.accent, createdAt);
  });
  
  stmt.finalize();
  console.log("Migration completed: brands seeded.");
});

db.close();
