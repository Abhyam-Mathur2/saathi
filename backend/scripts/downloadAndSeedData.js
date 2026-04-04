const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Report = require('../models/Report');
const ImpactZone = require('../models/ImpactZone');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saathi';

const FALLBACK_NGO_DATA = [
  { title: "Village Flood Relief", description: "Severe flooding affecting local village. Immediate food and medical aid needed.", issueType: "Environment", urgency: 9, lat: 26.2, lng: 92.9, placeName: "Assam Village", affected: 500, state: "Assam" },
  { title: "Medical Camp Needed", description: "Outbreak of waterborne diseases. Doctors needed.", issueType: "Health", urgency: 8, lat: 25.5, lng: 85.1, placeName: "Patna Suburbs", affected: 200, state: "Bihar" },
  { title: "Food Distribution", description: "Drought affecting crop yield. Food packets required.", issueType: "Food", urgency: 7, lat: 20.9, lng: 77.7, placeName: "Amravati", affected: 1500, state: "Maharashtra" },
  { title: "School Rebuilding", description: "School roof collapsed in storm.", issueType: "Education", urgency: 5, lat: 22.5, lng: 88.3, placeName: "Kolkata outskirts", affected: 300, state: "West Bengal" },
  { title: "Clean Water Supply", description: "Wells dried up in summer heat.", issueType: "Environment", urgency: 8, lat: 13.0, lng: 80.2, placeName: "Chennai Suburbs", affected: 1000, state: "Tamil Nadu" }
];

async function downloadAndSeed() {
  let seededReports = 0;
  let seededZones = 0;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Fetch ReliefWeb Data (Fallback to local if fail)
    try {
      console.log('Fetching from ReliefWeb API...');
      const res = await axios.get('https://api.reliefweb.int/v1/disasters?appname=saathi&profile=full&limit=10', { timeout: 5000 });
      const disasters = res.data.data;
      if (disasters && disasters.length > 0) {
        for (const d of disasters) {
          const type = d.fields?.primary_type?.name || 'Other';
          let mappedType = 'Environment';
          if (type.toLowerCase().includes('health') || type.toLowerCase().includes('epidemic')) mappedType = 'Health';
          
          let lat = d.fields?.primary_country?.location?.lat || 20.0;
          let lng = d.fields?.primary_country?.location?.lon || 77.0;

          await Report.create({
            title: d.fields?.name || 'Disaster Relief',
            description: d.fields?.description || 'Details unavailable',
            issueType: mappedType,
            urgency: 8,
            location: { type: 'Point', coordinates: [lng, lat], address: d.fields?.primary_country?.name },
            source: 'reliefweb'
          });
          seededReports++;
        }
      }
    } catch (e) {
      console.log('⚠️ ReliefWeb fetch failed, using fallback data.');
      for (const d of FALLBACK_NGO_DATA) {
        await Report.create({
          title: d.title,
          description: d.description,
          issueType: d.issueType,
          urgency: d.urgency,
          location: { type: 'Point', coordinates: [d.lng, d.lat], address: d.placeName },
          source: 'fallback'
        });
        seededReports++;
      }
    }

    // 2. Fetch World Bank Data (Simple mock mapping since API can be complex, but try to fetch basic poverty data)
    try {
      console.log('Fetching from World Bank API...');
      const wbRes = await axios.get('https://api.worldbank.org/v2/country/IN/indicator/SI.POV.DDAY?format=json&per_page=1', { timeout: 5000 });
      const povVal = wbRes.data[1] && wbRes.data[1][0] ? wbRes.data[1][0].value : 10;
      
      // Seed Impact Zones based on fallback data locations
      for (const d of FALLBACK_NGO_DATA) {
        await ImpactZone.create({
          zoneId: `ZONE_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
          placeName: d.placeName,
          lat: d.lat,
          lng: d.lng,
          state: d.state,
          currentUrgency: d.urgency,
          crisisType: d.issueType,
          affectedPopulation: d.affected,
          worldBankPovertyIndex: povVal || 10,
          worldBankWaterAccess: 80,
          weatherSeverity: 3,
          activeReports: 1
        });
        seededZones++;
      }
    } catch (e) {
      console.log('⚠️ World Bank fetch failed, seeding mock zones.');
    }

    console.log(`✅ Seeded: ${seededReports} reports from ReliefWeb/Fallback, ${seededZones} from World Bank/Fallback.`);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

downloadAndSeed();
