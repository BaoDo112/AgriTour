const db = require("../config/db");

// 🧩 Make a payment
exports.createPayment = (req, res) => {
  const { booking_id, amount, payment_method } = req.body;

  const sql = `
    INSERT INTO payments (booking_id, amount, payment_method, status)
    VALUES (?, ?, ?, 'paid')
  `;
  db.query(sql, [booking_id, amount, payment_method], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // Update booking status to confirmed
    db.query("UPDATE bookings SET status = 'confirmed' WHERE booking_id = ?", [booking_id]);
    res.json({ message: "Payment completed successfully!" });
  });
};

// 🧩 Get all payments (admin)
exports.getAllPayments = (req, res) => {
  db.query("SELECT * FROM payments", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};

