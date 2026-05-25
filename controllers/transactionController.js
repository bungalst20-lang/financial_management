const db = require("../config/db");

exports.getAll = (req, res) => {
  db.query(
    `SELECT t.*, c.name as category_name 
         FROM transactions t 
         LEFT JOIN categories c ON t.category_id = c.id 
         WHERE t.user_id = ? 
         ORDER BY t.id DESC`,
    [req.session.userId],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    },
  );
};

exports.getDetail = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT t.*, c.name as category_name 
         FROM transactions t 
         LEFT JOIN categories c ON t.category_id = c.id 
         WHERE t.id = ? AND t.user_id = ?`,
    [id, req.session.userId],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length === 0) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }
      res.json(result[0]);
    },
  );
};

exports.create = (req, res) => {
  const { type, amount, category_id, description, transaction_date } = req.body;
  const userId = req.session.userId;

  db.query(
    `INSERT INTO transactions(type, amount, user_id, category_id, description, transaction_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
    [
      type,
      amount,
      userId,
      category_id || null,
      description || null,
      transaction_date,
    ],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Transaction added",
      });
    },
  );
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { type, amount, category_id, description, transaction_date } = req.body;
  const userId = req.session.userId;

  db.query(
    `UPDATE transactions
         SET type=?, amount=?, category_id=?, description=?, transaction_date=?
         WHERE id=? AND user_id=?`,
    [
      type,
      amount,
      category_id || null,
      description || null,
      transaction_date,
      id,
      userId,
    ],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Transaction updated",
      });
    },
  );
};

exports.remove = (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;

  db.query(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?",
    [id, userId],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Transaction deleted",
      });
    },
  );
};
