const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("node:path");
const { getAllPosts, createPost, requestAdoption, acceptRequest, rejectRequest, addChatMessage, deletePost } = require("../controllers/adoptionController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder to store uploaded images
  },
  filename: function (req, file, cb) {
    // preserve original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", getAllPosts);
router.post("/", authMiddleware, upload.single("image"), createPost); // multer used here
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/request", authMiddleware, requestAdoption);
router.put("/:id/requests/:requestId/accept", authMiddleware, acceptRequest);
router.put("/:id/requests/:requestId/reject", authMiddleware, rejectRequest);
router.post("/:id/chat", authMiddleware, addChatMessage);

module.exports = router;