const db = require("../config/db");
const { resolveTourSnapshot } = require("../integrations/tourCatalogAdapter");

const toSqlScalar = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return toSqlScalar(value.at(-1));
  }

  if (value == null) return null;
  if (typeof value === "object") return null;

  return value;
};

// ===================================================
//  CREATE BOOKING (Customer creates booking)
// ===================================================
exports.createBooking = async (req, res) => {
  const {
    user_id,
    tour_id,
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
    payment_method
  } = req.body;

  // --- Validate ---
  if (!user_id || !tour_id || !num_people || !total_price) {
    return res.status(400).json({ message: "Missing required fields!" });
  }

  // --- Resolve Tour Snapshot (Saga / Cross-Service Integration) ---
  const { tour: tourSnapshot, source } = await resolveTourSnapshot(tour_id, req.body);
  
  const tourTitle = toSqlScalar(tourSnapshot ? tourSnapshot.tour_name : null);
  const tourImageUrl = toSqlScalar(tourSnapshot ? tourSnapshot.image_url : null);
  let tourStartDate = toSqlScalar(tourSnapshot ? tourSnapshot.start_date : null);
  let tourEndDate = toSqlScalar(tourSnapshot ? tourSnapshot.end_date : null);
  const normalizedTourPrice = toSqlScalar(tourSnapshot ? tourSnapshot.price : null);
  const tourUnitPrice = normalizedTourPrice == null
    ? null
    : Number(normalizedTourPrice);

  // MySQL DATE format fix if timestamps are provided
  if (tourStartDate && typeof tourStartDate === 'string') {
    tourStartDate = tourStartDate.split('T')[0];
  }
  if (tourEndDate && typeof tourEndDate === 'string') {
    tourEndDate = tourEndDate.split('T')[0];
  }

  if (tourUnitPrice != null && Number.isNaN(tourUnitPrice)) {
    return res.status(502).json({ message: "Invalid tour price returned by catalog service" });
  }

  const sql = `
    INSERT INTO bookings (
      user_id, tour_id, 
      tour_title, tour_image_url, tour_start_date, tour_end_date, tour_unit_price,
      booking_date,
      num_people, total_price, status,

      customer_name, email, phone, address, notes,
      adults, children, small_children, infants,
      visa_option, visa_count,
      single_room_option, single_room_count,
      payment_method
    )
    VALUES (?, ?,
      ?, ?, ?, ?, ?,
      NOW(),
      ?, ?, 'pending',
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?
    )
  `;

  const params = [
    user_id, tour_id,
    tourTitle, tourImageUrl, tourStartDate, tourEndDate, tourUnitPrice,
    num_people, total_price,

    customer_name, email, phone, address, notes,
    adults, children, small_children, infants,
    visa_option, visa_count,
    single_room_option, single_room_count,
    payment_method
  ].map((value) => toSqlScalar(value));

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Booking insertion error:", err);
      return res.status(500).json({ error: err });
    }

    res.json({
      message: "Booking created successfully!",
      booking_id: result.insertId,
      tour_source: source
    });
  });
};


// ===================================================
//  UPDATE BOOKING (only if NOT paid)
// ===================================================
exports.updateBooking = (req, res) => {
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

    payment_method
  } = req.body;

  const check = `SELECT status FROM bookings WHERE booking_id = ?`;

  db.query(check, [booking_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (!result.length)
      return res.status(404).json({ message: "Booking not found" });

    if (result[0].status === "confirmed")
      return res.status(400).json({ message: "Cannot update after payment" });

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
      num_people, total_price,
      customer_name, email, phone, address, notes,
      adults, children, small_children, infants,
      visa_option, visa_count,
      single_room_option, single_room_count,
      payment_method,
      booking_id
    ];

    db.query(sql, params, (err2) => {
      if (err2) return res.status(500).json({ error: err2 });

      res.json({ message: "Booking updated successfully!" });
    });
  });
};


// ===================================================
//  DELETE BOOKING (only if unpaid)
// ===================================================
exports.deleteBooking = (req, res) => {
  const { booking_id } = req.params;

  const check = `SELECT status FROM bookings WHERE booking_id = ?`;

  db.query(check, [booking_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (!result.length)
      return res.status(404).json({ message: "Booking not found" });

    if (result[0].status === "confirmed")
      return res.status(400).json({ message: "Cannot delete after payment" });

    db.query(`DELETE FROM bookings WHERE booking_id = ?`, [booking_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: "Booking deleted successfully!" });
    });
  });
};


// ===================================================
//  GET ALL BOOKINGS (admin/reporting view)
// ===================================================
exports.getAllBookings = (_req, res) => {
  const sql = `
    SELECT
      b.booking_id,
      b.user_id,
      b.tour_id,
      b.total_price,
      b.status,
      b.booking_date,
      b.customer_name,
      b.email,
      b.tour_title AS tour_name,
      b.tour_start_date AS start_date
    FROM bookings b
    ORDER BY b.booking_date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });

    res.json(result);
  });
};


// ===================================================
//  GET ALL BOOKINGS FOR A USER
// ===================================================
exports.getBookingsByUser = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT 
      b.booking_id, 
      b.user_id, 
      b.tour_id,
      b.num_people,
      b.total_price,
      b.status,
      b.booking_date,

      b.customer_name,
      b.email,
      b.phone,
      b.address,
      b.notes,
      b.adults,
      b.children,
      b.small_children,
      b.infants,

      b.tour_title AS tour_name,
      b.tour_image_url AS image_url,
      b.tour_start_date AS start_date,
      b.tour_end_date AS end_date,
      b.tour_unit_price AS price

    FROM bookings b
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    res.json(result);
  });
};

