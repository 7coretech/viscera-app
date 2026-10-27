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

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

type TokenRefreshedCb = (tokens: { accessToken: string; refreshToken: string }) => void;
let onTokenRefreshedCallback: TokenRefreshedCb | null = null;

export const setOnTokenRefreshed = (cb: TokenRefreshedCb) => {
    onTokenRefreshedCallback = cb;
};

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

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
                if (isRefreshing) {
                    return new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return client(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshToken = await AsyncStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    const refreshResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
                        refreshToken,
                    });

                    const { success, data } = refreshResponse.data;

                    if (success && data?.accessToken) {
                        await AsyncStorage.setItem('accessToken', data.accessToken);
                        if (data.refreshToken) {
                            await AsyncStorage.setItem('refreshToken', data.refreshToken);
                        }
                        if (onTokenRefreshedCallback) {
                            try {
                                onTokenRefreshedCallback({
                                    accessToken: data.accessToken,
                                    refreshToken: data.refreshToken || refreshToken,
                                });
                            } catch (e) {
                                console.error('Error invoking onTokenRefreshedCallback:', e);
                            }
                        }
                        processQueue(null, data.accessToken);
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                        return client(originalRequest);
                    } else {
                        throw new Error('Token refresh unsuccessful');
                    }
                } catch (refreshError) {
                    console.log(' Refresh Token Error:', refreshError);
                    processQueue(refreshError, null);
                    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
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
