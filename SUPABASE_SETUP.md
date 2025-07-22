# Supabase Integration Setup Guide

This guide will help you set up Supabase integration for your Spaecs project.

## Prerequisites

- A Supabase account (free at https://supabase.com)
- Your Supabase project URL and anon key (already configured)

## Step 1: Set Up Database Tables

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Click "Run" to execute the SQL commands

This will create:
- `waitlist` table for storing email addresses
- `user_preferences` table for storing user preferences
- Appropriate indexes and security policies

## Step 2: Verify Configuration

The following files have been created/updated:

- `supabase-config.js` - Contains your Supabase credentials and helper functions
- `index.html` - Updated to include Supabase client library
- `script.js` - Updated to use Supabase for waitlist and preferences

## Step 3: Test the Integration

1. Open your website in a browser
2. Try submitting an email through the waitlist form
3. Check your Supabase dashboard > Table Editor > waitlist to see if the email was added
4. Check the browser console for any errors

## Features Implemented

### Waitlist Management
- Email addresses are stored in Supabase `waitlist` table
- Duplicate emails are prevented (unique constraint)
- Automatic timestamps for created_at and updated_at

### User Preferences
- User preferences are stored in Supabase `user_preferences` table
- Fallback to localStorage if Supabase is unavailable
- Automatic synchronization between local and remote storage

### Helper Functions
- `addToWaitlist(email)` - Add email to waitlist
- `getWaitlistCount()` - Get total number of waitlist entries
- `saveUserPreference(userId, key, value)` - Save user preference
- `getUserPreferences(userId)` - Get all user preferences

## Security Features

- Row Level Security (RLS) enabled on all tables
- Public policies for waitlist operations
- User-specific policies for preferences
- Automatic timestamp updates

## Troubleshooting

### Common Issues

1. **"supabase is not defined" error**
   - Make sure the Supabase client library is loaded before your config file
   - Check that the CDN link is accessible

2. **"Permission denied" error**
   - Verify that RLS policies are correctly set up
   - Check that your anon key is correct

3. **Emails not being saved**
   - Check the browser console for errors
   - Verify the table structure matches the schema
   - Ensure the email field is not null

### Debug Mode

To enable debug logging, add this to your browser console:
```javascript
localStorage.setItem('supabase_debug', 'true');
```

## Next Steps

1. **Analytics**: Use the waitlist data to track signup trends
2. **Email Integration**: Connect to an email service (Mailchimp, SendGrid, etc.)
3. **User Authentication**: Add Supabase Auth for user accounts
4. **Real-time Features**: Use Supabase real-time subscriptions for live updates

## Environment Variables

For production, consider moving the Supabase credentials to environment variables:

```javascript
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

## Support

If you encounter any issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the browser console for error messages
3. Verify your database schema matches the provided SQL 