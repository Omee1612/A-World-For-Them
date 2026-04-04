const express = require('express');
const router = express.Router();
const Adoption = require('../models/Adoption');
const ChatRoom = require('../models/ChatRoom');
const { protect } = require('../middleware/auth');

// @GET /api/adoptions - Get all available adoptions with filters
router.get('/', async (req, res) => {
  try {
    const { species, status, city, search, urgency, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (species && species !== 'all') filter.species = species;
    if (status) filter.status = status;
    else filter.status = { $in: ['available', 'pending'] };
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (urgency) filter.urgency = urgency;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Adoption.countDocuments(filter);
    const adoptions = await Adoption.find(filter)
      .populate('poster', 'name avatar email phone')
      .sort({ urgency: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      adoptions,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/adoptions/my-posts
router.get('/my-posts', protect, async (req, res) => {
  try {
    const adoptions = await Adoption.find({ poster: req.user._id })
      .populate('requests.requester', 'name avatar email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, adoptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/adoptions/my-requests
router.get('/my-requests', protect, async (req, res) => {
  try {
    const adoptions = await Adoption.find({ 'requests.requester': req.user._id })
      .populate('poster', 'name avatar email')
      .sort({ createdAt: -1 });

    const requestedAdoptions = adoptions.map(adoption => {
      const myRequest = adoption.requests.find(
        r => r.requester.toString() === req.user._id.toString()
      );
      return { ...adoption.toObject(), myRequest };
    });

    res.json({ success: true, adoptions: requestedAdoptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/adoptions/:id
router.get('/:id', async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate('poster', 'name avatar email phone address bio createdAt')
      .populate('requests.requester', 'name avatar email');

    if (!adoption) return res.status(404).json({ success: false, message: 'Not found' });

    adoption.views += 1;
    await adoption.save();

    res.json({ success: true, adoption });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/adoptions - Create adoption post
router.post('/', protect, async (req, res) => {
  try {
    const adoptionData = { ...req.body, poster: req.user._id };
    const adoption = await Adoption.create(adoptionData);
    await adoption.populate('poster', 'name avatar email');
    res.status(201).json({ success: true, message: 'Adoption post created!', adoption });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @PUT /api/adoptions/:id - Update adoption post
router.put('/:id', protect, async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json({ success: false, message: 'Not found' });
    if (adoption.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Adoption.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('poster', 'name avatar email');
    res.json({ success: true, adoption: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @DELETE /api/adoptions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json({ success: false, message: 'Not found' });
    if (adoption.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await adoption.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/adoptions/:id/request - Request to adopt
router.post('/:id/request', protect, async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json({ success: false, message: 'Not found' });
    if (adoption.status === 'adopted') return res.status(400).json({ success: false, message: 'Already adopted' });
    if (adoption.poster.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot request your own post' });
    }

    const existingRequest = adoption.requests.find(
      r => r.requester.toString() === req.user._id.toString()
    );
    if (existingRequest) return res.status(400).json({ success: false, message: 'Already requested' });

    const chatRoomId = `adoption_${adoption._id}_user_${req.user._id}`;

    adoption.requests.push({
      requester: req.user._id,
      message: req.body.message || '',
      chatRoomId,
    });
    await adoption.save();

    // Create chat room
    await ChatRoom.create({
      roomId: chatRoomId,
      adoption: adoption._id,
      poster: adoption.poster,
      requester: req.user._id,
    });

    res.json({ success: true, message: 'Adoption request sent!', chatRoomId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/adoptions/:id/request/:requestId/respond
router.put('/:id/request/:requestId/respond', protect, async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json({ success: false, message: 'Not found' });
    if (adoption.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const request = adoption.requests.id(req.params.requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const { action } = req.body; // 'accept' or 'reject'
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    request.respondedAt = new Date();

    if (action === 'accept') {
      adoption.status = 'pending';
      // Reject all other requests
      adoption.requests.forEach(r => {
        if (r._id.toString() !== request._id.toString() && r.status === 'pending') {
          r.status = 'rejected';
        }
      });
    }

    await adoption.save();
    res.json({ success: true, message: `Request ${action}ed`, adoption });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/adoptions/:id/complete
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json({ success: false, message: 'Not found' });
    if (adoption.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    adoption.status = 'adopted';
    await adoption.save();
    res.json({ success: true, message: 'Adoption marked as complete!', adoption });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
