const express = require("express");
const { getUsers, createUser, updateUser } = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticate, authorize(['admin']), getUsers);
router.post("/", authenticate, authorize(['admin']), createUser);
router.put("/:id", authenticate, authorize(['admin']), updateUser);

module.exports = router;
