const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Adoption = require('../models/Adoption');
const VetAppointment = require('../models/VetAppointment');
const { protect, authorize } = require('../middleware/auth');
const { sendAccountBannedEmail, sendPostRemovedEmail } = require('../config/email');

const adminOnly = [protect, authorize('admin')];

// ── Overview Stats ────────────────────────────────────────────────────────────

// @GET /api/admin/stats
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdoptions,
      availableAdoptions,
      adoptedAnimals,
      totalAppointments,
      pendingAppointments,
      bannedUsers,
      urgentAdoptions,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Adoption.countDocuments(),
      Adoption.countDocuments({ status: 'available' }),
      Adoption.countDocuments({ status: 'adopted' }),
      VetAppointment.countDocuments(),
      VetAppointment.countDocuments({ status: { $in: ['scheduled', 'confirmed'] } }),
      User.countDocuments({ isBanned: true }),
      Adoption.countDocuments({ urgency: { $in: ['urgent', 'critical'] } }),
    ]);

    // Recent activity — last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsersThisWeek, newPostsThisWeek, newAppointmentsThisWeek] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Adoption.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      VetAppointment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, banned: bannedUsers, newThisWeek: newUsersThisWeek },
        adoptions: { total: totalAdoptions, available: availableAdoptions, adopted: adoptedAnimals, urgent: urgentAdoptions, newThisWeek: newPostsThisWeek },
        appointments: { total: totalAppointments, pending: pendingAppointments, newThisWeek: newAppointmentsThisWeek },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── User Management ───────────────────────────────────────────────────────────

// @GET /api/admin/users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, banned } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    if (role) filter.role = role;
    if (banned === 'true') filter.isBanned = true;
    if (banned === 'false') filter.isBanned = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot ban an admin' });

    user.isBanned = true;
    user.banReason = reason || 'Violation of community guidelines';
    await user.save();

    sendAccountBannedEmail({ userEmail: user.email, userName: user.name, reason: user.banReason });

    res.json({ success: true, message: `${user.name} has been banned`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/admin/users/:id/unban
router.put('/users/:id/unban', adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: '' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `${user.name} has been unbanned`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/admin/users/:id/role
router.put('/users/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'vet'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @DELETE /api/admin/users/:id
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete an admin account' });
    await user.deleteOne();
    // Also delete their posts
    await Adoption.deleteMany({ poster: req.params.id });
    await VetAppointment.deleteMany({ owner: req.params.id });
    res.json({ success: true, message: 'User and all their data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Adoption Management ───────────────────────────────────────────────────────

// @GET /api/admin/adoptions
router.get('/adoptions', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, species, urgency, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (species) filter.species = species;
    if (urgency) filter.urgency = urgency;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Adoption.countDocuments(filter);
    const adoptions = await Adoption.find(filter)
      .populate('poster', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, adoptions, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @DELETE /api/admin/adoptions/:id
router.delete('/adoptions/:id', adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const adoption = await Adoption.findById(req.params.id).populate('poster', 'name email');
    if (!adoption) return res.status(404).json({ success: false, message: 'Not found' });

    sendPostRemovedEmail({
      userEmail: adoption.poster.email,
      userName: adoption.poster.name,
      animalName: adoption.animalName,
      reason: reason || '',
    });

    await adoption.deleteOne();
    res.json({ success: true, message: 'Adoption post removed and user notified' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/admin/adoptions/:id/status
router.put('/adoptions/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['available', 'pending', 'adopted', 'removed'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const adoption = await Adoption.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, adoption });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Vet Appointment Management ────────────────────────────────────────────────

// @GET /api/admin/appointments
router.get('/appointments', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await VetAppointment.countDocuments(filter);
    const appointments = await VetAppointment.find(filter)
      .populate('owner', 'name email')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, appointments, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/admin/appointments/:id/status
router.put('/appointments/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const appointment = await VetAppointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
