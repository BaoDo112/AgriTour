const db = require("../config/db");

// Create invoice
exports.createInvoice = async (req, res) => {
	try {
		const { booking_id, payment_id, total_amount } = req.body;

		if (!booking_id || !payment_id || !total_amount) {
			return res.status(400).json({ message: "Missing required fields!" });
		}

		const [result] = await db.execute(
			"INSERT INTO invoices (booking_id, payment_id, total_amount) VALUES (?, ?, ?)",
			[booking_id, payment_id, total_amount]
		);

		return res.status(201).json({
			message: "Invoice created successfully!",
			invoice_id: result.insertId,
		});
	} catch (err) {
		return res.status(500).json({ error: err.message || err });
	}
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
	try {
		const [rows] = await db.query("SELECT * FROM invoices ORDER BY invoice_id DESC");
		return res.json(rows);
	} catch (err) {
		return res.status(500).json({ error: err.message || err });
	}
};
