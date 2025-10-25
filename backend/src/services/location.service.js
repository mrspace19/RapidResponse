import Ambulance from '../models/Ambulance.js';

/**
 * Find nearby ambulances based on location and criteria
 */
export const findNearbyAmbulances = async (
  longitude,
  latitude,
  ambulanceType,
  serviceType,
  maxDistance = 10000 // 10km in meters
) => {
  try {
    const ambulances = await Ambulance.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      },
      type: ambulanceType,
      serviceType: serviceType,
      status: 'available',
      isActive: true,
      isVerified: true
    })
    .populate('driverId', 'name phone')
    .limit(10);

    // Calculate actual distance for each ambulance
    const ambulancesWithDistance = ambulances.map(ambulance => {
      const distance = calculateDistance(
        latitude,
        longitude,
        ambulance.currentLocation.coordinates[1],
        ambulance.currentLocation.coordinates[0]
      );

      return {
        ...ambulance.toObject(),
        distance: Math.round(distance)
      };
    });

    return ambulancesWithDistance;

  } catch (error) {
    console.error('Error finding nearby ambulances:', error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Get ambulances within a specific area
 */
export const getAmbulancesInArea = async (bounds, filters = {}) => {
  try {
    const { southWest, northEast } = bounds;

    const query = {
      currentLocation: {
        $geoWithin: {
          $box: [
            [southWest.longitude, southWest.latitude],
            [northEast.longitude, northEast.latitude]
          ]
        }
      },
      isActive: true,
      ...filters
    };

    const ambulances = await Ambulance.find(query)
      .populate('driverId', 'name phone')
      .select('registrationNumber type serviceType currentLocation status');

    return ambulances;

  } catch (error) {
    console.error('Error getting ambulances in area:', error);
    throw error;
  }
};

/**
 * Update ambulance location
 */
export const updateAmbulanceLocation = async (ambulanceId, longitude, latitude) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(
      ambulanceId,
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      { new: true }
    );

    return ambulance;

  } catch (error) {
    console.error('Error updating ambulance location:', error);
    throw error;
  }
};