================================================================================
                    SMART WASTE REPORTING AND PICKUP SYSTEM
================================================================================

A comprehensive waste management application with citizen reporting, worker 
management, admin dashboard, and gamification features.

================================================================================
                                TABLE OF CONTENTS
================================================================================

1. PROJECT OVERVIEW
2. SYSTEM REQUIREMENTS
3. INSTALLATION GUIDE
4. API KEYS SETUP
5. RUNNING THE APPLICATION
6. USER ROLES & FEATURES
7. TROUBLESHOOTING
8. PROJECT STRUCTURE
9. CONTRIBUTING
10. SUPPORT

================================================================================
                            1. PROJECT OVERVIEW
================================================================================

This application provides a complete waste management solution with:

CITIZEN FEATURES:
- Report waste issues with photos and location
- Track report status
- Earn reward points and badges
- Play educational games
- View community impact

WORKER FEATURES:
- View assigned tasks
- Navigate optimized routes
- Update task status
- Access worker profile

ADMIN FEATURES:
- Manage workers and reports
- View analytics and insights
- Assign tasks to workers
- Monitor system performance

================================================================================
                            2. SYSTEM REQUIREMENTS
================================================================================

REQUIRED SOFTWARE:
- Node.js (version 16 or higher)
- npm (Node Package Manager)
- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)

RECOMMENDED SPECIFICATIONS:
- RAM: 4GB minimum, 8GB recommended
- Storage: 2GB free space
- Internet connection for API services

================================================================================
                            3. INSTALLATION GUIDE
================================================================================

STEP 1: CLONE THE REPOSITORY
----------------------------
1. Open Command Prompt or PowerShell
2. Navigate to your desired directory
3. Run: git clone <repository-url>
4. Navigate to the project folder:
   cd "smart waste reporting and pickup system/project"

STEP 2: INSTALL DEPENDENCIES
----------------------------
1. Install frontend dependencies:
   npm install

2. Install backend dependencies:
   cd backend
   npm install
   cd ..

STEP 3: ENVIRONMENT SETUP
--------------------------
1. The .env file is already configured with the following variables:
   - VITE_GOOGLE_CLIENT_ID (for Google OAuth)
   - JWT_SECRET (for backend authentication)
   - MONGODB_URI (for MongoDB database)
   - PORT (for backend server)

================================================================================
                            4. API KEYS SETUP
================================================================================

GOOGLE OAUTH SETUP (Required for Google Login)
-----------------------------------------------
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Add authorized origins:
     * http://localhost:5173
     * http://localhost:3000
     * http://127.0.0.1:5173
     * http://127.0.0.1:3000
   - Add authorized redirect URIs:
     * http://localhost:5173
     * http://localhost:3000
     * http://127.0.0.1:5173
     * http://127.0.0.1:3000
5. Copy the Client ID and update your .env file:
   VITE_GOOGLE_CLIENT_ID=your-client-id-here

MONGODB SETUP (Required - for database)
---------------------------------------
For detailed MongoDB setup instructions, see: MONGODB_SETUP.md

Quick Setup:
1. Install MongoDB locally OR use MongoDB Atlas (cloud)
2. Update MONGODB_URI in .env file
3. Start the backend server to test connection

Local MongoDB: mongodb://localhost:27017/smart-waste-management
MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/smart-waste-management

FACEBOOK LOGIN SETUP (Optional)
-------------------------------
1. Go to Facebook Developers: https://developers.facebook.com/
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Update the app ID in SocialLogin.tsx

================================================================================
                            5. RUNNING THE APPLICATION
================================================================================

DEVELOPMENT MODE
----------------
1. Start the frontend development server:
   npm run dev
   
   The application will be available at:
   http://localhost:5173

2. Start the backend server (optional):
   cd backend
   npm start
   
   The API will be available at:
   http://localhost:5000

PRODUCTION BUILD
----------------
1. Build the application:
   npm run build
   
2. Preview the production build:
   npm run preview

DEMO CREDENTIALS
----------------
For testing purposes, use these demo credentials:

ADMIN LOGIN:
- Email: kumaran18v@gmail.com
- Password: admin123

WORKER LOGIN:
- Email: worker
- Password: worker123

CITIZEN LOGIN:
- Use Google OAuth or create a new account
- Microsoft button provides demo login

================================================================================
                            6. USER ROLES & FEATURES
================================================================================

CITIZEN ROLE
------------
- Report waste issues with photos
- Track report status
- Earn reward points
- Play educational games
- View leaderboard
- Access rewards store
- View community impact

WORKER ROLE
-----------
- View assigned tasks
- Navigate optimized routes
- Update task completion status
- Access worker profile
- View task history

ADMIN ROLE
----------
- Manage all reports
- Assign tasks to workers
- View analytics dashboard
- Manage worker accounts
- Monitor system performance
- Generate reports

================================================================================
                            7. TROUBLESHOOTING
================================================================================

COMMON ISSUES AND SOLUTIONS
----------------------------

ISSUE: "Google OAuth 400 Error"
SOLUTION:
1. Check Google Cloud Console OAuth configuration
2. Ensure authorized origins include localhost:5173
3. Wait 5-10 minutes after making changes
4. Clear browser cache

ISSUE: "Module not found" errors
SOLUTION:
1. Delete node_modules folder
2. Delete package-lock.json
3. Run: npm install

ISSUE: "Port already in use"
SOLUTION:
1. Kill the process using the port:
   - Windows: netstat -ano | findstr :5173
   - Then: taskkill /PID <PID> /F
2. Or use a different port: npm run dev -- --port 3000

ISSUE: "Environment variables not loading"
SOLUTION:
1. Ensure .env file is in the project root
2. Restart the development server
3. Check variable names start with VITE_

ISSUE: "MongoDB connection errors"
SOLUTION:
1. Check MongoDB connection string in .env file
2. Ensure MongoDB service is running (for local setup)
3. Verify MongoDB Atlas credentials (for cloud setup)
4. Check network connectivity
5. Verify database name and permissions

DEBUGGING TIPS
--------------
1. Check browser console for errors
2. Test Google OAuth by trying to login
3. Verify all API keys are correctly set
4. Check network tab for failed requests
5. Test MongoDB connection at http://localhost:5000/health

================================================================================
                            8. PROJECT STRUCTURE
================================================================================

project/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── admin/               # Admin dashboard components
│   │   ├── agent/               # Agent/worker components
│   │   ├── auth/                # Authentication components
│   │   ├── citizen/             # Citizen features
│   │   ├── common/              # Shared components
│   │   ├── games/               # Game components
│   │   ├── pages/               # Page components
│   │   ├── rewards/             # Rewards system
│   │   └── worker/              # Worker components
│   ├── data/                    # Mock data
│   ├── hooks/                    # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
├── backend/                     # Backend API
│   ├── config/                 # Database configuration
│   ├── middleware/             # Express middleware
│   ├── models/                # Database models
│   ├── routes/                 # API routes
│   └── server.js              # Main server file
├── .env                        # Environment variables
├── package.json                # Frontend dependencies
├── vite.config.ts              # Vite configuration
└── README.txt                  # This file

================================================================================
                            9. CONTRIBUTING
================================================================================

CONTRIBUTION GUIDELINES
-----------------------
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

CODING STANDARDS
----------------
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add comments for complex logic

================================================================================
                            10. SUPPORT
================================================================================

GETTING HELP
------------
1. Check this README for common issues
2. Review the GOOGLE_OAUTH_SETUP.md file
3. Check browser console for error messages
4. Verify all dependencies are installed

CONTACT INFORMATION
------------------
- Project Repository: [Your Repository URL]
- Documentation: [Your Documentation URL]
- Issues: [Your Issues URL]

TECHNICAL STACK
---------------
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express.js, MongoDB with Mongoose
- Database: MongoDB (local or MongoDB Atlas)
- Authentication: Google OAuth, JWT, bcryptjs
- UI Components: Lucide React Icons
- Charts: Recharts
- Games: Custom React components
- File Upload: Multer
- Security: Helmet, CORS, Rate Limiting

================================================================================
                                END OF README
================================================================================

Last Updated: January 2025
Version: 1.0.0
