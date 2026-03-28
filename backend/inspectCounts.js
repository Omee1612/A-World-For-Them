const mongoose = require('mongoose');
require('dotenv').config();
const Adoption = require('./models/Adoption');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const total = await Adoption.countDocuments();
    const withContact = await Adoption.countDocuments({ contact: { $exists: true, $ne: null, $ne: '' } });
    const withPoster = await Adoption.countDocuments({ poster: { $exists: true, $ne: null } });
    console.log({ total, withContact, withPoster });
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
