import Hospital from '../models/Hospital.js';
import { calculateDistance } from './location.service.js';
import { getRoute } from './routing.service.js';

/**
 * Suggest hospitals based on emergency type and location
 */
export const suggestHospitals = async (
  emergencyType,
  patientCoordinates, // [longitude, latitude]
  maxDistance = 15000 // 15km in meters
) => {
  try {
    // Map emergency types to required specializations
    const specializationMap = {
      'heart_attack': ['cardiology', 'general'],
      'stroke': ['neurology', 'general'],
      'road_accident': ['trauma_center', 'orthopedics', 'general'],
      'trauma': ['trauma_center', 'general'],
      'burns': ['burn_unit', 'general'],
      'breathing_difficulty': ['pulmonology', 'general'],
      'seizure': ['neurology', 'general'],
      'poisoning': ['general'],
      'pregnancy_emergency': ['gynecology', 'general'],
      'other': ['general']
    };

    const requiredSpecializations = specializationMap[emergencyType] || ['general'];

    // Find hospitals with required specialization
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: patientCoordinates
          },
          $maxDistance: maxDistance
        }
      },
      specializations: { $in: requiredSpecializations },
      'currentAvailability.emergencyBeds': { $gt: 0 },
      isActive: true,
      verified: true
    }).limit(5);

    if (hospitals.length === 0) {
      // Fallback: find any hospital with available beds
      const fallbackHospitals = await Hospital.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: patientCoordinates
            },
            $maxDistance: maxDistance * 2 // Expand search radius
          }
        },
        'currentAvailability.emergencyBeds': { $gt: 0 },
        isActive: true
      }).limit(5);

      return await processHospitals(fallbackHospitals, patientCoordinates, emergencyType);
    }

    return await processHospitals(hospitals, patientCoordinates, emergencyType);

  } catch (error) {
    console.error('Error suggesting hospitals:', error);
    throw error;
  }
};

/**
 * Process hospitals with distance, ETA and scoring
 */
const processHospitals = async (hospitals, patientCoordinates, emergencyType) => {
  const hospitalsWithDetails = await Promise.all(
    hospitals.map(async (hospital) => {
      try {
        // Calculate straight-line distance
        const distance = calculateDistance(
          patientCoordinates[1],
          patientCoordinates[0],
          hospital.location.coordinates[1],
          hospital.location.coordinates[0]
        );

        // Get actual route (if routing service is available)
        let routeInfo = null;
        try {
          routeInfo = await getRoute(
            patientCoordinates,
            hospital.location.coordinates
          );
        } catch (routeError) {
          console.log('Route calculation failed, using straight-line distance');
        }

        // Calculate score
        const score = calculateHospitalScore(
          hospital,
          distance,
          emergencyType,
          routeInfo?.duration || distance / 10 // Estimate: 10 m/s average speed
        );

        return {
          hospital: {
            _id: hospital._id,
            name: hospital.name,
            address: hospital.address,
            phone: hospital.phone,
            emergencyContact: hospital.emergencyContact,
            specializations: hospital.specializations,
            availableBeds: hospital.currentAvailability.emergencyBeds,
            rating: hospital.rating.average,
            type: hospital.type
          },
          distance: Math.round(distance),
          eta: routeInfo ? Math.round(routeInfo.duration / 60) : Math.round(distance / 600), // minutes
          actualDistance: routeInfo ? routeInfo.distance : distance,
          score,
          reason: generateReason(hospital, emergencyType, distance)
        };
      } catch (error) {
        console.error('Error processing hospital:', error);
        return null;
      }
    })
  );

  // Filter out null values and sort by score
  return hospitalsWithDetails
    .filter(h => h !== null)
    .sort((a, b) => b.score - a.score);
};

/**
 * Calculate hospital score based on multiple factors
 */
const calculateHospitalScore = (hospital, distance, emergencyType, eta) => {
  let score = 100;

  // Distance factor (closer is better) - Max impact: 30 points
  const distanceScore = Math.max(0, 30 - (distance / 1000) * 2);
  score += distanceScore;

  // Specialization match - Max impact: 25 points
  const specializationMap = {
    'heart_attack': 'cardiology',
    'stroke': 'neurology',
    'road_accident': 'trauma_center',
    'trauma': 'trauma_center',
    'burns': 'burn_unit',
    'breathing_difficulty': 'pulmonology',
    'seizure': 'neurology',
    'pregnancy_emergency': 'gynecology'
  };

  const idealSpecialization = specializationMap[emergencyType];
  if (idealSpecialization && hospital.specializations.includes(idealSpecialization)) {
    score += 25;
  } else if (hospital.specializations.includes('general')) {
    score += 10;
  }

  // Bed availability - Max impact: 20 points
  const availableBeds = hospital.currentAvailability.emergencyBeds || 0;
  score += Math.min(20, availableBeds * 2);

  // Hospital rating - Max impact: 15 points
  score += (hospital.rating.average || 0) * 3;

  // Government hospitals get slight preference for emergencies - 10 points
  if (hospital.type === 'government') {
    score += 10;
  }

  // ICU availability for critical cases - 10 points
  if (hospital.currentAvailability.icuBeds > 0) {
    score += 10;
  }

  return Math.round(score);
};

/**
 * Generate reason for hospital suggestion
 */
const generateReason = (hospital, emergencyType, distance) => {
  const reasons = [];

  // Check specialization
  const specializationMap = {
    'heart_attack': 'cardiology',
    'stroke': 'neurology',
    'road_accident': 'trauma_center',
    'trauma': 'trauma_center',
    'burns': 'burn_unit',
    'breathing_difficulty': 'pulmonology',
    'seizure': 'neurology',
    'pregnancy_emergency': 'gynecology'
  };

  const idealSpecialization = specializationMap[emergencyType];
  if (idealSpecialization && hospital.specializations.includes(idealSpecialization)) {
    reasons.push(`Specialized in ${idealSpecialization.replace('_', ' ')}`);
  }

  // Distance
  if (distance < 3000) {
    reasons.push('Nearest hospital');
  }

  // Beds
  if (hospital.currentAvailability.emergencyBeds >= 5) {
    reasons.push('Good bed availability');
  }

  // Rating
  if (hospital.rating.average >= 4) {
    reasons.push('Highly rated');
  }

  // Type
  if (hospital.type === 'government') {
    reasons.push('Government facility');
  }

  return reasons.join(', ') || 'Available for emergency care';
};

/**
 * Update hospital bed availability
 */
export const updateHospitalAvailability = async (hospitalId, updates) => {
  try {
    const hospital = await Hospital.findById(hospitalId);
    
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    hospital.currentAvailability = {
      ...hospital.currentAvailability,
      ...updates,
      lastUpdated: new Date()
    };

    await hospital.save();
    return hospital;

  } catch (error) {
    console.error('Error updating hospital availability:', error);
    throw error;
  }
};

/**
 * Get hospital details
 */
export const getHospitalDetails = async (hospitalId) => {
  try {
    const hospital = await Hospital.findById(hospitalId);
    
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    return hospital;

  } catch (error) {
    console.error('Error getting hospital details:', error);
    throw error;
  }
};