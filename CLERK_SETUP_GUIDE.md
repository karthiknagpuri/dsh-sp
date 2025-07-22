# Clerk Authentication Setup Guide for Spaecs

This guide will help you set up Clerk authentication with Supabase integration for the Spaecs project.

## Prerequisites

1. A Clerk account (sign up at https://clerk.com)
2. Your existing Supabase project
3. A deployment platform (Vercel, Netlify, or similar) for the webhook

## Step 1: Create a Clerk Application

1. Sign in to your Clerk Dashboard
2. Click "Create Application"
3. Name it "Spaecs" 
4. Choose your authentication methods (Email, Google, etc.)
5. Click "Create Application"

## Step 2: Get Your Clerk Keys

1. In Clerk Dashboard, go to "API Keys"
2. Copy your **Publishable Key** (starts with `pk_`)
3. Copy your **Secret Key** (starts with `sk_`) - keep this secure!

## Step 3: Update Configuration Files

1. Update `clerk-config.js`:
   ```javascript
   publishableKey: 'pk_test_your_actual_key_here' // Replace with your key
   ```

2. Update `sign-in.html` and `sign-up.html`:
   ```javascript
   publishableKey: 'pk_test_your_actual_key_here' // Replace with your key
   ```

3. Update `dashboard.html`:
   ```javascript
   publishableKey: 'pk_test_your_actual_key_here' // Replace with your key
   ```

## Step 4: Set Up Supabase Schema

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the entire contents of `clerk-supabase-schema.sql`
4. This creates:
   - `profiles` table for user data
   - `user_activities` table for gamification
   - RLS policies for security
   - Helper functions and triggers

## Step 5: Configure Clerk Appearance (Optional)

1. In Clerk Dashboard, go to "Customization"
2. Set your brand colors:
   - Primary: `#1a4d3a`
   - Background: `#f8faf9`
3. Upload your logo
4. Customize email templates

## Step 6: Set Up Webhook (Important!)

Follow the instructions in `CLERK_WEBHOOK_SETUP.md` to:
1. Deploy a webhook endpoint
2. Configure it in Clerk Dashboard
3. Add environment variables

## Step 7: Update Navigation Links

The integration automatically:
- Shows "Sign In" button for logged-out users
- Shows user menu with avatar for logged-in users
- Redirects to dashboard after sign-in

## Step 8: Test the Integration

1. Open `index.html` in a browser
2. Click "Sign In"
3. Create a new account
4. Verify you're redirected to the dashboard
5. Check Supabase to confirm profile was created

## Features Implemented

### Authentication Flow
- Sign up with email/password or social providers
- Sign in with existing account  
- Persistent sessions
- Secure sign out

### User Profile Sync
- Automatic profile creation in Supabase
- Updates on user info changes
- Tracks last login time
- Gamification points for activities

### Protected Routes
- Dashboard requires authentication
- Automatic redirects for unauthenticated users
- Client-side route protection

### UI Components
- User menu in navigation
- Loading states
- Authenticated vs unauthenticated views
- Responsive design

## Customization Options

### Adding More Protected Pages

Create new HTML files with this authentication check:

```javascript
// Check if user is authenticated
if (window.Clerk.user) {
    // Show protected content
} else {
    // Redirect to sign-in
    window.location.href = '/sign-in.html';
}
```

### Customizing User Data

Add fields to the `profiles` table and update the webhook handler to sync additional data.

### Adding Social Logins

1. In Clerk Dashboard, go to "User & Authentication"
2. Enable social providers (Google, GitHub, etc.)
3. Configure OAuth apps
4. They'll automatically appear in sign-in/up forms

## Troubleshooting

### Users not syncing to Supabase
- Check webhook is configured correctly
- Verify environment variables
- Check webhook logs in Clerk Dashboard

### Sign-in redirect not working
- Ensure `redirectUrl` in Clerk config matches your dashboard URL
- Check browser console for errors

### Styles not loading
- Verify `clerk-styles.css` is included
- Check CSS variable definitions

## Security Notes

1. Never expose your Secret Key or Service Role Key
2. Always use HTTPS in production
3. Keep webhook endpoint secure
4. Regularly rotate keys
5. Monitor webhook failures

## Next Steps

1. Deploy to production
2. Set up custom domain
3. Configure production environment variables
4. Enable additional Clerk features (MFA, etc.)
5. Implement gamification features using the user activities table

## Support

- Clerk Documentation: https://clerk.com/docs
- Supabase Documentation: https://supabase.com/docs
- Spaecs Support: support@spaecs.com

Remember to replace all placeholder keys with your actual Clerk keys before deploying!