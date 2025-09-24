# Deploy to Heroku

## Prerequisites
1. Install Heroku CLI
2. Create Heroku account
3. Install Git

## Steps

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create Heroku App
```bash
heroku create your-app-name
```

### 3. Set Environment Variables
```bash
heroku config:set MONGO_URL=your_mongodb_connection_string
```

### 4. Deploy
```bash
git push heroku main
```

### 5. Open App
```bash
heroku open
```
