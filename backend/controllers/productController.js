const db = require('../config/db');
const { resolveImageUrl } = require('../utils/helpers');


exports.getAllProductsGrouped = (req, res) => {
    db.all("SELECT * FROM Products", [], (err, rows) => {
        if (err) {
            console.error("DB Error in getAllProductsGrouped:", err);
            return res.status(500).json({ error: err.message });
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
                image: resolveImageUrl(row.localImagePath, req)
            });
        });

        res.json(formattedData);
    });
};

exports.evaluateProduct = (req, res) => {
    const { productId, conditions } = req.body;

    db.get("SELECT * FROM Products WHERE id = ?", [productId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });

        let finalPrice = row.basePrice;
        const selectedCategory = row.category;

        // Condition logic (simplified for brevity, kept consistent with legacy)
        if (selectedCategory === 'Mobiles') {
            if (!conditions.turnsOn) finalPrice *= 0.1;
            else {
                if (conditions.screen === 'broken') finalPrice -= 5000;
                else if (conditions.screen === 'scratches') finalPrice -= 1500;
                if (conditions.body === 'dents') finalPrice -= 2000;
                else if (conditions.body === 'scratches') finalPrice -= 1000;
            }
        }
        // ... age logic
        if (conditions.turnsOn !== false) {
            if (conditions.age === '1_year') finalPrice *= 0.8;
            else if (conditions.age === '2_years') finalPrice *= 0.6;
            else if (conditions.age === 'more_than_2') finalPrice *= 0.4;
        }

        finalPrice = Math.max(0, finalPrice);

        res.json({
            productName: row.name,
            category: selectedCategory,
            basePrice: row.basePrice,
            predictedPrice: Math.round(finalPrice)
        });
    });
};
