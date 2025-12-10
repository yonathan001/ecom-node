# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth for your eCommerce application.

## Overview

Your application now supports social login with:
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Email/Password (already working)

## Prerequisites

- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### Step 2: Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: ecom
   - User support email: your email
   - Developer contact: your email
4. Application type: **Web application**
5. Name: ecom OAuth
6. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
7. Authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/callback/google
   ```
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### Step 3: Add to Environment Variables

Add to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

## 2. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - Application name: `ecom`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:5000/api/auth/callback/github`
4. Click **Register application**

### Step 2: Generate Client Secret

1. After creating the app, click **Generate a new client secret**
2. Copy the **Client ID** and **Client Secret**

### Step 3: Add to Environment Variables

Add to `backend/.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

---

## 3. Restart Backend Server

After adding the OAuth credentials to `.env`:

```bash
cd backend
# Stop the current server (Ctrl+C)
# Restart it
npm start
```

---

## 4. Testing Social Login

1. Go to `http://localhost:3000/login` or `http://localhost:3000/register`
2. Click **Continue with Google** or **Continue with GitHub**
3. Authorize the application
4. You should be redirected back and logged in automatically

---

## Production Setup

When deploying to production, update:

### Backend `.env`:
```env
# Update these URLs to your production domains
```

### OAuth Provider Settings:
- **Google**: Add production URLs to authorized origins and redirect URIs
- **GitHub**: Add production callback URL

### Authorized URLs:
- JavaScript origins: `https://yourdomain.com`
- Redirect URIs: `https://api.yourdomain.com/api/auth/callback/google`
- GitHub callback: `https://api.yourdomain.com/api/auth/callback/github`

---

## Troubleshooting

### "OAuth provider not configured" error
- Make sure you've added the client ID and secret to `.env`
- Restart the backend server after adding credentials

### "Redirect URI mismatch" error
- Verify the callback URL in your OAuth provider settings matches exactly
- Google: `http://localhost:5000/api/auth/callback/google`
- GitHub: `http://localhost:5000/api/auth/callback/github`

### Social login buttons not working
- Check browser console for errors
- Verify backend server is running on port 5000
- Check that Better Auth is properly configured

---

## Optional: Add More Providers

Better Auth supports many providers. To add more:

1. Update `backend/lib/auth.js` socialProviders section
2. Add credentials to `.env`
3. Restart backend server

Supported providers:
- Discord
- Facebook
- Twitter/X
- Microsoft
- Apple
- And many more!

Check [Better Auth documentation](https://www.better-auth.com/docs/authentication/social) for details.
