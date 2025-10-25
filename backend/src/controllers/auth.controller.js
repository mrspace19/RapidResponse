import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ErrorResponse } from '../middleware/error.handler.middleware.js';
import { asyncHandler } from '../middleware/error.handler.middleware.js';

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Send token response
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return next(new ErrorResponse('User with this email or phone already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'patient'
  });

  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, phone, password } = req.body;

  // Validate
  if ((!email && !phone) || !password) {
    return next(new ErrorResponse('Please provide email/phone and password', 400));
  }

  // Find user
  const query = email ? { email } : { phone };
  const user = await User.findOne(query).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Update medical history
 * @route   PUT /api/auth/medical-history
 * @access  Private
 */
export const updateMedicalHistory = asyncHandler(async (req, res, next) => {
  const { bloodGroup, allergies, chronicConditions, currentMedications } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      medicalHistory: {
        bloodGroup,
        allergies,
        chronicConditions,
        currentMedications
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: user.medicalHistory
  });
});

/**
 * @desc    Add emergency contact
 * @route   POST /api/auth/emergency-contact
 * @access  Private
 */
export const addEmergencyContact = asyncHandler(async (req, res, next) => {
  const { name, phone, relation } = req.body;

  if (!name || !phone || !relation) {
    return next(new ErrorResponse('Please provide all contact details', 400));
  }

  const user = await User.findById(req.user.id);
  
  user.emergencyContacts.push({ name, phone, relation });
  await user.save();

  res.status(200).json({
    success: true,
    data: user.emergencyContacts
  });
});

/**
 * @desc    Remove emergency contact
 * @route   DELETE /api/auth/emergency-contact/:contactId
 * @access  Private
 */
export const removeEmergencyContact = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  user.emergencyContacts = user.emergencyContacts.filter(
    contact => contact._id.toString() !== req.params.contactId
  );
  
  await user.save();

  res.status(200).json({
    success: true,
    data: user.emergencyContacts
  });
});