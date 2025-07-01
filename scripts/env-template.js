/**
 * Template for environment variables
 * 
 * Create a file named `.env.local` with the following content
 * Replace the values with your own Supabase project details and VAPID keys
 */

module.exports = {
  template: `# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SECRET_KEY=your-secret-key-here

# VAPID keys for web push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=your-email@example.com`
}

// If this file is executed directly, print the template
if (require.main === module) {
  console.log(module.exports.template);
} 