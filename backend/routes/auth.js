
const express = require("express");
const { regUser, logUser, getNotifications, markNotificationRead } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register",regUser);
router.post("/login",logUser);
router.get("/notifications", authMiddleware, getNotifications);
router.put("/notifications/:id/read", authMiddleware, markNotificationRead);

module.exports = router;