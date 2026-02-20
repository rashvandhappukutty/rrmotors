# Deployment Checklist - Cold Start Fixes

## ✅ Changes Made

1. **Enhanced Retry Logic** (`src/lib/api.ts`)
   - 5 retries (up from 3)
   - 60s timeout (up from 45s)
   - Exponential backoff (2s, 4s, 8s, 16s delays)
   - Handles 502/503/504/524 errors
   - Pre-flight ping to warm up server

2. **Better Error Messages** (`src/components/BookingModal.tsx`)
   - Detects cold start errors
   - More helpful user messages
   - Longer toast duration (8 seconds)

3. **Server Warmup** (`src/App.tsx`)
   - Calls `/api/ping` on page load
   - Non-blocking warmup

4. **Vercel Configuration** (`vercel.json`)
   - Proper static file serving
   - API routing configured

## ⚠️ CRITICAL: Deploy These Changes

The fixes won't work until you deploy! Follow these steps:

### Step 1: Install Dependencies
```bash
npm install
```
This installs `serverless-http` which is required for the API to work.

### Step 2: Test Locally (Optional but Recommended)
```bash
npm run build
npm run preview
```
Visit `http://localhost:4173` and test the booking form.

### Step 3: Commit and Push
```bash
git add .
git commit -m "Fix cold start issues with enhanced retry logic and server warmup"
git push
```

### Step 4: Verify Deployment
1. Go to Vercel Dashboard
2. Check the latest deployment
3. Verify build succeeded
4. Check function logs for any errors

### Step 5: Test After Deployment
1. Wait 15+ minutes (to ensure cold start)
2. Try booking a service
3. Check browser console (F12) for retry logs
4. Should see automatic retries happening

## 🔍 Troubleshooting

### If Still Getting "Server is waking up" Error:

1. **Check Browser Console** (F12 → Console)
   - Look for retry messages: `⏱️ [Attempt X/5]`
   - Should see multiple retry attempts
   - If you see "All 5 attempts failed", the server took too long

2. **Check Vercel Function Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on `/api/index.js`
   - Check "Logs" tab
   - Look for errors or timeouts

3. **Verify serverless-http is Installed**
   - Check `package.json` has `"serverless-http": "^3.2.0"`
   - Check `node_modules/serverless-http` exists after `npm install`

4. **Check API Endpoint**
   - Visit `https://rrmotors.vercel.app/api/ping`
   - Should return `{"message":"pong","timestamp":"..."}`
   - If it times out, the function isn't working

5. **Verify Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure all required vars are set:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `CLOUDINARY_CLOUD_NAME` (if using)
     - `CLOUDINARY_API_KEY` (if using)
     - `CLOUDINARY_API_SECRET` (if using)

## 📊 Expected Behavior After Fix

### Cold Start Scenario (First Request After 15+ Minutes):
1. User clicks "Submit Booking"
2. Button shows "Submitting..."
3. System automatically:
   - Tries request #1 (may timeout)
   - Waits 2 seconds
   - Tries request #2 (may timeout)
   - Waits 4 seconds
   - Tries request #3 (may succeed or timeout)
   - Continues up to 5 attempts
4. If successful: Shows success message
5. If all fail: Shows "Server is waking up" error

### Warm Server Scenario (Recent Activity):
1. User clicks "Submit Booking"
2. Request succeeds immediately (< 1 second)
3. Shows success message

## 🚀 To Eliminate Cold Starts Completely

Consider upgrading to **Vercel Pro** ($20/month):
- Functions stay warm
- No cold starts
- Better performance
- Can set up cron jobs to keep functions warm

## 📝 Files Changed

- ✅ `src/lib/api.ts` - Enhanced retry logic
- ✅ `src/App.tsx` - Server warmup
- ✅ `src/components/BookingModal.tsx` - Better error handling
- ✅ `api/index.js` - Serverless function handler
- ✅ `vercel.json` - Static file routing
- ✅ `package.json` - Added serverless-http

## ⏱️ Timeline

After deployment:
- **First request**: May take 30-90 seconds (cold start + retries)
- **Subsequent requests**: < 1 second (function is warm)
- **After 10 minutes inactivity**: Function may sleep again
