const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users Table
      db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`, (err) => { if (err) reject(err); });

      // Products Table
      db.run(`CREATE TABLE IF NOT EXISTS Products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        basePrice INTEGER NOT NULL,
        localImagePath TEXT
      )`, (err) => { if (err) reject(err); });

      // Pickups Table
      db.run(`CREATE TABLE IF NOT EXISTS Pickups (
        id INTEGER PRIMARY KEY,
        userId INTEGER,
        userName TEXT,
        productName TEXT,
        predictedPrice INTEGER,
        conditions TEXT,
        conditionSummary TEXT,
        address TEXT,
        mobile TEXT,
        pickupDate TEXT,
        scheduledAt TEXT,
        FOREIGN KEY (userId) REFERENCES Users(id)
      )`, (err) => { 
        if (err) reject(err); 
        else resolve();
      });
    });
  });
};

const seedProducts = () => {
  const products = [
    // Mobiles
    { name: 'iPhone 15 Pro', category: 'Mobiles', brand: 'Apple', basePrice: 124900, localImagePath: '/images/iphone_15_pro.png' },
    { name: 'iPhone 14 Pro', category: 'Mobiles', brand: 'Apple', basePrice: 105000, localImagePath: '/images/m_apple_14_pro.jpg' },
    { name: 'iPhone 13', category: 'Mobiles', brand: 'Apple', basePrice: 59900, localImagePath: '/images/m_apple_13.jpg' },
    { name: 'Galaxy S23 Ultra', category: 'Mobiles', brand: 'Samsung', basePrice: 114900, localImagePath: '/images/galaxy_s23_ultra.png' },
    { name: 'Galaxy Z Fold 4', category: 'Mobiles', brand: 'Samsung', basePrice: 154900, localImagePath: '/images/m_samsung_zfold4.jpg' },
    { name: 'OnePlus 11', category: 'Mobiles', brand: 'OnePlus', basePrice: 56999, localImagePath: 'PLACEHOLDER:📱:OnePlus 11:#F5010C' },
    { name: 'Pixel 8 Pro', category: 'Mobiles', brand: 'Google', basePrice: 93999, localImagePath: 'PLACEHOLDER:📱:Pixel 8 Pro:#4285F4' },
    
    // Laptops
    { name: 'MacBook Pro 14 M2', category: 'Laptops', brand: 'Apple', basePrice: 199900, localImagePath: '/images/l_mac_pro_14.jpg' },
    { name: 'MacBook Air M1', category: 'Laptops', brand: 'Apple', basePrice: 89900, localImagePath: '/images/l_mac_air_m1.jpg' },
    { name: 'Dell XPS 15', category: 'Laptops', brand: 'Dell', basePrice: 245000, localImagePath: '/images/l_dell_xps_15.jpg' },
    { name: 'HP Spectre x360', category: 'Laptops', brand: 'HP', basePrice: 155000, localImagePath: 'PLACEHOLDER:💻:HP Spectre:#0096D6' },
    { name: 'Lenovo ThinkPad X1', category: 'Laptops', brand: 'Lenovo', basePrice: 185000, localImagePath: 'PLACEHOLDER:💻:ThinkPad X1:#E2231A' },

    // Earbuds
    { name: 'AirPods Pro 2', category: 'Earbuds', brand: 'Apple', basePrice: 24900, localImagePath: '/images/e_airpods_pro.jpg' },
    { name: 'Sony WF-1000XM5', category: 'Earbuds', brand: 'Sony', basePrice: 24990, localImagePath: '/images/sony_earbuds.png' },
    { name: 'Galaxy Buds2 Pro', category: 'Earbuds', brand: 'Samsung', basePrice: 12990, localImagePath: '/images/e_galaxy_buds_2.jpg' },

    // Accessories (Watches)
    { name: 'Apple Watch Series 8', category: 'Accessories', brand: 'Apple', basePrice: 41900, localImagePath: '/images/w_apple_watch_8.jpg' },
    { name: 'Samsung Galaxy Watch 5', category: 'Accessories', brand: 'Samsung', basePrice: 29999, localImagePath: '/images/w_galaxy_watch_5.jpg' }
  ];

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM Products", (err) => {
        if (err) return reject(err);
        
        const stmt = db.prepare("INSERT INTO Products (name, category, brand, basePrice, localImagePath) VALUES (?, ?, ?, ?, ?)");
        products.forEach(p => {
          stmt.run(p.name, p.category, p.brand, p.basePrice, p.localImagePath);
        });
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  });
};

const init = async () => {
  try {
    console.log("Initializing database...");
    await createTables();
    console.log("Tables created successfully.");
    await seedProducts();
    console.log("Database seeded with products.");
    db.close();
    console.log("Database connection closed.");
  } catch (err) {
    console.error("Initialization failed:", err);
    process.exit(1);
  }
};

init();
