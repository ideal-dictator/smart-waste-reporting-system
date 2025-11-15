# Google OAuth Setup Guide

Follow these steps to enable Google login for your waste management application:

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" at the top, then click "New Project"
3. Enter a project name (e.g., "Waste Management App")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: Select "External"
   - App name: "Waste Management App"
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Skip scopes (click "Save and Continue")
   - Add test users if needed
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "Waste Management Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production URL (when deployed)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production URL (when deployed)
   - Click "Create"

5. Copy the "Client ID" (looks like: `xxxxx.apps.googleusercontent.com`)

## Step 4: Add Client ID to Your Project

1. Open the `.env` file in your project root
2. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```
3. Save the file
4. Restart your development server

**Current Configuration:**
Your project already has a Google OAuth Client ID configured:
```
VITE_GOOGLE_CLIENT_ID=Y92940397515-t3ui8r5errf7v8080grff7p3ik9bgpus.apps.googleusercontent.com
```

## Step 5: Configure Authorized Origins and Redirect URIs

**IMPORTANT:** The 400 error you're experiencing is likely due to incorrect OAuth configuration in Google Cloud Console. Make sure to:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Add these **Authorized JavaScript origins**:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (alternative development port)
   - Your production domain (when deployed)
5. Add these **Authorized redirect URIs**:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (alternative development port)
   - Your production domain (when deployed)
6. **Save** the configuration
7. Wait 5-10 minutes for changes to propagate

## Step 5: Test Google Login

1. Go to your application
2. Click on "Login" or the user icon
3. You should now see a working "Continue with Google" button
4. Click it to test the Google authentication flow

## Troubleshooting

### Error: "400. That's an error. The server cannot process the request because it is malformed"
This is the most common error and usually indicates OAuth configuration issues:

1. **Check Authorized JavaScript Origins:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"
   - Click on your OAuth 2.0 Client ID
   - Ensure `http://localhost:5173` is in "Authorized JavaScript origins"
   - Add `http://localhost:3000` as well (in case you're using a different port)

2. **Check Authorized Redirect URIs:**
   - Add `http://localhost:5173` to "Authorized redirect URIs"
   - Add `http://localhost:3000` as well

3. **Verify OAuth Consent Screen:**
   - Go to "OAuth consent screen" in Google Cloud Console
   - Make sure the app is published or add your email as a test user
   - Ensure the app name and email are properly configured

4. **Clear Browser Cache:**
   - Clear your browser cache and cookies
   - Try in an incognito/private window

### Error: "redirect_uri_mismatch"
- Make sure your authorized redirect URIs in Google Console match your application URL exactly
- Include both `http://localhost:5173` and your production URL

### Error: "invalid_client"
- Double-check that you copied the Client ID correctly
- Make sure there are no extra spaces in the `.env` file

### Button doesn't appear
- Verify the `.env` file has the correct variable name: `VITE_GOOGLE_CLIENT_ID`
- Restart your development server after changing `.env`
- Check browser console for any errors

### Still having issues?
1. Check the browser console for detailed error messages
2. Verify your Google Cloud Console project is active
3. Ensure the Google+ API is enabled
4. Wait 5-10 minutes after making changes in Google Console
5. Try creating a new OAuth 2.0 Client ID if the current one is corrupted

## Demo Login (Microsoft Button)

The Microsoft login button is configured as a demo login. When clicked, it logs you in as a "Demo User" without requiring any external authentication. This is useful for:
- Testing the application
- Demonstrating features
- Quick access without setup

To use demo login, simply click the "Continue with Microsoft" button (marked with a green "Demo" badge).

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- For production, use environment variables in your hosting platform
- Keep your Client ID secure, but know it's safe to expose in frontend code (it's meant to be public)
- The OAuth Secret (different from Client ID) should NEVER be in frontend code
