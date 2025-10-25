import mongoose from 'mongoose';

const emergencyRequestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emergencyType: {
    type: String,
    enum: [
      'road_accident',
      'heart_attack',
      'stroke',
      'trauma',
      'breathing_difficulty',
      'seizure',
      'burns',
      'poisoning',
      'pregnancy_emergency',
      'other'
    ],
    required: [true, 'Emergency type is required']
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'high'
  },
  serviceType: {
    type: String,
    enum: ['emergency', 'private'],
    required: true
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    },
    landmark: String
  },
  dropLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    address: String
  },
  ambulanceType: {
    type: String,
    enum: ['BLS', 'ALS'],
    required: true
  },
  assignedAmbulanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance',
    default: null
  },
  status: {
    type: String,
    enum: [
      'pending',
      'searching',
      'accepted',
      'en_route_to_pickup',
      'arrived_at_pickup',
      'patient_picked',
      'en_route_to_hospital',
      'arrived_at_hospital',
      'completed',
      'cancelled',
      'no_ambulance_available'
    ],
    default: 'pending'
  },
  requestTime: {
    type: Date,
    default: Date.now
  },
  acceptTime: Date,
  pickupTime: Date,
  arrivalAtHospitalTime: Date,
  completionTime: Date,
  cancellationTime: Date,
  patientDetails: {
    name: String,
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    symptoms: String,
    consciousnessLevel: {
      type: String,
      enum: ['conscious', 'semi_conscious', 'unconscious']
    }
  },
  notes: String,
  fare: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'not_applicable'],
    default: 'not_applicable'
  },
  paymentId: String,
  suggestedHospitals: [{
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    distance: Number,
    eta: Number,
    matchScore: Number,
    reason: String
  }],
  route: {
    distance: Number, // in meters
    duration: Number, // in seconds
    polyline: String
  },
  responseMetrics: {
    searchStartTime: Date,
    searchEndTime: Date,
    ambulancesNotified: Number,
    responseTime: Number // in seconds
  },
  cancellationReason: String,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
emergencyRequestSchema.index({ pickupLocation: '2dsphere' });
emergencyRequestSchema.index({ patientId: 1 });
emergencyRequestSchema.index({ assignedAmbulanceId: 1 });
emergencyRequestSchema.index({ status: 1 });
emergencyRequestSchema.index({ serviceType: 1 });
emergencyRequestSchema.index({ createdAt: -1 });

// Method to calculate response time
emergencyRequestSchema.methods.calculateResponseTime = function() {
  if (this.acceptTime && this.requestTime) {
    return Math.floor((this.acceptTime - this.requestTime) / 1000); // in seconds
  }
  return null;
};

// Method to update status with timestamp
emergencyRequestSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  const statusTimeMap = {
    'accepted': 'acceptTime',
    'patient_picked': 'pickupTime',
    'arrived_at_hospital': 'arrivalAtHospitalTime',
    'completed': 'completionTime',
    'cancelled': 'cancellationTime'
  };
  
  if (statusTimeMap[newStatus]) {
    this[statusTimeMap[newStatus]] = new Date();
  }
  
  return this.save();
};

const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);

export default EmergencyRequest;