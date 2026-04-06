// Seed data script to populate sample reports and volunteers
// Run this on backend startup to create demo data

const sampleVolunteers = [
  {
    name: 'Abhyammath Volunteer',
    email: 'abhyammath78@gmail.com',
    phone: '9876543210',
    skills: ['Medical', 'Food Distribution', 'Counseling'],
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041], // Delhi
      address: 'New Delhi, Delhi, India'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      times: ['Morning', 'Afternoon']
    }
  },
  {
    name: 'Priya Sharma',
    email: 'priya@volunteers.com',
    phone: '9876543211',
    skills: ['Education', 'Tech Support', 'Counseling'],
    location: {
      type: 'Point',
      coordinates: [77.0369, 28.5355], // South Delhi
      address: 'Greater Kailash, Delhi, India'
    },
    availability: {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      times: ['Morning', 'Afternoon', 'Evening']
    }
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@volunteers.com',
    phone: '9876543212',
    skills: ['Construction', 'Transportation', 'Logistics'],
    location: {
      type: 'Point',
      coordinates: [77.2273, 28.6139], // North Delhi
      address: 'Connaught Place, Delhi, India'
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      times: ['Morning', 'Afternoon', 'Evening']
    }
  }
];

const sampleReports = [
  {
    description: 'Medicine shortage affecting elderly residents in colony',
    issueType: 'Health',
    urgency: 9,
    location: {
      type: 'Point',
      coordinates: [77.1050, 28.7055],
      address: 'Delhi Civil Lines, Delhi, India'
    },
    source: 'web'
  },
  {
    description: 'Food supply needed for homeless shelter - immediate help required',
    issueType: 'Food',
    urgency: 10,
    location: {
      type: 'Point',
      coordinates: [77.0980, 28.7020],
      address: 'Old Delhi, Delhi, India'
    },
    source: 'web'
  },
  {
    description: 'School building needs emergency repairs after recent rain damage',
    issueType: 'Education',
    urgency: 8,
    location: {
      type: 'Point',
      coordinates: [77.0390, 28.5340],
      address: 'South Delhi Education Zone, Delhi, India'
    },
    source: 'web'
  },
  {
    description: 'Water pipeline burst - urgent infrastructure repair needed',
    issueType: 'Infrastructure',
    urgency: 9,
    location: {
      type: 'Point',
      coordinates: [77.2300, 28.6150],
      address: 'North Delhi Infrastructure Area, Delhi, India'
    },
    source: 'web'
  },
  {
    description: 'Community safety - street lights not working in residential area',
    issueType: 'Safety',
    urgency: 8,
    location: {
      type: 'Point',
      coordinates: [77.1150, 28.6900],
      address: 'East Delhi Residential Zone, Delhi, India'
    },
    source: 'web'
  },
  {
    description: 'Environmental issue - garbage disposal affecting neighborhood health',
    issueType: 'Environment',
    urgency: 7,
    location: {
      type: 'Point',
      coordinates: [77.0850, 28.6800],
      address: 'West Delhi Environment Area, Delhi, India'
    },
    source: 'web'
  }
];

module.exports = { sampleVolunteers, sampleReports };
