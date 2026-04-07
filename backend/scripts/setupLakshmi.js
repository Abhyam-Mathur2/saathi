const mongoose = require('mongoose');
require('dotenv').config();
const Citizen = require('../models/Citizen');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');

async function setup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const citizen = await Citizen.findOne({ name: /Lakshmi Rajan/i });
  if (!citizen) {
     console.log('Lakshmi Rajan not found in Citizens.');
     process.exit(1);
  }

  // Find an org in her city
  const org = await Organization.findOne({ city: { $regex: new RegExp(citizen.city || 'Chennai', 'i') } });
  
  const targetEmail = citizen.email || "lakshmi@example.com";

  let vol = await Volunteer.findOne({ email: targetEmail });
  if (!vol) {
      vol = new Volunteer({
          name: citizen.name,
          email: targetEmail,
          phone: citizen.phone || '9800100005',
          password: citizen.password || 'password123',
          city: citizen.city || 'Chennai',
          location: {
              type: 'Point',
              coordinates: [80.2707, 13.0827], // Default Chennai coords
              address: citizen.address || 'Chennai'
          },
          status: 'Active',
          organization: org ? org._id : undefined
      });
      await vol.save();
      console.log('Created Lakshmi Rajan as a Volunteer! Org linked:', org ? org.name : 'None');
  } else {
      vol.organization = org ? org._id : undefined;
      vol.city = citizen.city || 'Chennai';
      await vol.save();
      console.log('Updated Lakshmi Rajan Volunteer account. Org linked:', org ? org.name : 'None');
  }

  process.exit(0);
}

setup();
