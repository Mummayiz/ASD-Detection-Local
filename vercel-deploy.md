# Deploy Frontend to Vercel + Backend to Railway

## Frontend (Vercel) - FREE
1. Go to https://vercel.com
2. Connect GitHub
3. Select your repository
4. Set build command: `npm run build`
5. Set output directory: `build`
6. Deploy!

## Backend (Railway) - FREE
1. Go to https://railway.app
2. Deploy backend from GitHub
3. Add MongoDB service
4. Get backend URL

## Connect Them:
In Vercel environment variables:
- REACT_APP_BACKEND_URL: https://your-backend.railway.app
