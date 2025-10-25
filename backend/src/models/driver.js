import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'License expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'License must not be expired'
    }
  },
  licenseType: {
    type: String,
    enum: ['LMV', 'HMV', 'TRANSPORT'],
    required: [true, 'License type is required']
  },
  emergencyMedicalTechnicianCertification: {
    certificateNumber: String,
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: String
  },
  currentStatus: {
    type: String,
    enum: ['available', 'on_duty', 'offline', 'on_break'],
    default: 'offline'
  },
  ambulanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance',
    default: null
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalRides: {
    type: Number,
    default: 0
  },
  totalDistanceCovered: {
    type: Number, // in meters
    default: 0
  },
  workingHours: {
    totalHours: {
      type: Number,
      default: 0
    },
    thisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['license', 'aadhar', 'police_verification', 'medical_certificate', 'emt_certificate', 'photo', 'address_proof'],
      required: true
    },
    documentNumber: String,
    documentUrl: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String
  }],
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please provide a valid 10-digit phone number'
      }
    },
    relation: {
      type: String,
      required: true
    }
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{6}$/.test(v);
        },
        message: 'Please provide a valid 6-digit pincode'
      }
    }
  },
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branchName: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  performanceMetrics: {
    onTimeRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    cancellationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageResponseTime: {
      type: Number, // in seconds
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  availability: {
    monday: { available: { type: Boolean, default: true }, startTime: String, endTime: String },
    tuesday: { available: { type: Boolean, default: true }, startTime: String, endTime: String },
    wednesday: { available: { type: Boolean, default: true }, startTime: String, endTime: String },
    thursday: { available: { type: Boolean, default: true }, startTime: String, endTime: String },
    friday: { available: { type: Boolean, default: true }, startTime: String, endTime: String },
    saturday: { available: { type: Boolean, default: true }, startTime: String, endTime: String },
    sunday: { available: { type: Boolean, default: true }, startTime: String, endTime: String }
  },
  earnings: {
    totalEarnings: {
      type: Number,
      default: 0
    },
    thisMonth: {
      type: Number,
      default: 0
    },
    lastMonth: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      default: 0
    },
    lastPaymentDate: Date
  },
  trainingCompleted: [{
    trainingName: String,
    completedDate: Date,
    certificateUrl: String,
    validUntil: Date
  }],
  violations: [{
    type: {
      type: String,
      enum: ['late_arrival', 'cancellation', 'customer_complaint', 'safety_violation', 'other']
    },
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    actionTaken: String,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    deviceId: String,
    deviceType: String,
    appVersion: String,
    lastLoginAt: Date
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
driverSchema.index({ userId: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ currentStatus: 1 });
driverSchema.index({ ambulanceId: 1 });
driverSchema.index({ isActive: 1, isVerified: 1 });
driverSchema.index({ 'rating.average': -1 });

// Virtual for license validity
driverSchema.virtual('isLicenseValid').get(function() {
  return this.licenseExpiry && this.licenseExpiry > new Date();
});

// Virtual for age of driver account
driverSchema.virtual('accountAge').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to calculate completion rate
driverSchema.methods.calculateCompletionRate = function() {
  if (this.totalRides === 0) return 0;
  const completionRate = 100 - this.performanceMetrics.cancellationRate;
  return Math.round(completionRate * 100) / 100;
};

// Method to update rating
driverSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (totalRating + newRating) / this.rating.count;
  return this.save();
};

// Method to update earnings
driverSchema.methods.addEarnings = function(amount) {
  this.earnings.totalEarnings += amount;
  this.earnings.thisMonth += amount;
  this.earnings.pendingAmount += amount;
  return this.save();
};

// Method to reset monthly stats
driverSchema.methods.resetMonthlyStats = function() {
  this.earnings.lastMonth = this.earnings.thisMonth;
  this.earnings.thisMonth = 0;
  this.workingHours.lastResetDate = new Date();
  return this.save();
};

// Method to check if driver is available for work
driverSchema.methods.isAvailableForWork = function() {
  if (!this.isActive || !this.isVerified) return false;
  if (!this.isLicenseValid) return false;
  if (this.currentStatus === 'offline' || this.currentStatus === 'on_duty') return false;
  
  // Check if ambulance is assigned
  if (!this.ambulanceId) return false;
  
  return true;
};

// Method to get driver profile summary
driverSchema.methods.getProfileSummary = function() {
  return {
    id: this._id,
    userId: this.userId,
    licenseNumber: this.licenseNumber,
    currentStatus: this.currentStatus,
    rating: this.rating,
    totalRides: this.totalRides,
    isVerified: this.isVerified,
    isActive: this.isActive,
    ambulanceId: this.ambulanceId,
    completionRate: this.calculateCompletionRate()
  };
};

// Pre-save middleware to update lastActiveAt
driverSchema.pre('save', function(next) {
  if (this.isModified('currentStatus') && this.currentStatus !== 'offline') {
    this.lastActiveAt = new Date();
  }
  next();
});

// Static method to find available drivers
driverSchema.statics.findAvailableDrivers = function(filters = {}) {
  const query = {
    isActive: true,
    isVerified: true,
    currentStatus: 'available',
    licenseExpiry: { $gt: new Date() },
    ambulanceId: { $ne: null },
    ...filters
  };
  
  return this.find(query)
    .populate('userId', 'name phone email')
    .populate('ambulanceId', 'registrationNumber type status')
    .sort({ 'rating.average': -1 });
};

// Static method to find top-rated drivers
driverSchema.statics.findTopRatedDrivers = function(limit = 10) {
  return this.find({
    isActive: true,
    isVerified: true,
    'rating.count': { $gte: 5 }
  })
    .sort({ 'rating.average': -1 })
    .limit(limit)
    .populate('userId', 'name phone')
    .populate('ambulanceId', 'registrationNumber type');
};

// Static method to get driver statistics
driverSchema.statics.getDriverStats = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        totalDrivers: [{ $count: 'count' }],
        activeDrivers: [
          { $match: { isActive: true, isVerified: true } },
          { $count: 'count' }
        ],
        availableDrivers: [
          { $match: { currentStatus: 'available', isActive: true } },
          { $count: 'count' }
        ],
        onDutyDrivers: [
          { $match: { currentStatus: 'on_duty' } },
          { $count: 'count' }
        ],
        averageRating: [
          { $match: { 'rating.count': { $gt: 0 } } },
          { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
        ],
        pendingVerifications: [
          { $match: { verificationStatus: 'pending' } },
          { $count: 'count' }
        ]
      }
    }
  ]);

  return {
    totalDrivers: stats[0].totalDrivers[0]?.count || 0,
    activeDrivers: stats[0].activeDrivers[0]?.count || 0,
    availableDrivers: stats[0].availableDrivers[0]?.count || 0,
    onDutyDrivers: stats[0].onDutyDrivers[0]?.count || 0,
    averageRating: stats[0].averageRating[0]?.avgRating || 0,
    pendingVerifications: stats[0].pendingVerifications[0]?.count || 0
  };
};

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;