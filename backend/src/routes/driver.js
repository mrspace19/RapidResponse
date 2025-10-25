import express from 'express';
import {
  registerDriver,
  getDriverProfile,
  updateDriverProfile,
  uploadDocument,
  getDriverStats,
  updateDriverStatus
} from '../controllers/driverController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Driver registration and profile
router.post('/register', registerDriver);
router.get('/profile', authorize('driver'), getDriverProfile);
router.put('/profile', authorize('driver'), updateDriverProfile);

// Documents
router.post('/document', authorize('driver'), uploadDocument);

// Statistics and status
router.get('/stats', authorize('driver'), getDriverStats);
router.put('/status', authorize('driver'), updateDriverStatus);

export default router;