const express = require("express");
const { getUserConversations, getConversationMessages, sendMessage } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/conversations", authMiddleware, getUserConversations);
router.get("/conversations/:postId", authMiddleware, getConversationMessages);
router.post("/conversations/:postId/messages", authMiddleware, sendMessage);

module.exports = router;
