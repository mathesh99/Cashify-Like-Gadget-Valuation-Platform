const db = require('../config/db');
const { resolveImageUrl } = require('../utils/helpers');


exports.getRefurbishedProducts = (req, res) => {
    console.log("Fetching refurbished products from DB...");
    db.all("SELECT * FROM Products", [], (err, rows) => {
        if (err) {
            console.error("DB Error in getRefurbishedProducts:", err);
            return res.status(500).json({ error: err.message });
        }

        console.log(`Found ${rows.length} base products. Generating grades...`);

        const gradeConfig = [
            { grade: 'A', label: 'Like New', discount: 0.25, badge: '⭐ Top Pick', color: '#10b981' },
            { grade: 'B', label: 'Good Condition', discount: 0.45, badge: '✅ Verified', color: '#3b82f6' },
            { grade: 'C', label: 'Fair Condition', discount: 0.60, badge: '💰 Best Value', color: '#f59e0b' },
        ];

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
                    image: resolveImageUrl(row.localImagePath, req)
                });
            });
        });

        console.log(`Sending ${listings.length} refurbished listings.`);
        res.json(listings);
    });
};
