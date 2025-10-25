import Hospital from '../models/hospital.js';
import { ErrorResponse } from '../middleware/error.handler.middleware.js';
import { asyncHandler } from '../middleware/error.handler.middleware.js';
import { calculateDistance } from '../services/location.service.js';
import { suggestHospitals } from '../services/hospitalmatching.service.js';

/**
 * @desc    Register new hospital
 * @route   POST /api/hospital/register
 * @access  Private (Admin)
 */
export const registerHospital = asyncHandler(async (req, res, next) => {
  const {
    name,
    location,
    address,
    phone,
    emergencyContact,
    email,
    specializations,
    facilities,
    type
  } = req.body;

  // Validate required fields
  if (!name || !location || !address || !phone || !emergencyContact || !type) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Create hospital
  const hospital = await Hospital.create({
    name,
    location: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude]
    },
    address,
    phone,
    emergencyContact,
    email,
    specializations: specializations || ['general'],
    facilities: facilities || {},
    currentAvailability: {
      icuBeds: facilities?.icuBeds || 0,
      emergencyBeds: facilities?.emergencyBeds || 0,
      ventilators: facilities?.ventilators || 0,
      lastUpdated: new Date()
    },
    type,
    adminId: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Hospital registered successfully',
    data: hospital
  });
});

/**
 * @desc    Get hospital by ID
 * @route   GET /api/hospital/:id
 * @access  Public
 */
export const getHospital = asyncHandler(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id)
    .populate('adminId', 'name email phone');

  if (!hospital) {
    return next(new ErrorResponse('Hospital not found', 404));
  }

  res.status(200).json({
    success: true,
    data: hospital
  });
});

/**
 * @desc    Get all hospitals
 * @route   GET /api/hospital
 * @access  Public
 */
export const getAllHospitals = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { type, specialization, verified, search } = req.query;

  const query = { isActive: true };
  
  if (type) query.type = type;
  if (specialization) query.specializations = specialization;
  if (verified !== undefined) query.verified = verified === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } }
    ];
  }

  const hospitals = await Hospital.find(query)
    .select('-adminId')
    .sort({ 'rating.average': -1, name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Hospital.countDocuments(query);

  res.status(200).json({
    success: true,
    count: hospitals.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: hospitals
  });
});

/**
 * @desc    Get nearby hospitals
 * @route   GET /api/hospital/nearby
 * @access  Public
 */
export const getNearbyHospitals = asyncHandler(async (req, res, next) => {
  const { longitude, latitude, radius, specialization } = req.query;

  if (!longitude || !latitude) {
    return next(new ErrorResponse('Please provide longitude and latitude', 400));
  }

  const maxDistance = parseInt(radius) || 15000; // Default 15km

  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  };

  if (specialization) {
    query.specializations = specialization;
  }

  const hospitals = await Hospital.find(query)
    .select('-adminId')
    .limit(10);

  // Calculate distance for each hospital
  const hospitalsWithDistance = hospitals.map(hospital => {
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      hospital.location.coordinates[1],
      hospital.location.coordinates[0]
    );

    return {
      ...hospital.toObject(),
      distance: Math.round(distance),
      distanceFormatted: (distance / 1000).toFixed(1) + ' km'
    };
  });

  res.status(200).json({
    success: true,
    count: hospitalsWithDistance.length,
    data: hospitalsWithDistance
  });
});

/**
 * @desc    Get hospital suggestions for emergency
 * @route   POST /api/hospital/suggest
 * @access  Public
 */
export const getHospitalSuggestions = asyncHandler(async (req, res, next) => {
  const { emergencyType, location, radius } = req.body;

  if (!emergencyType || !location) {
    return next(new ErrorResponse('Please provide emergency type and location', 400));
  }

  const maxDistance = radius || 15000;

  const suggestions = await suggestHospitals(
    emergencyType,
    [location.longitude, location.latitude],
    maxDistance
  );

  res.status(200).json({
    success: true,
    count: suggestions.length,
    data: suggestions
  });
});

/**
 * @desc    Update hospital details
 * @route   PUT /api/hospital/:id
 * @access  Private (Hospital Admin, Admin)
 */
export const updateHospital = asyncHandler(async (req, res, next) => {
  let hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return next(new ErrorResponse('Hospital not found', 404));
  }

  // Check authorization
  if (
    req.user.role === 'hospital_admin' &&
    hospital.adminId.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to update this hospital', 403));
  }

  const allowedUpdates = [
    'phone',
    'emergencyContact',
    'email',
    'specializations',
    'facilities',
    'operatingHours',
    'images'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  hospital = await Hospital.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Hospital updated successfully',
    data: hospital
  });
});

/**
 * @desc    Update hospital bed availability
 * @route   PUT /api/hospital/:id/availability
 * @access  Private (Hospital Admin)
 */
export const updateAvailability = asyncHandler(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return next(new ErrorResponse('Hospital not found', 404));
  }

  // Check authorization
  if (
    req.user.role === 'hospital_admin' &&
    hospital.adminId.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to update this hospital', 403));
  }

  const { icuBeds, emergencyBeds, ventilators } = req.body;

  const updates = {};
  if (icuBeds !== undefined) updates.icuBeds = icuBeds;
  if (emergencyBeds !== undefined) updates.emergencyBeds = emergencyBeds;
  if (ventilators !== undefined) updates.ventilators = ventilators;

  hospital.currentAvailability = {
    ...hospital.currentAvailability,
    ...updates,
    lastUpdated: new Date()
  };

  await hospital.save();

  res.status(200).json({
    success: true,
    message: 'Availability updated successfully',
    data: hospital.currentAvailability
  });
});

/**
 * @desc    Get hospital statistics
 * @route   GET /api/hospital/:id/stats
 * @access  Private (Hospital Admin, Admin)
 */
export const getHospitalStats = asyncHandler(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return next(new ErrorResponse('Hospital not found', 404));
  }

  // Check authorization
  if (
    req.user.role === 'hospital_admin' &&
    hospital.adminId?.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to view these statistics', 403));
  }

  const EmergencyRequest = (await import('../models/EmergencyRequest.js')).default;

  const totalAdmissions = await EmergencyRequest.countDocuments({
    'dropLocation.hospitalId': hospital._id,
    status: 'completed'
  });

  const emergencyTypeStats = await EmergencyRequest.aggregate([
    {
      $match: {
        'dropLocation.hospitalId': hospital._id,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$emergencyType',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const todayAdmissions = await EmergencyRequest.countDocuments({
    'dropLocation.hospitalId': hospital._id,
    arrivalAtHospitalTime: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalAdmissions,
      todayAdmissions,
      emergencyTypeStats,
      currentAvailability: hospital.currentAvailability,
      rating: hospital.rating,
      occupancyRate: {
        icu: hospital.facilities.icuBeds > 0
          ? (((hospital.facilities.icuBeds - hospital.currentAvailability.icuBeds) / hospital.facilities.icuBeds) * 100).toFixed(1) + '%'
          : 'N/A',
        emergency: hospital.facilities.emergencyBeds > 0
          ? (((hospital.facilities.emergencyBeds - hospital.currentAvailability.emergencyBeds) / hospital.facilities.emergencyBeds) * 100).toFixed(1) + '%'
          : 'N/A'
      }
    }
  });
});

/**
 * @desc    Verify hospital
 * @route   PUT /api/hospital/:id/verify
 * @access  Private (Admin)
 */
export const verifyHospital = asyncHandler(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return next(new ErrorResponse('Hospital not found', 404));
  }

  hospital.verified = true;
  await hospital.save();

  res.status(200).json({
    success: true,
    message: 'Hospital verified successfully',
    data: hospital
  });
});

/**
 * @desc    Delete/Deactivate hospital
 * @route   DELETE /api/hospital/:id
 * @access  Private (Admin)
 */
export const deleteHospital = asyncHandler(async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return next(new ErrorResponse('Hospital not found', 404));
  }

  // Soft delete
  hospital.isActive = false;
  await hospital.save();

  res.status(200).json({
    success: true,
    message: 'Hospital deactivated successfully'
  });
});

/**
 * @desc    Get my hospital (for hospital admin)
 * @route   GET /api/hospital/my-hospital
 * @access  Private (Hospital Admin)
 */
export const getMyHospital = asyncHandler(async (req, res, next) => {
  const hospital = await Hospital.findOne({ adminId: req.user.id });

  if (!hospital) {
    return next(new ErrorResponse('No hospital assigned to this admin', 404));
  }

  res.status(200).json({
    success: true,
    data: hospital
  });
});