import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './server';

// Export for testing
export default app;
