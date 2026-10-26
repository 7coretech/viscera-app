import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';
import { router } from 'expo-router';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export const PUSH_TOKEN_STORAGE_KEY = 'viscera_push_token';
export const PUSH_STATUS_STORAGE_KEY = 'viscera_push_status';

/**
 * Trigger an immediate native local notification banner
 */
export async function showLocalNotification({
  title,
  body,
  data = {},
}: {
  title: string;
  body: string;
  data?: any;
}): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  } catch (err) {
    console.error('[Push] Failed to show local notification:', err);
  }
}

/**
 * Request notification permissions and fetch the Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
      sound: 'default',
    });
  }

  if (!Device.isDevice) {
    console.warn('[Push] Running on emulator/simulator: remote push notifications require Google Play Services.');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Notification permission not granted. Status:', finalStatus);
    await AsyncStorage.setItem(PUSH_STATUS_STORAGE_KEY, `PERMISSION_DENIED (${finalStatus})`);
    return null;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      'c27a527e-5e4c-45ef-b3c7-2adaf3e81aea';

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    token = tokenResponse.data;
    console.log('[Push] Registered Expo Push Token:', token);
    await AsyncStorage.setItem(PUSH_STATUS_STORAGE_KEY, `REGISTERED: ${token}`);
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error('[Push] Error getting push token:', errorMsg);
    await AsyncStorage.setItem(PUSH_STATUS_STORAGE_KEY, `TOKEN_ERROR: ${errorMsg}`);
  }

  return token;
}

/**
 * Send push token to backend to associate with logged-in user
 */
export async function registerDevicePushToken(): Promise<void> {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('[Push] No accessToken available, skipping push token registration.');
      return;
    }

    const token = await registerForPushNotificationsAsync();
    if (!token) {
      console.log('[Push] No push token obtained, skipping backend sync.');
      return;
    }

    await apiClient.post('/api/v1/users/push-token', {
      pushToken: token,
    });

    await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    console.log('[Push] Push token synced with backend successfully:', token);
  } catch (err: any) {
    console.error('[Push] Failed to sync push token with backend:', err?.message || err);
  }
}

/**
 * Remove push token from backend on logout
 */
export async function unregisterDevicePushToken(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (token) {
      await apiClient.delete('/api/v1/users/push-token', {
        data: { pushToken: token },
      });
      await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
      console.log('[Push] Push token removed from backend');
    }
  } catch (err) {
    console.error('[Push] Failed to remove push token:', err);
  }
}

/**
 * Set up listeners for received and tapped notifications
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void
) {
  // Listener for foreground notifications
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Push] Notification received in foreground:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Listener for user tapping on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Push] Notification response received:', response);
    const data = response?.notification?.request?.content?.data as any;

    if (data?.url) {
      const url = String(data.url);
      if (url.includes('chat')) {
        router.push('/app/(tabs)/chat' as any);
        return;
      }
    }

    if (data?.jobId) {
      router.push({
        pathname: '/app/JobDetail',
        params: { jobId: data.jobId },
      } as any);
      return;
    }

    // Default fallback to Notifications screen
    router.push('/app/Notifications' as any);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
