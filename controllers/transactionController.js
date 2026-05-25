const db = require('../config/db');

exports.getAll = (req, res) => {
    db.query(
        'SELECT * FROM transactions ORDER BY id DESC',
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );
};

exports.create = (req, res) => {
    const {
        type,
        amount,
        category_id,
        description,
        transaction_date
    } = req.body;

    db.query(
        `INSERT INTO transactions(type, amount, category_id, description, transaction_date)
         VALUES (?, ?, ?, ?, ?)`,
        [type, amount, category_id, description, transaction_date],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Transaction added'
            });
        }
    );
};


exports.update = (req, res) => {
    const { id } = req.params;

    const {
        type,
        amount,
        category_id,
        description,
        transaction_date
    } = req.body;

    db.query(
        `UPDATE transactions
         SET type=?, amount=?, category_id=?, description=?, transaction_date=?
         WHERE id=?`,
        [type, amount, category_id, description, transaction_date, id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Transaction updated'
            });
        }
    );
};

exports.remove = (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM transactions WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Transaction deleted'
            });
        }
    );
};