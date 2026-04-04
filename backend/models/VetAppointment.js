const mongoose = require('mongoose');

const vetAppointmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  animalName: {
    type: String,
    required: true,
    trim: true,
  },
  species: {
    type: String,
    required: true,
    enum: ['dog', 'cat', 'rabbit', 'bird', 'other'],
  },
  breed: {
    type: String,
    default: 'Unknown',
  },
  age: {
    value: Number,
    unit: { type: String, enum: ['weeks', 'months', 'years'], default: 'months' },
  },
  serviceType: {
    type: String,
    required: true,
    enum: [
      'general-checkup',
      'vaccination',
      'neutering-spaying',
      'dental-care',
      'emergency',
      'microchipping',
      'deworming',
      'skin-treatment',
      'nutrition-consult',
      'post-adoption-checkup',
    ],
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  vet: {
    type: String,
    default: 'Auto-assigned',
  },
  notes: {
    type: String,
    maxlength: 500,
    default: '',
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  isStray: {
    type: Boolean,
    default: false,
  },
  relatedAdoption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adoption',
    default: null,
  },
  medicalRecord: {
    diagnosis: { type: String, default: '' },
    treatment: { type: String, default: '' },
    prescription: [{ medication: String, dosage: String, duration: String }],
    followUpDate: Date,
    vetNotes: { type: String, default: '' },
  },
  fee: {
    type: Number,
    default: 0,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

vetAppointmentSchema.index({ owner: 1, appointmentDate: 1 });
vetAppointmentSchema.index({ appointmentDate: 1, status: 1 });

module.exports = mongoose.model('VetAppointment', vetAppointmentSchema);
