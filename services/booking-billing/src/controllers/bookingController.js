const db = require("../config/db");
const { resolveTourSnapshot } = require("../integrations/tourCatalogAdapter");

const normalizeBooleanFlag = (value) => {
	if (value === true || value === 1 || value === "1") return 1;
	return 0;
};

const normalizeInt = (value, defaultValue = 0) => {
	const num = Number(value);
	if (Number.isNaN(num)) return defaultValue;
	return Math.trunc(num);
};

const normalizePrice = (value, defaultValue = null) => {
	if (value === undefined || value === null || value === "") return defaultValue;
	const num = Number(value);
	if (Number.isNaN(num)) return defaultValue;
	return num;
};

const toNullable = (value, defaultValue = null) => {
	if (value === undefined) return defaultValue;
	return value;
};

const keepOrIncoming = (incoming, existing) => {
	if (incoming === undefined) return existing;
	return incoming;
};

const toSqlDate = (value) => {
	if (!value) return null;
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString().slice(0, 10);
};

// Create booking
exports.createBooking = async (req, res) => {
	try {
		const {
			user_id,
			tour_id,
			num_people,
			customer_name,
			email,
			phone,
			address,
			notes,
			adults,
			children,
			small_children,
			infants,
			visa_option,
			visa_count,
			single_room_option,
			single_room_count,
			payment_method,
			total_price: payloadTotalPrice,
		} = req.body;

		if (!user_id || !tour_id || !num_people) {
			return res.status(400).json({
				message: "Missing required fields: user_id, tour_id, num_people",
			});
		}

		const normalizedNumPeople = normalizeInt(num_people, 0);
		if (normalizedNumPeople <= 0) {
			return res.status(400).json({
				message: "num_people must be greater than 0",
			});
		}

		const { tour, source: tourSource } = await resolveTourSnapshot(tour_id, req.body);

		const tourUnitPrice = tour?.price != null ? Number(tour.price) : null;
		const totalPriceCandidate =
			payloadTotalPrice != null
				? normalizePrice(payloadTotalPrice)
				: tourUnitPrice != null
					? tourUnitPrice * normalizedNumPeople
					: null;

		if (totalPriceCandidate == null || Number.isNaN(totalPriceCandidate)) {
			return res.status(400).json({
				message:
					"Missing total_price and cannot derive from tour data. Provide total_price or a valid tour snapshot.",
			});
		}

		const tourStartDate = toSqlDate(tour?.start_date);
		const tourEndDate = toSqlDate(tour?.end_date);

		const sql = `
			INSERT INTO bookings (
				user_id, tour_id, booking_date,
				tour_title, tour_image_url, tour_start_date, tour_end_date, tour_unit_price,
				num_people, total_price, status,
				customer_name, email, phone, address, notes,
				adults, children, small_children, infants,
				visa_option, visa_count,
				single_room_option, single_room_count,
				payment_method
			)
			VALUES (?, ?, NOW(),
				?, ?, ?, ?, ?,
				?, ?, 'pending',
				?, ?, ?, ?, ?,
				?, ?, ?, ?,
				?, ?,
				?, ?,
				?
			)
		`;

		const params = [
			user_id,
			tour_id,
			tour?.tour_name || null,
			tour?.image_url || null,
			tourStartDate,
			tourEndDate,
			tourUnitPrice,
			normalizedNumPeople,
			totalPriceCandidate,
			toNullable(customer_name),
			toNullable(email),
			toNullable(phone),
			toNullable(address),
			toNullable(notes),
			normalizeInt(adults, 0),
			normalizeInt(children, 0),
			normalizeInt(small_children, 0),
			normalizeInt(infants, 0),
			normalizeBooleanFlag(visa_option),
			normalizeInt(visa_count, 0),
			normalizeBooleanFlag(single_room_option),
			normalizeInt(single_room_count, 0),
			payment_method || "cash",
		];

		const [result] = await db.execute(sql, params);

		return res.status(201).json({
			message: "Booking created successfully!",
			booking_id: result.insertId,
			tour_source: tourSource,
		});
	} catch (err) {
		return res.status(500).json({ error: err.message || err });
	}
};

// Update booking only when unpaid
exports.updateBooking = async (req, res) => {
	try {
		const { booking_id } = req.params;

		const {
			num_people,
			total_price,
			customer_name,
			email,
			phone,
			address,
			notes,
			adults,
			children,
			small_children,
			infants,
			visa_option,
			visa_count,
			single_room_option,
			single_room_count,
			payment_method,
		} = req.body;

		const [rows] = await db.execute("SELECT * FROM bookings WHERE booking_id = ?", [
			booking_id,
		]);

		if (!rows.length) {
			return res.status(404).json({ message: "Booking not found" });
		}

		const current = rows[0];

		if (current.status === "confirmed") {
			return res.status(400).json({ message: "Cannot update after payment" });
		}

		const sql = `
			UPDATE bookings SET
				num_people = ?, total_price = ?,
				customer_name = ?, email = ?, phone = ?, address = ?, notes = ?,
				adults = ?, children = ?, small_children = ?, infants = ?,
				visa_option = ?, visa_count = ?,
				single_room_option = ?, single_room_count = ?,
				payment_method = ?
			WHERE booking_id = ?
		`;

		const params = [
			normalizeInt(keepOrIncoming(num_people, current.num_people), current.num_people),
			normalizePrice(keepOrIncoming(total_price, current.total_price), current.total_price),
			toNullable(keepOrIncoming(customer_name, current.customer_name)),
			toNullable(keepOrIncoming(email, current.email)),
			toNullable(keepOrIncoming(phone, current.phone)),
			toNullable(keepOrIncoming(address, current.address)),
			toNullable(keepOrIncoming(notes, current.notes)),
			normalizeInt(keepOrIncoming(adults, current.adults), current.adults),
			normalizeInt(keepOrIncoming(children, current.children), current.children),
			normalizeInt(
				keepOrIncoming(small_children, current.small_children),
				current.small_children
			),
			normalizeInt(keepOrIncoming(infants, current.infants), current.infants),
			normalizeBooleanFlag(keepOrIncoming(visa_option, current.visa_option)),
			normalizeInt(keepOrIncoming(visa_count, current.visa_count), current.visa_count),
			normalizeBooleanFlag(
				keepOrIncoming(single_room_option, current.single_room_option)
			),
			normalizeInt(
				keepOrIncoming(single_room_count, current.single_room_count),
				current.single_room_count
			),
			keepOrIncoming(payment_method, current.payment_method) || "cash",
			booking_id,
		];

		await db.execute(sql, params);

		return res.json({ message: "Booking updated successfully!" });
	} catch (err) {
		return res.status(500).json({ error: err.message || err });
	}
};

// Delete booking only when unpaid
exports.deleteBooking = async (req, res) => {
	try {
		const { booking_id } = req.params;

		const [rows] = await db.execute(
			"SELECT status FROM bookings WHERE booking_id = ?",
			[booking_id]
		);

		if (!rows.length) {
			return res.status(404).json({ message: "Booking not found" });
		}

		if (rows[0].status === "confirmed") {
			return res.status(400).json({ message: "Cannot delete after payment" });
		}

		await db.execute("DELETE FROM bookings WHERE booking_id = ?", [booking_id]);

		return res.json({ message: "Booking deleted successfully!" });
	} catch (err) {
		return res.status(500).json({ error: err.message || err });
	}
};

// Get all bookings of a user (no cross-service JOIN)
exports.getBookingsByUser = async (req, res) => {
	try {
		const { user_id } = req.params;

		const sql = `
			SELECT
				booking_id,
				user_id,
				tour_id,
				tour_title,
				tour_image_url,
				tour_start_date,
				tour_end_date,
				tour_unit_price,
				num_people,
				total_price,
				status,
				booking_date,
				customer_name,
				email,
				phone,
				address,
				notes,
				adults,
				children,
				small_children,
				infants,
				visa_option,
				visa_count,
				single_room_option,
				single_room_count,
				payment_method
			FROM bookings
			WHERE user_id = ?
			ORDER BY booking_date DESC
		`;

		const [rows] = await db.execute(sql, [user_id]);

		return res.json(rows);
	} catch (err) {
		return res.status(500).json({ error: err.message || err });
	}
};
