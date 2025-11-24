/**
 * API Configuration
 * 
 * Controls whether to use dummy data (localhost) or real AWS data (production)
 * 
 * To switch modes:
 * 1. For localhost/dummy data: Set REACT_APP_USE_DUMMY_DATA=true in .env
 * 2. For production/AWS: Set REACT_APP_USE_DUMMY_DATA=false or unset it
 * 
 * Default behavior:
 * - localhost (development): Uses dummy data if REACT_APP_USE_DUMMY_DATA is not set
 * - production: Uses AWS endpoint
 */

// Check if we should use dummy data
// Priority: 1. Environment variable, 2. Check if localhost, 3. Default to false in production
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname === '');

const useDummyDataEnv = process.env.REACT_APP_USE_DUMMY_DATA;
const shouldUseDummyData = useDummyDataEnv === 'true' || 
  (useDummyDataEnv === undefined && isLocalhost && process.env.NODE_ENV === 'development');

export const USE_DUMMY_DATA = shouldUseDummyData;
export const IS_LOCALHOST = isLocalhost;
export const API_MODE = shouldUseDummyData ? 'DUMMY' : 'AWS';

// Log the current mode (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log(`🔧 API Mode: ${API_MODE}${shouldUseDummyData ? ' (Dummy Data)' : ' (AWS Backend)'}`);
  console.log(`📍 Hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'N/A'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📝 REACT_APP_USE_DUMMY_DATA: ${process.env.REACT_APP_USE_DUMMY_DATA}`);
  console.log(`✅ USE_DUMMY_DATA flag: ${shouldUseDummyData}`);
}

