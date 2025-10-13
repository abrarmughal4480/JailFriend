# Environment Setup Guide

## Frontend Environment Variables

Create a file called `.env.local` in the `my-app` directory with the following content:

```bash
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=https://jaifriend-backend-production.up.railway.app
NEXT_PUBLIC_FRONTEND_URL=https://jaifriend-frontend-n6zr.vercel.app

# Development settings
NODE_ENV=development
```

## Backend Environment Variables

Create a file called `.env` in the `my-express-app` directory with the following content:

```bash
# Backend Environment Variables
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Configuration
SESSION_SECRET=your-session-secret-key

# CORS Configuration
FRONTEND_URL=https://jaifriend-frontend-n6zr.vercel.app

# MongoDB Configuration (if using database)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fedup

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Important Notes

1. **Frontend**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose variables to the browser
2. **Backend**: Make sure to restart the server after adding environment variables
3. **CORS**: The backend is already configured to allow requests from your Vercel frontend
4. **Security**: Change the JWT_SECRET and SESSION_SECRET to unique, secure values

## Verification

After setting up the environment variables:

1. Restart both frontend and backend servers
2. Check browser console for any CORS errors
3. Test API calls from frontend to backend
4. Verify that file uploads work correctly

## Troubleshooting

If you still get "path not found" errors:

1. Check that the backend is running on Railway
2. Verify the API URL is correct in frontend
3. Check browser network tab for actual request URLs
4. Ensure CORS is properly configured in backend 