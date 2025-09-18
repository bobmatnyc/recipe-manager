# Google OAuth Setup Guide for Recipe Manager

This guide helps you set up Google OAuth authentication for your Recipe Manager app using Clerk.

## Prerequisites

- Google Cloud account (free tier is sufficient)
- Access to Clerk Dashboard
- Recipe Manager app deployed at https://recipes.help

## Required Redirect URIs

These must be added to your Google OAuth client:

- **Development**: `https://powerful-salmon-99.clerk.accounts.dev/v1/oauth_callback`
- **Production**: `https://recipes.help/.clerk/oauth_callback`

## Step 1: Create Google OAuth Credentials

### Option A: Using Google Cloud Console (Web UI)

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Create or Select a Project**
   - If you don't have a project, create one (e.g., "recipe-manager")
   - Select your project from the dropdown

3. **Configure OAuth Consent Screen** (first time only)
   - Navigate to "OAuth consent screen" in the left sidebar
   - Choose "External" for user type
   - Fill in the required fields:
     - App name: `Recipe Manager`
     - User support email: Your email
     - Authorized domains: `recipes.help`
     - Developer contact: Your email
   - Save and continue through the scopes section (no special scopes needed)

4. **Create OAuth 2.0 Client ID**
   - Go back to "Credentials"
   - Click "CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: `Web application`
   - Name: `Recipe Manager Web Client`
   - Add Authorized redirect URIs:
     ```
     https://powerful-salmon-99.clerk.accounts.dev/v1/oauth_callback
     https://recipes.help/.clerk/oauth_callback
     ```
   - Click "CREATE"

5. **Save Your Credentials**
   - A popup will show your Client ID and Client Secret
   - Copy these values immediately
   - Optionally, download the JSON file for backup

### Option B: Using gcloud CLI

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project (replace PROJECT_ID)
gcloud config set project YOUR_PROJECT_ID

# Note: OAuth 2.0 clients cannot be created via gcloud CLI
# You must use the Console UI or API directly
```

## Step 2: Extract Credentials from Downloaded JSON

If you downloaded the credentials as JSON:

### Using the provided script:

```bash
# Run the Python helper script
python3 scripts/setup-google-oauth.py

# Or use the bash helper
./scripts/extract-oauth-creds.sh path/to/downloaded-credentials.json
```

### Manual extraction:

```bash
# If you have jq installed
cat ~/Downloads/client_secret_*.json | jq '.web | {client_id, client_secret}'

# Or with Python
python3 -c "import json; d=json.load(open('path/to/credentials.json')); print('Client ID:', d['web']['client_id']); print('Client Secret:', d['web']['client_secret'])"
```

## Step 3: Add Credentials to Clerk

1. **Go to Clerk Dashboard**
   ```
   https://dashboard.clerk.com
   ```

2. **Navigate to SSO Connections**
   - Configure → SSO Connections → Google

3. **Add Your Credentials**
   - Enable Google authentication
   - Add your Client ID
   - Add your Client Secret
   - Save the configuration

## Step 4: Configure Your Application

Add these environment variables to your `.env.local` file:

```env
# Google OAuth (optional - Clerk handles this internally)
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

Note: These are primarily for reference as Clerk manages the OAuth flow internally.

## Step 5: Test the Integration

1. Visit your app: https://recipes.help
2. Click on "Sign in with Google"
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you'll be redirected back to your app

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the exact redirect URIs are added in Google Cloud Console
- Check for trailing slashes or protocol differences (http vs https)

### "This app hasn't been verified" warning
- This is normal for development
- For production, you'll need to verify your app with Google

### Cannot retrieve existing OAuth credentials
- Google doesn't allow retrieving client secrets after creation
- You must regenerate the secret or create a new OAuth client

## Helper Scripts

We've created two helper scripts:

1. **setup-google-oauth.sh** - Bash script for guided setup
2. **setup-google-oauth.py** - Python script with automatic credential extraction

Both scripts are located in the `/scripts` directory.

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables or secure secret management
- Rotate credentials periodically
- Restrict OAuth client to specific domains in production

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Clerk Google OAuth Documentation](https://clerk.com/docs/authentication/social-connections/google)
- [Google Cloud Console](https://console.cloud.google.com)