const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const VolunteerRoute = require('../models/VolunteerRoute');
const groqService = require('./groqService');
const routeOptimizer = require('./routeOptimizer');
const localStore = require('./localStore');

const skillMapping = {
  'Food': ['Food Distribution', 'Logistics'],
  'Health': ['Medical', 'Counseling'],
  'Education': ['Education', 'Tech Support'],
  'Infrastructure': ['Construction', 'Logistics', 'Transportation'],
  'Safety': ['Counseling', 'Medical', 'Logistics'],
  'Environment': ['Construction', 'Logistics', 'Food Distribution'],
  'Other': []
};

const getDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.runAutoPlanner = async () => {
    const reports = await localStore.listReports(Report);
    const pendingReports = reports.filter(r => r.status === 'Pending').slice(0, 20);
    
    if (pendingReports.length === 0) return { message: "No unassigned reports found." };

    const reportsData = pendingReports.map(r => ({
        id: r._id.toString(),
        location: r.location.address || 'Unknown',
        lat: r.location.coordinates[1],
        lng: r.location.coordinates[0],
        issueType: r.issueType,
        urgencyScore: r.urgency,
        description: r.description
    }));

    const volunteers = await localStore.listVolunteers(Volunteer);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).substring(0, 3); // Mon, Tue...
    
    const availableVolunteers = volunteers.filter((v) => {
        const availability = v.availability;
        if (typeof availability === 'boolean') return availability;
        if (availability && Array.isArray(availability.days)) {
            if (availability.days.length === 0) return true;
            // Simplistic check for hackathon
            return true;
        }
        return true;
    });

    if (availableVolunteers.length === 0) return { message: "No available volunteers found." };

    const filteredVolunteersData = availableVolunteers.map(v => {
        const vLat = v.location?.coordinates[1] || 20.0;
        const vLng = v.location?.coordinates[0] || 77.0;
        
        // Filter by skill match first
        const matchedTasks = reportsData.filter(t => {
            const requiredSkills = skillMapping[t.issueType] || [];
            const hasSkill = requiredSkills.length === 0 || v.skills?.some(s => requiredSkills.includes(s));
            if (!hasSkill) return false;
            
            // Distance check
            const dist = getDist(vLat, vLng, t.lat, t.lng);
            return dist < 500; // max 500km for testing
        });
        
        // Sort tasks by distance, then urgency
        matchedTasks.sort((a, b) => {
            const distA = getDist(vLat, vLng, a.lat, a.lng);
            const distB = getDist(vLat, vLng, b.lat, b.lng);
            if (Math.abs(distA - distB) > 5) return distA - distB;
            return b.urgencyScore - a.urgencyScore;
        });

        if (matchedTasks.length === 0) return null;

        return {
            id: v._id.toString(),
            name: v.name,
            skills: v.skills,
            lat: vLat,
            lng: vLng,
            nearbyTaskIds: matchedTasks.map(t => t.id).slice(0, 5), // Top 5 matches
            currentWorkload: 0
        };
    }).filter(v => v !== null);

    if (filteredVolunteersData.length === 0) {
        return { 
            message: "No volunteers match skills and distance.",
            unassignedTasks: reportsData.map(r => ({ reportId: r.id, reason: "No matching volunteers found." }))
        };
    }

    const prompt = `System: You are an NGO operations coordinator for the Saathi app. Respond ONLY in valid JSON.
    User: 
    Given these unassigned community needs:
    ${JSON.stringify(reportsData)}
    
    And these available volunteers:
    ${JSON.stringify(filteredVolunteersData)}
    
    Create an optimal work assignment plan that:
    1. Assigns tasks ONLY from the volunteer's nearbyTaskIds list.
    2. Groups nearby tasks to minimize travel.
    3. Balances workload (max 4 tasks).
    4. Explains WHY the assignment was made based on skills, distance, and urgency.
    
    Respond as JSON:
    {
      "assignments": [
        {
          "volunteerId": "string",
          "tasks": [{ "reportId": "string", "taskTitle": "string", "location": "string", "urgency": 5, "estimatedDuration": 30, "reason": "string" }]
        }
      ]
    }`;

    try {
        const response = await groqService.generateCompletion(prompt);
        let plan = typeof response === 'string' ? JSON.parse(response) : response;
        
        for (const assign of plan.assignments) {
            const volTasks = [];
            for (const task of assign.tasks) {
                await localStore.updateReport(task.reportId, { 
                  status: 'Assigned',
                  assignedVolunteers: [assign.volunteerId] 
                }, Report);
                
                const rep = reportsData.find(r => r.id.toString() === task.reportId);
                if (rep) {
                    volTasks.push({
                        report: task.reportId,
                        lat: rep.lat,
                        lng: rep.lng,
                        address: task.location,
                        taskTitle: task.taskTitle,
                        urgency: task.urgency,
                        estimatedDurationMinutes: task.estimatedDuration,
                    });
                }
            }

            const vol = filteredVolunteersData.find(v => v.id.toString() === assign.volunteerId);
            if (vol && volTasks.length > 0) {
                const optimized = await routeOptimizer.optimizeVolunteerRoute({lat: vol.lat, lng: vol.lng}, volTasks);
                // Assume VolunteerRoute handles storing in Mongo if available, or we just ignore for local mock
                if (localStore.isMongoReady()) {
                  await VolunteerRoute.findOneAndUpdate(
                      { volunteer: assign.volunteerId, date: { $gte: new Date().setHours(0,0,0,0) } },
                      {
                          volunteer: assign.volunteerId,
                          routePoints: optimized.route.map((t, i) => ({ ...t, order: i + 1 })),
                          totalDistanceKm: optimized.totalDistanceKm,
                          estimatedDurationHours: optimized.estimatedTimeMinutes / 60
                      },
                      { upsert: true, new: true }
                  );
                }
            }
        }

        return plan;
    } catch (e) {
        console.error("AutoPlanner Error:", e);
        throw new Error("AutoPlanner failed: " + e.message);
    }
};