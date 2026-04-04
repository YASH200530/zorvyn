const express = require("express");
const { exportRecords, getRecords, createRecord, updateRecord, deleteRecord } = require("../controllers/record.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/export", authenticate, authorize(['analyst', 'admin']), exportRecords);
router.get("/", authenticate, authorize(['analyst', 'admin']), getRecords);
router.post("/", authenticate, authorize(['admin']), createRecord);
router.put("/:id", authenticate, authorize(['admin']), updateRecord);
router.delete("/:id", authenticate, authorize(['admin']), deleteRecord);

module.exports = router;
