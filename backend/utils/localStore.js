const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'local-db.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    const initial = {
      reports: [],
      volunteers: [],
      assignments: [],
      activities: []
    };
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readData() {
  ensureStore();
  const raw = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(raw);
}

function writeData(data) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// Activity store helpers — append to existing localStore.js

function getActivities() {
  const data = readData();
  if (!data.activities) data.activities = [];
  return data.activities;
}

function addActivity(entry) {
  const data = readData();
  if (!data.activities) data.activities = [];
  const newEntry = {
    _id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    ...entry,
    createdAt: new Date().toISOString()
  };
  data.activities.unshift(newEntry); // newest first
  if (data.activities.length > 500) data.activities = data.activities.slice(0, 500); // cap
  writeData(data);
  return newEntry;
}

function getActivitiesByVolunteer(volunteerId, limit = 50) {
  const activities = getActivities();
  return activities.filter(a => a.volunteerId === volunteerId).slice(0, limit);
}

function getRecentActivities(limit = 100) {
  return getActivities().slice(0, limit);
}

// Reports & Volunteers helpers to keep it compatible with what controllers might need if they use this localStore
function findReportById(reportId) {
  const data = readData();
  return data.reports.find(r => r._id === reportId) || null;
}

module.exports = {
  readData,
  writeData,
  getActivities,
  addActivity,
  getActivitiesByVolunteer,
  getRecentActivities,
  findReportById
};
