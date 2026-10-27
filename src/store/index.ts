import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import nurseReducer from './nurseSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        nurse: nurseReducer,
        chat: chatReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Often needed for React Native / complex objects
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
