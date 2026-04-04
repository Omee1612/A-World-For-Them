const express = require('express');
const router = express.Router();
const VetAppointment = require('../models/VetAppointment');
const { protect, authorize } = require('../middleware/auth');

const SERVICES = {
  'general-checkup': { name: 'General Checkup', duration: 30, fee: 500 },
  'vaccination': { name: 'Vaccination', duration: 20, fee: 800 },
  'neutering-spaying': { name: 'Neutering/Spaying', duration: 120, fee: 3500 },
  'dental-care': { name: 'Dental Care', duration: 60, fee: 1500 },
  'emergency': { name: 'Emergency Care', duration: 60, fee: 2000 },
  'microchipping': { name: 'Microchipping', duration: 15, fee: 600 },
  'deworming': { name: 'Deworming', duration: 15, fee: 400 },
  'skin-treatment': { name: 'Skin Treatment', duration: 45, fee: 1200 },
  'nutrition-consult': { name: 'Nutrition Consultation', duration: 30, fee: 700 },
  'post-adoption-checkup': { name: 'Post-Adoption Checkup', duration: 30, fee: 400 },
};

const VETS = [
  { name: 'Dr. Anika Rahman', speciality: 'General Practice', available: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { name: 'Dr. Sharif Hossain', speciality: 'Surgery', available: ['Mon', 'Wed', 'Thu', 'Sat'] },
  { name: 'Dr. Priya Das', speciality: 'Exotic Animals', available: ['Tue', 'Thu', 'Fri', 'Sat'] },
];

// @GET /api/vet/services
router.get('/services', (req, res) => {
  res.json({ success: true, services: SERVICES, vets: VETS });
});

// @GET /api/vet/available-slots
router.get('/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date required' });

    const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const booked = await VetAppointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] },
    }).select('timeSlot');

    const bookedSlots = booked.map(a => a.timeSlot);
    const available = slots.filter(s => !bookedSlots.includes(s));

    res.json({ success: true, slots: available, totalBooked: bookedSlots.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/vet/my-appointments
router.get('/my-appointments', protect, async (req, res) => {
  try {
    const appointments = await VetAppointment.find({ owner: req.user._id })
      .sort({ appointmentDate: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/vet/book
router.post('/book', protect, async (req, res) => {
  try {
    const { animalName, species, breed, age, serviceType, appointmentDate, timeSlot, notes, isStray } = req.body;

    if (!animalName || !species || !serviceType || !appointmentDate || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check slot availability
    const existing = await VetAppointment.findOne({
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $nin: ['cancelled'] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }

    const serviceInfo = SERVICES[serviceType];
    const vetIndex = Math.floor(Math.random() * VETS.length);

    const appointment = await VetAppointment.create({
      owner: req.user._id,
      animalName,
      species,
      breed: breed || 'Unknown',
      age: age || { value: 1, unit: 'years' },
      serviceType,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      vet: VETS[vetIndex].name,
      notes: notes || '',
      isStray: isStray || false,
      fee: serviceInfo ? serviceInfo.fee : 0,
    });

    res.status(201).json({
      success: true,
      message: `Appointment booked with ${VETS[vetIndex].name}!`,
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @PUT /api/vet/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await VetAppointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });
    if (appointment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/vet/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await VetAppointment.findById(req.params.id).populate('owner', 'name email phone');
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
