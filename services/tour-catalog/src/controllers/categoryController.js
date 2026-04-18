const db = require('../config/db');


exports.getAllCategories = (req, res) => {
  db.query("SELECT * FROM categories", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};


exports.createCategory = (req, res) => {
  const { category_name } = req.body;
  db.query("INSERT INTO categories (category_name) VALUES (?)", [category_name], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Category created successfully" });
  });
};

exports.deleteCategory = (req, res) => {
  const { category_id } = req.params;
  db.query("DELETE FROM categories WHERE category_id = ?", [category_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Category deleted successfully" });
  });
};
