# Clerk Webhook Setup for Supabase Integration

Since this is a vanilla JavaScript application without a backend server, you'll need to set up a webhook endpoint to sync Clerk users with Supabase. Here are your options:

## Option 1: Use Vercel Functions (Recommended)

1. Deploy this project to Vercel
2. Create a file `api/clerk-webhook.js` with the webhook handler
3. Configure the webhook URL in Clerk Dashboard

## Option 2: Use Netlify Functions

1. Deploy to Netlify
2. Create a file `netlify/functions/clerk-webhook.js`
3. Configure the webhook URL in Clerk Dashboard

## Option 3: Use a Separate Backend Service

1. Create a simple Express.js server or use a serverless function
2. Deploy it separately (Heroku, Railway, etc.)
3. Use the webhook handler code below

## Webhook Handler Code

Here's the webhook handler code you'll need (Node.js):

```javascript
// api/clerk-webhook.js (for Vercel)
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin access
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the webhook signature
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Get the headers
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Create a new Webhook instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(JSON.stringify(req.body), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Error verifying webhook' });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;
    
    const profileData = {
      id,
      email: email_addresses[0]?.email_address || '',
      first_name: first_name || '',
      last_name: last_name || '',
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      username: username || null,
      avatar_url: image_url || '',
      last_login_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) {
        console.error('Error upserting profile:', error);
        return res.status(500).json({ error: 'Error updating profile' });
      }

      // Log activity for new user
      if (eventType === 'user.created') {
        await supabase
          .from('user_activities')
          .insert({
            user_id: id,
            activity_type: 'account_created',
            points_earned: 100, // Welcome bonus
            metadata: { source: 'clerk_webhook' }
          });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  }
  
  if (eventType === 'session.created') {
    const { user_id } = evt.data;
    
    // Update last login
    try {
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user_id);
        
      // Log login activity
      await supabase
        .from('user_activities')
        .insert({
          user_id,
          activity_type: 'login',
          points_earned: 10,
          metadata: { source: 'clerk_webhook' }
        });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating last login:', error);
      return res.status(500).json({ error: 'Error updating last login' });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      // The profile will be deleted automatically due to CASCADE
      // but we can log this event if needed
      console.log(`User ${id} deleted`);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error handling user deletion:', error);
      return res.status(500).json({ error: 'Error handling deletion' });
    }
  }

  // Return a 200 for unhandled event types
  return res.status(200).json({ received: true });
}
```

## Environment Variables Needed

Add these to your deployment platform:

```
CLERK_SECRET_KEY=sk_test_PLzd6IIgCvrNVQoON3Ta7UFfFt9dlGWqUzT0mK5PKL
CLERK_WEBHOOK_SECRET=your_webhook_secret_from_clerk
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important**: The CLERK_SECRET_KEY should ONLY be used in your backend/webhook handler, never in client-side code!

## Setting Up in Clerk Dashboard

1. Go to your Clerk Dashboard
2. Navigate to Webhooks
3. Click "Add Webhook"
4. Set the URL to your webhook endpoint (e.g., `https://your-app.vercel.app/api/clerk-webhook`)
5. Select these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
6. Copy the signing secret and add it as `CLERK_WEBHOOK_SECRET` in your environment

## Testing

1. Create a test user in Clerk
2. Check your Supabase `profiles` table to see if the user was created
3. Sign in with the user and check if `last_login_at` is updated
4. Check the `user_activities` table for login and creation events

## Alternative: Client-Side Sync

If you can't set up a webhook, the `clerk-config.js` file includes a `syncUserWithSupabase` function that attempts to sync on the client side. However, this approach has limitations:

- Requires RLS policies that allow users to create their own profiles
- Less secure than server-side sync
- May have race conditions
- Won't capture all events (like deletion)

The webhook approach is strongly recommended for production use.