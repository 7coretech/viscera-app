import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import chatService from '../services/chatService';

interface ChatState {
    unreadCount: number;
    loading: boolean;
}

const initialState: ChatState = {
    unreadCount: 0,
    loading: false,
};

export const fetchUnreadChatCount = createAsyncThunk(
    'chat/fetchUnreadCount',
    async () => {
        const count = await chatService.getUnreadCount();
        return count;
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = Math.max(0, action.payload);
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
        decrementUnreadCount: (state, action: PayloadAction<number | undefined>) => {
            const by = action.payload ?? 1;
            state.unreadCount = Math.max(0, state.unreadCount - by);
        },
        clearUnreadCount: (state) => {
            state.unreadCount = 0;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUnreadChatCount.fulfilled, (state, action) => {
            state.unreadCount = action.payload;
        });
        builder.addCase('auth/logout/fulfilled', (state) => {
            state.unreadCount = 0;
        });
        builder.addCase('auth/logout', (state) => {
            state.unreadCount = 0;
        });
    },
});

export const { setUnreadCount, incrementUnreadCount, decrementUnreadCount, clearUnreadCount } =
    chatSlice.actions;

export default chatSlice.reducer;
