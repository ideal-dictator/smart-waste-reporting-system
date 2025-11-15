const express = require('express');
const User = require('../models/User');
const Report = require('../models/Report');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
router.get('/', 
  protect, 
  authorize('admin'), 
  validatePagination, 
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        sort = '-createdAt',
        role,
        isActive,
        search
      } = req.query;

      // Build query
      let query = {};

      if (role) {
        query.role = role;
      }

      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sort,
        select: '-password',
        populate: {
          path: 'totalReports',
          select: 'status'
        }
      };

      const users = await User.paginate(query, options);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching users'
      });
    }
  }
);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin or own profile)
router.get('/:id', protect, validateMongoId(), async (req, res) => {
  try {
    // Check if user can access this profile
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this profile'
      });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('totalReports');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's report statistics
    const reportStats = await Report.aggregate([
      { $match: { citizenId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0
    };

    reportStats.forEach(stat => {
      stats.total += stat.count;
      stats[stat._id.toLowerCase().replace(' ', '')] = stat.count;
    });

    res.json({
      success: true,
      data: {
        user,
        reportStats: stats
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own profile)
router.put('/:id', protect, validateMongoId(), async (req, res) => {
  try {
    // Check if user can update this profile
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const { name, phone, location, preferences, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    // Only admin can update role and active status
    if (req.user.role === 'admin') {
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          location: user.location,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @desc    Upload profile image
// @route   POST /api/users/:id/avatar
// @access  Private (Own profile only)
router.post('/:id/avatar', 
  protect, 
  validateMongoId(),
  uploadSingle('profileImage'),
  async (req, res) => {
    try {
      // Check if user can update this profile
      if (req.params.id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this profile'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Profile image is required'
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.profileImage = req.file.url;
      await user.save();

      res.json({
        success: true,
        message: 'Profile image updated successfully',
        data: {
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while uploading profile image'
      });
    }
  }
);

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', 
  protect, 
  authorize('admin'), 
  validateMongoId(), 
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Don't allow deleting admin users
      if (user.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete admin users'
        });
      }

      // Soft delete - deactivate instead of removing
      user.isActive = false;
      await user.save();

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting user'
      });
    }
  }
);

// @desc    Get agents list
// @route   GET /api/users/agents/list
// @access  Private (Admin)
router.get('/agents/list', protect, authorize('admin'), async (req, res) => {
  try {
    const agents = await User.find({ 
      role: 'worker', 
      isActive: true 
    }).select('name email phone location');

    res.json({
      success: true,
      data: { agents }
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching agents'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private (Admin)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          citizens: {
            $sum: { $cond: [{ $eq: ['$role', 'citizen'] }, 1, 0] }
          },
          agents: {
            $sum: { $cond: [{ $eq: ['$role', 'worker'] }, 1, 0] }
          },
          admins: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          totalRewardPoints: { $sum: '$rewardPoints' },
          averageStreak: { $avg: '$streakCount' }
        }
      }
    ]);

    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

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
          totalReports: { $size: '$reports' }
        }
      },
      {
        $match: {
          totalReports: { $gt: 0 }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          rewardPoints: 1,
          totalReports: 1
        }
      },
      { $sort: { totalReports: -1, rewardPoints: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          citizens: 0,
          agents: 0,
          admins: 0,
          totalRewardPoints: 0,
          averageStreak: 0
        },
        recentUsers,
        topContributors
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

module.exports = router;