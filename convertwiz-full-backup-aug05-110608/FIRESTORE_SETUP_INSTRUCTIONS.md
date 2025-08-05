# Firebase Firestore Setup Instructions for ConvertWiz

## Overview
ConvertWiz now includes Firebase Firestore integration for tracking user subscription plans and daily usage limits. This document provides setup instructions for configuring Firestore in your Firebase project.

## Prerequisites
- Firebase project with Authentication already enabled
- Admin access to Firebase Console
- ConvertWiz application already configured with Firebase Authentication

## Step 1: Enable Firestore Database

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your "convertwiz" project
3. Click on **"Firestore Database"** in the left sidebar
4. Click **"Create database"**
5. Choose **"Start in production mode"** (we'll configure security rules)
6. Select your preferred location (choose closest to your users)
7. Click **"Done"**

## Step 2: Configure Firestore Security Rules

1. In Firestore Database console, click on **"Rules"** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other operations by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **"Publish"** to save the rules

## Step 3: Test Firestore Integration

1. Open your ConvertWiz application
2. Sign up with a new account or sign in to an existing account
3. Check the browser's Developer Tools Console for Firebase logs
4. Try converting a file (JPG to PNG) to test usage tracking
5. Verify that usage information appears in the navigation bar

## Step 4: Verify Firestore Data Structure

1. In Firebase Console, go to **Firestore Database** → **Data** tab
2. You should see a `users` collection created automatically
3. Each user document should contain:
   - `plan`: "free" (default)
   - `dailyUsageCount`: 0 (initially)
   - `lastConversionDate`: timestamp
   - `email`: user's email address
   - `displayName`: user's display name

## Subscription Plan Limits

The system supports three subscription tiers:

| Plan | Daily Conversions | Description |
|------|-------------------|-------------|
| Free | 5 per day | Default plan for all new users |
| Standard | 20 per day | Mid-tier plan |
| Premium | Unlimited | No daily limits |

## Usage Tracking Features

### For Authenticated Users:
- Real-time usage tracking in Firestore
- Cross-device synchronization
- Automatic daily reset at midnight
- Plan-based conversion limits
- Usage display in navigation bar

### For Guest Users:
- Local storage tracking (3 conversions/day)
- Encouragement to sign up for more conversions
- No cross-device synchronization

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Verify Firestore security rules are correctly configured
   - Ensure user is properly authenticated
   - Check browser console for detailed error messages

2. **Usage not updating**
   - Verify internet connection
   - Check Firebase project configuration
   - Ensure Firestore is enabled in Firebase Console

3. **Plan not displaying correctly**
   - Clear browser cache and localStorage
   - Sign out and sign in again
   - Check Firestore data in Firebase Console

### Debug Steps:

1. Open browser Developer Tools → Console
2. Look for Firebase-related error messages
3. Check Network tab for failed Firestore requests
4. Verify user authentication status in console logs

## Manual Plan Upgrades

To manually upgrade a user's plan (for testing or customer service):

1. Go to Firebase Console → Firestore Database → Data
2. Navigate to `users` collection
3. Find the user's document by their UID
4. Edit the `plan` field to "standard" or "premium"
5. Save the changes

The user will see the updated plan and limits on next page reload.

## Security Notes

- Users can only access their own usage data
- All Firestore operations require authentication
- Plan changes must be done through Firebase Console (admin access)
- No sensitive personal data is stored beyond email and display name

## Support

If you encounter issues with Firestore integration:

1. Check the browser console for error messages
2. Verify Firebase project configuration
3. Ensure Firestore security rules are correctly set
4. Test with a fresh user account

The Firestore integration is designed to gracefully fallback to localStorage if Firebase is unavailable, ensuring the application continues to function even with connectivity issues.