const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const Assignment = require('../models/Assignment');
const VolunteerRoute = require('../models/VolunteerRoute');
const groqService = require('./groqService');
const routeOptimizer = require('./routeOptimizer');
const { logActivity } = require('../controllers/activityController');

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

exports.runAutoPlanner = async (orgId) => {
    let reportQuery = { status: 'Pending' };
    if (orgId) reportQuery.organization = orgId;
    const reports = await Report.find(reportQuery).lean();
    const pendingReports = reports.slice(0, 20);
    
    if (pendingReports.length === 0) return { message: "No unassigned reports found." };

    const reportsData = pendingReports.map(r => ({
        id: r._id.toString(),
        location: r.location?.address || r.city || 'Unknown',
        lat: r.location?.coordinates?.[1] || 0,
        lng: r.location?.coordinates?.[0] || 0,
        issueType: r.issueType,
        urgencyScore: r.urgency,
        description: r.description
    }));

    let volunteerQuery = { status: 'Active' };
    if (orgId) volunteerQuery.organization = orgId;
    const volunteers = await Volunteer.find(volunteerQuery).lean();
    const availableVolunteers = volunteers.filter((v) => {
        const availability = v.availability;
        if (!availability) return true;
        if (Array.isArray(availability.days) && availability.days.length === 0) return true;
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
            completedTasks: v.completedTasks || 0,
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
    4. Explains WHY the assignment was made based on skills, existing completedTasks history, distance, and urgency.
    
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
                // Update the report status
                await Report.findByIdAndUpdate(task.reportId, { 
                  status: 'Assigned',
                  assignedVolunteers: [assign.volunteerId] 
                });
                
                // Create an Assignment record
                const newAssignment = new Assignment({
                    report: task.reportId,
                    volunteer: assign.volunteerId,
                    status: 'Pending'
                });
                await newAssignment.save();

                // Log activity
                const volObj = await Volunteer.findById(assign.volunteerId);
                const reportObj = await Report.findById(task.reportId);
                await logActivity({
                    volunteerId: assign.volunteerId,
                    volunteerName: volObj?.name,
                    type: 'TASK_ASSIGNED',
                    title: 'New Task Assigned (Auto)',
                    description: reportObj?.description,
                    meta: {
                        reportId: task.reportId,
                        reportTitle: reportObj?.description?.slice(0, 50),
                        issueType: reportObj?.issueType,
                        urgency: reportObj?.urgency,
                        location: reportObj?.location?.address
                    }
                });
                
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
                
                // Attach volunteer name and route summary to the plan output
                assign.volunteerName = vol.name;
                assign.routeSummary = `Total distance: ${optimized.totalDistanceKm}km, Est. ${Math.round(optimized.estimatedTimeMinutes / 60)} hours`;
            }
        }


        return plan;
    } catch (e) {
        console.error("AutoPlanner Error:", e);
        throw new Error("AutoPlanner failed: " + e.message);
    }
};

exports.generateLiveDashboard = async (orgId) => {
    try {
        let reportQuery = { status: 'Pending' };
        let assignmentQuery = { status: { $in: ['Pending', 'Accepted', 'In Progress'] } };
        
        // Safeguard against string literals from frontend query params
        if (orgId && orgId !== 'undefined' && orgId !== 'null') {
            reportQuery.organization = orgId;
            // Removed strict organization filtering on Assignments to ensure legacy tasks show up
            // Or we check both:
            assignmentQuery.$or = [
                { organization: orgId },
                { organization: { $exists: false } },
                { organization: null }
            ];
        }

        // 1. Get Unassigned
        const unassigned = await Report.find(reportQuery).lean();
        
        // 2. Get Active Assignments
        const assignments = await Assignment.find(assignmentQuery)
            .populate('volunteer', 'name location')
            .populate('report', 'issueType urgency description location city')
            .lean();

        // 3. Group by Volunteer
        const volunteerMap = {};
        for (const a of assignments) {
            if (!a.volunteer || !a.report) continue;
            const vid = a.volunteer._id.toString();
            if (!volunteerMap[vid]) {
                volunteerMap[vid] = {
                    volunteerId: vid,
                    volunteerName: a.volunteer.name,
                    routeSummary: "Live assignment tracking map.",
                    tasks: []
                };
            }
            
            volunteerMap[vid].tasks.push({
                reportId: a.report._id.toString(),
                taskTitle: a.report.issueType,
                location: a.report.location?.address || a.report.city || 'Unknown Location',
                urgency: a.report.urgency || 5,
                estimatedDuration: 30
            });
        }

        return {
            generatedAt: new Date(),
            planSummary: `Live System Tracking: Found ${Object.keys(volunteerMap).length} active volunteers managing ${assignments.length} assigned tasks, with ${unassigned.length} tasks still awaiting assignment.`,
            assignments: Object.values(volunteerMap),
            unassignedTasks: unassigned.map(r => ({ reportId: r._id.toString(), reason: 'Pending manual or AI dispatch.' }))
        };

    } catch (e) {
        console.error("Error generating live dashboard:", e);
        return null;
    }
};
