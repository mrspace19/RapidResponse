import express from 'express';
import {
  createEmergencyRequest,
  createPrivateBooking,
  getEmergencyRequest,
  getMyRequests,
  getAllRequests,
  assignAmbulance,
  updateRequestStatus,
  selectHospital,
  cancelRequest,
  rateService,
  getEmergencyStats
} from '../controllers/emergency.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes - None for emergency

// Protected routes - All users
router.post('/create', protect, createEmergencyRequest);
router.post('/private-booking', protect, createPrivateBooking);
router.get('/my-requests', protect, getMyRequests);
router.get('/:id', protect, getEmergencyRequest);
router.put('/:id/select-hospital', protect, selectHospital);
router.put('/:id/cancel', protect, cancelRequest);
router.put('/:id/rate', protect, rateService);

// Protected routes - Driver, Operator, Admin
router.put('/:id/assign', protect, authorize('driver', 'operator', 'admin'), assignAmbulance);
router.put('/:id/status', protect, authorize('driver', 'operator', 'admin'), updateRequestStatus);

// Protected routes - Operator, Admin only
router.get('/all/requests', protect, authorize('operator', 'admin'), getAllRequests);
router.get('/all/stats', protect, authorize('operator', 'admin'), getEmergencyStats);

export default router;