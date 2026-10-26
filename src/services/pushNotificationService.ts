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

const PUSH_TOKEN_STORAGE_KEY = 'viscera_push_token';

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
    console.log('[Push] Must use a physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Notification permission not granted');
    return null;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      'a853f1f0-d723-4003-8f69-02d0f79ea4f1';

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    token = tokenResponse.data;
    console.log('[Push] Registered Expo Push Token:', token);
  } catch (error) {
    console.error('[Push] Error getting push token:', error);
  }

  return token;
}

/**
 * Send push token to backend to associate with logged-in user
 */
export async function registerDevicePushToken(): Promise<void> {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) return;

    const token = await registerForPushNotificationsAsync();
    if (!token) return;

    await apiClient.post('/api/v1/users/push-token', {
      pushToken: token,
    });

    await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    console.log('[Push] Push token synced with backend successfully');
  } catch (err) {
    console.error('[Push] Failed to sync push token with backend:', err);
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
        router.push('/app/ChatRoom' as any);
        return;
      }
    }
    // Default fallback to Notifications screen
    router.push('/app/Notifications' as any);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
