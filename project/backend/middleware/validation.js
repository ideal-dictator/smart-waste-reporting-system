const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .optional()
    .isIn(['citizen', 'admin', 'worker'])
    .withMessage('Role must be citizen, admin, or worker'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Report validation rules
const validateReportSubmission = [
  body('citizenName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Citizen name must be between 2 and 50 characters'),
  
  body('citizenPhone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('wasteType')
    .isIn(['Organic', 'Plastic', 'Medical', 'E-Waste', 'Glass', 'Metal', 'Mixed', 'Other'])
    .withMessage('Invalid waste type'),
  
  body('severity')
    .isFloat({ min: 1, max: 10 })
    .withMessage('Severity must be between 1 and 10'),
  
  body('confidence')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be between 0 and 1'),
  
  body('location.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  
  body('location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  
  handleValidationErrors
];

// Parse location field when sent as a JSON string (e.g., via multipart/form-data)
const parseLocationField = (req, res, next) => {
  if (req.body && typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location);

      // If coordinates were themselves stringified, try to parse them
      if (req.body.location.coordinates && typeof req.body.location.coordinates === 'string') {
        try {
          req.body.location.coordinates = JSON.parse(req.body.location.coordinates);
        } catch (e) {
          // Fallback: split comma-separated values
          req.body.location.coordinates = req.body.location.coordinates.split(',').map(c => parseFloat(c));
        }
      }
    } catch (e) {
      // Leave as-is; validation will report an error
    }
  }
  next();
};

const validateReportUpdate = [
  body('status')
    .optional()
    .isIn(['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'])
    .withMessage('Invalid status'),
  
  body('assignedAgentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid agent ID'),
  
  body('completionNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Completion notes cannot exceed 500 characters'),
  
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Rejection reason cannot exceed 200 characters'),
  
  handleValidationErrors
];

// Task validation rules
const validateTaskCreation = [
  body('reportId')
    .isMongoId()
    .withMessage('Invalid report ID'),
  
  body('assignedAgentId')
    .isMongoId()
    .withMessage('Invalid agent ID'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority level'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Estimated duration must be between 15 and 480 minutes'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  handleValidationErrors
];

// Parameter validation
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'severity', '-severity'])
    .withMessage('Invalid sort parameter'),
  
  handleValidationErrors
];

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  handleValidationErrors
];

const validateLocationQuery = [
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 km'),
  
  handleValidationErrors
];

// Reward validation
const validateRewardRedemption = [
  body('rewardId')
    .notEmpty()
    .withMessage('Reward ID is required'),
  
  body('points')
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateReportSubmission,
  parseLocationField,
  validateReportUpdate,
  validateTaskCreation,
  validateMongoId,
  validatePagination,
  validateDateRange,
  validateLocationQuery,
  validateRewardRedemption
};