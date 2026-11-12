const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');

const SECRET_KEY = 'cell-master-pro-secret-2024';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve local images statically
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Dynamic SVG placeholder endpoint 
// URL: /placeholder/💻/Dell%20XPS%2015/%23007db8
app.get('/placeholder/:emoji/:label/:color', (req, res) => {
    const emoji = decodeURIComponent(req.params.emoji);
    const label = decodeURIComponent(req.params.label);
    const color = decodeURIComponent(req.params.color);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1e2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2a2a3e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(#bg)" rx="40"/>
  <rect x="10" y="10" width="480" height="480" fill="none" stroke="${color.replace('#', '%23')}" stroke-width="2" rx="35" opacity="0.4"/>
  <text x="250" y="220" font-size="160" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  <text x="250" y="360" font-size="28" font-weight="700" font-family="Arial, sans-serif" fill="white" text-anchor="middle">${label}</text>
</svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
});

// Connect to Database
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to SQLite Backend Database Successfully!");
    }
});

// Create Brands table if not exists
db.run(`CREATE TABLE IF NOT EXISTS Brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    accentColor TEXT DEFAULT '#8b5cf6',
    logoPath TEXT,
    createdAt TEXT
)`);

// Migration for Brands table to add logoPath if it doesn't exist
db.run(`ALTER TABLE Brands ADD COLUMN logoPath TEXT`, () => { });

// Add ramGB column to Products if it doesn't exist (migration)
db.run(`ALTER TABLE Products ADD COLUMN ramGB TEXT`, () => { });
// Add storageGB column to Products if it doesn't exist (migration)
db.run(`ALTER TABLE Products ADD COLUMN storageGB TEXT`, () => { });
// Add watchVariant column to Products if it doesn't exist (migration)
db.run(`ALTER TABLE Products ADD COLUMN watchVariant TEXT`, () => { });
// Add status column to Pickups if it doesn't exist (migration)
db.run(`ALTER TABLE Pickups ADD COLUMN status TEXT DEFAULT 'Pending'`, () => { });
// Create Repairs table if not exists
db.run(`CREATE TABLE IF NOT EXISTS Repairs (
    id INTEGER PRIMARY KEY,
    userId INTEGER,
    userName TEXT,
    serviceName TEXT,
    brandName TEXT,
    address TEXT,
    mobile TEXT,
    status TEXT DEFAULT 'Pending',
    scheduledAt TEXT,
    visitDate TEXT,
    FOREIGN KEY (userId) REFERENCES Users(id)
)`, () => { });

// Migration for Repairs table to add visitDate if it doesn't exist
db.run(`ALTER TABLE Repairs ADD COLUMN visitDate TEXT`, () => { });

// Create Settings table
db.run(`CREATE TABLE IF NOT EXISTS Settings (
    key TEXT PRIMARY KEY,
    value TEXT
)`, () => { });

// Create PriceHistory table — tracks every quote for market analysis
db.run(`CREATE TABLE IF NOT EXISTS PriceHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    productName TEXT,
    brand TEXT,
    category TEXT,
    basePrice REAL,
    quotedPrice REAL,
    conditions TEXT,
    createdAt TEXT DEFAULT (datetime('now','localtime'))
)`, () => { });

// Multer: store uploaded product images in public/images
const imgStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'images')),
    filename: (req, file, cb) => {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
        const prefix = req.body.isSetting ? 'site_' : (req.body.category ? 'product_' : 'brand_');
        cb(null, prefix + suffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: imgStorage,
    fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Admin credentials & secret
const ADMIN_CREDENTIALS = { email: 'admin@cellmasterpro.com', password: 'admin@123' };
const ADMIN_SECRET = 'cell-master-pro-admin-secret-2024';

// Admin auth middleware
const verifyAdmin = (req, res, next) => {
    const token = (req.headers['authorization'] || '').split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Admin token required' });
    jwt.verify(token, ADMIN_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access denied' });
        req.admin = decoded;
        next();
    });
};

// Helper to log customers to JSON file
function logCustomerToJson(userData) {
    const customersFile = path.join(__dirname, 'customers.json');
    let customerList = [];
    try {
        if (fs.existsSync(customersFile)) {
            customerList = JSON.parse(fs.readFileSync(customersFile, 'utf8'));
        }
    } catch (err) {
        console.error("Error reading customer list:", err);
    }

    const existingIndex = customerList.findIndex(c => c.email === userData.email);
    const entry = {
        ...userData,
        lastSeen: new Date().toLocaleString()
    };

    if (existingIndex > -1) {
        customerList[existingIndex] = { ...customerList[existingIndex], ...entry };
    } else {
        customerList.push({ ...entry, signupDate: new Date().toLocaleString() });
    }

    try {
        fs.writeFileSync(customersFile, JSON.stringify(customerList, null, 2));
    } catch (err) {
        console.error("Error writing customer list:", err);
    }
}

function resolveImageUrl(localImagePath) {
    if (localImagePath && localImagePath.startsWith('/images/')) {
        return localImagePath; // relative path — served via Vite proxy
    }
    if (localImagePath && localImagePath.startsWith('PLACEHOLDER:')) {
        // Format: PLACEHOLDER:emoji:label:color
        const parts = localImagePath.split(':');
        const emoji = encodeURIComponent(parts[1]);
        const label = encodeURIComponent(parts[2]);
        const color = encodeURIComponent(parts[3]);
        return `/placeholder/${emoji}/${label}/${color}`;
    }
    // fallback to a generic placeholder
    return `/placeholder/${encodeURIComponent('📱')}/${encodeURIComponent('Device')}/${encodeURIComponent('#8b5cf6')}`;
}

// Endpoint to get all product categories from DB
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM Products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }

        const formattedData = {};
        rows.forEach(row => {
            if (!formattedData[row.category]) formattedData[row.category] = {};
            if (!formattedData[row.category][row.brand]) formattedData[row.category][row.brand] = [];
            formattedData[row.category][row.brand].push({
                id: row.id,
                name: row.name,
                category: row.category,
                brand: row.brand,
                basePrice: row.basePrice,
                ramGB: row.ramGB || null,
                storageGB: row.storageGB || null,
                watchVariant: row.watchVariant || null,
                image: resolveImageUrl(row.localImagePath)
            });
        });

        res.json(formattedData);
    });
});

// Endpoint to get refurbished products (graded A / B / C)
app.get('/api/refurbished', (req, res) => {
    db.all("SELECT * FROM Products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }

        const gradeConfig = [
            { grade: 'A', label: 'Like New', discount: 0.25, badge: '⭐ Top Pick', color: '#10b981' },
            { grade: 'B', label: 'Good Condition', discount: 0.45, badge: '✅ Verified', color: '#3b82f6' },
            { grade: 'C', label: 'Fair Condition', discount: 0.60, badge: '💰 Best Value', color: '#f59e0b' },
        ];

        // Generate refurbished listings for all products with all 3 grades
        const listings = [];
        rows.forEach(row => {
            gradeConfig.forEach(g => {
                const refurbishedPrice = Math.round(row.basePrice * (1 - g.discount));
                listings.push({
                    id: `${row.id}_${g.grade}`,
                    productId: row.id,
                    name: row.name,
                    category: row.category,
                    brand: row.brand,
                    grade: g.grade,
                    gradeLabel: g.label,
                    badge: g.badge,
                    gradeColor: g.color,
                    originalPrice: row.basePrice,
                    refurbishedPrice,
                    discount: Math.round(g.discount * 100),
                    ramGB: row.ramGB || null,
                    storageGB: row.storageGB || null,
                    watchVariant: row.watchVariant || null,
                    image: resolveImageUrl(row.localImagePath)
                });
            });
        });

        res.json(listings);
    });
});

// Endpoint to get all brands for public marquee/repair
app.get('/api/brands', (req, res) => {
    db.all('SELECT * FROM Brands ORDER BY name ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Endpoint to get repair services
app.get('/api/repair-services', (req, res) => {
    const services = [
        {
            id: 'screen',
            name: 'Screen Repair',
            description: 'Fix cracked or non-responsive displays with premium OEM-grade parts.',
            icon: '📱',
            basePrice: 1999,
            time: '2-4 Hours'
        },
        {
            id: 'battery',
            name: 'Battery Replacement',
            description: 'Restore your device battery health to 100% with certified cells.',
            icon: '🔋',
            basePrice: 999,
            time: '1 Hour'
        },
        {
            id: 'charging',
            name: 'Charging Port',
            description: 'Fix loose connections or slow charging issues efficiently.',
            icon: '🔌',
            basePrice: 799,
            time: '45 Mins'
        },
        {
            id: 'camera',
            name: 'Camera Repair',
            description: 'Restore clarity to your photos by replacing damaged lens or sensors.',
            icon: '📸',
            basePrice: 1499,
            time: '2 Hours'
        },
        {
            id: 'backglass',
            name: 'Back Glass Repair',
            description: 'Premium glass replacement for a like-new feel and look.',
            icon: '💎',
            basePrice: 1299,
            time: '3 Hours'
        },
        {
            id: 'software',
            name: 'Software Fix',
            description: 'Resolve hanging, boot loops, or OS upgrade issues securely.',
            icon: '⚙️',
            basePrice: 499,
            time: '1-2 Days'
        }
    ];
    res.json(services);
});

// ╔═══════════════════════════════════════════════════════════════════╗
// ║        MARKET-AWARE PRICING ENGINE v3.0                         ║
// ║  Phases: Age → Brand → Functional → Screen → Body →             ║
// ║          Category → Box → MarketTrend → Overhead → Clamp        ║
// ╚═══════════════════════════════════════════════════════════════════╝
app.post('/api/evaluate', (req, res) => {
    const { productId, conditions } = req.body;

    db.get("SELECT * FROM Products WHERE id = ?", [productId], (err, row) => {
        if (err) return res.status(500).json({ "error": err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });

        const basePrice = row.basePrice;
        const category = row.category;
        const brandName = (row.brand || '').toLowerCase();
        const breakdown = {};

        // ══════════════════════════════════════════════════════════
        // PHASE 1: REAL-LIFE EXPONENTIAL DEPRECIATION
        // Most gadgets lose 30-40% value the moment they are unboxed.
        // ══════════════════════════════════════════════════════════
        // ══════════════════════════════════════════════════════════
        // PHASE 1: BRAND-AWARE AGE DEPRECIATION
        // Apple/Premium Androids retain value better. Budget brands drop faster.
        // ══════════════════════════════════════════════════════════
        const isPremium = ['apple', 'samsung', 'google'].includes(brandName);
        const AGE_RATES = isPremium ? {
            'under_1':     0.75,   // < 1 year: retain 75%
            '1_year':      0.55,   // 1–2 yrs: retain 55%
            '2_years':     0.42,   // 2–3 yrs: retain 42%
            'more_than_2': 0.28,   // 3+ yrs : retain 28%
        } : {
            'under_1':     0.62,   // Budget brands drop faster
            '1_year':      0.40,
            '2_years':     0.25,
            'more_than_2': 0.12,
        };
        const ageRate = AGE_RATES[conditions.age] ?? 0.40;
        let price = basePrice * ageRate;
        breakdown.phase1_age = `×${ageRate} (brand-aware age depreciation)`;

        // ══════════════════════════════════════════════════════════
        // PHASE 2: GLOBAL BRAND TIER MULTIPLIER
        // ══════════════════════════════════════════════════════════
        const BRAND_TIERS = {
            tier1: { brands: ['apple'], factor: 1.10 },          
            tier2: { brands: ['samsung', 'google'], factor: 1.05 },
            tier3: { brands: ['oneplus', 'dell', 'hp', 'sony'], factor: 0.95 },
            tier4: { brands: ['lenovo', 'asus', 'xiaomi'], factor: 0.88 },
            tier5: { brands: ['realme', 'oppo', 'vivo'], factor: 0.78 }, 
        };
        let brandFactor = 0.70; 
        for (const tier of Object.values(BRAND_TIERS)) {
            if (tier.brands.includes(brandName)) { brandFactor = tier.factor; break; }
        }
        price *= brandFactor;
        breakdown.phase2_brand = `×${brandFactor} (brand tier adjustment)`;

        // ══════════════════════════════════════════════════════════
        // PHASE 3: FUNCTIONAL STATUS — DEAD DEVICE EARLY EXIT
        // ══════════════════════════════════════════════════════════
        if (conditions.turnsOn === false) {
            let scrapPrice = basePrice * 0.05; // 5% base scrap
            
            // Storage Salvage Bonus (Higher GB chips have better salvage value)
            const storage = parseInt(conditions.storageGB) || 64;
            let salvageBonus = 1.0;
            if (storage >= 1024) salvageBonus = 1.50;      // 1TB+ parts are rare/valuable
            else if (storage >= 512) salvageBonus = 1.30;
            else if (storage >= 256) salvageBonus = 1.15;
            
            scrapPrice *= salvageBonus;
            const floorPrice = Math.round(scrapPrice / 100) * 100;
            
            breakdown.phase3_functional = `× DEAD — scrap value + ${((salvageBonus-1)*100).toFixed(0)}% storage salvage bonus`;
            breakdown.final = `Scrap Value: ₹${floorPrice}`;

            db.run(
                `INSERT INTO PriceHistory (productId, productName, brand, category, basePrice, quotedPrice, conditions)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [productId, row.name, row.brand, category, basePrice, floorPrice, JSON.stringify(conditions)],
                () => {}
            );

            return res.json({ productName: row.name, predictedPrice: floorPrice, marketBenchmark: floorPrice, deadDevice: true, breakdown });
        }

        // ══════════════════════════════════════════════════════════
        // PHASE 4: REPAIR COST DEDUCTION (REAL-WORLD OEM PARTS)
        // ══════════════════════════════════════════════════════════
        const REPAIR_ESTIMATES = {
            Mobiles:     { scratches: 1200, broken: Math.min(basePrice * 0.45, 12000) },
            Laptops:     { scratches: 3500, broken: Math.min(basePrice * 0.40, 22000) },
            Accessories: { scratches: 1200, broken: Math.min(basePrice * 0.55, 8000) }, // Watch screens are very expensive
            Earbuds:     { scratches: 0,    broken: 0 },
        };
        let repairDeduction = 0;
        const re = REPAIR_ESTIMATES[category] || {};
        if (conditions.screen === 'scratches') repairDeduction += re.scratches || 0;
        else if (conditions.screen === 'broken') repairDeduction += re.broken || 0;
        
        if (category === 'Laptops' && conditions.keyboard === 'broken') repairDeduction += 4500;
        
        price -= repairDeduction;
        breakdown.phase4_repair = `-₹${repairDeduction} (OEM refurbishment cost)`;

        // ══════════════════════════════════════════════════════════
        // PHASE 5: COSMETIC CONDITION
        // ══════════════════════════════════════════════════════════
        const BODY_FACTORS = { perfect: 1.0, scratches: 0.85, dents: 0.68 };
        const bodyFactor = BODY_FACTORS[conditions.body] ?? 0.80;
        price *= bodyFactor;
        breakdown.phase5_body = `×${bodyFactor} (cosmetic body grade)`;

        // ══════════════════════════════════════════════════════════
        // PHASE 6: HYGIENE & COMPONENT HEALTH
        // ══════════════════════════════════════════════════════════
        let componentFactor = 1.0;
        if (conditions.batteryHealth === 'poor') componentFactor *= 0.80;
        else if (conditions.batteryHealth === 'dead') componentFactor *= 0.50;
        
        // Earbuds specific high-deduction for hygiene only if used
        if (category === 'Earbuds') {
            componentFactor *= 0.65; // Immediate drop for used hygiene items
            if (conditions.hasCase === false) componentFactor *= 0.35;
            if (conditions.bothWork === false) componentFactor *= 0.15;
        }
        
        price *= componentFactor;
        breakdown.phase6_components = `×${componentFactor.toFixed(2)} (component/hygiene status)`;

        // ══════════════════════════════════════════════════════════
        // PHASE 7: SECURITY & FRAUD RISK
        // ══════════════════════════════════════════════════════════
        if (conditions.hasBill === false) {
            price *= 0.65; // 35% reduction for missing original bill (Hard legal/resale risk)
            breakdown.phase7_security = '×0.65 (Missing matching bill/IMEI — legal risk factor)';
        }

        // ══════════════════════════════════════════════════════════
        // PHASE 8: MARKET CURVE BLENDING (OLX/CASHIFY DYNAMIC BENCHMARKS)
        // ══════════════════════════════════════════════════════════
        const MARKET_CURVES = {
            Mobiles: {
                apple:    { under_1: 0.68, '1_year': 0.52, '2_years': 0.38, more_than_2: 0.25 },
                samsung:  { under_1: 0.55, '1_year': 0.40, '2_years': 0.26, more_than_2: 0.16 },
                _default: { under_1: 0.48, '1_year': 0.35, '2_years': 0.20, more_than_2: 0.12 },
            },
            Laptops: {
                apple:    { under_1: 0.72, '1_year': 0.58, '2_years': 0.45, more_than_2: 0.32 },
                _default: { under_1: 0.50, '1_year': 0.38, '2_years': 0.25, more_than_2: 0.15 },
            }
        };
        const catCurve = MARKET_CURVES[category] || MARKET_CURVES['Mobiles']; 
        const brandCurve = catCurve[brandName] || catCurve['_default'];
        const mBenchmark = basePrice * (brandCurve[conditions.age || 'under_1'] || 0.20);
        
        // Weighting: If brand is premium, follow market benchmark more closely (60%)
        const mWeight = isPremium ? 0.60 : 0.40;
        price = (price * (1 - mWeight)) + (mBenchmark * mWeight);
        breakdown.phase8_market_blend = `Blended with real-world benchmark (Weighted: ${mWeight*100}%)`;

        // ══════════════════════════════════════════════════════════
        // PHASE 9: PROFIT MARGIN & TAX (22%)
        // Covers logistics, storage, payment gateway, and platform profit.
        // ══════════════════════════════════════════════════════════
        price *= 0.78;
        breakdown.phase9_overhead = '×0.78 (Platform margin & logistics)';

        // ══════════════════════════════════════════════════════════
        // PHASE 10: VARIANT MULTIPLIERS (RAM, STORAGE, CONNECTIVITY)
        // ══════════════════════════════════════════════════════════
        if (category === 'Mobiles' || category === 'Laptops' || category === 'Accessories') {
            const ramFactorMap = {
                'Mobiles': { '2': 0.80, '3': 0.88, '4': 0.94, '6': 1.0, '8': 1.15, '12': 1.30, '16': 1.45, '24': 1.60 },
                'Laptops': { '4': 0.75, '8': 1.0, '12': 1.20, '16': 1.40, '32': 1.75, '64': 2.10, '128': 2.50 }
            };
            const storageFactorMap = {
                'Mobiles': { '32': 0.80, '64': 0.90, '128': 1.0, '256': 1.20, '512': 1.45, '1024': 1.75, '2048': 2.10 },
                'Laptops': { '128': 0.78, '256': 0.90, '512': 1.0, '1024': 1.35, '2048': 1.75, '4096': 2.30 }
            };
            const connectivityFactorMap = {
                'Accessories': { 
                    'Bluetooth': 1.0, 'GPS': 1.0, 'Wi-Fi': 1.0,
                    'Cellular': 1.40, 'LTE': 1.40, '4G': 1.30, '5G': 1.55,
                    'GPS + Cellular': 1.50, 'GPS + LTE': 1.50
                }
            };
            
            // Helper to get factor with high-value fallback
            const getFactor = (map, val, cat) => {
                if (!val) return 1.0;
                const catMap = map[cat] || {};
                if (catMap[val]) return catMap[val];
                
                // Smart keyword matching for connectivity
                if (cat === 'Accessories') {
                    const lVal = val.toLowerCase();
                    if (lVal.includes('cellular') || lVal.includes('lte') || lVal.includes('5g')) return 1.45;
                    if (lVal.includes('sim') || lVal.includes('4g')) return 1.35;
                }

                // If it's a number key, do numeric fallback
                const keys = Object.keys(catMap).map(Number).filter(n => !isNaN(n)).sort((a, b) => b - a);
                if (keys.length > 0) {
                    if (Number(val) > keys[0]) return catMap[keys[0]] * 1.15;
                    if (Number(val) < keys[keys.length - 1]) return catMap[keys[keys.length - 1]] * 0.9;
                }
                
                // Text fallback (case-insensitive)
                const exactMatch = Object.keys(catMap).find(k => k.toLowerCase() === val.toLowerCase());
                if (exactMatch) return catMap[exactMatch];
                
                return 1.0;
            };

            const rFactor = getFactor(ramFactorMap, conditions.ramGB, category);
            const sFactor = getFactor(storageFactorMap, conditions.storageGB, category);
            const cFactor = getFactor(connectivityFactorMap, conditions.watchVariant, category);
            
            price *= (rFactor * sFactor * cFactor);
            breakdown.phase10_variants = `×${rFactor.toFixed(2)} (RAM) ×${sFactor.toFixed(2)} (Storage) ×${cFactor.toFixed(2)} (Connectivity)`;
        }

        // FINAL PHASE: ROUNDING & LIMITS
        const floor = basePrice * 0.04;
        
        // Ceiling scales with variant multipliers to avoid capping high-end upgrades
        let variantScale = 1.0;
        if (category === 'Mobiles' || category === 'Laptops') {
            // Recalculate scale for ceiling (approximate based on phase 10 logic)
            const rFactor = (conditions.ramGB) ? 1 + (Number(conditions.ramGB) / 64) : 1;
            const sFactor = (conditions.storageGB) ? 1 + (Number(conditions.storageGB) / 1024) : 1;
            variantScale = Math.max(1.0, (rFactor + sFactor) / 1.5);
        }
        
        const ceiling = basePrice * 0.92 * variantScale; 
        price = Math.max(floor, Math.min(ceiling, price));
        const finalPrice = Math.round(price / 100) * 100;

        // Log to history
        db.run(
            `INSERT INTO PriceHistory (productId, productName, brand, category, basePrice, quotedPrice, conditions)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [productId, row.name, row.brand, category, basePrice, finalPrice, JSON.stringify(conditions)],
            () => {}
        );

        res.json({
            productName: row.name,
            predictedPrice: finalPrice,
            breakdown
        });
    });
});

// --- AUTHENTICATION ENDPOINTS ---

// Signup Endpoint
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide name, email and password' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("INSERT INTO Users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'This email is already registered.' });
                }
                return res.status(500).json({ error: err.message });
            }

            // Log new customer to customers.json
            logCustomerToJson({
                id: this.lastID,
                name,
                email
            });

            // Generate Token
            const token = jwt.sign({ id: this.lastID, name }, SECRET_KEY, { expiresIn: '24h' });
            res.status(201).json({ token, user: { name } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login Endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    db.get("SELECT * FROM Users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: '24h' });

        // Log sign-in to customers.json
        logCustomerToJson({
            id: user.id,
            name: user.name,
            email: user.email
        });

        res.json({ token, user: { name: user.name } });
    });
});

// Schedule Pickup Endpoint
app.post('/api/pickups', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Please login to schedule a pickup' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Session expired. Please login again.' });

        const { address, mobile, pickupDate, productName, predictedPrice, conditions } = req.body;

        if (!address || !mobile || !pickupDate) {
            return res.status(400).json({ error: 'Please fill in all pickup details' });
        }

        // Create human-readable condition summary
        let conditionSummary = '';
        if (conditions && typeof conditions === 'object') {
            conditionSummary = Object.entries(conditions)
                .map(([key, value]) => {
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    const valStr = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
                    return `${label}: ${valStr}`;
                })
                .join(', ');
        }

        const scheduledAt = new Date().toLocaleString();
        const id = Date.now();

        db.run(`INSERT INTO Pickups (id, userId, userName, productName, predictedPrice, conditions, conditionSummary, address, mobile, pickupDate, scheduledAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, decoded.id, decoded.name, productName, predictedPrice, JSON.stringify(conditions), conditionSummary, address, mobile, pickupDate, scheduledAt],
            (dbErr) => {
                if (dbErr) return res.status(500).json({ error: dbErr.message });

                // Log to pickups.json for redundancy
                const pickupEntry = {
                    id,
                    userId: decoded.id,
                    userName: decoded.name,
                    productName,
                    predictedPrice,
                    conditions,
                    conditionSummary,
                    address,
                    mobile,
                    pickupDate,
                    scheduledAt
                };

                const pickupsFile = path.join(__dirname, 'pickups.json');
                let pickupList = [];
                try {
                    if (fs.existsSync(pickupsFile)) {
                        pickupList = JSON.parse(fs.readFileSync(pickupsFile, 'utf8'));
                    }
                } catch (pErr) {
                    console.error("Error reading pickup list:", pErr);
                }

                pickupList.push(pickupEntry);
                try {
                    fs.writeFileSync(pickupsFile, JSON.stringify(pickupList, null, 2));
                } catch (wErr) {
                    console.error("Error writing pickup list:", wErr);
                }

                res.status(201).json({ message: 'Pickup scheduled successfully!', pickupId: id });
            }
        );
    });
});

// Repair Booking Endpoint
app.post('/api/repairs', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Please login to book a repair' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Session expired. Please login again.' });

        const { address, mobile, serviceName, brandName, visitDate } = req.body;

        if (!address || !mobile || !serviceName || !brandName || !visitDate) {
            return res.status(400).json({ error: 'Please fill in all repair details' });
        }

        const scheduledAt = new Date().toLocaleString();
        const id = Date.now();

        db.run(`INSERT INTO Repairs (id, userId, userName, serviceName, brandName, address, mobile, scheduledAt, visitDate) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, decoded.id, decoded.name, serviceName, brandName, address, mobile, scheduledAt, visitDate],
            (dbErr) => {
                if (dbErr) return res.status(500).json({ error: dbErr.message });

                // Log to repairs.json for redundancy
                const repairEntry = {
                    id,
                    userId: decoded.id,
                    userName: decoded.name,
                    serviceName,
                    brandName,
                    address,
                    mobile,
                    status: 'Pending',
                    scheduledAt,
                    visitDate
                };

                const repairsFile = path.join(__dirname, 'repairs.json');
                let repairList = [];
                try {
                    if (fs.existsSync(repairsFile)) {
                        repairList = JSON.parse(fs.readFileSync(repairsFile, 'utf8'));
                    }
                } catch (pErr) {
                    console.error("Error reading repair list:", pErr);
                }

                repairList.push(repairEntry);
                try {
                    fs.writeFileSync(repairsFile, JSON.stringify(repairList, null, 2));
                } catch (wErr) {
                    console.error("Error writing repair list:", wErr);
                }

                res.status(201).json({ message: 'Repair booked successfully!', repairId: id });
            }
        );
    });
});

// Verify Session Endpoint
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid or expired token' });
        res.json({ user: { name: decoded.name } });
    });
});

// =========================================
// ADMIN API ENDPOINTS
// =========================================

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const token = jwt.sign({ role: 'admin', email }, ADMIN_SECRET, { expiresIn: '8h' });
        return res.json({ token, admin: { email } });
    }
    res.status(401).json({ error: 'Invalid admin credentials' });
});

// Admin Stats
app.get('/api/admin/stats', verifyAdmin, (req, res) => {
    db.all('SELECT category, COUNT(*) as count FROM Products GROUP BY category', [], (err, catRows) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT COUNT(*) as total FROM Products', [], (e2, prodRow) => {
            db.get('SELECT COUNT(*) as total FROM Brands', [], (e3, brandRow) => {
                db.get('SELECT COUNT(*) as total FROM Pickups', [], (e4, pickupRow) => {
                    res.json({
                        totalProducts: prodRow?.total || 0,
                        totalBrands: brandRow?.total || 0,
                        totalPickups: pickupRow?.total || 0,
                        byCategory: catRows
                    });
                });
            });
        });
    });
});

// Admin Pickups List
app.get('/api/admin/pickups', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM Pickups ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => {
            try {
                return { ...row, conditions: JSON.parse(row.conditions) };
            } catch (e) {
                return row;
            }
        }));
    });
});

// Admin Update Pickup Status
app.put('/api/admin/pickups/:id/status', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    db.run('UPDATE Pickups SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Pickup not found' });
        res.json({ id, status, message: 'Status updated successfully' });
    });
});

// Admin Repair List
app.get('/api/admin/repairs', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM Repairs ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin Update Repair Status
app.put('/api/admin/repairs/:id/status', verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    db.run('UPDATE Repairs SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Repair request not found' });
        res.json({ id, status, message: 'Status updated successfully' });
    });
});

// Brands CRUD
app.get('/api/admin/brands', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM Brands ORDER BY name ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/admin/brands', verifyAdmin, upload.single('image'), (req, res) => {
    const { name, accentColor } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Brand name required' });
    const createdAt = new Date().toLocaleString();
    const logoPath = req.file ? `/images/${req.file.filename}` : null;
    db.run('INSERT INTO Brands (name, accentColor, logoPath, createdAt) VALUES (?, ?, ?, ?)',
        [name.trim(), accentColor || '#8b5cf6', logoPath, createdAt],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Brand already exists' });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, name: name.trim(), accentColor: accentColor || '#8b5cf6', logoPath, createdAt });
        }
    );
});

app.delete('/api/admin/brands/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM Brands WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Brand not found' });
        res.json({ message: 'Brand deleted' });
    });
});

app.put('/api/admin/brands/:id', verifyAdmin, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, accentColor } = req.body;
    console.log(`[ADMIN] Update Brand attempt: ID=${id}, Name=${name}`);

    db.get('SELECT * FROM Brands WHERE id = ?', [Number(id)], (err, row) => {
        if (err) {
            console.error('[DATABASE] Error fetching brand:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            console.warn(`[ADMIN] Brand update failed: ID ${id} not found`);
            return res.status(404).json({ error: 'Brand not found' });
        }

        const updName = name || row.name;
        const updAccent = accentColor || row.accentColor;
        const logoPath = req.file ? `/images/${req.file.filename}` : row.logoPath;

        db.run('UPDATE Brands SET name=?, accentColor=?, logoPath=? WHERE id=?',
            [updName.trim(), updAccent, logoPath, id],
            function (e2) {
                if (e2) {
                    console.error('[DATABASE] Error updating brand:', e2);
                    return res.status(500).json({ error: e2.message });
                }
                console.log(`[ADMIN] Brand updated successfully: ID=${id}`);
                res.json({ id: Number(id), name: updName.trim(), accentColor: updAccent, logoPath, message: 'Brand updated successfully' });
            }
        );
    });
});

// Admin Customers List
app.get('/api/admin/customers', verifyAdmin, (req, res) => {
    const customersFile = path.join(__dirname, 'customers.json');
    try {
        if (fs.existsSync(customersFile)) {
            const customerList = JSON.parse(fs.readFileSync(customersFile, 'utf8'));
            res.json(customerList);
        } else {
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read customers' });
    }
});

// Products CRUD (Admin)
app.get('/api/admin/products', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM Products ORDER BY category ASC, brand ASC, name ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => ({ ...r, ramGB: r.ramGB || null, storageGB: r.storageGB || null, watchVariant: r.watchVariant || null, imageUrl: resolveImageUrl(r.localImagePath) })));
    });
});

app.post('/api/admin/products', verifyAdmin, upload.single('image'), (req, res) => {
    const { name, category, brand, basePrice, ramGB, storageGB, watchVariant } = req.body;
    if (!name || !category || !brand || !basePrice)
        return res.status(400).json({ error: 'name, category, brand, basePrice are all required' });
    const emoji = { Mobiles: '📱', Laptops: '💻', Earbuds: '🎧', Accessories: '⌚' }[category] || '📱';
    const localImagePath = req.file
        ? `/images/${req.file.filename}`
        : `PLACEHOLDER:${emoji}:${name}:#8b5cf6`;
    const ram = (category === 'Mobiles' || category === 'Laptops') ? (ramGB || null) : null;
    const storage = (category === 'Mobiles' || category === 'Laptops') ? (storageGB || null) : null;
    const variant = category === 'Accessories' ? (watchVariant || null) : null;
    db.run('INSERT INTO Products (name, category, brand, basePrice, localImagePath, ramGB, storageGB, watchVariant) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name.trim(), category, brand.trim(), parseInt(basePrice), localImagePath, ram, storage, variant],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, name, category, brand, basePrice: parseInt(basePrice), localImagePath, ramGB: ram, storageGB: storage, watchVariant: variant, imageUrl: resolveImageUrl(localImagePath) });
        }
    );
});

app.put('/api/admin/products/:id', verifyAdmin, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, category, brand, basePrice, ramGB, storageGB, watchVariant } = req.body;
    db.get('SELECT * FROM Products WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });
        const updName = name || row.name;
        const updCat = category || row.category;
        const updBrand = brand || row.brand;
        const updPrice = parseInt(basePrice) || row.basePrice;
        const localImagePath = req.file ? `/images/${req.file.filename}` : row.localImagePath;
        const updRam = (updCat === 'Mobiles' || updCat === 'Laptops') ? (ramGB !== undefined ? ramGB : row.ramGB) : null;
        const updStorage = (updCat === 'Mobiles' || updCat === 'Laptops') ? (storageGB !== undefined ? storageGB : row.storageGB) : null;
        const updVariant = updCat === 'Accessories' ? (watchVariant !== undefined ? watchVariant : row.watchVariant) : null;
        db.run('UPDATE Products SET name=?, category=?, brand=?, basePrice=?, localImagePath=?, ramGB=?, storageGB=?, watchVariant=? WHERE id=?',
            [updName, updCat, updBrand, updPrice, localImagePath, updRam, updStorage, updVariant, id],
            function (e2) {
                if (e2) return res.status(500).json({ error: e2.message });
                res.json({ id: parseInt(id), name: updName, category: updCat, brand: updBrand, basePrice: updPrice, localImagePath, ramGB: updRam, storageGB: updStorage, watchVariant: updVariant, imageUrl: resolveImageUrl(localImagePath) });
            }
        );
    });
});

app.delete('/api/admin/products/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM Products WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    });
});


// =========================================
// REVIEWS SYSTEM
// =========================================

// Create Reviews table
db.run(`CREATE TABLE IF NOT EXISTS Reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    userName TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
)`, () => { });

// Public: GET all reviews (newest first)
app.get('/api/reviews', (req, res) => {
    db.all('SELECT * FROM Reviews ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Public: POST a new review (requires user auth)
app.post('/api/reviews', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Please login to leave a review' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Session expired. Please login again.' });

        const { rating, body } = req.body;
        if (!rating || !body) return res.status(400).json({ error: 'Rating and review text are required' });
        if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        if (body.trim().length < 4) return res.status(400).json({ error: 'Review must be at least 4 characters' });

        const title = body.split(' ').slice(0, 5).join(' ') + '...';
        const createdAt = new Date().toLocaleString();
        db.run('INSERT INTO Reviews (userId, userName, rating, title, body, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [decoded.id, decoded.name, parseInt(rating), title, body.trim(), createdAt],
            function (dbErr) {
                if (dbErr) return res.status(500).json({ error: dbErr.message });
                res.status(201).json({
                    id: this.lastID,
                    userId: decoded.id,
                    userName: decoded.name,
                    rating: parseInt(rating),
                    title: title.trim(),
                    body: body.trim(),
                    createdAt
                });
            }
        );
    });
});

// Admin: GET all reviews
app.get('/api/admin/reviews', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM Reviews ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin: DELETE a review
app.delete('/api/admin/reviews/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM Reviews WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Review not found' });
        res.json({ message: 'Review deleted successfully' });
    });
});

// Public: GET settings
app.get('/api/settings', (req, res) => {
    db.all('SELECT * FROM Settings', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settings = {};
        rows.forEach(r => { settings[r.key] = r.value; });
        res.json(settings);
    });
});

// Admin: POST site logo
app.post('/api/admin/settings/logo', verifyAdmin, upload.single('logo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const logoUrl = `/images/${req.file.filename}`;
    db.run('INSERT INTO Settings (key, value) VALUES ("companyLogo", ?) ON CONFLICT(key) DO UPDATE SET value=?', [logoUrl, logoUrl], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Logo updated successfully', companyLogo: logoUrl });
    });
});

// Admin: DELETE site logo
app.delete('/api/admin/settings/logo', verifyAdmin, (req, res) => {
    db.run('DELETE FROM Settings WHERE key = "companyLogo"', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Logo deleted successfully' });
    });
});

// Fallback JSON 404 handler for API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
