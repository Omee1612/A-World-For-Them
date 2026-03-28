const mongoose = require('mongoose');
require('dotenv').config();
const Adoption = require('./models/Adoption');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const posts = await Adoption.find().limit(5).lean();
    console.log(JSON.stringify(posts, null, 2));
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
