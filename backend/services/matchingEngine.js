/**
 * Haversine formula to calculate distance between two GPS points in kilometers
 * @param {Array} coord1 [lon, lat]
 * @param {Array} coord2 [lon, lat]
 * @returns {Number} distance in Km
 */
function getDistanceInKm(coord1, coord2) {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Calculates match scores for volunteers against a specific report
 * @param {Object} report The community need report
 * @param {Array} volunteers List of all volunteers
 * @returns {Array} Top 3 matched volunteers with scores
 */
function calculateMatches(report, volunteers) {
    const requiredSkillsMap = {
        'Food': ['Food Distribution', 'Logistics'],
        'Health': ['Medical', 'Counseling'],
        'Education': ['Education', 'Tech Support'],
        'Infrastructure': ['Construction', 'Logistics', 'Transportation'],
        'Safety': ['Counseling', 'Medical'],
        'Environment': ['Construction', 'Logistics']
    };

    const requiredSkills = requiredSkillsMap[report.issueType] || ['Logistics'];

    const scores = volunteers.map(volunteer => {
        // 1. Skill Score (40%)
        const matchedSkills = volunteer.skills.filter(skill => requiredSkills.includes(skill));
        const skillScore = (matchedSkills.length / requiredSkills.length) * 10;

        // 2. Proximity Score (30%)
        const distance = getDistanceInKm(report.location.coordinates, volunteer.location.coordinates);
        const proximityScore = Math.max(0, 10 - (distance / 5));

        // 3. Urgency Score (20%)
        const urgencyScore = report.urgency; // Already 1-10

        // 4. Availability Score (10%)
        // Simulation: 10 if available today (e.g., today is in their days array)
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = daysOfWeek[new Date().getDay()];
        const availabilityScore = volunteer.availability.days.includes(today) ? 10 : 5;

        const totalScore = (skillScore * 0.4) + (proximityScore * 0.3) + (urgencyScore * 0.2) + (availabilityScore * 0.1);

        return {
            volunteer,
            distance: distance.toFixed(2),
            breakdown: {
                skillScore: skillScore.toFixed(2),
                proximityScore: proximityScore.toFixed(2),
                urgencyScore: urgencyScore.toFixed(2),
                availabilityScore: availabilityScore.toFixed(2)
            },
            totalScore: totalScore.toFixed(2)
        };
    });

    // Sort by total score descending and take top 3
    return scores.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
}

module.exports = {
    calculateMatches,
    getDistanceInKm
};
