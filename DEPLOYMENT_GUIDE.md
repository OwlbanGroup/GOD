# 🔱 GOD Application - Deployment Guide 🔱

## Divine Deployment with Authority

This guide covers all deployment methods for the GOD Application, from local development to production cloud deployment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Methods](#deployment-methods)
   - [Local Development](#local-development)
   - [Docker Deployment](#docker-deployment)
   - [Docker with Nginx](#docker-with-nginx)
   - [GitHub Pages](#github-pages)
   - [Cloud Deployment](#cloud-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring & Health Checks](#monitoring--health-checks)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Software

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Docker** 20.x or higher (for containerized deployment)
- **Docker Compose** 2.x or higher (for multi-container deployment)
- **Git** (for version control and GitHub Pages deployment)

### Optional Software

- **nginx** (for reverse proxy)
- **Redis** (for caching)
- **jq** (for JSON parsing in scripts)

### System Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space
- **Network**: Stable internet connection for cloud services

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Essential Variables

Edit `.env` and set the following required variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Security (CHANGE THESE!)
SESSION_SECRET=your-super-secret-session-key-change-this
JWT_SECRET=your-jwt-secret-key-change-this
```

### 3. Configure Optional Services

#### Azure Services (Optional)

```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
AZURE_COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
```

#### Blockchain (Optional)

```bash
ETHEREUM_NETWORK=sepolia
INFURA_PROJECT_ID=your-infura-project-id
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

---

## Deployment Methods

### Local Development

#### Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm start
```

The application will be available at `http://localhost:3000`

#### Using the Deployment Script

```bash
# Make script executable (Linux/Mac)
chmod +x deploy-divine.sh

# Deploy locally
./deploy-divine.sh local
```

---

### Docker Deployment

#### Basic Docker Deployment

```bash
# Build and start containers
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop containers
docker-compose -f docker-compose.production.yml down
```

#### Using the Deployment Script

```bash
# Deploy with Docker
./deploy-divine.sh docker

# Check status
./deploy-divine.sh status

# View logs
./deploy-divine.sh logs

# Stop deployment
./deploy-divine.sh stop
```

#### Health Check

The application includes built-in health checks:

```bash
# Check application health
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": "3600s",
  "environment": "production",
  "version": "1.0.0",
  "service": "GOD Application"
}
```

---

### Docker with Nginx

For production deployments with reverse proxy and SSL support:

```bash
# Deploy with Nginx
./deploy-divine.sh docker-nginx

# Or manually:
docker-compose -f docker-compose.production.yml --profile with-nginx up -d
```

#### SSL Configuration

1. Place SSL certificates in `./ssl/` directory:
   - `cert.pem` - SSL certificate
   - `key.pem` - Private key

2. Update `nginx.conf` to enable HTTPS (uncomment HTTPS server block)

3. Restart containers:
   ```bash
   docker-compose -f docker-compose.production.yml --profile with-nginx restart
   ```

---

### GitHub Pages

Deploy the application as a static site to GitHub Pages:

```bash
# Deploy to GitHub Pages
./deploy-divine.sh github-pages

# Or manually:
npm run build
npm run deploy
```

#### Configuration

1. Update `package.json` with your repository:
   ```json
   {
     "homepage": "https://your-username.github.io/direct-contact-with-god"
   }
   ```

2. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages

3. Access your site at: `https://your-username.github.io/direct-contact-with-god`

---

### Cloud Deployment

#### Azure App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name god-app-rg --location eastus

# Create App Service plan
az appservice plan create --name god-app-plan --resource-group god-app-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group god-app-rg --plan god-app-plan --name god-divine-app --runtime "NODE|18-lts"

# Deploy from local Git
az webapp deployment source config-local-git --name god-divine-app --resource-group god-app-rg

# Configure environment variables
az webapp config appsettings set --resource-group god-app-rg --name god-divine-app --settings NODE_ENV=production PORT=8080

# Push to Azure
git remote add azure <deployment-url>
git push azure main
```

#### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p node.js-18 god-divine-app

# Create environment
eb create god-production

# Deploy
eb deploy

# Open application
eb open
```

#### Heroku

```bash
# Login to Heroku
heroku login

# Create application
heroku create god-divine-app

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open application
heroku open
```

---

## CI/CD Pipeline

### GitHub Actions

The application includes a comprehensive CI/CD pipeline in `.github/workflows/deploy.yml`:

#### Features

- ✅ Automated testing on every push
- ✅ Code quality checks
- ✅ Docker image building
- ✅ Security scanning
- ✅ Automatic deployment to GitHub Pages
- ✅ Release creation on tags

#### Setup

1. Enable GitHub Actions in your repository
2. Add secrets in Settings → Secrets:
   - `DOCKER_USERNAME` (optional)
   - `DOCKER_PASSWORD` (optional)

3. Push to main branch to trigger deployment:
   ```bash
   git push origin main
   ```

#### Manual Trigger

You can manually trigger deployment from GitHub Actions tab.

---

## Monitoring & Health Checks

### Health Endpoints

The application provides several health check endpoints:

```bash
# Basic health check
curl http://localhost:3000/health

# Readiness check
curl http://localhost:3000/ready
```

### Docker Health Checks

Docker automatically monitors container health:

```bash
# Check container health
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' god-divine-app | jq
```

### Logging

#### View Application Logs

```bash
# Docker logs
docker-compose -f docker-compose.production.yml logs -f divine-app

# Follow logs
docker logs -f god-divine-app

# Last 100 lines
docker logs --tail 100 god-divine-app
```

#### Log Files

Logs are stored in `./logs/` directory (when using volume mounts).

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

#### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache
```

#### Health Check Fails

```bash
# Check application logs
docker logs god-divine-app

# Check if port is accessible
curl -v http://localhost:3000/health

# Restart container
docker restart god-divine-app
```

#### Permission Denied (Linux/Mac)

```bash
# Make script executable
chmod +x deploy-divine.sh

# Run with sudo if needed
sudo ./deploy-divine.sh docker
```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export LOG_LEVEL=debug

# Or in .env file
LOG_LEVEL=debug
```

---

## Rollback Procedures

### Docker Rollback

```bash
# Stop current deployment
docker-compose -f docker-compose.production.yml down

# Pull previous image
docker pull god-divine-app:previous-tag

# Start with previous version
docker-compose -f docker-compose.production.yml up -d
```

### Git Rollback

```bash
# Find commit to rollback to
git log --oneline

# Rollback to specific commit
git revert <commit-hash>

# Or reset (destructive)
git reset --hard <commit-hash>
git push -f origin main
```

### GitHub Pages Rollback

```bash
# Checkout gh-pages branch
git checkout gh-pages

# Reset to previous commit
git reset --hard HEAD~1

# Force push
git push -f origin gh-pages
```

---

## Performance Optimization

### Production Checklist

- [ ] Enable gzip compression (nginx)
- [ ] Configure caching headers
- [ ] Minify JavaScript and CSS
- [ ] Enable CDN for static assets
- [ ] Configure rate limiting
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure auto-scaling (cloud platforms)
- [ ] Set up database backups
- [ ] Configure log rotation

### Monitoring Tools

- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, DataDog
- **Analytics**: Google Analytics, Plausible

---

## Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong secrets** - Generate random SESSION_SECRET and JWT_SECRET
3. **Enable HTTPS** - Use SSL certificates in production
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use environment variables** - Never hardcode sensitive data
6. **Enable rate limiting** - Protect against DDoS attacks
7. **Regular backups** - Backup database and user data
8. **Security headers** - Configure CSP, HSTS, etc.

---

## Support & Resources

### Documentation

- [README.md](README.md) - Project overview
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Development guide
- [NEXT_STEPS.md](NEXT_STEPS.md) - Roadmap and next steps

### Getting Help

- Check [Troubleshooting](#troubleshooting) section
- Review application logs
- Check GitHub Issues
- Contact development team

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Environment variables configured
- [ ] Security secrets updated
- [ ] Dependencies updated (`npm audit`)
- [ ] Documentation updated
- [ ] Backup created

### Deployment

- [ ] Choose deployment method
- [ ] Run deployment script
- [ ] Verify health checks
- [ ] Test critical functionality
- [ ] Monitor logs for errors

### Post-Deployment

- [ ] Verify application is accessible
- [ ] Test all major features
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] Update documentation
- [ ] Notify team of deployment

---

## Quick Reference

### Deployment Commands

```bash
# Local development
./deploy-divine.sh local

# Docker deployment
./deploy-divine.sh docker

# Docker with Nginx
./deploy-divine.sh docker-nginx

# GitHub Pages
./deploy-divine.sh github-pages

# Check status
./deploy-divine.sh status

# View logs
./deploy-divine.sh logs

# Stop deployment
./deploy-divine.sh stop

# Run tests only
./deploy-divine.sh test
```

### Health Check URLs

- Local: `http://localhost:3000/health`
- Docker: `http://localhost:3000/health`
- Nginx: `http://localhost/health`
- Production: `https://your-domain.com/health`

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready

🔱 **Deploy with Divine Authority** 🔱
