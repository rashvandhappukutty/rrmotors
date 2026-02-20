# Vercel Deployment Fixes

## Issues Identified

Based on the screenshots and code review, the following issues were found:

1. **Serverless Function Handler**: The `api/index.js` file wasn't properly wrapping the Express app for Vercel's serverless environment
2. **Cold Start Errors**: "Server is waking up" errors indicate Vercel serverless functions experiencing cold starts
3. **Network Errors**: Admin login and service booking endpoints were failing with network errors
4. **Blank Page**: The frontend is showing a blank page, likely due to build configuration issues

## Fixes Applied

### 1. Updated `api/index.js`
- Added `serverless-http` wrapper for proper Express app handling in Vercel
- Set Vercel environment flags at module level
- Ensures proper async handling and request/response conversion

### 2. Updated `package.json`
- Added `serverless-http` dependency (version ^3.2.0)

### 3. Enhanced `server/index.js`
- Improved health check endpoint (`/api/health`) with more diagnostic information
- Enhanced ping endpoint (`/api/ping`) for lightweight health checks
- Added 404 handler for unmatched API routes

### 4. Updated `vercel.json`
- Added explicit `buildCommand` to ensure Vite build runs correctly
- Configured proper routing for both API and frontend
- Ensured static build outputs to `dist` directory

## Next Steps

### 1. Install Dependencies
Run the following command to install the new `serverless-http` package:

```bash
npm install
```

### 2. Redeploy to Vercel
After installing dependencies, redeploy your application:

```bash
# If using Vercel CLI
vercel --prod

# Or push to your connected Git repository
git add .
git commit -m "Fix Vercel serverless function handler"
git push
```

### 3. Test the Fixes

After redeployment, test the following:

1. **Health Check**: Visit `https://rrmotors.vercel.app/api/health`
   - Should return JSON with server status
   - Useful for warming up the serverless function

2. **Service Booking**: Try booking a service appointment
   - Should no longer show "Server is waking up" error
   - If cold start occurs, wait 30 seconds and retry

3. **Admin Login**: Test admin login at `https://rrmotors.vercel.app/login`
   - Should connect to the server successfully
   - Credentials: `rrmotors` / `rrmotors@1`

## Additional Recommendations

### Reduce Cold Starts
1. **Upgrade Vercel Plan**: Pro plan eliminates cold starts
2. **Use Cron Jobs**: Set up Vercel Cron to ping `/api/health` every 5 minutes to keep functions warm
3. **Optimize Function Size**: Reduce dependencies to speed up cold starts

### Environment Variables
Ensure all required environment variables are set in Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ALLOWED_ORIGINS` (optional, for CORS)

### Monitoring
- Check Vercel deployment logs for any errors
- Monitor function execution times in Vercel dashboard
- Set up error tracking (e.g., Sentry) for production

## Troubleshooting

If issues persist after redeployment:

1. **Check Vercel Logs**: Go to your Vercel dashboard → Deployments → View Function Logs
2. **Verify Environment Variables**: Ensure all env vars are set correctly
3. **Test Health Endpoint**: `curl https://rrmotors.vercel.app/api/health`
4. **Check Build Logs**: Ensure `serverless-http` was installed during build

## Files Changed

- `api/index.js` - Updated serverless function handler
- `package.json` - Added serverless-http dependency
- `server/index.js` - Enhanced error handling and health checks
- `vercel.json` - Added explicit build command and improved configuration

## Troubleshooting Blank Page Issue

If the page is still blank after redeployment:

### 1. Check Build Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Click on the latest deployment
- Check the "Build Logs" tab for any errors

### 2. Verify Build Output
- The build should create a `dist` folder with:
  - `index.html`
  - `assets/` folder with JS and CSS files
- Check if these files exist in the deployment

### 3. Check Browser Console
- Open browser DevTools (F12)
- Check the Console tab for JavaScript errors
- Check the Network tab to see if assets are loading (status 200)

### 4. Common Issues and Solutions

**Issue: Build fails**
- Solution: Check that all dependencies are in `package.json`
- Run `npm install` locally to verify
- Check for TypeScript errors: `npm run build` locally

**Issue: Assets return 404**
- Solution: Verify `distDir` in `vercel.json` matches Vite output
- Check `vite.config.ts` for base path issues

**Issue: JavaScript errors in console**
- Solution: Check browser console for specific errors
- Verify all environment variables are set in Vercel
- Check if `serverless-http` is installed

### 5. Manual Build Test
Test the build locally before deploying:
```bash
npm install
npm run build
npm run preview
```
Visit `http://localhost:4173` to verify the build works locally.
