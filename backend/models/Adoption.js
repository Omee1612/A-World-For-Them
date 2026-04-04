const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  message: {
    type: String,
    default: '',
    maxlength: 500,
  },
  chatRoomId: {
    type: String,
    default: '',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: Date,
});

const adoptionSchema = new mongoose.Schema({
  poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  animalName: {
    type: String,
    required: [true, 'Animal name is required'],
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
    trim: true,
  },
  age: {
    value: { type: Number, min: 0 },
    unit: { type: String, enum: ['weeks', 'months', 'years'], default: 'months' },
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown',
  },
  size: {
    type: String,
    enum: ['tiny', 'small', 'medium', 'large', 'extra-large'],
    default: 'medium',
  },
  color: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: 20,
    maxlength: 1000,
  },
  photos: [{
    type: String,
  }],
  location: {
    city: { type: String, default: '' },
    area: { type: String, default: '' },
  },
  healthStatus: {
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    microchipped: { type: Boolean, default: false },
    conditions: [{ type: String }],
  },
  personality: [{
    type: String,
    enum: ['friendly', 'playful', 'calm', 'energetic', 'shy', 'protective', 'good-with-kids', 'good-with-pets', 'indoor', 'outdoor'],
  }],
  status: {
    type: String,
    enum: ['available', 'pending', 'adopted', 'removed'],
    default: 'available',
  },
  requests: [adoptionRequestSchema],
  views: {
    type: Number,
    default: 0,
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'critical'],
    default: 'normal',
  },
}, { timestamps: true });

// Index for search
adoptionSchema.index({ species: 1, status: 1, 'location.city': 1 });
adoptionSchema.index({ animalName: 'text', description: 'text', breed: 'text' });

module.exports = mongoose.model('Adoption', adoptionSchema);
