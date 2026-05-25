const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, categoryController.getAll);
router.post('/', authMiddleware, categoryController.create);
router.delete('/:id', authMiddleware, categoryController.remove);

module.exports = router;