/**
 * @module routeOptimizer
 * @description Service to cluster tasks and optimize routes for volunteers.
 */
const axios = require('axios');

/**
 * Calculate distance between two coordinates in km
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearest neighbor route
 */
function nearestNeighborRoute(startPoint, tasks) {
  const route = [];
  let unvisited = [...tasks];
  let current = startPoint;

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => haversineDistance(current.lat, current.lng, a.lat, a.lng) - haversineDistance(current.lat, current.lng, b.lat, b.lng));
    const nearest = unvisited[0];
    route.push(nearest);
    current = nearest;
    unvisited.shift();
  }
  return route;
}

/**
 * Optimize route for a volunteer
 * @param {Object} volunteer Location object {lat, lng}
 * @param {Array} tasks Array of tasks {id, lat, lng, ...}
 * @returns {Object} Optimized route data
 */
exports.optimizeVolunteerRoute = async (volunteerLoc, tasks) => {
    if (!tasks || tasks.length === 0) return { route: [], totalDistance: 0, estimatedTimeMinutes: 0 };

    const startPoint = { lat: volunteerLoc.lat, lng: volunteerLoc.lng };
    const optimizedRoute = nearestNeighborRoute(startPoint, tasks);

    let totalDistance = 0;
    let currentLoc = startPoint;

    for (const task of optimizedRoute) {
        totalDistance += haversineDistance(currentLoc.lat, currentLoc.lng, task.lat, task.lng);
        currentLoc = task;
    }

    let estimatedTimeMinutes = (totalDistance / 40) * 60 + (tasks.length * 30); // 40 km/h + 30 min per task

    if (process.env.GOOGLE_MAPS_API_KEY) {
        try {
            const origin = `${volunteerLoc.lat},${volunteerLoc.lng}`;
            const dest = `${optimizedRoute[optimizedRoute.length - 1].lat},${optimizedRoute[optimizedRoute.length - 1].lng}`;
            const waypoints = optimizedRoute.slice(0, -1).map(t => `${t.lat},${t.lng}`).join('|');
            
            let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
            if (waypoints) url += `&waypoints=optimize:true|${waypoints}`;

            const res = await axios.get(url);
            if (res.data.status === 'OK') {
                const leg = res.data.routes[0].legs[0];
                totalDistance = leg.distance.value / 1000;
                estimatedTimeMinutes = (leg.duration.value / 60) + (tasks.length * 30);
            }
        } catch(e) {
            console.error('Google Maps API failed, using fallback.');
        }
    }

    return {
        route: optimizedRoute,
        totalDistanceKm: totalDistance,
        estimatedTimeMinutes: estimatedTimeMinutes
    };
};
