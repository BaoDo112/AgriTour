const db = require('../config/db');


exports.getAllRegions = (req, res) => {
  db.query("SELECT * FROM regions", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};


exports.createRegion = (req, res) => {
  const { region_name } = req.body;
  if (!region_name) return res.status(400).json({ message: "Missing region_name" });

  const sql = "INSERT INTO regions (region_name) VALUES (?)";
  db.query(sql, [region_name], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Region created successfully", region_id: result.insertId });
  });
};


exports.updateRegion = (req, res) => {
  const { id } = req.params;
  const { region_name } = req.body;

  const sql = "UPDATE regions SET region_name = ? WHERE region_id = ?";
  db.query(sql, [region_name, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Region not found" });
    res.json({ message: "Region updated successfully" });
  });
};


exports.deleteRegion = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM regions WHERE region_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Region not found" });
    res.json({ message: "Region deleted successfully" });
  });
};

