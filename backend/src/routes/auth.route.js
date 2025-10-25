import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword,
  updateMedicalHistory,
  addEmergencyContact,
  removeEmergencyContact
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/medical-history', protect, updateMedicalHistory);
router.post('/emergency-contact', protect, addEmergencyContact);
router.delete('/emergency-contact/:contactId', protect, removeEmergencyContact);

export default router;