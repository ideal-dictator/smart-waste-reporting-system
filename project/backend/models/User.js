const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'worker'],
    default: 'citizen'
  },
  rewardPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  streakCount: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLoginDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: null
  },
  location: {
    address: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' }
  },
  badges: [{
    badgeId: String,
    earnedAt: { type: Date, default: Date.now },
    name: String,
    description: String
  }],
  achievements: [{
    achievementId: String,
    unlockedAt: { type: Date, default: Date.now },
    name: String,
    description: String,
    points: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total reports
UserSchema.virtual('totalReports', {
  ref: 'Report',
  localField: '_id',
  foreignField: 'citizenId',
  count: true
});

// Index for geospatial queries
UserSchema.index({ 'location.coordinates': '2dsphere' });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update login streak
UserSchema.methods.updateLoginStreak = function() {
  const now = new Date();
  const lastLogin = this.lastLoginDate;
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (!lastLogin) {
    this.streakCount = 1;
    this.lastLoginDate = now;
    return;
  }

  const daysSinceLastLogin = Math.floor((now - lastLogin) / oneDayMs);
  
  if (daysSinceLastLogin === 1) {
    // Consecutive day login
    this.streakCount += 1;
    if (this.streakCount > this.longestStreak) {
      this.longestStreak = this.streakCount;
    }
  } else if (daysSinceLastLogin > 1) {
    // Streak broken
    this.streakCount = 1;
  }
  // If daysSinceLastLogin === 0, same day login, no change to streak
  
  this.lastLoginDate = now;
};

// Method to add reward points
UserSchema.methods.addRewardPoints = function(points, reason) {
  this.rewardPoints += points;
  
  // Log the reward (you might want to create a separate RewardLog model)
  console.log(`User ${this.email} earned ${points} points for: ${reason}`);
  
  return this.rewardPoints;
};

// Method to deduct reward points
UserSchema.methods.deductRewardPoints = function(points, reason) {
  if (this.rewardPoints < points) {
    throw new Error('Insufficient reward points');
  }
  
  this.rewardPoints -= points;
  console.log(`User ${this.email} spent ${points} points for: ${reason}`);
  
  return this.rewardPoints;
};

// Method to add badge
UserSchema.methods.addBadge = function(badgeId, name, description) {
  const existingBadge = this.badges.find(badge => badge.badgeId === badgeId);
  if (!existingBadge) {
    this.badges.push({
      badgeId,
      name,
      description,
      earnedAt: new Date()
    });
  }
};

// Method to add achievement
UserSchema.methods.addAchievement = function(achievementId, name, description, points = 0) {
  const existingAchievement = this.achievements.find(ach => ach.achievementId === achievementId);
  if (!existingAchievement) {
    this.achievements.push({
      achievementId,
      name,
      description,
      points,
      unlockedAt: new Date()
    });
    
    if (points > 0) {
      this.addRewardPoints(points, `Achievement: ${name}`);
    }
  }
};

// Add pagination plugin
UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);
