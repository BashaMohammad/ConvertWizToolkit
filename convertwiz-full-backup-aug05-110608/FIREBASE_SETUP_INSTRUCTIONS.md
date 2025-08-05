# Firebase Google OAuth Setup Instructions

## Problem
Google sign-in is failing with error: "This domain is not authorized for Google sign-in"

## Solution
You need to authorize your Replit domain in Firebase Console.

## Step-by-Step Fix:

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select your "convertwiz" project

### 2. Enable Google Authentication (if not done)
- Go to **Authentication** → **Sign-in method**
- Click on **Google** provider
- Click **Enable** toggle
- Save changes

### 3. Add Authorized Domains
- In **Authentication** → **Settings** → **Authorized domains**
- Click **Add domain**
- Add these domains:
  ```
  replit.dev
  replit.co
  *.replit.dev
  *.replit.co
  ```
- Also add your specific Replit URL (the one you're currently using)

### 4. Configure OAuth (Important!)
- In **Authentication** → **Settings** → **Authorized domains**
- Make sure these domains are listed:
  - localhost (for development)
  - Your current Replit domain
  - replit.dev
  - replit.co

### 5. Check Project Settings
- Go to **Project Settings** (gear icon)
- Under **General** → **Your apps** → **Web app**
- Verify the configuration matches our code

## Current Domain to Add:
Your current Replit URL needs to be added to authorized domains.

## Test After Setup:
1. Save all changes in Firebase Console
2. Wait 2-3 minutes for changes to propagate
3. Refresh your ConvertWiz app
4. Try Google sign-in again

## Alternative Domains to Try:
If your specific domain doesn't work, try adding:
- `*.replit.dev` (wildcard for all Replit subdomains)
- `replit.dev` (main domain)
- Your specific replit URL without https://