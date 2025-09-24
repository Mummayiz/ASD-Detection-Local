# Multi-stage build for ASD Detection Application
FROM node:18-alpine AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps --force
COPY frontend/ ./
RUN npm run build

# Python backend
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY railway_minimal.py ./

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy models
COPY models/ ./models/

# Expose ports
EXPOSE 8001

# Start the application
CMD ["python", "railway_minimal.py"]
