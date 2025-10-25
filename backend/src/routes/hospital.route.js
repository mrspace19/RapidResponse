import express from 'express';
import {
  registerHospital,
  getHospital,
  getAllHospitals,
  getNearbyHospitals,
  getHospitalSuggestions,
  updateHospital,
  updateAvailability,
  getHospitalStats,
  verifyHospital,
  deleteHospital,
  getMyHospital
} from '../controllers/hospital.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllHospitals);
router.get('/nearby', getNearbyHospitals);
router.post('/suggest', getHospitalSuggestions);
router.get('/:id', getHospital);

// Protected routes - Hospital Admin
router.get('/admin/my-hospital', protect, authorize('hospital_admin'), getMyHospital);
router.put('/:id/availability', protect, authorize('hospital_admin', 'admin'), updateAvailability);

// Protected routes - Hospital Admin, Admin
router.put('/:id', protect, authorize('hospital_admin', 'admin'), updateHospital);
router.get('/:id/stats', protect, authorize('hospital_admin', 'admin'), getHospitalStats);

// Protected routes - Admin only
router.post('/register', protect, authorize('admin'), registerHospital);
router.put('/:id/verify', protect, authorize('admin'), verifyHospital);
router.delete('/:id', protect, authorize('admin'), deleteHospital);

export default router;