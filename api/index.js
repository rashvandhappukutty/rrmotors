import app from '../server/index.js';

console.log('🚀 Vercel Serverless Function Initializing...');

// Set Vercel environment flags at module level (only once)
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

// Export the Express app directly for Vercel's @vercel/node runtime
export default (req, res) => {
    console.log(`⏱️ [Vercel Request] ${req.method} ${req.url}`);
    return app(req, res);
};
