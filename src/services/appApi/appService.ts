import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api';
import { APP_ENDPOINTS } from './appApi';

const API_BASE_URL = 'https://api.visceraconnect.com';

const uploadFormData = async (endpoint: string, formData: FormData, method = 'POST') => {
    const token = await AsyncStorage.getItem('accessToken');
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method,
        headers: {
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
        throw data?.message || data?.error || 'Upload failed';
    }
    return { data, status: response.status };
};

// App Service Methods
export const appService = {
    getCompletionScore: () => apiClient.get(APP_ENDPOINTS.GET_COMPLETION_SCORE),
    getUserProfile: () => apiClient.get(APP_ENDPOINTS.GET_USER_PROFILE),
    getPreferences: () => apiClient.get(APP_ENDPOINTS.PREFERENCES),
    savePreferences: (data: any) => apiClient.post(APP_ENDPOINTS.PREFERENCES, data),
    updatePreferences: (data: any) => apiClient.patch(APP_ENDPOINTS.PREFERENCES, data),

    // Experience Methods
    getExperiences: () => apiClient.get(APP_ENDPOINTS.EXPERIENCES),
    addExperience: (data: any) => apiClient.post(APP_ENDPOINTS.EXPERIENCES, data),
    updateExperience: (id: string, data: any) => apiClient.patch(`${APP_ENDPOINTS.EXPERIENCES}/${id}`, data),
    deleteExperience: (id: string) => apiClient.delete(`${APP_ENDPOINTS.EXPERIENCES}/${id}`),

    // Skills Methods
    getSkills: () => apiClient.get(APP_ENDPOINTS.SKILLS),
    saveSkills: (data: any) => apiClient.post(APP_ENDPOINTS.SKILLS, data),
    updateSkills: (data: any) => apiClient.patch(APP_ENDPOINTS.SKILLS, data),

    // Availability Methods
    getAvailability: () => apiClient.get(APP_ENDPOINTS.AVAILABILITY),
    saveAvailability: (data: any) => apiClient.post(APP_ENDPOINTS.AVAILABILITY, data),
    updateAvailability: (data: any) => apiClient.patch(APP_ENDPOINTS.AVAILABILITY, data),

    // Compensation Methods
    getCompensation: () => apiClient.get(APP_ENDPOINTS.COMPENSATION),
    saveCompensation: (data: any) => apiClient.post(APP_ENDPOINTS.COMPENSATION, data),
    updateCompensation: (data: any) => apiClient.patch(APP_ENDPOINTS.COMPENSATION, data),

    // Resume Methods
    getResumes: () => apiClient.get(APP_ENDPOINTS.RESUMES),
    uploadResume: (formData: FormData) => uploadFormData(APP_ENDPOINTS.RESUMES, formData, 'POST'),
    getResumeUrl: (id: string) => apiClient.get(`${APP_ENDPOINTS.RESUMES}/${id}/url`),
    deleteResume: (id: string) => apiClient.delete(`${APP_ENDPOINTS.RESUMES}/${id}`),
    getLicenses: () => apiClient.get(APP_ENDPOINTS.LICENSES),
    saveLicenses: (formData: FormData) => uploadFormData(APP_ENDPOINTS.LICENSES, formData, 'POST'),
    updateLicenses: (id: string, formData: FormData) => uploadFormData(`${APP_ENDPOINTS.LICENSES}/${id}`, formData, 'PATCH'),
    deleteLicense: (id: string) => apiClient.delete(`${APP_ENDPOINTS.LICENSES}/${id}`),
    getLicenseById: (id: string) => apiClient.get(`${APP_ENDPOINTS.LICENSES}/${id}`),

    // Document Methods
    getDocuments: () => apiClient.get(APP_ENDPOINTS.DOCUMENTS),
    uploadDocument: (formData: FormData) => uploadFormData(APP_ENDPOINTS.DOCUMENTS, formData, 'POST'),
    getDocumentUrl: (id: string) => apiClient.get(`${APP_ENDPOINTS.DOCUMENTS}/${id}/url`),
    updateDocument: (id: string, formData: FormData) => uploadFormData(`${APP_ENDPOINTS.DOCUMENTS}/${id}`, formData, 'PATCH'),
    deleteDocument: (id: string) => apiClient.delete(`${APP_ENDPOINTS.DOCUMENTS}/${id}`),

    // Travel Preferences Methods
    getTravelPreferences: () => apiClient.get(APP_ENDPOINTS.TRAVEL),
    saveTravelPreferences: (data: any) => apiClient.post(APP_ENDPOINTS.TRAVEL, data),
    updateTravelPreferences: (data: any) => apiClient.patch(APP_ENDPOINTS.TRAVEL, data),

    // Profile Picture Method
    updateProfilePicture: (formData: FormData) => uploadFormData(APP_ENDPOINTS.PROFILE_PICTURE, formData, 'PUT'),
    updateUserProfile: (formData: FormData) => uploadFormData(APP_ENDPOINTS.GET_USER_PROFILE, formData, 'PATCH'),

    // Jobs Methods
    getJobs: () => apiClient.get(APP_ENDPOINTS.JOBS),
    getJobDetails: (id: string) => apiClient.get(`${APP_ENDPOINTS.JOBS}/${id}`),

    // Applicant Methods
    getApplicantJobs: (type: 'save' | 'apply') => apiClient.get(type === 'save' ? '/api/v1/jobs/me?type=SAVED' : '/api/v1/jobs/me?type=APPLIED'),
    saveJob: (data: { jobId: string }) => apiClient.post(`/api/v1/jobs/${data.jobId}/save`, data),
    applyJob: (data: { jobId: string, status: string }) => apiClient.post(`/api/v1/applications/job/${data.jobId}/apply`, data),

    // Notification Methods
    getNotifications: () => apiClient.get('/api/v1/notifications'),
    getUnreadNotificationCount: () => apiClient.get('/api/v1/notifications/unread-counts'),
    markNotificationAsRead: (id: string) => apiClient.put(`/api/v1/notifications/${id}/read`),
    deleteNotification: (id: string) => apiClient.delete(`/api/v1/notifications/${id}`),
};

export default {
    ...appService,
};
