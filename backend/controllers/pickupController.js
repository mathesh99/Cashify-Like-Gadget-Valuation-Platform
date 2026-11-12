const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'electro-trade-secret-2024';

exports.schedulePickup = (req, res) => {
    const { address, mobile, pickupDate, productName, predictedPrice, conditions } = req.body;
    
    if (!address || !mobile || !pickupDate) {
        return res.status(400).json({ error: 'Please fill in all pickup details' });
    }

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
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : 'Guest';

    db.run(`INSERT INTO Pickups (id, userId, userName, productName, predictedPrice, conditions, conditionSummary, address, mobile, pickupDate, scheduledAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, userName, productName, predictedPrice, JSON.stringify(conditions), conditionSummary, address, mobile, pickupDate, scheduledAt],
            (dbErr) => {
                if (dbErr) return res.status(500).json({ error: dbErr.message });

                // Log to pickups.json for redundancy
                const pickupEntry = {
                    id,
                    userId,
                    userName,
                    productName,
                    predictedPrice,
                    conditions,
                    conditionSummary,
                    address,
                    mobile,
                    pickupDate,
                    scheduledAt
                };

                const pickupsFile = path.join(__dirname, '../', 'pickups.json');
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
};
