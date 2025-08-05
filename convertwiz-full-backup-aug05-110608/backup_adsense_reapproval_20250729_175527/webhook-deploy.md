# ConvertWiz Webhook Server Deployment Guide

## Overview
This dedicated webhook server ensures 24/7 availability for Razorpay webhooks, independent of your main application server.

## Files for Deployment
- `webhook-server.js` - Main server file
- `webhook-package.json` - Dependencies (rename to package.json when deploying)
- `.env` file with required environment variables

## Environment Variables Required
```
RAZORPAY_WEBHOOK_SECRET=CWsecret2025@123
ENV=prod
PORT=3000
```

## Deployment Options

### Option 1: Render.com (Recommended)
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy

### Option 2: Railway.app
1. Create new project on Railway
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

### Option 3: Heroku
1. Create new Heroku app
2. Connect GitHub repository
3. Add Config Vars (environment variables)
4. Enable automatic deploys

## Webhook URLs After Deployment
- **Production**: `https://your-app-name.render.com/razorpay-webhook`
- **Development**: Keep current Replit URL for testing

## Configuration in Razorpay Dashboard
1. Go to Settings → Webhooks
2. Add new webhook endpoint: `https://your-app-name.render.com/razorpay-webhook`
3. Select events: `payment.captured`
4. Set webhook secret: `CWsecret2025@123`
5. Activate webhook

## Testing
- Health check: `https://your-app-name.render.com/health`
- Server status: `https://your-app-name.render.com/`

## How It Works
1. Razorpay sends webhook to dedicated server
2. Server validates signature using secret
3. Server forwards payment data to your main app's `/api/confirm-subscription` endpoint
4. Main app grants premium access to user

This ensures webhooks work even if your main Replit app goes to sleep.