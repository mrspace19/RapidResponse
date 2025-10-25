import express from 'express';
import User from '../models/user.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.handler.middleware.js';
import { ErrorResponse } from '../middleware/error.handler.middleware.js';

const router = express.Router();

/**
 * @desc    Get all users
 * @route   GET /api/user
 * @access  Private (Admin)
 */
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { role, search, isActive } = req.query;

  const query = {};
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: users
  });
}));

/**
 * @desc    Get user by ID
 * @route   GET /api/user/:id
 * @access  Private (Admin, or own profile)
 */
router.get('/:id', protect, asyncHandler(async (req, res, next) => {
  // Check authorization
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new ErrorResponse('Not authorized to view this user', 403));
  }

  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
}));

/**
 * @desc    Update user role
 * @route   PUT /api/user/:id/role
 * @access  Private (Admin)
 */
router.put('/:id/role', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role) {
    return next(new ErrorResponse('Please provide role', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: user
  });
}));

/**
 * @desc    Activate/Deactivate user
 * @route   PUT /api/user/:id/status
 * @access  Private (Admin)
 */
router.put('/:id/status', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  if (isActive === undefined) {
    return next(new ErrorResponse('Please provide status', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
}));

/**
 * @desc    Delete user
 * @route   DELETE /api/user/:id
 * @access  Private (Admin)
 */
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}));

export default router;