import EmergencyRequest from '../models/emergency.request.js';
import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/hospital.js';
import { ErrorResponse } from '../middleware/error.handler.middleware.js';
import { asyncHandler } from '../middleware/error.handler.middleware.js';
import { findNearbyAmbulances } from '../services/location.service.js';
import { suggestHospitals } from '../services/hospitalmatching.service.js';
import { getRoute } from '../services/routing.service.js';

/**
 * @desc    Create emergency request
 * @route   POST /api/emergency/create
 * @access  Private
 */
export const createEmergencyRequest = asyncHandler(async (req, res, next) => {
  const {
    emergencyType,
    severity,
    pickupLocation,
    ambulanceType,
    patientDetails,
    notes
  } = req.body;

  // Validate required fields
  if (!emergencyType || !pickupLocation || !ambulanceType) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Create emergency request
  const emergencyRequest = await EmergencyRequest.create({
    patientId: req.user.id,
    emergencyType,
    severity: severity || 'high',
    serviceType: 'emergency',
    pickupLocation: {
      type: 'Point',
      coordinates: [pickupLocation.longitude, pickupLocation.latitude],
      address: pickupLocation.address,
      landmark: pickupLocation.landmark
    },
    ambulanceType,
    patientDetails: {
      ...patientDetails,
      name: patientDetails?.name || req.user.name
    },
    notes,
    status: 'pending'
  });

  // Populate patient details
  await emergencyRequest.populate('patientId', 'name phone emergencyContacts medicalHistory');

  res.status(201).json({
    success: true,
    message: 'Emergency request created successfully',
    data: emergencyRequest
  });
});

/**
 * @desc    Create private ambulance booking
 * @route   POST /api/emergency/private-booking
 * @access  Private
 */
export const createPrivateBooking = asyncHandler(async (req, res, next) => {
  const {
    emergencyType,
    pickupLocation,
    dropLocation,
    ambulanceType,
    patientDetails,
    notes,
    scheduledTime
  } = req.body;

  if (!emergencyType || !pickupLocation || !dropLocation || !ambulanceType) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Find available private ambulances
  const nearbyAmbulances = await findNearbyAmbulances(
    pickupLocation.longitude,
    pickupLocation.latitude,
    ambulanceType,
    'private',
    20000 // 20km radius for private
  );

  if (nearbyAmbulances.length === 0) {
    return next(new ErrorResponse('No private ambulances available in your area', 404));
  }

  // Calculate route and fare
  const route = await getRoute(
    [pickupLocation.longitude, pickupLocation.latitude],
    [dropLocation.longitude, dropLocation.latitude]
  );

  // Calculate fare from first available ambulance (can be modified to show all options)
  const ambulance = await Ambulance.findById(nearbyAmbulances[0]._id);
  const estimatedFare = ambulance.calculateFare(route.distance, 0);

  // Create booking
  const booking = await EmergencyRequest.create({
    patientId: req.user.id,
    emergencyType,
    serviceType: 'private',
    pickupLocation: {
      type: 'Point',
      coordinates: [pickupLocation.longitude, pickupLocation.latitude],
      address: pickupLocation.address,
      landmark: pickupLocation.landmark
    },
    dropLocation: {
      type: 'Point',
      coordinates: [dropLocation.longitude, dropLocation.latitude],
      address: dropLocation.address
    },
    ambulanceType,
    patientDetails,
    notes,
    fare: estimatedFare,
    route: {
      distance: route.distance,
      duration: route.duration,
      polyline: JSON.stringify(route.geometry)
    },
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: {
      booking,
      availableAmbulances: nearbyAmbulances,
      estimatedFare,
      route: {
        distance: (route.distance / 1000).toFixed(1) + ' km',
        duration: Math.ceil(route.duration / 60) + ' min'
      }
    }
  });
});

/**
 * @desc    Get emergency request by ID
 * @route   GET /api/emergency/:id
 * @access  Private
 */
export const getEmergencyRequest = asyncHandler(async (req, res, next) => {
  const emergencyRequest = await EmergencyRequest.findById(req.params.id)
    .populate('patientId', 'name phone emergencyContacts medicalHistory')
    .populate('assignedAmbulanceId')
    .populate('dropLocation.hospitalId');

  if (!emergencyRequest) {
    return next(new ErrorResponse('Emergency request not found', 404));
  }

  // Check authorization
  if (
    emergencyRequest.patientId._id.toString() !== req.user.id &&
    req.user.role !== 'operator' &&
    req.user.role !== 'admin'
  ) {
    return next(new ErrorResponse('Not authorized to access this request', 403));
  }

  res.status(200).json({
    success: true,
    data: emergencyRequest
  });
});

/**
 * @desc    Get user's emergency requests
 * @route   GET /api/emergency/my-requests
 * @access  Private
 */
export const getMyRequests = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const status = req.query.status;
  const query = { patientId: req.user.id };
  
  if (status) {
    query.status = status;
  }

  const requests = await EmergencyRequest.find(query)
    .populate('assignedAmbulanceId', 'registrationNumber type')
    .populate('dropLocation.hospitalId', 'name address')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await EmergencyRequest.countDocuments(query);

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
 * @desc    Get all emergency requests (for operators/admin)
 * @route   GET /api/emergency/all
 * @access  Private (Operator, Admin)
 */
export const getAllRequests = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { status, serviceType, emergencyType, startDate, endDate } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (serviceType) query.serviceType = serviceType;
  if (emergencyType) query.emergencyType = emergencyType;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const requests = await EmergencyRequest.find(query)
    .populate('patientId', 'name phone')
    .populate('assignedAmbulanceId', 'registrationNumber type')
    .populate('dropLocation.hospitalId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await EmergencyRequest.countDocuments(query);

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
 * @desc    Assign ambulance to emergency request
 * @route   PUT /api/emergency/:id/assign
 * @access  Private (Driver, Operator, Admin)
 */
export const assignAmbulance = asyncHandler(async (req, res, next) => {
  const { ambulanceId } = req.body;

  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Emergency request not found', 404));
  }

  if (request.status !== 'searching' && request.status !== 'pending') {
    return next(new ErrorResponse('Request is not available for assignment', 400));
  }

  const ambulance = await Ambulance.findById(ambulanceId);

  if (!ambulance) {
    return next(new ErrorResponse('Ambulance not found', 404));
  }

  if (ambulance.status !== 'available') {
    return next(new ErrorResponse('Ambulance is not available', 400));
  }

  // Update request
  request.assignedAmbulanceId = ambulanceId;
  request.status = 'accepted';
  request.acceptTime = new Date();
  await request.save();

  // Update ambulance status
  ambulance.status = 'on_duty';
  await ambulance.save();

  // Get hospital suggestions
  const hospitals = await suggestHospitals(
    request.emergencyType,
    request.pickupLocation.coordinates,
    15000
  );

  request.suggestedHospitals = hospitals.map(h => ({
    hospitalId: h.hospital._id,
    distance: h.distance,
    eta: h.eta,
    matchScore: h.score,
    reason: h.reason
  }));

  await request.save();

  res.status(200).json({
    success: true,
    message: 'Ambulance assigned successfully',
    data: {
      request,
      suggestedHospitals: hospitals
    }
  });
});

/**
 * @desc    Update emergency request status
 * @route   PUT /api/emergency/:id/status
 * @access  Private (Driver, Operator, Admin)
 */
export const updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide status', 400));
  }

  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Emergency request not found', 404));
  }

  await request.updateStatus(status);

  // If completed, free up ambulance
  if (status === 'completed' && request.assignedAmbulanceId) {
    await Ambulance.findByIdAndUpdate(request.assignedAmbulanceId, {
      status: 'available',
      $inc: { totalRides: 1 }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: request
  });
});

/**
 * @desc    Select hospital for emergency
 * @route   PUT /api/emergency/:id/select-hospital
 * @access  Private
 */
export const selectHospital = asyncHandler(async (req, res, next) => {
  const { hospitalId } = req.body;

  if (!hospitalId) {
    return next(new ErrorResponse('Please provide hospital ID', 400));
  }

  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Emergency request not found', 404));
  }

  const hospital = await Hospital.findById(hospitalId);

  if (!hospital) {
    return next(new ErrorResponse('Hospital not found', 404));
  }

  // Calculate route to hospital
  const route = await getRoute(
    request.pickupLocation.coordinates,
    hospital.location.coordinates
  );

  request.dropLocation = {
    type: 'Point',
    coordinates: hospital.location.coordinates,
    hospitalId: hospital._id,
    address: `${hospital.address.street}, ${hospital.address.city}`
  };

  request.route = {
    distance: route.distance,
    duration: route.duration,
    polyline: JSON.stringify(route.geometry)
  };

  await request.save();

  res.status(200).json({
    success: true,
    message: 'Hospital selected successfully',
    data: {
      request,
      hospital,
      route: {
        distance: (route.distance / 1000).toFixed(1) + ' km',
        duration: Math.ceil(route.duration / 60) + ' min'
      }
    }
  });
});

/**
 * @desc    Cancel emergency request
 * @route   PUT /api/emergency/:id/cancel
 * @access  Private
 */
export const cancelRequest = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Emergency request not found', 404));
  }

  // Check authorization
  if (
    request.patientId.toString() !== req.user.id &&
    req.user.role !== 'operator' &&
    req.user.role !== 'admin'
  ) {
    return next(new ErrorResponse('Not authorized to cancel this request', 403));
  }

  if (['completed', 'cancelled'].includes(request.status)) {
    return next(new ErrorResponse('Cannot cancel completed or already cancelled request', 400));
  }

  request.status = 'cancelled';
  request.cancellationTime = new Date();
  request.cancellationReason = reason || 'Cancelled by user';
  await request.save();

  // Free up ambulance if assigned
  if (request.assignedAmbulanceId) {
    await Ambulance.findByIdAndUpdate(request.assignedAmbulanceId, {
      status: 'available'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Request cancelled successfully',
    data: request
  });
});

/**
 * @desc    Rate emergency service
 * @route   PUT /api/emergency/:id/rate
 * @access  Private
 */
export const rateService = asyncHandler(async (req, res, next) => {
  const { score, comment } = req.body;

  if (!score || score < 1 || score > 5) {
    return next(new ErrorResponse('Please provide a valid rating (1-5)', 400));
  }

  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Emergency request not found', 404));
  }

  if (request.patientId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to rate this service', 403));
  }

  if (request.status !== 'completed') {
    return next(new ErrorResponse('Can only rate completed services', 400));
  }

  request.rating = {
    score,
    comment,
    ratedAt: new Date()
  };

  await request.save();

  // Update ambulance rating
  if (request.assignedAmbulanceId) {
    const ambulance = await Ambulance.findById(request.assignedAmbulanceId);
    const newAverage = 
      (ambulance.rating.average * ambulance.rating.count + score) / 
      (ambulance.rating.count + 1);
    
    ambulance.rating.average = newAverage;
    ambulance.rating.count += 1;
    await ambulance.save();
  }

  res.status(200).json({
    success: true,
    message: 'Rating submitted successfully',
    data: request.rating
  });
});

/**
 * @desc    Get emergency statistics
 * @route   GET /api/emergency/stats
 * @access  Private (Operator, Admin)
 */
export const getEmergencyStats = asyncHandler(async (req, res, next) => {
  const stats = await EmergencyRequest.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const emergencyTypeStats = await EmergencyRequest.aggregate([
    {
      $match: { serviceType: 'emergency' }
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

  const avgResponseTime = await EmergencyRequest.aggregate([
    {
      $match: {
        status: 'completed',
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

  const todayRequests = await EmergencyRequest.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });

  res.status(200).json({
    success: true,
    data: {
      statusStats: stats,
      emergencyTypeStats,
      avgResponseTime: avgResponseTime[0]?.avgResponseTime 
        ? Math.round(avgResponseTime[0].avgResponseTime) 
        : 0,
      todayRequests
    }
  });
});