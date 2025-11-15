const express = require('express');
const User = require('../models/User');
const Report = require('../models/Report');
const Task = require('../models/Task');
const RewardLog = require('../models/RewardLog');
const { protect, authorize } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validation');

const router = express.Router();

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    // Get current date ranges
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get overall statistics
    const [
      totalUsers,
      totalReports,
      totalTasks,
      pendingReports,
      todayReports,
      weekReports,
      monthReports
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Report.countDocuments(),
      Task.countDocuments(),
      Report.countDocuments({ status: 'Pending' }),
      Report.countDocuments({ createdAt: { $gte: startOfDay } }),
      Report.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Report.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    // Get status distribution
    const statusStats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get waste type distribution
    const wasteTypeStats = await Report.aggregate([
      {
        $group: {
          _id: '$wasteType',
          count: { $sum: 1 },
          averageSeverity: { $avg: '$severity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent high-priority reports
    const highPriorityReports = await Report.find({
      severity: { $gte: 8 },
      status: { $nin: ['Resolved', 'Rejected'] }
    })
      .populate('citizenId', 'name phone')
      .populate('assignedAgentId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get agent performance
    const agentPerformance = await Task.aggregate([
      {
        $match: {
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: '$assignedAgentId',
          completedTasks: { $sum: 1 },
          averageDuration: { $avg: '$actualDuration' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent'
        }
      },
      {
        $unwind: '$agent'
      },
      {
        $project: {
          agentName: '$agent.name',
          completedTasks: 1,
          averageDuration: 1
        }
      },
      { $sort: { completedTasks: -1 } },
      { $limit: 5 }
    ]);

    // Get reward system stats
    const rewardStats = await RewardLog.aggregate([
      {
        $group: {
          _id: null,
          totalPointsAwarded: { $sum: { $cond: [{ $gt: ['$points', 0] }, '$points', 0] } },
          totalPointsRedeemed: { $sum: { $cond: [{ $lt: ['$points', 0] }, { $abs: '$points' }, 0] } },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalReports,
          totalTasks,
          pendingReports,
          todayReports,
          weekReports,
          monthReports
        },
        statusDistribution: statusStats,
        wasteTypeDistribution: wasteTypeStats,
        highPriorityReports,
        agentPerformance,
        rewardStats: rewardStats[0] || {
          totalPointsAwarded: 0,
          totalPointsRedeemed: 0,
          totalTransactions: 0
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30', days: daysParam } = req.query;
    const days = parseInt(daysParam || period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily report trends
    const dailyTrends = await Report.aggregate([
      {
        $match: {
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
          reports: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          averageSeverity: { $avg: '$severity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Response time analysis
    const responseTimeStats = await Report.aggregate([
      {
        $match: {
          assignedAt: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $addFields: {
          responseTimeHours: {
            $divide: [
              { $subtract: ['$assignedAt', '$createdAt'] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageResponseTime: { $avg: '$responseTimeHours' },
          minResponseTime: { $min: '$responseTimeHours' },
          maxResponseTime: { $max: '$responseTimeHours' }
        }
      }
    ]);

    // Completion time analysis
    const completionTimeStats = await Report.aggregate([
      {
        $match: {
          completedAt: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $addFields: {
          completionTimeHours: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageCompletionTime: { $avg: '$completionTimeHours' },
          minCompletionTime: { $min: '$completionTimeHours' },
          maxCompletionTime: { $max: '$completionTimeHours' }
        }
      }
    ]);

    // Geographic distribution
    const geographicStats = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            // Group by approximate area (you might want to implement proper geocoding)
            lat: { $round: [{ $multiply: ['$location.coordinates.1', 100] }, 0] },
            lng: { $round: [{ $multiply: ['$location.coordinates.0', 100] }, 0] }
          },
          count: { $sum: 1 },
          averageSeverity: { $avg: '$severity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // User engagement metrics
    const userEngagement = await User.aggregate([
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
          recentReports: {
            $size: {
              $filter: {
                input: '$reports',
                cond: { $gte: ['$$this.createdAt', startDate] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          activeUsers: {
            $sum: { $cond: [{ $gt: ['$recentReports', 0] }, 1, 0] }
          },
          totalUsers: { $sum: 1 },
          averageReportsPerUser: { $avg: '$totalReports' },
          topContributors: {
            $push: {
              $cond: [
                { $gt: ['$totalReports', 5] },
                {
                  name: '$name',
                  email: '$email',
                  totalReports: '$totalReports',
                  rewardPoints: '$rewardPoints'
                },
                null
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        dailyTrends,
        responseTime: responseTimeStats[0] || {
          averageResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0
        },
        completionTime: completionTimeStats[0] || {
          averageCompletionTime: 0,
          minCompletionTime: 0,
          maxCompletionTime: 0
        },
        geographicDistribution: geographicStats,
        userEngagement: userEngagement[0] || {
          activeUsers: 0,
          totalUsers: 0,
          averageReportsPerUser: 0,
          topContributors: []
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Bulk assign reports to agents
// @route   POST /api/admin/bulk-assign
// @access  Private (Admin)
router.post('/bulk-assign', protect, authorize('admin'), async (req, res) => {
  try {
    const { reportIds, agentId } = req.body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Report IDs array is required'
      });
    }

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID is required'
      });
    }

    // Verify agent exists
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'worker') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    // Update reports
    const updateResult = await Report.updateMany(
      {
        _id: { $in: reportIds },
        status: 'Pending'
      },
      {
        $set: {
          assignedAgentId: agentId,
          assignedAgentName: agent.name,
          assignedAt: new Date(),
          status: 'Assigned'
        }
      }
    );

    res.json({
      success: true,
      message: `${updateResult.modifiedCount} reports assigned successfully`,
      data: {
        assignedCount: updateResult.modifiedCount,
        agentName: agent.name
      }
    });
  } catch (error) {
    console.error('Bulk assign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk assignment'
    });
  }
});

// @desc    Update reward system settings
// @route   PUT /api/admin/reward-settings
// @access  Private (Admin)
router.put('/reward-settings', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      dailyLoginPoints,
      reportSubmissionPoints,
      reportValidationPoints,
      streakBonuses
    } = req.body;

    // In a real application, you would store these settings in a database
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Reward settings updated successfully',
      data: {
        dailyLoginPoints: dailyLoginPoints || 2,
        reportSubmissionPoints: reportSubmissionPoints || 10,
        reportValidationPoints: reportValidationPoints || 20,
        streakBonuses: streakBonuses || {
          3: 10,
          7: 30,
          30: 100
        }
      }
    });
  } catch (error) {
    console.error('Update reward settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating reward settings'
    });
  }
});

// @desc    Manual reward adjustment
// @route   POST /api/admin/adjust-rewards
// @access  Private (Admin)
router.post('/adjust-rewards', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    if (!userId || !points || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID, points, and reason are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Adjust points
    if (points > 0) {
      user.addRewardPoints(points, reason);
    } else {
      user.deductRewardPoints(Math.abs(points), reason);
    }

    await user.save();

    // Log the adjustment
    await RewardLog.create({
      userId: user._id,
      action: 'admin_adjustment',
      points: points,
      description: `Admin adjustment: ${reason}`,
      metadata: { adminId: req.user.id },
      balanceAfter: user.rewardPoints
    });

    res.json({
      success: true,
      message: 'Reward points adjusted successfully',
      data: {
        userId: user._id,
        userName: user.name,
        pointsAdjusted: points,
        newBalance: user.rewardPoints,
        reason
      }
    });
  } catch (error) {
    console.error('Adjust rewards error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while adjusting rewards'
    });
  }
});

// @desc    Create worker (Admin only)
// @route   POST /api/admin/workers
// @access  Private (Admin)
router.post('/workers', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }

    // Create worker user
    const worker = await User.create({
      name,
      email,
      password,
      phone,
      role: 'worker',
      location: location || {}
    });

    res.status(201).json({
      success: true,
      message: 'Worker created successfully',
      data: {
        worker: {
          id: worker._id,
          name: worker.name,
          email: worker.email,
          phone: worker.phone,
          role: worker.role,
          location: worker.location
        }
      }
    });
  } catch (error) {
    console.error('Create worker error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during worker creation'
    });
  }
});

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private (Admin)
router.get('/export/:type', protect, authorize('admin'), async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let data = [];
    let filename = '';

    switch (type) {
      case 'reports':
        data = await Report.find(query)
          .populate('citizenId', 'name email phone')
          .populate('assignedAgentId', 'name email phone')
          .sort({ createdAt: -1 });
        filename = 'reports_export';
        break;

      case 'users':
        data = await User.find(query)
          .select('-password')
          .sort({ createdAt: -1 });
        filename = 'users_export';
        break;

      case 'rewards':
        data = await RewardLog.find(query)
          .populate('userId', 'name email')
          .sort({ createdAt: -1 });
        filename = 'rewards_export';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (format === 'csv') {
      // In a real application, you would convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      res.send('CSV export not implemented yet');
    } else {
      res.json({
        success: true,
        data: data,
        count: data.length,
        exportType: type,
        exportDate: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during data export'
    });
  }
});

module.exports = router;