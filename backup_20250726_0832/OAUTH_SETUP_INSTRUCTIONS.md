# Firebase OAuth Configuration Setup

To properly configure Google Sign-in with ConvertWiz branding, follow these steps:

## 1. Firebase Console Updates

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: "convertwiz"
3. **Navigate to**: Authentication → Sign-in method → Google
4. **Click "Edit" on Google provider**
5. **Update Provider name**: Change from "ConvertWiz" to "ConvertWiz"
6. **Save changes**

## 2. Google Cloud Console OAuth Configuration

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select project**: "convertwiz"
3. **Navigate to**: APIs & Services → OAuth consent screen
4. **Update the following fields**:
   - **Application name**: Change to "ConvertWiz"
   - **Authorized domains**: Add these domains:
     - `convertwiz.in`
     - `www.convertwiz.in`
     - `replit.app` (for development)
5. **Save changes**

## 3. Update OAuth Redirect URIs (if needed)

1. **Go to**: APIs & Services → Credentials
2. **Select your OAuth 2.0 Client ID**
3. **In "Authorized redirect URIs", ensure you have**:
   - `https://convertwiz.firebaseapp.com/__/auth/handler`
   - `https://convertwiz.in/__/auth/handler` (when live)
   - Your Replit domain for testing

## 4. Replit Environment Variables

Ensure these environment variables are set in your Replit Secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_APP_ID` 
- `VITE_FIREBASE_PROJECT_ID`

## 5. Testing the Changes

After making these changes:
1. Clear browser cache and cookies
2. Test Google Sign-in on your site
3. Verify the OAuth consent screen shows "ConvertWiz" branding
4. Check that authorized domains work correctly

## 6. Custom Domain Setup (Future)

When you have a custom domain:
1. Add it to Firebase Hosting custom domains
2. Update OAuth authorized domains
3. Update redirect URIs to include your custom domain

## Notes

- Changes may take up to 24 hours to propagate fully
- Test with an incognito/private browser window
- If issues persist, try re-creating the OAuth client ID