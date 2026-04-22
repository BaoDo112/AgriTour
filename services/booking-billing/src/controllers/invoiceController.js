const db = require("../config/db");

// 🧩 Create invoice (after payment)
exports.createInvoice = (req, res) => {
  const { booking_id, payment_id, total_amount } = req.body;
  const sql = `
    INSERT INTO invoices (booking_id, payment_id, total_amount)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [booking_id, payment_id, total_amount], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Invoice created successfully!" });
  });
};

// 🧩 Get all invoices (admin)
exports.getAllInvoices = (req, res) => {
  db.query("SELECT * FROM invoices", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};
