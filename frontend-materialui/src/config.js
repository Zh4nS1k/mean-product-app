const isProduction = process.env.NODE_ENV === 'production';

const API_BASE_URL = isProduction
  ? 'https://your-production-domain.com'
  : 'http://localhost:5000';

export default API_BASE_URL;
