const db = require('../config/db');

exports.createOrder = (req, res) => {
    const { productId, productName, totalPrice, address, mobile } = req.body;
    const userId = req.user ? req.user.id : null;

    db.run(
        "INSERT INTO Orders (userId, productId, productName, totalPrice, address, mobile) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, productId, productName, totalPrice, address, mobile],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Order placed successfully', orderId: this.lastID });
        }
    );
};
