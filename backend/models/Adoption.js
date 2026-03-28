const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: String,
  trait: String,
  location: { type: String, required: true },
  description: String,
  contact: { type: String, required: true },
  image: String,
  poster: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  chat: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  requests: [
    {
      requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
      requestedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Adoption", adoptionSchema);