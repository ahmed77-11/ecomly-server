const express = require("express");
const { getUsers, getUserById, updateUser } = require("../controllers/users");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

module.exports = router;
