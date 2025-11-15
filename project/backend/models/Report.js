const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ReportSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Citizen ID is required']
  },
  citizenName: {
    type: String,
    required: [true, 'Citizen name is required']
  },
  citizenPhone: {
    type: String,
    required: [true, 'Citizen phone is required']
  },
  imagePath: {
    type: String,
    required: [true, 'Image is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  wasteType: {
    type: String,
    enum: ['Organic', 'Plastic', 'Medical', 'E-Waste', 'Glass', 'Metal', 'Mixed', 'Other'],
    required: [true, 'Waste type is required']
  },
  severity: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Severity is required']
  },
  severityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High', 'Critical'],
    required: true,
    default: 'Low'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'GPS coordinates are required'],
      index: '2dsphere'
    },
    accuracy: Number,
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAgentName: {
    type: String,
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  estimatedCompletionTime: {
    type: Date,
    default: null
  },
  actualCompletionTime: {
    type: Number, // in minutes
    default: null
  },
  isValidated: {
    type: Boolean,
    default: false
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  validatedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  },
  completionNotes: {
    type: String,
    maxlength: [500, 'Completion notes cannot exceed 500 characters']
  },
  beforeImages: [{
    type: String
  }],
  afterImages: [{
    type: String
  }],
  wasteQuantity: {
    estimated: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'Very Large']
    },
    actual: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'Very Large']
    },
    weight: Number // in kg
  },
  tags: [{
    type: String,
    trim: true
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  publicHealth: {
    risk: {
      type: String,
      enum: ['None', 'Low', 'Medium', 'High', 'Critical'],
      default: 'None'
    },
    description: String
  },
  feedback: {
    citizenRating: {
      type: Number,
      min: 1,
      max: 5
    },
    citizenComment: String,
    agentRating: {
      type: Number,
      min: 1,
      max: 5
    },
    agentComment: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ReportSchema.index({ citizenId: 1, createdAt: -1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ assignedAgentId: 1, status: 1 });
ReportSchema.index({ 'location.coordinates': '2dsphere' });
ReportSchema.index({ wasteType: 1, severity: -1 });
ReportSchema.index({ createdAt: -1 });

// Virtual for response time (in hours)
ReportSchema.virtual('responseTime').get(function() {
  if (this.assignedAt) {
    return Math.round((this.assignedAt - this.createdAt) / (1000 * 60 * 60));
  }
  return null;
});

// Virtual for completion time (in hours)
ReportSchema.virtual('completionTime').get(function() {
  if (this.completedAt && this.assignedAt) {
    return Math.round((this.completedAt - this.assignedAt) / (1000 * 60 * 60));
  }
  return null;
});

// Virtual for total time (in hours)
ReportSchema.virtual('totalTime').get(function() {
  if (this.completedAt) {
    return Math.round((this.completedAt - this.createdAt) / (1000 * 60 * 60));
  }
  return null;
});

// Pre-validate middleware to set severity level and priority
// Run before validation so required fields (like `severityLevel`) are populated
ReportSchema.pre('validate', function(next) {
  // Coerce severity to a number and set severity level based on it
  const sev = Number(this.severity) || 0;
  if (sev >= 9) {
    this.severityLevel = 'Critical';
    this.priority = 'Critical';
    this.isUrgent = true;
  } else if (sev >= 7) {
    this.severityLevel = 'Very High';
    this.priority = 'High';
  } else if (sev >= 5) {
    this.severityLevel = 'High';
    this.priority = 'Medium';
  } else if (sev >= 3) {
    this.severityLevel = 'Medium';
    this.priority = 'Medium';
  } else {
    this.severityLevel = 'Low';
    this.priority = 'Low';
  }

  // Set public health risk based on waste type and severity
  if (this.wasteType === 'Medical') {
    this.publicHealth.risk = this.severity >= 7 ? 'Critical' : 'High';
    this.isUrgent = true;
  } else if (this.wasteType === 'E-Waste' && this.severity >= 6) {
    this.publicHealth.risk = 'Medium';
  }

  // Set estimated completion time based on priority
  if (!this.estimatedCompletionTime && this.assignedAt) {
    const hoursToAdd = this.priority === 'Critical' ? 2 : 
                      this.priority === 'High' ? 6 : 
                      this.priority === 'Medium' ? 24 : 48;
    this.estimatedCompletionTime = new Date(this.assignedAt.getTime() + (hoursToAdd * 60 * 60 * 1000));
  }

  next();
});

// Method to assign to agent
ReportSchema.methods.assignToAgent = function(agentId, agentName) {
  this.assignedAgentId = agentId;
  this.assignedAgentName = agentName;
  this.assignedAt = new Date();
  this.status = 'Assigned';
  
  // Set estimated completion time
  const hoursToAdd = this.priority === 'Critical' ? 2 : 
                    this.priority === 'High' ? 6 : 
                    this.priority === 'Medium' ? 24 : 48;
  this.estimatedCompletionTime = new Date(Date.now() + (hoursToAdd * 60 * 60 * 1000));
};

// Method to start work
ReportSchema.methods.startWork = function() {
  this.status = 'In Progress';
  this.startedAt = new Date();
};

// Method to complete work
ReportSchema.methods.completeWork = function(notes, afterImages = [], wasteQuantity = null) {
  this.status = 'Resolved';
  this.completedAt = new Date();
  this.completionNotes = notes;
  this.afterImages = afterImages;
  
  if (wasteQuantity) {
    this.wasteQuantity.actual = wasteQuantity;
  }
  
  // Calculate actual completion time in minutes
  if (this.startedAt) {
    this.actualCompletionTime = Math.round((this.completedAt - this.startedAt) / (1000 * 60));
  }
};

// Method to validate report
ReportSchema.methods.validateReport = function(validatorId) {
  this.isValidated = true;
  this.validatedBy = validatorId;
  this.validatedAt = new Date();
};

// Method to reject report
ReportSchema.methods.rejectReport = function(reason) {
  this.status = 'Rejected';
  this.rejectionReason = reason;
};

// Static method to get reports by location
ReportSchema.statics.findByLocation = function(longitude, latitude, radiusInKm = 5) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    }
  });
};

// Static method to get reports by date range
ReportSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Virtual for readable report ID (short code)
ReportSchema.virtual('reportId').get(function() {
  // Generate a short readable ID from MongoDB _id
  const idString = this._id.toString();
  // Take first 8 characters and make it uppercase
  return `WR-${idString.substring(0, 8).toUpperCase()}`;
});

// Ensure virtuals are included in JSON output
ReportSchema.set('toJSON', { virtuals: true });
ReportSchema.set('toObject', { virtuals: true });

// Add pagination plugin
ReportSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Report', ReportSchema);