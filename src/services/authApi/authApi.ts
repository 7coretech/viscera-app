// Auth API URL Constants
export const AUTH_ENDPOINTS = {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    VERIFY_FORGOT_PASSWORD_OTP: '/api/v1/auth/verify-forgot-password-otp',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
};

// OTP API URL Constants
export const OTP_ENDPOINTS = {
    SEND: '/api/v1/users/otp/send',
    VERIFY: '/api/v1/users/otp/verify',
};
