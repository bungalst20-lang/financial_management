const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, transactionController.getAll);
router.post("/", authMiddleware, transactionController.create);
router.get("/:id", authMiddleware, transactionController.getDetail);
router.put("/:id", authMiddleware, transactionController.update);
router.delete("/:id", authMiddleware, transactionController.remove);

module.exports = router;
