require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Volunteer = require('../models/Volunteer');
const Citizen = require('../models/Citizen');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const volunteers = await Volunteer.find().lean();
    const citizens = await Citizen.find().lean();
    const volMap = new Map();
    volunteers.forEach(v => {
      if (v.email) volMap.set(v.email.toLowerCase(), v);
      if (v.phone) volMap.set(v.phone, v);
    });
    const dual = [];
    citizens.forEach(c => {
      const keyEmail = c.email?.toLowerCase();
      const keyPhone = c.phone;
      if ((keyEmail && volMap.has(keyEmail)) || (keyPhone && volMap.has(keyPhone))) {
        const vol = volMap.get(keyEmail) || volMap.get(keyPhone);
        dual.push({
          name: c.name || c.username,
          email: c.email || keyEmail,
          phone: c.phone,
          volunteerId: vol._id,
          citizenId: c._id
        });
      }
    });
    console.log('=== Users who are both Volunteer and Citizen ===');
    if (dual.length === 0) console.log('None found');
    else dual.forEach(u => console.log(u));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
