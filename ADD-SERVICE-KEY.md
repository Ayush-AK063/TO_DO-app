# 🔑 Add Service Role Key for Admin Delete

To enable full user deletion (including from authentication), you need to add your Supabase **Service Role Key** to your environment variables.

## ⚠️ IMPORTANT SECURITY WARNING

The Service Role Key bypasses all Row Level Security policies and has full access to your database. **NEVER expose it in client-side code or commit it to version control!**

It should ONLY be used in:
- Server-side API routes (like we're doing here)
- Server components
- Backend services

## Steps to Add Service Role Key

### 1. Get Your Service Role Key from Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **Settings** (gear icon in the left sidebar)
4. Click on **API**
5. Scroll down to **Project API keys**
6. Find the **`service_role`** key (NOT the anon key)
7. Click the eye icon to reveal it
8. Copy the entire key

### 2. Add to Your .env.local File

1. Open your `.env.local` file in the project root
2. Add this new line (replace with your actual key):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

Your complete `.env.local` should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Restart Your Dev Server

After adding the key, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ What This Enables

With the service role key configured:

- ✅ Admin can **permanently delete users** from Supabase Auth
- ✅ Deleted users **cannot log in again**
- ✅ Deleted users **cannot sign up with the same email again** (unless you manually allow it)
- ✅ All user data (profile, todos) is automatically deleted via cascade

## 🧪 How to Test

1. As an admin, go to the Admin Panel
2. Try to delete a test user
3. The user should be removed from:
   - Authentication > Users (in Supabase Dashboard)
   - Table Editor > profiles
   - Table Editor > todos (their todos)
4. Try to log in with that user's credentials → Should fail
5. Try to sign up with that email → Should work (creates new user)

## 🔒 Deployment Note

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Settings** > **Environment Variables**
3. Add the `SUPABASE_SERVICE_ROLE_KEY` variable
4. Make sure to add it for all environments (Production, Preview, Development)
5. Redeploy your app

## 🐛 Troubleshooting

**Error: "Invalid API key"**
- Double-check you copied the service_role key, not the anon key
- Make sure there are no extra spaces or quotes in your .env.local

**Error: "Environment variable not found"**
- Restart your dev server after adding the key
- Make sure the variable name is exactly: `SUPABASE_SERVICE_ROLE_KEY`

**User still exists after deletion**
- Check browser console for errors
- Check Supabase Dashboard > Authentication > Logs for errors
- Make sure the service role key is correctly configured

---

**Done!** Your admin panel can now fully delete users from the authentication system. 🎉
