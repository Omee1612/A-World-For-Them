const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
exports.regUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Fields are empty" });
    }

    const userExists = await User.findOne({ username });
    const emailExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ error: "Username already exists" });
    if (emailExists) return res.status(400).json({ error: "Email already exists" });

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPass });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

        // Return username with token
   res.status(201).json({
  _id: newUser._id,
  username: newUser.username,
  email: newUser.email,
  token
});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error found" });
  }
};

exports.logUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Fields are empty" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Such a user does not exist" });

    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) return res.status(401).json({ error: "Password is incorrect" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

     // Return username with token
    res.status(200).json({_id: user._id, message: "User logged in", token, username: user.username , email:user.email});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error detected in login" });
  }
};

exports.addNotification = async (userId, type, message, meta = {}) => {
  await User.findByIdAndUpdate(userId, {
    $push: {
      notifications: { type, message, meta, read: false, createdAt: new Date() }
    }
  });
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await User.findById(req.user._id).select("notifications");
    res.json(notifications.notifications || []);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    await User.updateOne(
      { _id: req.user._id, "notifications._id": notificationId },
      { $set: { "notifications.$.read": true } }
    );
    res.status(200).json({ msg: "Notification marked read" });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getMe = async(req,res) => {
  res.json(req.user);
};