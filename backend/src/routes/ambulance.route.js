import express from 'express';
import {
  registerAmbulance,
  getAmbulance,
  getAllAmbulances,
  getNearbyAmbulances,
  getAmbulancesInArea,
  updateAmbulance,
  updateLocation,
  updateStatus,
  getMyAmbulance,
  getActiveRequests,
  getRequestHistory,
  getAmbulanceStats,
  deleteAmbulance,
  verifyAmbulance
} from '../controllers/ambulance.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/nearby', optionalAuth, getNearbyAmbulances);
router.post('/in-area', optionalAuth, getAmbulancesInArea);
router.get('/:id', optionalAuth, getAmbulance);

// Protected routes - Driver
router.get('/driver/my-ambulance', protect, authorize('driver'), getMyAmbulance);
router.get('/driver/active-requests', protect, authorize('driver'), getActiveRequests);
router.get('/driver/request-history', protect, authorize('driver'), getRequestHistory);
router.put('/:id/location', protect, authorize('driver'), updateLocation);
router.put('/:id/status', protect, authorize('driver'), updateStatus);

// Protected routes - Driver, Operator, Admin
router.put('/:id', protect, authorize('driver', 'operator', 'admin'), updateAmbulance);
router.get('/:id/stats', protect, authorize('driver', 'operator', 'admin'), getAmbulanceStats);

// Protected routes - Operator, Admin
router.post('/register', protect, authorize('operator', 'admin'), registerAmbulance);
router.get('/', protect, authorize('operator', 'admin'), getAllAmbulances);
router.put('/:id/verify', protect, authorize('operator', 'admin'), verifyAmbulance);

// Protected routes - Admin only
router.delete('/:id', protect, authorize('admin'), deleteAmbulance);

export default router;