import axios from 'axios';

/**
 * Get route between two points using OpenRouteService
 */
export const getRoute = async (origin, destination) => {
  try {
    const ORS_API_KEY = process.env.ORS_API_KEY;

    if (!ORS_API_KEY) {
      throw new Error('OpenRouteService API key not configured');
    }

    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/json',
      {
        coordinates: [
          [origin[0], origin[1]], // [longitude, latitude]
          [destination[0], destination[1]]
        ],
        preference: 'fastest',
        instructions: true,
        geometry: true
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const route = response.data.routes[0];

    return {
      distance: route.summary.distance, // in meters
      duration: route.summary.duration, // in seconds
      geometry: route.geometry, // encoded polyline
      coordinates: route.geometry.coordinates, // array of [lon, lat]
      instructions: route.segments[0].steps.map(step => ({
        instruction: step.instruction,
        distance: step.distance,
        duration: step.duration,
        type: step.type
      }))
    };

  } catch (error) {
    console.error('Routing service error:', error.response?.data || error.message);
    throw new Error('Failed to calculate route');
  }
};

/**
 * Get multiple routes (alternative routes)
 */
export const getAlternativeRoutes = async (origin, destination) => {
  try {
    const ORS_API_KEY = process.env.ORS_API_KEY;

    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/json',
      {
        coordinates: [
          [origin[0], origin[1]],
          [destination[0], destination[1]]
        ],
        preference: 'fastest',
        alternative_routes: {
          share_factor: 0.6,
          target_count: 2
        }
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.routes.map(route => ({
      distance: route.summary.distance,
      duration: route.summary.duration,
      geometry: route.geometry
    }));

  } catch (error) {
    console.error('Alternative routes error:', error.response?.data || error.message);
    throw new Error('Failed to calculate alternative routes');
  }
};

/**
 * Calculate ETA based on current location and destination
 */
export const calculateETA = async (currentLocation, destination) => {
  try {
    const route = await getRoute(currentLocation, destination);
    
    const etaInMinutes = Math.ceil(route.duration / 60);
    const distanceInKm = (route.distance / 1000).toFixed(1);

    return {
      eta: etaInMinutes,
      distance: route.distance,
      distanceFormatted: `${distanceInKm} km`,
      etaFormatted: `${etaInMinutes} min`,
      arrivalTime: new Date(Date.now() + route.duration * 1000)
    };

  } catch (error) {
    console.error('ETA calculation error:', error);
    throw error;
  }
};

/**
 * Get optimized route for multiple waypoints
 */
export const getOptimizedRoute = async (waypoints) => {
  try {
    const ORS_API_KEY = process.env.ORS_API_KEY;

    const response = await axios.post(
      'https://api.openrouteservice.org/optimization',
      {
        jobs: waypoints.map((point, index) => ({
          id: index,
          location: [point.longitude, point.latitude]
        })),
        vehicles: [{
          id: 1,
          start: [waypoints[0].longitude, waypoints[0].latitude],
          end: [waypoints[waypoints.length - 1].longitude, waypoints[waypoints.length - 1].latitude]
        }]
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error('Route optimization error:', error.response?.data || error.message);
    throw new Error('Failed to optimize route');
  }
};

/**
 * Decode polyline (if needed for frontend display)
 */
export const decodePolyline = (encoded) => {
  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng * 1e-5, lat * 1e-5]);
  }

  return coordinates;
};