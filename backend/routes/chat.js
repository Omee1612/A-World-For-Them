const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const { protect } = require('../middleware/auth');

// @GET /api/chat/my-rooms
router.get('/my-rooms', protect, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      $or: [{ poster: req.user._id }, { requester: req.user._id }],
      isActive: true,
    })
      .populate('adoption', 'animalName species photos status')
      .populate('poster', 'name avatar')
      .populate('requester', 'name avatar')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/chat/:roomId
router.get('/:roomId', protect, async (req, res) => {
  try {
    const room = await ChatRoom.findOne({ roomId: req.params.roomId })
      .populate('adoption', 'animalName species photos status')
      .populate('poster', 'name avatar email')
      .populate('requester', 'name avatar email')
      .populate('messages.sender', 'name avatar');

    if (!room) return res.status(404).json({ success: false, message: 'Chat room not found' });

    const isParticipant =
      room.poster._id.toString() === req.user._id.toString() ||
      room.requester._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Mark messages as read
    room.messages.forEach(msg => {
      if (!msg.readBy.includes(req.user._id)) {
        msg.readBy.push(req.user._id);
      }
    });
    await room.save();

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/chat/:roomId/message
router.post('/:roomId/message', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message required' });

    const room = await ChatRoom.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const isParticipant =
      room.poster.toString() === req.user._id.toString() ||
      room.requester.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

    const newMessage = {
      sender: req.user._id,
      senderName: req.user.name,
      message: message.trim(),
      readBy: [req.user._id],
    };

    room.messages.push(newMessage);
    room.lastMessage = message.trim().substring(0, 100);
    room.lastMessageAt = new Date();
    await room.save();

    const savedMsg = room.messages[room.messages.length - 1];

    // Emit via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.roomId).emit('receive_message', {
        ...savedMsg.toObject(),
        sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
      });
    }

    res.json({ success: true, message: savedMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
