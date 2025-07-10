# Render Deployment Guide

## 🚀 Quick Deploy to Render

### Option 1: Single Service (Recommended for demos)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   ```
   Name: web-demos
   Environment: Node
   Build Command: npm run install-all
   Start Command: npm start
   ```
   
   **Important:** The `npm run install-all` command installs dependencies for both the root project and all demo subdirectories.

4. **Environment Variables**
   ```
   NODE_ENV=production
   ```

5. **Deploy** 
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

### Option 2: Individual Services

Deploy each demo as a separate service for maximum isolation:

#### Landing Page
- **Root Directory:** `/`
- **Build Command:** `npm install`
- **Start Command:** `npm run start:landing`

#### Basic Auth Demo
- **Root Directory:** `/basic-auth`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### Form Auth Demo
- **Root Directory:** `/form-auth`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### Cookie Blocking Demo
- **Root Directory:** `/blocking-ui`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### Multi-Page Auth Demo
- **Root Directory:** `/multi-page-auth`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

## 🔧 Technical Details

### Auto-Configuration
- **Ports:** Automatically use Render's `PORT` environment variable
- **Environment:** Detects production mode via `NODE_ENV`
- **Health Checks:** Available at `/health` for all services

### Production Behavior
- **Single service mode:** Landing page with demo info pages (not full demos)
- **Individual service mode:** Each demo runs independently with full functionality
- All demos include health check endpoints for monitoring
- Landing page automatically detects environment (production vs development)

### Monitoring
- Health endpoint: `GET /health`
- Returns service status, environment, and port information
- Use for uptime monitoring and debugging

## 🛠️ Local Testing

Test production behavior locally:

```bash
# Test production mode
npm run production

# Test health checks
npm run health

# Regular development
npm start
```

## 📝 Deployment Checklist

- [ ] All dependencies installed locally
- [ ] Health checks passing (`npm run health`)
- [ ] Code pushed to GitHub
- [ ] Render service configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint accessible
- [ ] All features working in production

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 16+)
   - Verify `npm run install-all` works locally

2. **Service Won't Start**
   - Check environment variables
   - Verify health endpoint responds
   - Check Render logs for errors

3. **Individual Demos Not Working**
   - For single service: demos are embedded in landing page
   - For separate services: deploy each folder individually

4. **Demo Links Redirecting to Localhost**
   - The landing page automatically detects environment
   - In production: shows demo info pages with instructions
   - In development: opens individual demo servers
   - No configuration needed - works automatically

### Debug Commands

```bash
# Test locally in production mode
NODE_ENV=production PORT=10000 npm start

# Check health endpoints
curl https://your-app.onrender.com/health

# View logs
# Check Render dashboard → Your Service → Logs
```

## 🌐 Post-Deployment

1. **Update README**
   - Replace `your-app-name.onrender.com` with actual URL
   - Test all demo functionality

2. **Set Up Monitoring**
   - Use health endpoints for uptime monitoring
   - Configure alerts for service downtime

3. **Performance**
   - Render free tier: services sleep after 15 minutes
   - Consider paid plan for always-on services
   - Health checks help keep services awake

## 📚 Resources

- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)
- [Multiple Services](https://render.com/docs/multiple-services)

---

🎉 **Your web demos are now ready for production deployment on Render!**
