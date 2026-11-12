const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'electro-trade-secret-2024';

// Helper to log customers to JSON file
function logCustomerToJson(userData) {
    const customersFile = path.join(__dirname, '../', 'customers.json');
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

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide name, email and password' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("INSERT INTO Users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], function(err) {
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
};

exports.login = (req, res) => {
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
};

exports.getMe = (req, res) => {
    // req.user is set by authMiddleware
    res.json({ user: { name: req.user.name } });
};
