const mongoose = require('mongoose');

const RewardLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'daily_login',
      'report_submission',
      'report_validation',
      'streak_bonus',
      'achievement_unlock',
      'badge_earned',
      'referral_bonus',
      'points_redemption',
      'admin_adjustment'
    ]
  },
  points: {
    type: Number,
    required: [true, 'Points value is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  metadata: {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    },
    streakCount: Number,
    achievementId: String,
    badgeId: String,
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rewardItemId: String,
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  balanceAfter: {
    type: Number,
    required: [true, 'Balance after transaction is required']
  },
  isValid: {
    type: Boolean,
    default: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
RewardLogSchema.index({ userId: 1, createdAt: -1 });
RewardLogSchema.index({ action: 1, createdAt: -1 });
RewardLogSchema.index({ 'metadata.reportId': 1 });

// Static method to get user's reward history
RewardLogSchema.statics.getUserRewardHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('metadata.reportId', 'wasteType severity status')
    .populate('metadata.referredUserId', 'name email');
};

// Static method to get reward statistics
RewardLogSchema.statics.getRewardStats = function(userId, startDate, endDate) {
  const matchStage = { userId };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$action',
        totalPoints: { $sum: '$points' },
        count: { $sum: 1 },
        avgPoints: { $avg: '$points' }
      }
    },
    { $sort: { totalPoints: -1 } }
  ]);
};

// Static method to get daily points summary
RewardLogSchema.statics.getDailyPointsSummary = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalPoints: { $sum: '$points' },
        actions: { $push: '$action' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

// Method to validate reward entry
RewardLogSchema.methods.validateEntry = function(validatorId) {
  this.isValid = true;
  this.validatedBy = validatorId;
  this.validatedAt = new Date();
};

// Method to invalidate reward entry
RewardLogSchema.methods.invalidateEntry = function(validatorId) {
  this.isValid = false;
  this.validatedBy = validatorId;
  this.validatedAt = new Date();
};

module.exports = mongoose.model('RewardLog', RewardLogSchema);