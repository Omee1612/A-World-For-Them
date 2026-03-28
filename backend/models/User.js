const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notifications: [
    {
      type: { type: String, required: true },
      message: { type: String, required: true },
      meta: { type: mongoose.Schema.Types.Mixed, default: {} },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);