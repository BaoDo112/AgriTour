const db = require("../config/db");

// =========================
// 📌 Get all users (Admin only)
// =========================
exports.getAllUsers = (req, res) => {
  const sql = "SELECT user_id, full_name, email, phone, role, created_at FROM users";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};

// =========================
// 📌 Get user by ID
// =========================
exports.getUserById = (req, res) => {
  const { user_id } = req.params;
  const sql = "SELECT user_id, full_name, email, phone, role, created_at FROM users WHERE user_id = ?";
  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (!result.length) return res.status(404).json({ message: "User not found" });
    res.json(result[0]);
  });
};

// =========================
// 📌 Update user info (User or Admin)
// =========================
exports.updateUser = (req, res) => {
  const { user_id } = req.params;
  const { full_name, phone, email } = req.body;

  // Mảng lưu các cột cần cập nhật
  const updates = [];
  const values = [];

  if (full_name) {
    updates.push("full_name = ?");
    values.push(full_name);
  }
  if (phone) {
    updates.push("phone = ?");
    values.push(phone);
  }
  if (email) {
    updates.push("email = ?");
    values.push(email);
  }

  // Nếu không có dữ liệu nào để cập nhật
  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  // Ghép câu SQL động
  const sql = `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`;
  values.push(user_id);

  db.query(sql, values, (err, result) => {
    if (err) {
      // Kiểm tra lỗi trùng email
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email already exists" });
      }
      return res.status(500).json({ error: err });
    }

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully" });
  });
};

// =========================
// 📌 Change user role (Admin only)
// =========================
exports.changeUserRole = (req, res) => {
  const { user_id } = req.params;
  const { role } = req.body; // admin / customer / partner
  const sql = "UPDATE users SET role = ? WHERE user_id = ?";
  db.query(sql, [role, user_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: `User role updated to ${role}` });
  });
};

// =========================
// 📌 Delete user (Admin only)
// =========================
exports.deleteUser = (req, res) => {
  const { user_id } = req.params;
  const sql = "DELETE FROM users WHERE user_id = ?";
  db.query(sql, [user_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "User deleted successfully" });
  });
};
