import app from '../server/index.js';

console.log('🚀 Vercel Serverless Function Initializing...');

// Set Vercel environment flags at module level (only once)
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

// Export the Express app directly for Vercel's @vercel/node runtime
export default (req, res) => {
    // Vercel sometimes pre-parses the body. Let's log it for debugging.
    const bodyState = req.body ? `Parsed (${typeof req.body})` : 'Raw';
    console.log(`⏱️ [Vercel Request] ${req.method} ${req.url} | Body: ${bodyState}`);

    return app(req, res);
};
