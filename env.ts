import AsyncStorage from '@react-native-async-storage/async-storage';
const STORAGE_KEY = 'API_BASE_URL';

// Save the API Base URL
export const saveApiBaseUrl = async (url: string) => {
  await AsyncStorage.setItem(STORAGE_KEY, `${url}/api`);
};
export const getApiBaseURL = async () => {
  try {
    const url = await AsyncStorage.getItem('baseURL');
    if (url === null) {
      console.warn('No baseURL found, returning default');
      return ''; // Fallback URL
    }
    return url;
  } catch (error) {
    console.error('Error getting baseURL from AsyncStorage:', error);
    return ''; // Fallback URL
  }
};

// Remove the API Base URL (this will remove the stored key from AsyncStorage)
export const removeApiBaseUrl = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
