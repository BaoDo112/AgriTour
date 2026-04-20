const db = require("../config/db");

// Make payment and confirm booking atomically
exports.createPayment = async (req, res) => {
	let conn;

	try {
		const { booking_id, amount, payment_method } = req.body;

		if (!booking_id || !amount || !payment_method) {
			return res.status(400).json({ message: "Missing required fields!" });
		}

		conn = await db.getConnection();
		await conn.beginTransaction();

		const [paymentResult] = await conn.execute(
			"INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, 'paid')",
			[booking_id, amount, payment_method]
		);

		const [bookingUpdateResult] = await conn.execute(
			"UPDATE bookings SET status = 'confirmed' WHERE booking_id = ?",
			[booking_id]
		);

		if (bookingUpdateResult.affectedRows === 0) {
			throw new Error("Booking not found");
		}

		await conn.commit();

		return res.status(201).json({
			message: "Payment completed successfully!",
			payment_id: paymentResult.insertId,
		});
	} catch (err) {
		if (conn) {
			await conn.rollback();
		}

		return res.status(500).json({ error: err.message || err });
	} finally {
		if (conn) {
			conn.release();
		}
	}
};

// Get all payments
exports.getAllPayments = async (req, res) => {
	try {
		const [rows] = await db.query("SELECT * FROM payments ORDER BY payment_id DESC");
		return res.json(rows);
	} catch (err) {
		return res.status(500).json({ error: err.message || err });
	}
};
