import serverless from 'serverless-http';
import app from '../server/index.js';

// Set Vercel environment flags at module level (only once)
if (!process.env.VERCEL) {
    process.env.VERCEL = '1';
}
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// Wrap Express app with serverless-http for Vercel compatibility
// This ensures proper async handling and request/response conversion
export default serverless(app);
