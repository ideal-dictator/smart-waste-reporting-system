const express = require('express');
const Task = require('../models/Task');
const Report = require('../models/Report');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const { 
  validateTaskCreation, 
  validateMongoId, 
  validatePagination 
} = require('../middleware/validation');

const router = express.Router();

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin only)
router.post('/', 
  protect, 
  authorize('admin'), 
  validateTaskCreation, 
  async (req, res) => {
    try {
      const {
        reportId,
        assignedAgentId,
        title,
        description,
        priority,
        estimatedDuration,
        scheduledDate,
        dueDate,
        equipment,
        instructions
      } = req.body;

      // Verify report exists
      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Verify agent exists and has correct role
      const agent = await User.findById(assignedAgentId);
      if (!agent || agent.role !== 'worker') {
        return res.status(400).json({
          success: false,
          message: 'Invalid agent ID'
        });
      }

      // Create task
      const task = await Task.create({
        reportId,
        assignedAgentId,
        assignedBy: req.user.id,
        title,
        description,
        priority: priority || 'Medium',
        estimatedDuration: estimatedDuration || 60,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        location: {
          address: report.location.address,
          coordinates: report.location.coordinates
        },
        equipment: equipment || [],
        instructions: instructions || []
      });

      // Update report status and assignment
      report.assignToAgent(assignedAgentId, agent.name);
      await report.save();

      await task.populate([
        { path: 'reportId', select: 'wasteType severity description location' },
        { path: 'assignedAgentId', select: 'name email phone' },
        { path: 'assignedBy', select: 'name email' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task }
      });
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during task creation'
      });
    }
  }
);

// @desc    Get all tasks (with filtering)
// @route   GET /api/tasks
// @access  Private (Admin/Agent)
router.get('/', 
  protect, 
  authorize('admin', 'worker'), 
  validatePagination, 
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = '-createdAt',
        status,
        priority,
        assignedAgentId,
        overdue
      } = req.query;

      // Build query
      let query = {};

      // If agent, only show their tasks
      if (req.user.role === 'worker') {
        query.assignedAgentId = req.user.id;
      } else if (assignedAgentId) {
        query.assignedAgentId = assignedAgentId;
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by priority
      if (priority) {
        query.priority = priority;
      }

      // Filter overdue tasks
      if (overdue === 'true') {
        query.dueDate = { $lt: new Date() };
        query.status = { $nin: ['Completed', 'Cancelled'] };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sort,
        populate: [
          { path: 'reportId', select: 'wasteType severity description location imageUrl' },
          { path: 'assignedAgentId', select: 'name email phone' },
          { path: 'assignedBy', select: 'name email' }
        ]
      };

      const tasks = await Task.paginate(query, options);

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching tasks'
      });
    }
  }
);

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private (Admin/Agent)
router.get('/:id', 
  protect, 
  authorize('admin', 'worker'), 
  validateMongoId(), 
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate('reportId')
        .populate('assignedAgentId', 'name email phone')
        .populate('assignedBy', 'name email')
        .populate('verification.verifiedBy', 'name email');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Check if agent can only access their tasks
      if (req.user.role === 'agent' && task.assignedAgentId._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this task'
        });
      }

      res.json({
        success: true,
        data: { task }
      });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching task'
      });
    }
  }
);

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private (Agent/Admin)
router.put('/:id/status', 
  protect, 
  authorize('admin', 'worker'), 
  validateMongoId(), 
  async (req, res) => {
    try {
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Check if agent can only update their tasks
      if (req.user.role === 'agent' && task.assignedAgentId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task'
        });
      }

      // Handle different status updates
      if (status === 'In Progress') {
        task.startTask();
        if (notes) task.notes.agentNotes = notes;
      } else if (status === 'Completed') {
        if (!notes) {
          return res.status(400).json({
            success: false,
            message: 'Completion notes are required'
          });
        }
        task.completeTask(notes);
      } else if (status === 'Cancelled' && req.user.role === 'admin') {
        task.cancelTask(notes || 'Cancelled by admin');
      } else {
        task.status = status;
        if (notes) {
          if (req.user.role === 'admin') {
            task.notes.adminNotes = notes;
          } else {
            task.notes.agentNotes = notes;
          }
        }
      }

      await task.save();

      // Update related report status
      const report = await Report.findById(task.reportId);
      if (report) {
        if (status === 'In Progress') {
          report.startWork();
        } else if (status === 'Completed') {
          report.completeWork(notes);
        }
        await report.save();
      }

      await task.populate([
        { path: 'reportId', select: 'wasteType severity description' },
        { path: 'assignedAgentId', select: 'name email phone' }
      ]);

      res.json({
        success: true,
        message: 'Task status updated successfully',
        data: { task }
      });
    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating task status'
      });
    }
  }
);

// @desc    Upload task completion images
// @route   POST /api/tasks/:id/images
// @access  Private (Agent)
router.post('/:id/images', 
  protect, 
  authorize('worker'), 
  validateMongoId(),
  uploadFields([
    { name: 'beforeImages', maxCount: 3 },
    { name: 'afterImages', maxCount: 3 }
  ]),
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Check if agent owns this task
      if (task.assignedAgentId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to upload images for this task'
        });
      }

      // Add uploaded images to task
      if (req.files.beforeImages) {
        const beforeImageUrls = req.files.beforeImages.map(file => file.url);
        task.attachments.beforeImages.push(...beforeImageUrls);
      }

      if (req.files.afterImages) {
        const afterImageUrls = req.files.afterImages.map(file => file.url);
        task.attachments.afterImages.push(...afterImageUrls);
      }

      await task.save();

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          beforeImages: task.attachments.beforeImages,
          afterImages: task.attachments.afterImages
        }
      });
    } catch (error) {
      console.error('Upload task images error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while uploading images'
      });
    }
  }
);

// @desc    Update task instructions completion
// @route   PUT /api/tasks/:id/instructions/:stepNumber
// @access  Private (Agent)
router.put('/:id/instructions/:stepNumber', 
  protect, 
  authorize('worker'), 
  validateMongoId(), 
  async (req, res) => {
    try {
      const { isCompleted } = req.body;
      const stepNumber = parseInt(req.params.stepNumber);

      if (typeof isCompleted !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isCompleted must be a boolean value'
        });
      }

      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Check if agent owns this task
      if (task.assignedAgentId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task'
        });
      }

      task.updateInstructionCompletion(stepNumber, isCompleted);
      await task.save();

      res.json({
        success: true,
        message: 'Instruction updated successfully',
        data: {
          completionPercentage: task.completionPercentage,
          instructions: task.instructions
        }
      });
    } catch (error) {
      console.error('Update instruction error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating instruction'
      });
    }
  }
);

// @desc    Verify task completion
// @route   POST /api/tasks/:id/verify
// @access  Private (Admin)
router.post('/:id/verify', 
  protect, 
  authorize('admin'), 
  validateMongoId(), 
  async (req, res) => {
    try {
      const { verificationNotes } = req.body;

      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      if (task.status !== 'Completed') {
        return res.status(400).json({
          success: false,
          message: 'Task must be completed before verification'
        });
      }

      task.verifyCompletion(req.user.id, verificationNotes);
      await task.save();

      res.json({
        success: true,
        message: 'Task verified successfully',
        data: { task }
      });
    } catch (error) {
      console.error('Verify task error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while verifying task'
      });
    }
  }
);

// @desc    Get task statistics
// @route   GET /api/tasks/stats/overview
// @access  Private (Admin)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          assignedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Assigned'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $nin: ['$status', ['Completed', 'Cancelled']] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageDuration: { $avg: '$actualDuration' }
        }
      }
    ]);

    const agentStats = await Task.aggregate([
      {
        $group: {
          _id: '$assignedAgentId',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
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
          totalTasks: 1,
          completedTasks: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedTasks', '$totalTasks'] },
              100
            ]
          },
          averageDuration: 1
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTasks: 0,
          assignedTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          averageDuration: 0
        },
        agentPerformance: agentStats
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics'
    });
  }
});

module.exports = router;