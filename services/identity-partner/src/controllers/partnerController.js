const db = require("../config/db");

// =========================
// 📌 Partner applies for approval
// =========================
exports.createPartner = (req, res) => {
  const { user_id, company_name, business_license, address, description } = req.body;
  const sql = `
    INSERT INTO partners (user_id, company_name, business_license, address, description)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [user_id, company_name, business_license, address, description], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Partner application submitted. Waiting for admin approval." });
  });
};

// =========================
// 📌 Get all partners (Admin)
// =========================
exports.getAllPartners = (req, res) => {
  const sql = `SELECT * FROM partners`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};

// =========================
// 📌 Get partner by ID
// =========================
exports.getPartnerById = (req, res) => {
  const { partner_id } = req.params;
  const sql = `SELECT * FROM partners WHERE partner_id = ?`;
  db.query(sql, [partner_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (!result.length) return res.status(404).json({ message: "Partner not found" });
    res.json(result[0]);
  });
};

// =========================
// 📌 Admin approves or rejects a partner
// =========================
exports.approvePartner = (req, res) => {
  const { partner_id } = req.params;
  const { approved } = req.body; // true / false
  const sql = "UPDATE partners SET approved = ? WHERE partner_id = ?";
  db.query(sql, [approved, partner_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: approved ? "Partner approved!" : "Partner rejected!" });
  });
};

// =========================
// 📌 Delete partner (Admin)
// =========================
exports.deletePartner = (req, res) => {
  const { partner_id } = req.params;
  const sql = "DELETE FROM partners WHERE partner_id = ?";
  db.query(sql, [partner_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Partner deleted successfully" });
  });
};
