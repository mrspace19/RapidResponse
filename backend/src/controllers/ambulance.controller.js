import Ambulance from '../models/Ambulance.js';
import User from '../models/user.model.js';
import EmergencyRequest from '../models/emergency.request.js';
import { ErrorResponse } from '../middleware/error.handler.middleware.js';
import { asyncHandler } from '../middleware/error.handler.middleware.js';
import { findNearbyAmbulances, getAmbulancesInArea as getAmbulancesInAreaService } from '../services/location.service.js';
/**
 * @desc    Register new ambulance
 * @route   POST /api/ambulance/register
 * @access  Private (Admin, Operator)
 */
export const registerAmbulance = asyncHandler(async (req, res, next) => {
  const {
    registrationNumber,
    type,
    serviceType,
    driverId,
    vehicleDetails,
    equipment,
    fareStructure
  } = req.body;

  // Validate required fields
  if (!registrationNumber || !type || !serviceType || !driverId || !vehicleDetails) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Check if driver exists and has driver role
  const driver = await User.findById(driverId);
  if (!driver) {
    return next(new ErrorResponse('Driver not found', 404));
  }

  if (driver.role !== 'driver') {
    return next(new ErrorResponse('User must have driver role', 400));
  }

  // Check if ambulance already registered
  const existingAmbulance = await Ambulance.findOne({ registrationNumber });
  if (existingAmbulance) {
    return next(new ErrorResponse('Ambulance with this registration number already exists', 400));
  }

  // Create ambulance
  const ambulance = await Ambulance.create({
    registrationNumber: registrationNumber.toUpperCase(),
    type,
    serviceType,
    driverId,
    currentLocation: {
      type: 'Point',
      coordinates: [0, 0] // Will be updated when driver goes online
    },
    vehicleDetails,
    equipment: equipment || [],
    fareStructure: serviceType === 'private' ? fareStructure : undefined,
    status: 'offline'
  });

  res.status(201).json({
    success: true,
    message: 'Ambulance registered successfully',
    data: ambulance
  });
});

/**
 * @desc    Get ambulance by ID
 * @route   GET /api/ambulance/:id
 * @access  Public
 */
export const getAmbulance = asyncHandler(async (req, res, next) => {
  const ambulance = await Ambulance.findById(req.params.id)
    .populate('driverId', 'name phone');

  if (!ambulance) {
    return next(new ErrorResponse('Ambulance not found', 404));
  }

  res.status(200).json({
    success: true,
    data: ambulance
  });
});

/**
 * @desc    Get all ambulances
 * @route   GET /api/ambulance
 * @access  Private (Operator, Admin)
 */
export const getAllAmbulances = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { status, type, serviceType, search } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (serviceType) query.serviceType = serviceType;
  if (search) {
    query.registrationNumber = { $regex: search, $options: 'i' };
  }

  const ambulances = await Ambulance.find(query)
    .populate('driverId', 'name phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Ambulance.countDocuments(query);

  res.status(200).json({
    success: true,
    count: ambulances.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: ambulances
  });
});

/**
 * @desc    Get nearby ambulances
 * @route   GET /api/ambulance/nearby
 * @access  Public
 */
export const getNearbyAmbulances = asyncHandler(async (req, res, next) => {
  const { longitude, latitude, type, serviceType, radius } = req.query;

  if (!longitude || !latitude) {
    return next(new ErrorResponse('Please provide longitude and latitude', 400));
  }

  const maxDistance = parseInt(radius) || 10000; // Default 10km

  const ambulances = await findNearbyAmbulances(
    parseFloat(longitude),
    parseFloat(latitude),
    type,
    serviceType,
    maxDistance
  );

  res.status(200).json({
    success: true,
    count: ambulances.length,
    data: ambulances
  });
});

/**
 * @desc    Get ambulances in area (map view)
 * @route   POST /api/ambulance/in-area
 * @access  Public
 */
export const getAmbulancesInArea = asyncHandler(async (req, res, next) => {
  const { southWest, northEast, filters } = req.body;

  if (!southWest || !northEast) {
    return next(new ErrorResponse('Please provide map bounds', 400));
  }

  const ambulances = await getAmbulancesInAreaService(
    { southWest, northEast },
    filters
  );

  res.status(200).json({
    success: true,
    count: ambulances.length,
    data: ambulances
  });
});

/**
 * @desc    Update ambulance details
 * @route   PUT /api/ambulance/:id
 * @access  Private (Driver, Admin, Operator)
 */
export const updateAmbulance = asyncHandler(async (req, res, next) => {
  let ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse('Ambulance not found', 404));
  }

  // Check authorization
  if (
    req.user.role === 'driver' &&
    ambulance.driverId.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to update this ambulance', 403));
  }

  const allowedUpdates = [
    'equipment',
    'vehicleDetails',
    'fareStructure',
    'status'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  ambulance = await Ambulance.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Ambulance updated successfully',
    data: ambulance
  });
});

/**
 * @desc    Update ambulance location
 * @route   PUT /api/ambulance/:id/location
 * @access  Private (Driver)
 */
export const updateLocation = asyncHandler(async (req, res, next) => {
  const { longitude, latitude } = req.body;

  if (!longitude || !latitude) {
    return next(new ErrorResponse('Please provide longitude and latitude', 400));
  }

  const ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse('Ambulance not found', 404));
  }

  // Check authorization
  if (ambulance.driverId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this ambulance', 403));
  }

  ambulance.currentLocation = {
    type: 'Point',
    coordinates: [parseFloat(longitude), parseFloat(latitude)]
  };

  await ambulance.save();

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    data: {
      location: ambulance.currentLocation
    }
  });
});

/**
 * @desc    Update ambulance status
 * @route   PUT /api/ambulance/:id/status
 * @access  Private (Driver)
 */
export const updateStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide status', 400));
  }

  const ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse('Ambulance not found', 404));
  }

  // Check authorization
  if (ambulance.driverId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this ambulance', 403));
  }

  ambulance.status = status;
  await ambulance.save();

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: ambulance
  });
});

/**
 * @desc    Get driver's ambulance
 * @route   GET /api/ambulance/my-ambulance
 * @access  Private (Driver)
 */
export const getMyAmbulance = asyncHandler(async (req, res, next) => {
  const ambulance = await Ambulance.findOne({ driverId: req.user.id })
    .populate('driverId', 'name phone email');

  if (!ambulance) {
    return next(new ErrorResponse('No ambulance assigned to this driver', 404));
  }

  res.status(200).json({
    success: true,
    data: ambulance
  });
});

/**
 * @desc    Get driver's active requests
 * @route   GET /api/ambulance/active-requests
 * @access  Private (Driver)
 */
export const getActiveRequests = asyncHandler(async (req, res, next) => {
  const ambulance = await Ambulance.findOne({ driverId: req.user.id });

  if (!ambulance) {
    return next(new ErrorResponse('No ambulance assigned to this driver', 404));
  }

  const requests = await EmergencyRequest.find({
    assignedAmbulanceId: ambulance._id,
    status: {
      $in: ['accepted', 'en_route_to_pickup', 'arrived_at_pickup', 'patient_picked', 'en_route_to_hospital']
    }
  })
    .populate('patientId', 'name phone emergencyContacts medicalHistory')
    .populate('dropLocation.hospitalId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

/**
 * @desc    Get driver's request history
 * @route   GET /api/ambulance/request-history
 * @access  Private (Driver)
 */
export const getRequestHistory = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const ambulance = await Ambulance.findOne({ driverId: req.user.id });

  if (!ambulance) {
    return next(new ErrorResponse('No ambulance assigned to this driver', 404));
  }

  const requests = await EmergencyRequest.find({
    assignedAmbulanceId: ambulance._id,
    status: { $in: ['completed', 'cancelled'] }
  })
    .populate('patientId', 'name phone')
    .populate('dropLocation.hospitalId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await EmergencyRequest.countDocuments({
    assignedAmbulanceId: ambulance._id,
    status: { $in: ['completed', 'cancelled'] }
  });

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: requests
  });
});

/**
 * @desc    Get ambulance statistics
 * @route   GET /api/ambulance/:id/stats
 * @access  Private (Driver, Operator, Admin)
 */
export const getAmbulanceStats = asyncHandler(async (req, res, next) => {
  const ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse('Ambulance not found', 404));
  }

  // Check authorization
  if (
    req.user.role === 'driver' &&
    ambulance.driverId.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to view these statistics', 403));
  }

  const totalRequests = await EmergencyRequest.countDocuments({
    assignedAmbulanceId: ambulance._id
  });

  const completedRequests = await EmergencyRequest.countDocuments({
    assignedAmbulanceId: ambulance._id,
    status: 'completed'
  });

  const cancelledRequests = await EmergencyRequest.countDocuments({
    assignedAmbulanceId: ambulance._id,
    status: 'cancelled'
  });

  const avgResponseTime = await EmergencyRequest.aggregate([
    {
      $match: {
        assignedAmbulanceId: ambulance._id,
        'responseMetrics.responseTime': { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        avgResponseTime: { $avg: '$responseMetrics.responseTime' }
      }
    }
  ]);

  const totalEarnings = await EmergencyRequest.aggregate([
    {
      $match: {
        assignedAmbulanceId: ambulance._id,
        serviceType: 'private',
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$fare' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRequests,
      completedRequests,
      cancelledRequests,
      completionRate: totalRequests > 0
        ? ((completedRequests / totalRequests) * 100).toFixed(1) + '%'
        : '0%',
      avgResponseTime: avgResponseTime[0]?.avgResponseTime
        ? Math.round(avgResponseTime[0].avgResponseTime) + ' seconds'
        : 'N/A',
      rating: ambulance.rating,
      totalEarnings: totalEarnings[0]?.total || 0,
      totalRides: ambulance.totalRides
    }
  });
});

/**
 * @desc    Delete/Deactivate ambulance
 * @route   DELETE /api/ambulance/:id
 * @access  Private (Admin)
 */
export const deleteAmbulance = asyncHandler(async (req, res, next) => {
  const ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse('Ambulance not found', 404));
  }

  // Check if ambulance is currently on duty
  if (ambulance.status === 'on_duty') {
    return next(new ErrorResponse('Cannot delete ambulance that is currently on duty', 400));
  }

  // Soft delete - just deactivate
  ambulance.isActive = false;
  ambulance.status = 'offline';
  await ambulance.save();

  res.status(200).json({
    success: true,
    message: 'Ambulance deactivated successfully'
  });
});

/**
 * @desc    Verify ambulance
 * @route   PUT /api/ambulance/:id/verify
 * @access  Private (Admin, Operator)
 */
export const verifyAmbulance = asyncHandler(async (req, res, next) => {
  const ambulance = await Ambulance.findById(req.params.id);

  if (!ambulance) {
    return next(new ErrorResponse('Ambulance not found', 404));
  }

  ambulance.isVerified = true;
  await ambulance.save();

  res.status(200).json({
    success: true,
    message: 'Ambulance verified successfully',
    data: ambulance
  });
});