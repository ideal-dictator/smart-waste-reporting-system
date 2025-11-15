# MongoDB Setup Guide

This guide will help you set up MongoDB for the Smart Waste Reporting and Pickup System.

## Option 1: Local MongoDB Installation

### Windows Installation
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service
5. Start the MongoDB service

### macOS Installation
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux Installation
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: MongoDB Atlas (Cloud)

### Create Free Cluster
1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster (choose the free tier)
4. Choose a cloud provider and region
5. Create cluster (this may take a few minutes)

### Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (for development)
4. Click "Confirm"

### Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., `smart-waste-management`)

## Environment Configuration

### Update .env File
Your `.env` file should contain:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smart-waste-management
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/smart-waste-management
```

### For Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/smart-waste-management
```

### For MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-waste-management
```

## Database Schema

The application uses the following MongoDB collections:

### Users Collection
- Stores citizen, worker, and admin user data
- Includes authentication, profile, and reward information

### Reports Collection
- Stores waste report submissions
- Includes location, images, and status tracking

### Tasks Collection
- Stores worker assignments and task management
- Links reports to workers

### RewardLogs Collection
- Stores reward point transactions
- Tracks user achievements and badges

## Testing the Connection

### Start the Backend Server
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected: localhost (or your Atlas cluster)
🚀 Server running on port 5000 in development mode
```

### Health Check
Visit: http://localhost:5000/health

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-01-08T...",
  "uptime": 123.456,
  "environment": "development",
  "database": "Connected"
}
```

## Troubleshooting

### Common Issues

#### "MongoDB connection failed"
- Check if MongoDB service is running
- Verify the connection string in .env
- Ensure the database name is correct

#### "Authentication failed"
- Check username and password
- Verify database user permissions
- Ensure network access is configured (for Atlas)

#### "Connection timeout"
- Check network connectivity
- Verify firewall settings
- Ensure MongoDB is accessible from your IP

### Debug Commands

#### Check MongoDB Status (Local)
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl status mongod
```

#### Test Connection
```bash
# Using MongoDB Shell
mongosh "mongodb://localhost:27017/smart-waste-management"
```

## Production Considerations

### Security
- Use strong passwords
- Enable authentication
- Configure network access restrictions
- Use SSL/TLS connections

### Performance
- Create appropriate indexes
- Monitor query performance
- Set up connection pooling
- Configure replica sets for high availability

### Backup
- Set up regular backups
- Test restore procedures
- Monitor backup integrity

## Next Steps

1. Ensure MongoDB is running
2. Update your .env file with the correct connection string
3. Start the backend server
4. Test the health endpoint
5. Begin development!

For more information, visit the [MongoDB Documentation](https://docs.mongodb.com/).
