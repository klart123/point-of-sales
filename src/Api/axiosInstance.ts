// src/api/axiosInstance.ts
import axios from 'axios';
import {store} from '../redux/store';

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 🧠 Always pull latest baseURL before each request
axiosInstance.interceptors.request.use(
  config => {
    const latestBaseURL = store.getState().api.baseURL;
    config.baseURL = latestBaseURL;

    console.log(
      '[Axios Request]',
      config.method?.toUpperCase(),
      config.baseURL,
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
        url: config.baseURL + config.url,
        method: config.method,
        data,
      });

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
      console.error('[Axios No Response]', error.request);
    } else {
      console.error('[Axios Error]', error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
