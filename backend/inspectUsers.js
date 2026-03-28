const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find().lean();
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
