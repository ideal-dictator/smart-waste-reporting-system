const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories based on file type
    let subDir = 'others';
    
    if (file.fieldname === 'image' || file.fieldname === 'wasteImage') {
      subDir = 'reports';
    } else if (file.fieldname === 'beforeImage' || file.fieldname === 'afterImage') {
      subDir = 'tasks';
    } else if (file.fieldname === 'profileImage') {
      subDir = 'profiles';
    }
    
    const fullPath = path.join(uploadDir, subDir);
    
    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.fieldname === 'image' || file.fieldname === 'wasteImage' || 
      file.fieldname === 'beforeImage' || file.fieldname === 'afterImage' ||
      file.fieldname === 'profileImage') {
    
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  } else {
    // For other file types, allow common document formats
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.'
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: `Unexpected field name. Expected: ${fieldName}`
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      
      // Add file URL to request if file was uploaded
      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        // Normalize paths to handle both absolute and relative paths
        const normalizedUploadDir = path.resolve(uploadDir);
        const normalizedFilePath = path.resolve(req.file.path);
        
        // Calculate relative path from upload directory
        let relativePath = path.relative(normalizedUploadDir, normalizedFilePath).replace(/\\/g, '/');
        
        // If relative path calculation fails or gives unexpected result, extract from file path
        if (!relativePath || relativePath.startsWith('..')) {
          // Extract the path after 'uploads' directory
          const uploadsIndex = req.file.path.indexOf('uploads');
          if (uploadsIndex !== -1) {
            relativePath = req.file.path.substring(uploadsIndex).replace(/\\/g, '/');
          } else {
            // Fallback: use filename with subdirectory
            const subDir = path.basename(path.dirname(req.file.path));
            const filename = path.basename(req.file.path);
            relativePath = `uploads/${subDir}/${filename}`;
          }
        } else {
          // Ensure the path starts with uploads/
          if (!relativePath.startsWith('uploads/')) {
            relativePath = `uploads/${relativePath}`;
          }
        }
        
        req.file.url = `${baseUrl}/${relativePath}`;
        console.log('File uploaded:', {
          originalPath: req.file.path,
          uploadDir: normalizedUploadDir,
          relativePath: relativePath,
          url: req.file.url
        });
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum is ${maxCount}.`
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      
      // Add file URLs to request if files were uploaded
      if (req.files && req.files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        req.files.forEach(file => {
          file.url = `${baseUrl}/uploads/${path.relative(uploadDir, file.path)}`.replace(/\\/g, '/');
        });
      }
      
      next();
    });
  };
};

// Middleware for mixed file upload (different field names)
const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB.'
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      
      // Add file URLs to request if files were uploaded
      if (req.files) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName].forEach(file => {
            file.url = `${baseUrl}/uploads/${path.relative(uploadDir, file.path)}`.replace(/\\/g, '/');
          });
        });
      }
      
      next();
    });
  };
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to delete multiple files
const deleteFiles = (filePaths) => {
  const results = [];
  filePaths.forEach(filePath => {
    results.push(deleteFile(filePath));
  });
  return results;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  deleteFiles
};