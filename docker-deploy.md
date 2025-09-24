# Docker Deployment (Any Cloud Provider)

## Build Docker Image
```bash
docker build -t asd-detection .
docker run -p 8001:8001 asd-detection
```

## Deploy to:
- **DigitalOcean App Platform** (easiest)
- **AWS ECS** (most powerful)
- **Google Cloud Run** (serverless)
- **Azure Container Instances**

## DigitalOcean (Recommended for Docker):
1. Push image to Docker Hub
2. Connect DigitalOcean to Docker Hub
3. Deploy with one click
4. Add MongoDB managed database
