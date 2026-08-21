import { chatApiClient } from './api';

export const chatService = {
    /**
     * Start a chat (creates application if it doesn't exist)
     * @param jobId The ID of the job to start a chat for
     */
    startChat: async (id: string) => {
        console.log(`Starting chat for ID: ${id}`);
        // If the backend expects 'jobId' key for both cases, we keep it. 
        // If it specifically needs 'applicationId', we might need to adjust.
        // Assuming the backend handles the ID appropriately.
        const response = await chatApiClient.post('/api/v1/chat/messages/start', { jobId: id });
        return response.data;
    },

    /**
     * Send a message to a conversation
     * @param conversationId The ID of the conversation (applicationId)
     * @param content Message text
     */
    sendMessage: async (conversationId: string, content: string) => {
        const response = await chatApiClient.post(`/api/v1/chat/messages/${conversationId}`, { content });
        return response.data;
    },

    /**
     * Fetch message history for a conversation
     * @param conversationId The ID of the conversation
     */
    getMessages: async (conversationId: string) => {
        try {
            const response = await chatApiClient.get(`/api/v1/chat/conversations/${conversationId}/messages`);
            return response.data;
        } catch {
            const fallback = await chatApiClient.get(`/api/v1/chat/messages/${conversationId}`);
            return fallback.data;
        }
    },

    /**
     * List all conversations for the current user
     */
    getConversations: async () => {
        try {
            const response = await chatApiClient.get('/api/v1/chat/conversations');
            return response.data;
        } catch {
            const fallback = await chatApiClient.get('/api/v1/chat/messages/conversations');
            return fallback.data;
        }
    }
};

export default chatService;
