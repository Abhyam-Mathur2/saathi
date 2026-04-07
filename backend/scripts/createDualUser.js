require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Volunteer = require('../models/Volunteer');
const Citizen = require('../models/Citizen');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'dualuser@example.com';
    const phone = '9876543210';
    const name = 'Dual User';
    const city = 'Chennai';

    // Create Citizen (if not exists)
    let citizen = await Citizen.findOne({ phone: phone });
    if (!citizen) {
      citizen = new Citizen({
        name,
        username: email.split('@')[0],
        password: 'password123',
        phone,
        city,
        state: 'Tamil Nadu'
        // location will default via schema
      });
      await citizen.save();
      console.log('Created Citizen:', citizen._id);
    } else {
      console.log('Citizen already exists:', citizen._id);
    }

    // Create Volunteer (if not exists)
    let volunteer = await Volunteer.findOne({ email: email.toLowerCase() });
    if (!volunteer) {
      volunteer = new Volunteer({
        name,
        email: email.toLowerCase(),
        password: 'password123',
        phone,
        city,
        state: 'Tamil Nadu',
        // location will default to safe coordinates
        status: 'Active'
      });
      await volunteer.save();
      console.log('Created Volunteer:', volunteer._id);
    } else {
      console.log('Volunteer already exists:', volunteer._id);
    }

    console.log('Dual entry ready – same email/phone for both roles.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
