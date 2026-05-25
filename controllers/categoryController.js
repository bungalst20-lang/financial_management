const db = require('../config/db');

exports.getAll = (req, res) => {
    db.query('SELECT * FROM categories', (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};


exports.create = (req, res) => {
    const { name } = req.body;

    db.query(
        'INSERT INTO categories(name) VALUES (?)',
        [name],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Category added'
            });
        }
    );
};

exports.remove = (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM categories WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: 'Category deleted'
            });
        }
    );
};