const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'local-db.json');

const defaultData = {
  reports: [],
  volunteers: [],
  assignments: [],
};

const seedReports = [
  {
    issueType: 'Food',
    urgency: 9,
    description: 'Severe food shortage in flood-affected village near Patna. 50 families need immediate dry rations.',
    location: { type: 'Point', coordinates: [85.1376, 25.5941], address: 'Danapur, Patna, Bihar' },
    status: 'Pending',
  },
  {
    issueType: 'Health',
    urgency: 10,
    description: 'Medical emergency: Outbreak of water-borne diseases in temporary shelter. Need doctors and medicines.',
    location: { type: 'Point', coordinates: [85.15, 25.6], address: 'Shelter Camp 4, Patna' },
    status: 'Pending',
  },
  {
    issueType: 'Infrastructure',
    urgency: 7,
    description: 'Main approach road to the village blocked by fallen trees. Needs heavy equipment or manual labor.',
    location: { type: 'Point', coordinates: [77.209, 28.6139], address: 'Outer Ring Road, New Delhi' },
    status: 'Pending',
  },
  {
    issueType: 'Education',
    urgency: 4,
    description: 'Local primary school roof damaged. Need volunteers for minor repairs and organizing temporary classes.',
    location: { type: 'Point', coordinates: [72.8777, 19.076], address: 'Dharavi, Mumbai' },
    status: 'Pending',
  },
  {
    issueType: 'Safety',
    urgency: 8,
    description: 'Elderly residents stranded in waterlogged building. Need evacuation assistance.',
    location: { type: 'Point', coordinates: [80.2707, 13.0827], address: 'Velachery, Chennai' },
    status: 'Pending',
  },
  {
    issueType: 'Environment',
    urgency: 6,
    description: 'Oil spill in local lake affecting local fauna. Need volunteers for cleanup.',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Ulsoor Lake, Bangalore' },
    status: 'Pending',
  },
  {
    issueType: 'Food',
    urgency: 5,
    description: 'Community kitchen running low on vegetables and grains. Regular supply needed.',
    location: { type: 'Point', coordinates: [88.3639, 22.5726], address: 'Salt Lake, Kolkata' },
    status: 'Pending',
  },
  {
    issueType: 'Health',
    urgency: 8,
    description: 'Blood donation camp needed due to recent accidents in the area.',
    location: { type: 'Point', coordinates: [73.8567, 18.5204], address: 'Shivajinagar, Pune' },
    status: 'Pending',
  },
  {
    issueType: 'Infrastructure',
    urgency: 3,
    description: 'Street lights not working in Sector 15. Safety concern at night.',
    location: { type: 'Point', coordinates: [77.0266, 28.4595], address: 'Gurgaon, Haryana' },
    status: 'Pending',
  },
  {
    issueType: 'Other',
    urgency: 5,
    description: 'Stray animals injured during heavy rains. Need veterinary assistance.',
    location: { type: 'Point', coordinates: [75.8577, 22.7196], address: 'Indore, MP' },
    status: 'Pending',
  },
];

const seedVolunteers = [
  {
    name: 'Amit Sharma',
    phone: '9876543210',
    email: 'amit@example.com',
    skills: ['Medical', 'Logistics'],
    availability: { days: ['Monday', 'Wednesday', 'Friday'], times: ['Morning'] },
    location: { type: 'Point', coordinates: [85.14, 25.59], address: 'Patna, Bihar' },
  },
  {
    name: 'Priya Patel',
    phone: '9823456789',
    email: 'priya@example.com',
    skills: ['Food Distribution', 'Counseling'],
    availability: { days: ['Saturday', 'Sunday'], times: ['Afternoon'] },
    location: { type: 'Point', coordinates: [72.88, 19.08], address: 'Mumbai, Maharashtra' },
  },
  {
    name: 'Rahul Verma',
    phone: '9123456780',
    email: 'rahul@example.com',
    skills: ['Construction', 'Logistics', 'Transportation'],
    availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], times: ['Morning'] },
    location: { type: 'Point', coordinates: [77.21, 28.62], address: 'Delhi' },
  },
  {
    name: 'Sita Ramani',
    phone: '9445566778',
    email: 'sita@example.com',
    skills: ['Education', 'Tech Support'],
    availability: { days: ['Friday', 'Saturday'], times: ['Morning'] },
    location: { type: 'Point', coordinates: [80.28, 13.09], address: 'Chennai' },
  },
  {
    name: 'Vikram Singh',
    phone: '9988776655',
    email: 'vikram@example.com',
    skills: ['Logistics', 'Transportation'],
    availability: { days: ['Monday', 'Wednesday', 'Friday'], times: ['Afternoon'] },
    location: { type: 'Point', coordinates: [77.6, 12.98], address: 'Bangalore' },
  },
  {
    name: 'Anjali Gupta',
    phone: '9765432109',
    email: 'anjali@example.com',
    skills: ['Medical', 'Counseling'],
    availability: { days: ['Tuesday', 'Thursday'], times: ['Morning'] },
    location: { type: 'Point', coordinates: [88.37, 22.58], address: 'Kolkata' },
  },
  {
    name: 'Karan Mehra',
    phone: '9554433221',
    email: 'karan@example.com',
    skills: ['Construction', 'Tech Support'],
    availability: { days: ['Saturday', 'Sunday'], times: ['Afternoon'] },
    location: { type: 'Point', coordinates: [73.86, 18.53], address: 'Pune' },
  },
  {
    name: 'Sneha Reddy',
    phone: '9001122334',
    email: 'sneha@example.com',
    skills: ['Food Distribution', 'Education'],
    availability: { days: ['Wednesday', 'Thursday', 'Friday'], times: ['Morning'] },
    location: { type: 'Point', coordinates: [78.4867, 17.385], address: 'Hyderabad' },
  },
];

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    const initial = {
      ...defaultData,
      reports: seedReports.map((report) => ({
        ...report,
        _id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      })),
      volunteers: seedVolunteers.map((volunteer) => ({
        ...volunteer,
        _id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      })),
    };

    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(raw);
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), 'utf8');
}

function isMongoReady() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch (error) {
    return false;
  }
}

function normalizeReport(report) {
  return {
    ...report,
    _id: report._id || crypto.randomUUID(),
    location: {
      type: 'Point',
      coordinates: report.location?.coordinates || [77.1025, 28.7041],
      address: report.location?.address || 'Unknown',
    },
    status: report.status || 'Pending',
    createdAt: report.createdAt || new Date().toISOString(),
  };
}

function normalizeVolunteer(volunteer) {
  return {
    ...volunteer,
    _id: volunteer._id || crypto.randomUUID(),
    skills: volunteer.skills || [],
    availability: volunteer.availability || { days: [], times: [] },
    location: {
      type: 'Point',
      coordinates: volunteer.location?.coordinates || [77.1025, 28.7041],
      address: volunteer.location?.address || 'Unknown',
    },
    createdAt: volunteer.createdAt || new Date().toISOString(),
  };
}

async function createReport(reportData, ReportModel) {
  try {
    if (isMongoReady()) {
      const report = new ReportModel(reportData);
      await report.save();
      return report.toObject();
    }

    const store = readStore();
    const report = normalizeReport(reportData);
    store.reports.unshift(report);
    writeStore(store);
    return report;
  } catch (error) {
    console.error('LocalStore createReport error:', error);
    throw error;
  }
}

async function listReports(ReportModel) {
  if (isMongoReady()) {
    return ReportModel.find().sort({ createdAt: -1 }).lean();
  }

  return readStore().reports
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function findReportById(reportId, ReportModel) {
  if (isMongoReady()) {
    return ReportModel.findById(reportId).lean();
  }

  return readStore().reports.find((report) => report._id === reportId) || null;
}

async function countReports(filter, ReportModel) {
  if (isMongoReady()) {
    return ReportModel.countDocuments(filter);
  }

  const reports = readStore().reports;
  if (!filter || Object.keys(filter).length === 0) {
    return reports.length;
  }

  if (filter.urgency?.$gte !== undefined) {
    return reports.filter((report) => Number(report.urgency) >= Number(filter.urgency.$gte)).length;
  }

  if (filter.status) {
    return reports.filter((report) => report.status === filter.status).length;
  }

  return reports.length;
}

async function aggregateReportCategories(ReportModel) {
  if (isMongoReady()) {
    return ReportModel.aggregate([{ $group: { _id: '$issueType', count: { $sum: 1 } } }]);
  }

  const counts = new Map();
  for (const report of readStore().reports) {
    counts.set(report.issueType || 'Other', (counts.get(report.issueType || 'Other') || 0) + 1);
  }

  return Array.from(counts.entries()).map(([issueType, count]) => ({ _id: issueType, count }));
}

async function aggregateReportTrend(ReportModel, days = 7) {
  if (isMongoReady()) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days);
    return ReportModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const counts = new Map();

  for (const report of readStore().reports) {
    const createdAt = new Date(report.createdAt);
    if (createdAt < cutoff) {
      continue;
    }

    const key = createdAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ _id: date, count }));
}

async function getTopUrgentReports(ReportModel, limit = 5) {
  if (isMongoReady()) {
    return ReportModel.find({ status: 'Pending' }).sort({ urgency: -1 }).limit(limit).lean();
  }

  return readStore().reports
    .filter((report) => report.status === 'Pending')
    .sort((a, b) => Number(b.urgency) - Number(a.urgency))
    .slice(0, limit);
}

async function createVolunteer(volunteerData, VolunteerModel) {
  if (isMongoReady()) {
    const volunteer = new VolunteerModel(volunteerData);
    await volunteer.save();
    return volunteer.toObject();
  }

  const store = readStore();
  const volunteer = normalizeVolunteer(volunteerData);
  store.volunteers.push(volunteer);
  writeStore(store);
  return volunteer;
}

async function listVolunteers(VolunteerModel) {
  if (isMongoReady()) {
    return VolunteerModel.find().lean();
  }

  return readStore().volunteers.slice();
}

async function countVolunteers(VolunteerModel) {
  if (isMongoReady()) {
    return VolunteerModel.countDocuments();
  }

  return readStore().volunteers.length;
}

async function countAssignments(AssignmentModel) {
  if (isMongoReady()) {
    return AssignmentModel.countDocuments();
  }

  return readStore().assignments.length;
}

async function deleteVolunteer(volunteerId, VolunteerModel) {
  if (isMongoReady()) {
    const deleted = await VolunteerModel.findByIdAndDelete(volunteerId);
    return !!deleted;
  }

  const store = readStore();
  const initialLength = store.volunteers.length;
  store.volunteers = store.volunteers.filter((volunteer) => volunteer._id !== volunteerId);

  if (store.volunteers.length === initialLength) {
    return false;
  }

  writeStore(store);
  return true;
}

async function updateReport(reportId, updateData, ReportModel) {
  if (isMongoReady()) {
    return ReportModel.findByIdAndUpdate(reportId, updateData, { new: true }).lean();
  }
  const store = readStore();
  const index = store.reports.findIndex(r => r._id === reportId);
  if (index !== -1) {
    store.reports[index] = { ...store.reports[index], ...updateData };
    writeStore(store);
    return store.reports[index];
  }
  return null;
}

module.exports = {
  createReport,
  listReports,
  findReportById,
  updateReport,
  countReports,
  aggregateReportCategories,
  aggregateReportTrend,
  getTopUrgentReports,
  createVolunteer,
  listVolunteers,
  countVolunteers,
  countAssignments,
  deleteVolunteer,
  isMongoReady,
};
