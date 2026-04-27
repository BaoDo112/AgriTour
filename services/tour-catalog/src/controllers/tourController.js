const db = require('../config/db');



exports.getToursByPartner = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT *
    FROM tours
    WHERE created_by = ?
    ORDER BY tour_id DESC
  `;

  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};



exports.getTourById = (req, res) => {
  const { tour_id } = req.params;

  const sql = `
    SELECT 
      t.tour_id,
      t.tour_name,
      t.description,
      t.location,
      t.start_date,
      t.end_date,
      t.price,
      t.available_slots,
      t.status,
      t.image_url,
      t.created_by AS partner_id,
      r.region_name,
      c.category_name

    FROM tours t
    LEFT JOIN regions r ON t.region_id = r.region_id
    LEFT JOIN categories c ON t.category_id = c.category_id
    WHERE t.tour_id = ?
  `;

  db.query(sql, [tour_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tour not found" });
    }

    res.json(rows[0]);
  });
};



exports.getToursByRegion = (req, res) => {
  const { region_id } = req.params;

  db.query(
    "SELECT * FROM tours WHERE region_id = ?",
    [region_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
};

// ===============================
// 📌 GET TOURS BY CATEGORY
// ===============================
exports.getToursByCategory = (req, res) => {
  const { category_id } = req.params;

  db.query(
    "SELECT * FROM tours WHERE category_id = ?",
    [category_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
};


// ===============================
// 📌 CREATE TOUR (partner / admin)
// ===============================
exports.createTour = (req, res) => {
  const {
    tour_name,
    description,
    location,
    region_id,
    category_id,
    start_date,
    end_date,
    price,
    available_slots,
    created_by,
    role
  } = req.body;

  const image_url = req.file ? `/uploads/tours/${req.file.filename}` : null;

  const status = role === "admin" ? "approved" : "pending";

  const sql = `
    INSERT INTO tours (
      tour_name, description, location, region_id, category_id,
      start_date, end_date, price, available_slots, created_by, 
      image_url, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      tour_name,
      description,
      location,
      region_id,
      category_id,
      start_date,
      end_date,
      price,
      available_slots,
      created_by,
      image_url,
      status,
    ],
    (err) => {
      if (err) {
        console.error("❌ Error inserting tour:", err);
        return res.status(500).json({ error: err });
      }
      res.json({ message: "Tour created successfully!" });
    }
  );
};

// ===============================
// 📌 UPDATE TOUR
// ===============================
exports.updateTour = (req, res) => {
  const { tour_id } = req.params;
  const data = req.body;

  if (req.file) {
    data.image_url = `/uploads/tours/${req.file.filename}`;
  }

  db.query("UPDATE tours SET ? WHERE tour_id = ?", [data, tour_id], (err) => {
    if (err) return res.status(500).json({ error: err });

    res.json({ message: "Tour updated successfully!" });
  });
};

// ===============================
// 📌 ADMIN APPROVE / REJECT TOUR
// ===============================
exports.reviewTour = (req, res) => {
  console.log("📨 BODY RECEIVED:", req.body);
  console.log("📨 PARAMS RECEIVED:", req.params);

  const { tour_id } = req.params;
  const { action } = req.body;

  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  // 1️⃣ Lấy trạng thái hiện tại của tour
  db.query(
    "SELECT status FROM tours WHERE tour_id = ?",
    [tour_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });

      if (rows.length === 0) {
        return res.status(404).json({ message: "Tour not found" });
      }

      const currentStatus = rows[0].status;

      // 2️⃣ Chỉ cho duyệt nếu đang `pending`
      if (currentStatus !== "pending") {
        return res
          .status(400)
          .json({ message: "Only pending tours can be reviewed" });
      }

      // 3️⃣ Cập nhật trạng thái
      db.query(
        "UPDATE tours SET status = ? WHERE tour_id = ?",
        [action, tour_id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2 });

          // 4️⃣ Ghi log duyệt
          res.json({ message: `Tour ${action} successfully` });
        }
      );
    }
  );
};

// ===============================
// 📌 DELETE TOUR
// ===============================
exports.deleteTour = (req, res) => {
  const { tour_id } = req.params;

  db.query("DELETE FROM tours WHERE tour_id = ?", [tour_id], (err) => {
    if (err) return res.status(500).json({ error: err });

    res.json({ message: "Tour deleted successfully!" });
  });
};

// ===============================
// 📌 GET ALL TOURS FOR ADMIN
// ===============================
exports.getAllToursForAdmin = (req, res) => {
  const sql = `
    SELECT 
      t.tour_id,
      t.tour_name,
      t.location,
      t.start_date,
      t.end_date,
      t.price,
      t.status,
      t.created_by AS partner_id,
      r.region_name
    FROM tours t
    LEFT JOIN regions r ON t.region_id = r.region_id
    ORDER BY t.tour_id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};


exports.getAllTours = (req, res) => {
  db.query("SELECT * FROM tours WHERE status = 'approved'", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

exports.getFeaturedTours = (req, res) => {
  const sql = `
    SELECT *
    FROM tours
    WHERE status = 'approved'
    ORDER BY start_date ASC, tour_id DESC
    LIMIT 3
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    res.json({
      release: "tour-catalog-codedeploy-v1",
      count: rows.length,
      tours: rows,
    });
  });
};


