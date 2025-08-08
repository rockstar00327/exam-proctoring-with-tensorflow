// Configuration for the speed test module
export default {
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many speed test requests from this IP, please try again later.'
  }
};
