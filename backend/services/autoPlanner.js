/**
 * @module autoPlanner
 * @description Service to automatically assign tasks to volunteers using AI and create optimized routes.
 */
const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const VolunteerRoute = require('../models/VolunteerRoute');
const groqService = require('./groqService');
const routeOptimizer = require('./routeOptimizer');

exports.runAutoPlanner = async () => {
    // 1. Get unassigned reports
    const reports = await Report.find({ status: 'Pending' }).limit(20);
    console.log(`AutoPlanner: Found ${reports.length} pending reports.`);
    if (reports.length === 0) return { message: "No unassigned reports found." };

    const reportsData = reports.map(r => ({
        id: r._id.toString(),
        location: r.location.address || 'Unknown',
        lat: r.location.coordinates[1],
        lng: r.location.coordinates[0],
        issueType: r.issueType,
        urgencyScore: r.urgency,
        description: r.description
    }));

    // 2. Get volunteers and support both legacy boolean and schema-based availability objects
    const volunteers = await Volunteer.find({});
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const availableVolunteers = volunteers.filter((v) => {
        const availability = v.availability;

        // Legacy records seeded with `availability: true`
        if (typeof availability === 'boolean') {
            return availability;
        }

        // Schema-based records store `availability.days` and `availability.times`
        if (availability && Array.isArray(availability.days)) {
            if (availability.days.length === 0) {
                return true;
            }
            return availability.days.includes(today);
        }

        // If availability is missing or malformed, keep volunteer eligible instead of dropping silently
        return true;
    });

    console.log(`AutoPlanner: Found ${availableVolunteers.length} available volunteers.`);
    if (availableVolunteers.length === 0) return { message: "No available volunteers found." };

    /**
     * Haversine distance helper for filtering
     */
    const getDist = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // 2.5 Filter nearby tasks for each volunteer (max 500km radius for testing)
    const filteredVolunteersData = availableVolunteers.map(v => {
        const vLat = v.location?.coordinates[1] || 20.0;
        const vLng = v.location?.coordinates[0] || 77.0;
        
        // Find tasks within 500km of THIS volunteer
        const nearbyTasks = reportsData.filter(t => getDist(vLat, vLng, t.lat, t.lng) < 500);
        
        console.log(`Volunteer ${v.name}: Found ${nearbyTasks.length} tasks within 500km.`);
        if (nearbyTasks.length === 0) return null;

        return {
            id: v._id.toString(),
            name: v.name,
            skills: v.skills,
            lat: vLat,
            lng: vLng,
            nearbyTaskIds: nearbyTasks.map(t => t.id),
            currentWorkload: 0
        };
    }).filter(v => v !== null);

    if (filteredVolunteersData.length === 0) {
        return { 
            message: "No volunteers are near any pending tasks. Assignments must be within 50km.",
            unassignedTasks: reportsData.map(r => ({ reportId: r.id, reason: "No volunteers within 50km radius." }))
        };
    }

    // 3. Call Groq with filtered data
    const prompt = `System: You are an NGO operations coordinator for the Saathi app. Respond ONLY in valid JSON.
    User: 
    Given these unassigned community needs:
    ${JSON.stringify(reportsData)}
    
    And these available volunteers (ONLY assign tasks listed in their nearbyTaskIds):
    ${JSON.stringify(filteredVolunteersData)}
    
    Create an optimal work assignment plan that:
    1. PRIORITIZES tasks within the volunteer's nearbyTaskIds list (MANDATORY).
    2. Groups nearby tasks to minimize travel.
    3. Balances workload (max 4 tasks).
    
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
        
        // 4. Save assignments & Routes
        for (const assign of plan.assignments) {
            const volTasks = [];
            for (const task of assign.tasks) {
                // Update report
                await Report.findByIdAndUpdate(task.reportId, { status: 'Assigned' });
                // Create Assignment
                await Assignment.create({ report: task.reportId, volunteer: assign.volunteerId, status: 'Assigned' });
                
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

            // Optimize Route
            const vol = filteredVolunteersData.find(v => v.id.toString() === assign.volunteerId);
            if (vol && volTasks.length > 0) {
                const optimized = await routeOptimizer.optimizeVolunteerRoute({lat: vol.lat, lng: vol.lng}, volTasks);
                
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

        return plan;
    } catch (e) {
        console.error("AutoPlanner Error:", e);
        throw new Error("AutoPlanner failed: " + e.message);
    }
};
