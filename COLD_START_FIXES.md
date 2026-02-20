# Cold Start Fixes for Vercel Serverless Functions

## Problem
Vercel serverless functions on the free tier can experience "cold starts" - when a function hasn't been used in a while, it takes 10-30 seconds to wake up and respond. This was causing "Server is waking up" errors when users tried to book services.

## Solutions Implemented

### 1. Enhanced Retry Logic (`src/lib/api.ts`)
- **Increased retries**: From 3 to 5 attempts
- **Longer timeout**: From 45s to 60s per request
- **Longer delays**: Initial retry delay increased from 1s to 2s
- **Exponential backoff**: Retries wait progressively longer (2s, 4s, 8s, 16s)
- **Gateway error handling**: Automatically retries on 502/503/504 errors (common cold start indicators)
- **Better error messages**: More helpful messages that indicate cold start vs other errors

### 2. Improved Server Warmup (`src/App.tsx`)
- **Proactive warmup**: Calls `/api/ping` on page load to wake up the server
- **Non-blocking**: Warmup doesn't block page rendering
- **Timeout protection**: 10s timeout prevents hanging

### 3. Better Error Handling (`src/components/BookingModal.tsx`)
- **Cold start detection**: Identifies cold start errors vs other errors
- **User-friendly messages**: Clear messaging about server wake-up
- **Longer toast duration**: Error messages show for 5 seconds

## How It Works

1. **On Page Load**: 
   - App automatically calls `/api/ping` to warm up the server
   - This reduces cold start delays for subsequent requests

2. **On API Request**:
   - First attempt with 60s timeout
   - If it fails (timeout or network error), waits 2s and retries
   - Each retry waits longer (exponential backoff)
   - Up to 5 attempts total (can take up to ~90 seconds total)
   - Gateway errors (502/503/504) trigger automatic retries

3. **User Experience**:
   - User sees "Submitting..." while retries happen automatically
   - If all retries fail, clear error message explains the situation
   - User can try again after 30 seconds

## Testing

After deployment, test the following scenarios:

1. **Cold Start Test**:
   - Wait 15+ minutes without using the site
   - Try to book a service
   - Should automatically retry and succeed (may take 30-60 seconds)

2. **Warm Server Test**:
   - Use the site immediately after visiting
   - Bookings should work instantly

3. **Error Handling**:
   - Check browser console for retry logs
   - Verify error messages are user-friendly

## Additional Recommendations

### To Eliminate Cold Starts Completely:

1. **Upgrade to Vercel Pro** ($20/month):
   - Pro plan keeps functions warm
   - No cold starts
   - Better performance

2. **Use Vercel Cron Jobs** (Pro feature):
   - Set up a cron job to ping `/api/health` every 5 minutes
   - Keeps functions warm automatically

3. **Optimize Function Size**:
   - Reduce dependencies
   - Use tree-shaking
   - Smaller functions = faster cold starts

### Current Behavior (Free Tier):

- **First request after inactivity**: 10-30 second delay
- **Subsequent requests**: Instant (function stays warm for ~10 minutes)
- **Automatic retries**: Handle most cold start scenarios
- **User experience**: May need to wait, but retries happen automatically

## Files Modified

- `src/lib/api.ts` - Enhanced retry logic and error handling
- `src/App.tsx` - Improved server warmup
- `src/components/BookingModal.tsx` - Better error messages

## Next Steps

1. Deploy the changes
2. Test cold start scenarios
3. Monitor Vercel function logs for performance
4. Consider upgrading to Pro if cold starts are problematic
