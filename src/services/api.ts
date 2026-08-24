import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://api.visceraconnect.com';
// Use your computer's IP or 10.0.2.2 for local chat server testing
const CHAT_API_URL = 'https://api.visceraconnect.com';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatApiClient = axios.create({
    baseURL: CHAT_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const applyInterceptors = (client: any) => {
    client.interceptors.request.use(
        async (config: any) => {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            if (config.data instanceof FormData) {
                if (config.headers) {
                    delete config.headers['Content-Type'];
                    delete config.headers['content-type'];
                }
            }
            console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        },
        (error: any) => {
            console.log('API Request Error:', error);
            return Promise.reject(error);
        }
    );

    client.interceptors.response.use(
        (response: any) => {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
            return response;
        },
        async (error: any) => {
            const { response, config, message } = error;

            if (!response) {
                console.log(` Network Error: ${config?.method?.toUpperCase()} ${config?.url}`, message);
                return Promise.reject(message || 'Network error occurred');
            }

            console.log(`API Error: ${response.status} ${config?.url}`, response.data);

            const originalRequest = config;

            if (response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refreshToken = await AsyncStorage.getItem('refreshToken');
                    if (refreshToken) {
                        const refreshResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
                            refreshToken
                        });

                        const { success, data } = refreshResponse.data;

                        if (success && data.accessToken) {
                            await AsyncStorage.setItem('accessToken', data.accessToken);
                            await AsyncStorage.setItem('refreshToken', data.refreshToken);
                            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                            return client(originalRequest);
                        }
                    }
                } catch (refreshError) {
                    console.log(' Refresh Token Error:', refreshError);
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                }
            }

            const backendMessage = response.data?.message || message || 'Something went wrong';
            return Promise.reject(backendMessage);
        }
    );
};

applyInterceptors(apiClient);
applyInterceptors(chatApiClient);

export default apiClient;
