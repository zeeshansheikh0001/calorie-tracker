# Auth and Supabase Implementation - Commented Out

This document explains what authentication and Supabase functionality has been temporarily commented out in the Calorie Tracker application.

## Overview

The authentication system and Supabase integration have been commented out because they are not fully implemented. This allows the application to run in development mode without requiring a complete Supabase setup.

## What Has Been Commented Out

### 1. Supabase Provider Component
**File:** `src/components/supabase-provider.tsx`
- **Status:** Commented out with mock implementation
- **Reason:** Requires full Supabase auth setup
- **Impact:** No authentication context available

### 2. User Profile Hook
**File:** `src/hooks/use-user-profile.ts`
- **Status:** Commented out with mock implementation
- **Reason:** Depends on Supabase user authentication
- **Impact:** Uses mock user data instead of real user profiles

### 3. Supabase Client
**File:** `src/lib/supabase/client.ts`
- **Status:** Commented out with mock implementation
- **Reason:** Requires Supabase environment variables
- **Impact:** Returns null client

### 4. Supabase Route Handler
**File:** `src/utils/supabase/route-handler.ts`
- **Status:** Commented out with mock implementation
- **Reason:** Requires Supabase server-side setup
- **Impact:** Returns null server client

### 5. Supabase Edge Function
**File:** `supabase/functions/send-reminders/index.ts`
- **Status:** Commented out with placeholder
- **Reason:** Requires deployed Supabase project
- **Impact:** Returns 503 Service Unavailable

### 6. Notification API Routes
**Files:** 
- `src/app/api/notifications/subscribe/route.ts`
- `src/app/api/notifications/send/route.ts`
- **Status:** Commented out with placeholder responses
- **Reason:** Require authenticated users and Supabase database
- **Impact:** Return 503 Service Unavailable

### 7. Layout Integration
**File:** `src/app/layout.tsx`
- **Status:** SupabaseProvider wrapper commented out
- **Reason:** No authentication context needed
- **Impact:** App runs without auth wrapper

## Current Mock Behavior

### User Profile
- **Default User:** "Guest User" with placeholder email
- **Avatar:** Placeholder image
- **Diet Charts:** Empty array (no persistence)
- **Loading State:** Always false

### Authentication
- **No Login Required:** App runs in guest mode
- **No User Sessions:** All users are anonymous
- **No Data Persistence:** Data stored locally only

### Notifications
- **API Disabled:** All notification endpoints return 503
- **Service Worker:** Still functional for basic notifications
- **Push Subscriptions:** Not available

## How to Re-enable

### 1. Set Up Supabase Project
```bash
# Create new Supabase project
# Set environment variables
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-secret-key
```

### 2. Uncomment Components
Remove the `/* */` comment blocks from:
- `src/components/supabase-provider.tsx`
- `src/hooks/use-user-profile.ts`
- `src/lib/supabase/client.ts`
- `src/utils/supabase/route-handler.ts`

### 3. Uncomment Layout
In `src/app/layout.tsx`, uncomment:
```tsx
<SupabaseProvider>
  <AppLayout>{children}</AppLayout>
</SupabaseProvider>
```

### 4. Uncomment API Routes
Remove comment blocks from:
- `src/app/api/notifications/subscribe/route.ts`
- `src/app/api/notifications/send/route.ts`

### 5. Deploy Edge Function
```bash
# Deploy to Supabase
supabase functions deploy send-reminders
```

## Development Notes

### Current Limitations
- **No User Authentication:** All users are anonymous
- **No Data Persistence:** Data lost on page refresh
- **No Real-time Features:** No database subscriptions
- **No Push Notifications:** Notification APIs disabled

### Workarounds
- **Local Storage:** Used for temporary data persistence
- **Mock Data:** Placeholder user profiles and data
- **Basic Notifications:** Browser notifications still work
- **Offline Functionality:** Core app features work without backend

### Testing
- **Profile Page:** Shows mock user data
- **Diet Charts:** Can be created but not saved permanently
- **Feedback System:** Works with local storage
- **Settings:** Basic navigation works

## Future Implementation

When ready to implement full authentication:

1. **Complete Supabase Setup**
2. **Implement User Registration/Login**
3. **Add Protected Routes**
4. **Enable Data Persistence**
5. **Implement Real-time Features**
6. **Enable Push Notifications**

## Files Modified

- ✅ `src/components/supabase-provider.tsx`
- ✅ `src/hooks/use-user-profile.ts`
- ✅ `src/lib/supabase/client.ts`
- ✅ `src/utils/supabase/route-handler.ts`
- ✅ `supabase/functions/send-reminders/index.ts`
- ✅ `src/app/api/notifications/subscribe/route.ts`
- ✅ `src/app/api/notifications/send/route.ts`
- ✅ `src/app/layout.tsx`

All authentication and Supabase functionality has been successfully commented out with appropriate mock implementations for development purposes.

## Troubleshooting

### If you're still getting Supabase auth errors:

1. **Clear Browser Cache**: 
   - Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache and localStorage

2. **Restart Development Server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   # or
   yarn dev
   ```

3. **Clear Next.js Cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

4. **Check for Remaining Supabase References**:
   ```bash
   # Search for any uncommented supabase usage
   grep -r "supabase\." src/ --include="*.tsx" --include="*.ts" | grep -v "//"
   ```

### Common Error Resolution

If you see `TypeError: Cannot read properties of null (reading 'auth')`:
- This indicates cached JavaScript is still trying to access Supabase
- Follow the cache clearing steps above
- Verify all Supabase code is properly commented out

### TypeScript Errors Fixed

The following TypeScript errors have been resolved:
- ✅ **`Cannot find name 'handleLogout'`** - All logout button references commented out
- ✅ **Conditional rendering** - `{user ? (` conditional removed
- ✅ **Unused variables** - `user`, `setUser`, `router` variables commented out

The app should now run in development mode without requiring any Supabase setup and without TypeScript errors.
