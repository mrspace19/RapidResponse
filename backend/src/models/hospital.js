import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  location: {
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
      required: true
    },
    landmark: String
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  emergencyContact: {
    type: String,
    required: true
  },
  email: String,
  specializations: [{
    type: String,
    enum: [
      'cardiology',
      'neurology',
      'trauma_center',
      'burn_unit',
      'orthopedics',
      'pediatrics',
      'gynecology',
      'general_surgery',
      'oncology',
      'nephrology',
      'gastroenterology',
      'pulmonology',
      'general'
    ]
  }],
  facilities: {
    icuBeds: {
      type: Number,
      default: 0
    },
    ventilators: {
      type: Number,
      default: 0
    },
    emergencyBeds: {
      type: Number,
      default: 0
    },
    operationTheaters: {
      type: Number,
      default: 0
    },
    bloodBank: {
      type: Boolean,
      default: false
    },
    ambulanceService: {
      type: Boolean,
      default: false
    },
    pharmacy: {
      type: Boolean,
      default: false
    },
    diagnosticCenter: {
      type: Boolean,
      default: false
    }
  },
  currentAvailability: {
    icuBeds: {
      type: Number,
      default: 0
    },
    emergencyBeds: {
      type: Number,
      default: 0
    },
    ventilators: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
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
  type: {
    type: String,
    enum: ['government', 'private', 'trust', 'corporate'],
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    emergency24x7: {
      type: Boolean,
      default: true
    },
    opdHours: {
      opening: String,
      closing: String
    }
  },
  images: [String],
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Geospatial index
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ specializations: 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ verified: 1 });

// Method to update bed availability
hospitalSchema.methods.updateAvailability = function(updates) {
  this.currentAvailability = {
    ...this.currentAvailability,
    ...updates,
    lastUpdated: new Date()
  };
  return this.save();
};

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;