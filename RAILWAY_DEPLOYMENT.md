# 🚀 Deploy ASD Detection App to Railway

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub
```bash
# Initialize git repository
git init
git add .
git commit -m "ASD Detection App - Railway Ready"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/asd-detection.git
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Python app
6. **Add MongoDB service** (free tier)
7. Deploy! 🚀

### Step 3: Configure Environment
Railway will automatically set:
- `MONGO_URL` (from MongoDB service)
- `PORT` (auto-assigned)

### Step 4: Your App is Live!
- Frontend: `https://your-app.railway.app`
- API: `https://your-app.railway.app/api/health`

## What Railway Does Automatically:
✅ Detects Python app
✅ Installs dependencies from `requirements.txt`
✅ Builds React frontend
✅ Serves static files
✅ Connects to MongoDB
✅ Handles ML model loading
✅ Auto-scales based on traffic

## File Structure for Railway:
```
├── server.py              # Main FastAPI server
├── requirements.txt       # Python dependencies
├── railway.json          # Railway configuration
├── nixpacks.toml         # Build configuration
├── models/               # ML models
├── frontend/             # React app
└── README.md
```

## Environment Variables (Auto-set by Railway):
- `MONGO_URL`: MongoDB connection string
- `PORT`: Server port (auto-assigned)
- `RAILWAY_ENVIRONMENT`: Production/development

## Monitoring:
- View logs in Railway dashboard
- Monitor performance metrics
- Auto-restart on crashes
- Health checks on `/health` endpoint

## Cost:
- **Free tier**: 500 hours/month
- **Pro tier**: $5/month for unlimited usage
- **MongoDB**: Free tier available

## Troubleshooting:
- Check Railway logs for errors
- Ensure models are in `models/` directory
- Verify MongoDB connection
- Test API endpoints

Your ASD Detection app will be live and accessible worldwide! 🌍
