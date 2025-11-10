#!/bin/bash

# Deployment script for Direct Contact with God

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build for production
echo "Building for production..."
npm run build

# Deploy to GitHub Pages (or your preferred hosting)
echo "Deploying to GitHub Pages..."
npm run deploy

echo "Deployment completed successfully!"
echo "Your divine application is now live at: https://your-username.github.io/direct-contact-with-god"
