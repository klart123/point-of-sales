import axios from 'axios';
import {API_BASE_URL} from '@env';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔍 Log requests
axiosInstance.interceptors.request.use(
  config => {
    console.log(
      '[Axios Request]',
      config.method?.toUpperCase(),
      config.url,
      config.data,
    );
    return config;
  },
  error => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  },
);

// 📥 Log responses
axiosInstance.interceptors.response.use(
  response => {
    console.log(
      '[Axios Response]',
      response.status,
      response.config.url,
      response.data,
    );
    return response;
  },
  error => {
    if (error.response) {
      const {status, data, config} = error.response;

      console.log(`[Axios Response Error] ${status}`, {
        url: config.url,
        method: config.method,
        data,
      });

      // 🎯 Custom handling by status
      switch (status) {
        case 400:
          console.warn('Bad Request: Please check your input.');
          break;
        case 401:
          console.warn('Unauthorized: Token may be invalid or expired.');
          break;
        case 422:
          console.warn('Validation Failed:', data?.errors || data?.message);
          break;
        case 500:
          console.warn('Server Error: Try again later.');
          break;
      }
      return Promise.reject(data || error.response);
    } else if (error.request) {
      // No response was received
      console.error('[Axios No Response]', error.request);
    } else {
      // Other errors (e.g., setting up the request)
      console.error('[Axios Error]', error.message);
    }

    // Return the rejected promise with the error data for further processing
    return Promise.reject(error);
  },
);

export default axiosInstance;
