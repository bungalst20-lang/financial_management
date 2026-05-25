const db = require("../config/db");

exports.getAll = (req, res) => {
  db.query("SELECT * FROM categories", (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
};

exports.create = (req, res) => {
  const { name } = req.body;

  db.query("INSERT INTO categories(name) VALUES (?)", [name], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Category added",
    });
  });
};

exports.remove = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categories WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Category deleted",
    });
  });
};

exports.getDetail = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM categories WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(result[0]);
  });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  db.query("UPDATE categories SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Category updated",
    });
  });
};
