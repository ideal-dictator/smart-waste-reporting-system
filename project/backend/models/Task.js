const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: [true, 'Report ID is required']
  },
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned agent ID is required']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned by admin ID is required']
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Assigned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Assigned'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 60
  },
  actualDuration: {
    type: Number, // in minutes
    default: null
  },
  scheduledDate: {
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
  dueDate: {
    type: Date,
    required: true
  },
  location: {
    address: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  equipment: [{
    name: String,
    quantity: Number,
    unit: String
  }],
  instructions: [{
    step: Number,
    description: String,
    isCompleted: { type: Boolean, default: false }
  }],
  notes: {
    agentNotes: String,
    adminNotes: String,
    completionNotes: String
  },
  attachments: {
    beforeImages: [String],
    afterImages: [String],
    documents: [String]
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String
  },
  feedback: {
    agentRating: {
      type: Number,
      min: 1,
      max: 5
    },
    agentComment: String,
    adminRating: {
      type: Number,
      min: 1,
      max: 5
    },
    adminComment: String
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: null
    },
    interval: Number, // every N days/weeks/months
    endDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
TaskSchema.index({ assignedAgentId: 1, status: 1 });
TaskSchema.index({ reportId: 1 });
TaskSchema.index({ status: 1, priority: -1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'Completed' && this.status !== 'Cancelled';
});

// Virtual for completion percentage
TaskSchema.virtual('completionPercentage').get(function() {
  if (this.instructions.length === 0) return 0;
  const completedSteps = this.instructions.filter(step => step.isCompleted).length;
  return Math.round((completedSteps / this.instructions.length) * 100);
});

// Virtual for time remaining
TaskSchema.virtual('timeRemaining').get(function() {
  if (this.status === 'Completed' || this.status === 'Cancelled') return 0;
  const now = new Date();
  const remaining = this.dueDate - now;
  return Math.max(0, Math.round(remaining / (1000 * 60 * 60))); // hours
});

// Pre-save middleware
TaskSchema.pre('save', function(next) {
  // Set due date based on priority if not set
  if (!this.dueDate && this.isNew) {
    const hoursToAdd = this.priority === 'Critical' ? 2 : 
                      this.priority === 'High' ? 6 : 
                      this.priority === 'Medium' ? 24 : 48;
    this.dueDate = new Date(Date.now() + (hoursToAdd * 60 * 60 * 1000));
  }
  
  next();
});

// Method to start task
TaskSchema.methods.startTask = function() {
  this.status = 'In Progress';
  this.startedAt = new Date();
};

// Method to complete task
TaskSchema.methods.completeTask = function(completionNotes, afterImages = []) {
  this.status = 'Completed';
  this.completedAt = new Date();
  this.notes.completionNotes = completionNotes;
  this.attachments.afterImages = afterImages;
  
  // Calculate actual duration
  if (this.startedAt) {
    this.actualDuration = Math.round((this.completedAt - this.startedAt) / (1000 * 60));
  }
};

// Method to cancel task
TaskSchema.methods.cancelTask = function(reason) {
  this.status = 'Cancelled';
  this.notes.adminNotes = reason;
};

// Method to verify task completion
TaskSchema.methods.verifyCompletion = function(verifierId, notes) {
  this.verification.isVerified = true;
  this.verification.verifiedBy = verifierId;
  this.verification.verifiedAt = new Date();
  this.verification.verificationNotes = notes;
};

// Method to update instruction completion
TaskSchema.methods.updateInstructionCompletion = function(stepNumber, isCompleted) {
  const instruction = this.instructions.find(inst => inst.step === stepNumber);
  if (instruction) {
    instruction.isCompleted = isCompleted;
  }
};

// Static method to get overdue tasks
TaskSchema.statics.getOverdueTasks = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['Completed', 'Cancelled'] }
  });
};

// Static method to get tasks by agent
TaskSchema.statics.getTasksByAgent = function(agentId, status = null) {
  const query = { assignedAgentId: agentId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('reportId').sort({ priority: -1, dueDate: 1 });
};

// Static method to get tasks by location
TaskSchema.statics.getTasksByLocation = function(longitude, latitude, radiusInKm = 10) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000
      }
    }
  });
};

module.exports = mongoose.model('Task', TaskSchema);