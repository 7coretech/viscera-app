import apiClient from '../api';
import { APP_ENDPOINTS } from './appApi';

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
    uploadResume: (formData: FormData) => apiClient.post(APP_ENDPOINTS.RESUMES, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getResumeUrl: (id: string) => apiClient.get(`${APP_ENDPOINTS.RESUMES}/${id}/url`),
    deleteResume: (id: string) => apiClient.delete(`${APP_ENDPOINTS.RESUMES}/${id}`),
    getLicenses: () => apiClient.get(APP_ENDPOINTS.LICENSES),
    saveLicenses: (formData: FormData) => apiClient.post(APP_ENDPOINTS.LICENSES, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateLicenses: (id: string, formData: FormData) => apiClient.patch(`${APP_ENDPOINTS.LICENSES}/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    deleteLicense: (id: string) => apiClient.delete(`${APP_ENDPOINTS.LICENSES}/${id}`),
    getLicenseById: (id: string) => apiClient.get(`${APP_ENDPOINTS.LICENSES}/${id}`),

    // Document Methods
    getDocuments: () => apiClient.get(APP_ENDPOINTS.DOCUMENTS),
    uploadDocument: (formData: FormData) => apiClient.post(APP_ENDPOINTS.DOCUMENTS, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getDocumentUrl: (id: string) => apiClient.get(`${APP_ENDPOINTS.DOCUMENTS}/${id}/url`),
    updateDocument: (id: string, formData: FormData) => apiClient.patch(`${APP_ENDPOINTS.DOCUMENTS}/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    deleteDocument: (id: string) => apiClient.delete(`${APP_ENDPOINTS.DOCUMENTS}/${id}`),

    // Travel Preferences Methods
    getTravelPreferences: () => apiClient.get(APP_ENDPOINTS.TRAVEL),
    saveTravelPreferences: (data: any) => apiClient.post(APP_ENDPOINTS.TRAVEL, data),
    updateTravelPreferences: (data: any) => apiClient.patch(APP_ENDPOINTS.TRAVEL, data),

    // Profile Picture Method
    updateProfilePicture: (formData: FormData) => apiClient.put(APP_ENDPOINTS.PROFILE_PICTURE, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateUserProfile: (formData: FormData) => apiClient.patch(APP_ENDPOINTS.GET_USER_PROFILE, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    // Jobs Methods
    getJobs: () => apiClient.get(APP_ENDPOINTS.JOBS),
    getJobDetails: (id: string) => apiClient.get(`${APP_ENDPOINTS.JOBS}/${id}`),

    // Applicant Methods
    getApplicantJobs: (type: 'save' | 'apply') => apiClient.get(type === 'save' ? '/api/v1/jobs/me?type=SAVED' : '/api/v1/jobs/me?type=APPLIED'),
    saveJob: (data: { jobId: string }) => apiClient.post(`/api/v1/jobs/${data.jobId}/save`, data),
    applyJob: (data: { jobId: string, status: string }) => apiClient.post(`/api/v1/applications/job/${data.jobId}/apply`, data),
};

export default {
    ...appService,
};
