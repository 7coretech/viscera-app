import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService, otpService } from '../services/authApi/authService';
import { registerDevicePushToken, unregisterDevicePushToken } from '../services/pushNotificationService';

interface AuthState {
    user: any | null;
    accessToken: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: string | null;
}
const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
};

export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, { dispatch }) => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            if (accessToken && refreshToken) {
                return { accessToken, refreshToken, user };
            }
            return null;
        } catch (error) {
            return null;
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: any, { rejectWithValue }) => {
        try {
            const response = await authService.register(userData);
            const { success, data, message } = response.data;
            if (success && data) {
                await AsyncStorage.setItem('accessToken', data.accessToken);
                await AsyncStorage.setItem('refreshToken', data.refreshToken);
                registerDevicePushToken().catch(console.error);
                return data;
            } else {
                return rejectWithValue(message || 'Registration failed');
            }
        } catch (error: any) {
            return rejectWithValue(typeof error === 'string' ? error : (error.response?.data?.message || error.message || 'Something went wrong'));
        }
    }
);

export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await otpService.send(email);
            const { success, message } = response.data;
            if (success) {
                return message;
            } else {
                return rejectWithValue(message || 'Failed to send OTP');
            }
        } catch (error: any) {
            return rejectWithValue(typeof error === 'string' ? error : (error.response?.data?.message || error.message || 'Something went wrong'));
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload: { email: string; enteredOtp: string }, { rejectWithValue }) => {
        try {
            const response = await otpService.verify(payload);
            const { success, message } = response.data;
            if (success) {
                return message;
            } else {
                return rejectWithValue(message || 'OTP verification failed');
            }
        } catch (error: any) {
            return rejectWithValue(typeof error === 'string' ? error : (error.response?.data?.message || error.message || 'Something went wrong'));
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.logout();
            const { message } = response.data;
            return message || 'Log out successful';
        } catch (error: any) {
            return rejectWithValue(typeof error === 'string' ? error : (error.response?.data?.message || error.message || 'Logout failed'));
        } finally {
            await unregisterDevicePushToken().catch(console.error);
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: any, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            const { success, data } = response.data;
            if (success && data) {
                await AsyncStorage.setItem('accessToken', data.accessToken);
                await AsyncStorage.setItem('refreshToken', data.refreshToken);
                if (data.user) {
                    await AsyncStorage.setItem('user', JSON.stringify(data.user));
                }
                registerDevicePushToken().catch(console.error);
                return data;
            } else {
                return rejectWithValue(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : (error.response?.data?.message || error.message || 'Something went wrong');
            console.log('Login Thunk Error:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        },
        setCredentials: (state, action: PayloadAction<{ user: any; accessToken: string; refreshToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeAuth.fulfilled, (state, action) => {
                if (action.payload) {
                    state.accessToken = action.payload.accessToken;
                    state.refreshToken = action.payload.refreshToken;
                    state.user = action.payload.user;
                }
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.user = action.payload.user || null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                // Still clear local state even if server-side logout fails
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.loading = false;
            });
    },
});

export const { logout, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
