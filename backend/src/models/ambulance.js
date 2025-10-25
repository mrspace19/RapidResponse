import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['BLS', 'ALS'],
    required: [true, 'Ambulance type is required']
  },
  serviceType: {
    type: String,
    enum: ['government', 'private'],
    required: [true, 'Service type is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'on_duty', 'offline', 'maintenance'],
    default: 'offline'
  },
  equipment: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    isWorking: {
      type: Boolean,
      default: true
    }
  }],
  vehicleDetails: {
    make: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: new Date().getFullYear() + 1
    },
    color: String
  },
  fareStructure: {
    baseFare: {
      type: Number,
      default: 0,
      min: 0
    },
    perKmCharge: {
      type: Number,
      default: 0,
      min: 0
    },
    waitingCharges: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['registration', 'insurance', 'fitness', 'permit'],
      required: true
    },
    documentUrl: String,
    expiryDate: Date,
    verified: {
      type: Boolean,
      default: false
    }
  }],
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
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
ambulanceSchema.index({ currentLocation: '2dsphere' });
ambulanceSchema.index({ status: 1 });
ambulanceSchema.index({ serviceType: 1 });
ambulanceSchema.index({ type: 1 });
ambulanceSchema.index({ driverId: 1 });

// Method to update location
ambulanceSchema.methods.updateLocation = function(longitude, latitude) {
  this.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  return this.save();
};

// Method to calculate fare for private ambulances
ambulanceSchema.methods.calculateFare = function(distance, waitingTime = 0) {
  if (this.serviceType === 'government') {
    return 0;
  }
  
  const baseFare = this.fareStructure.baseFare || 0;
  const perKmCharge = this.fareStructure.perKmCharge || 0;
  const waitingCharges = this.fareStructure.waitingCharges || 0;
  
  const distanceFare = (distance / 1000) * perKmCharge; // distance in meters
  const waitingFare = (waitingTime / 60) * waitingCharges; // waitingTime in seconds
  
  return Math.round(baseFare + distanceFare + waitingFare);
};

const Ambulance = mongoose.model('Ambulance', ambulanceSchema);

export default Ambulance;