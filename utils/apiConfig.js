import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Returns the base URL for the API based on the environment.
 * In development, it reads the URL from the app config (app.json).
 * This centralizes the configuration for easy updates.
 */
export const getBaseURL = () => {
  // __DEV__ is a global variable set by React Native, true in development
  if (__DEV__) {
    // Prioritize the local device URL if available
    const localApiUrl = Constants.expoConfig?.extra?.API_BASE_URL_LOCAL;
    if (localApiUrl) {
      return localApiUrl;
    }

    const devApiUrl = Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    if (devApiUrl) {
      return devApiUrl;
    }
    
    console.warn(
      "Warning: Neither API_BASE_URL_LOCAL nor API_BASE_URL_DEV is set in app.json. Falling back to default."
    );
    // Fallback for safety
    if (Platform.OS === 'web') {
      return 'http://localhost:8080';
    }
    return 'http://10.0.2.2:8080';

  } else {
    // For production builds
    const prodApiUrl = Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    if (!prodApiUrl) {
      console.error("Error: Production API URL is not configured in app.json.");
      return 'https://api.your-production-domain.com';
    }
    return prodApiUrl;
  }
};

// Export the URL directly for convenience
export const API_URL = getBaseURL();
