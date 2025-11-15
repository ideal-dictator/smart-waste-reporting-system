const express = require('express');
const User = require('../models/User');
const RewardLog = require('../models/RewardLog');
const { protect } = require('../middleware/auth');
const { validateRewardRedemption, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Reward items catalog
const REWARD_CATALOG = {
  'eco_badge_bronze': { name: 'Bronze Eco Badge', points: 50, type: 'badge' },
  'eco_badge_silver': { name: 'Silver Eco Badge', points: 100, type: 'badge' },
  'eco_badge_gold': { name: 'Gold Eco Badge', points: 200, type: 'badge' },
  'plant_sapling': { name: 'Free Plant Sapling', points: 150, type: 'physical' },
  'discount_10': { name: '10% Discount Coupon', points: 100, type: 'coupon' },
  'discount_20': { name: '20% Discount Coupon', points: 200, type: 'coupon' },
  'eco_tote_bag': { name: 'Eco-Friendly Tote Bag', points: 300, type: 'physical' },
  'recognition_certificate': { name: 'Recognition Certificate', points: 250, type: 'certificate' }
};

// @desc    Get user's reward points and streak info
// @route   GET /api/rewards/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get recent reward history
    const recentRewards = await RewardLog.getUserRewardHistory(req.user.id, 10);
    
    // Get reward statistics for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyStats = await RewardLog.getRewardStats(req.user.id, startOfMonth, new Date());
    
    // Calculate total points earned this month
    const monthlyPoints = monthlyStats.reduce((total, stat) => total + stat.totalPoints, 0);
    
    res.json({
      success: true,
      data: {
        profile: {
          rewardPoints: user.rewardPoints,
          streakCount: user.streakCount,
          longestStreak: user.longestStreak,
          lastLoginDate: user.lastLoginDate,
          badges: user.badges,
          achievements: user.achievements
        },
        monthlyStats: {
          pointsEarned: monthlyPoints,
          actionsCount: monthlyStats.reduce((total, stat) => total + stat.count, 0),
          breakdown: monthlyStats
        },
        recentActivity: recentRewards
      }
    });
  } catch (error) {
    console.error('Get reward profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reward profile'
    });
  }
});

// @desc    Get reward history
// @route   GET /api/rewards/history
// @access  Private
router.get('/history', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, action } = req.query;
    
    let query = { userId: req.user.id };
    
    if (action) {
      query.action = action;
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: [
        { path: 'metadata.reportId', select: 'wasteType severity status' },
        { path: 'metadata.referredUserId', select: 'name email' }
      ]
    };
    
    const history = await RewardLog.paginate(query, options);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get reward history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reward history'
    });
  }
});

// @desc    Get daily points summary
// @route   GET /api/rewards/daily-summary
// @access  Private
router.get('/daily-summary', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const dailySummary = await RewardLog.getDailyPointsSummary(req.user.id, parseInt(days));
    
    res.json({
      success: true,
      data: {
        dailyPoints: dailySummary,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get daily summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching daily summary'
    });
  }
});

// @desc    Get reward catalog
// @route   GET /api/rewards/catalog
// @access  Private
router.get('/catalog', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const catalog = Object.entries(REWARD_CATALOG).map(([id, item]) => ({
      id,
      ...item,
      canAfford: user.rewardPoints >= item.points,
      pointsNeeded: Math.max(0, item.points - user.rewardPoints)
    }));
    
    res.json({
      success: true,
      data: {
        userPoints: user.rewardPoints,
        catalog: catalog.sort((a, b) => a.points - b.points)
      }
    });
  } catch (error) {
    console.error('Get reward catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reward catalog'
    });
  }
});

// @desc    Redeem reward
// @route   POST /api/rewards/redeem
// @access  Private
router.post('/redeem', protect, validateRewardRedemption, async (req, res) => {
  try {
    const { rewardId, points } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Check if reward exists
    const rewardItem = REWARD_CATALOG[rewardId];
    if (!rewardItem) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reward ID'
      });
    }
    
    // Check if points match
    if (points !== rewardItem.points) {
      return res.status(400).json({
        success: false,
        message: 'Points mismatch'
      });
    }
    
    // Check if user has enough points
    if (user.rewardPoints < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient reward points',
        data: {
          required: points,
          available: user.rewardPoints,
          needed: points - user.rewardPoints
        }
      });
    }
    
    // Deduct points
    user.deductRewardPoints(points, `Redeemed: ${rewardItem.name}`);
    await user.save();
    
    // Log the redemption
    await RewardLog.create({
      userId: req.user.id,
      action: 'points_redemption',
      points: -points,
      description: `Redeemed ${rewardItem.name}`,
      metadata: { rewardItemId: rewardId },
      balanceAfter: user.rewardPoints
    });
    
    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        rewardItem: {
          id: rewardId,
          ...rewardItem
        },
        pointsDeducted: points,
        remainingPoints: user.rewardPoints
      }
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while redeeming reward'
    });
  }
});

// @desc    Get leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Private
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;
    
    let matchStage = { isActive: true };
    
    // Filter by time period for recent activity
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchStage.lastLoginDate = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchStage.lastLoginDate = { $gte: monthAgo };
    }
    
    const leaderboard = await User.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'reports',
          localField: '_id',
          foreignField: 'citizenId',
          as: 'reports'
        }
      },
      {
        $addFields: {
          totalReports: { $size: '$reports' },
          resolvedReports: {
            $size: {
              $filter: {
                input: '$reports',
                cond: { $eq: ['$$this.status', 'Resolved'] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          rewardPoints: 1,
          streakCount: 1,
          longestStreak: 1,
          totalReports: 1,
          resolvedReports: 1,
          badges: { $size: '$badges' },
          achievements: { $size: '$achievements' }
        }
      },
      { $sort: { rewardPoints: -1, totalReports: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    // Find current user's position
    const currentUserRank = rankedLeaderboard.findIndex(
      user => user._id.toString() === req.user.id
    ) + 1;
    
    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        currentUserRank: currentUserRank || null,
        period,
        totalUsers: rankedLeaderboard.length
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard'
    });
  }
});

// @desc    Get community impact stats
// @route   GET /api/rewards/community-impact
// @access  Private
router.get('/community-impact', protect, async (req, res) => {
  try {
    // Get overall community statistics
    const communityStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalPoints: { $sum: '$rewardPoints' },
          totalStreaks: { $sum: '$streakCount' },
          totalBadges: { $sum: { $size: '$badges' } },
          totalAchievements: { $sum: { $size: '$achievements' } }
        }
      }
    ]);
    
    // Get report statistics
    const reportStats = await RewardLog.aggregate([
      {
        $match: {
          action: { $in: ['report_submission', 'report_validation'] }
        }
      },
      {
        $group: {
          _id: null,
          totalReports: {
            $sum: { $cond: [{ $eq: ['$action', 'report_submission'] }, 1, 0] }
          },
          validatedReports: {
            $sum: { $cond: [{ $eq: ['$action', 'report_validation'] }, 1, 0] }
          },
          totalPointsFromReports: { $sum: '$points' }
        }
      }
    ]);
    
    // Get monthly trends
    const monthlyTrends = await RewardLog.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalPoints: { $sum: '$points' },
          totalActions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $project: {
          uniqueUsers: 0
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    // Get top contributors
    const topContributors = await User.aggregate([
      {
        $lookup: {
          from: 'reports',
          localField: '_id',
          foreignField: 'citizenId',
          as: 'reports'
        }
      },
      {
        $addFields: {
          totalReports: { $size: '$reports' },
          resolvedReports: {
            $size: {
              $filter: {
                input: '$reports',
                cond: { $eq: ['$$this.status', 'Resolved'] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          rewardPoints: 1,
          totalReports: 1,
          resolvedReports: 1
        }
      },
      { $sort: { resolvedReports: -1, rewardPoints: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      success: true,
      data: {
        community: communityStats[0] || {
          totalUsers: 0,
          totalPoints: 0,
          totalStreaks: 0,
          totalBadges: 0,
          totalAchievements: 0
        },
        reports: reportStats[0] || {
          totalReports: 0,
          validatedReports: 0,
          totalPointsFromReports: 0
        },
        monthlyTrends,
        topContributors
      }
    });
  } catch (error) {
    console.error('Get community impact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community impact'
    });
  }
});

// @desc    Invite friend (referral system)
// @route   POST /api/rewards/invite
// @access  Private
router.post('/invite', protect, async (req, res) => {
  try {
    const { friendEmail } = req.body;
    
    if (!friendEmail) {
      return res.status(400).json({
        success: false,
        message: 'Friend email is required'
      });
    }
    
    // Check if friend already exists
    const existingUser = await User.findOne({ email: friendEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // In a real application, you would send an invitation email here
    // For now, we'll just award points for the invitation attempt
    
    const user = await User.findById(req.user.id);
    const invitePoints = 15;
    
    user.addRewardPoints(invitePoints, 'Friend invitation sent');
    await user.save();
    
    // Log the reward
    await RewardLog.create({
      userId: req.user.id,
      action: 'referral_bonus',
      points: invitePoints,
      description: `Invited friend: ${friendEmail}`,
      metadata: { referredUserId: null }, // Will be updated when friend registers
      balanceAfter: user.rewardPoints
    });
    
    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        pointsEarned: invitePoints,
        totalPoints: user.rewardPoints,
        invitedEmail: friendEmail
      }
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending invitation'
    });
  }
});

module.exports = router;