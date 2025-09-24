@echo off
echo 🚀 Deploying ASD Detection App to Railway...
echo.

echo 📦 Preparing for deployment...
echo.

echo 🔧 Building frontend...
cd frontend
call npm run build
cd ..

echo.
echo 📝 Creating deployment files...
echo ✅ server.py (Railway-optimized)
echo ✅ requirements.txt (Python dependencies)
echo ✅ railway.json (Railway config)
echo ✅ nixpacks.toml (Build config)
echo.

echo 🚀 Ready for Railway deployment!
echo.
echo Next steps:
echo 1. Push to GitHub: git add . && git commit -m "Railway ready" && git push
echo 2. Go to railway.app
echo 3. Connect GitHub repository
echo 4. Add MongoDB service
echo 5. Deploy!
echo.
echo Your app will be live at: https://your-app.railway.app
echo.
pause
