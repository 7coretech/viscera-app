
// // app/_layout.tsx
// import { Stack } from "expo-router";
// import { useAuth } from "@/src/hooks/useAuth";

// export default function RootLayout() {
//   const { isAuthenticated } = useAuth();

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {isAuthenticated ? (
//         <Stack.Screen name="app" />
//       ) : (
//         <Stack.Screen name="auth" />
//       )}
//     </Stack>
//   );
// }

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Appearance, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider, useDispatch } from "react-redux";
import "../global.css";
import { AppDispatch, store } from "../src/store";
import { initializeAuth, setCredentials } from "../src/store/authSlice";
import { fetchUnreadChatCount, incrementUnreadCount } from "../src/store/chatSlice";
import { setOnTokenRefreshed } from "../src/services/api";
import socketService from "../src/services/socketService";
import {
  registerDevicePushToken,
  setupNotificationListeners,
  showLocalNotification,
} from "../src/services/pushNotificationService";

// Force light mode
Appearance.setColorScheme("light");

function RootLayoutContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Keep Redux in sync whenever axios interceptor refreshes accessToken
    setOnTokenRefreshed(({ accessToken, refreshToken }) => {
      dispatch(setCredentials({ accessToken, refreshToken }));
    });

    const init = async () => {
      const result: any = await dispatch(initializeAuth());
      if (result?.payload?.accessToken) {
        // User already logged in, sync push token and unread chat count
        registerDevicePushToken().catch(console.error);
        dispatch(fetchUnreadChatCount());

        // Listen for socket events to show real-time foreground notifications
        socketService.initialize();
        socketService.onNewMessage((msg: any) => {
          dispatch(incrementUnreadCount());
          showLocalNotification({
            title: "New Message",
            body: msg?.content || "You have a new message",
            data: { url: "/app/(tabs)/chat", conversationId: msg?.applicationId },
          });
        });
        socketService.onNotification((notif: any) => {
          showLocalNotification({
            title: notif?.title || "Viscera Alert",
            body: notif?.description || notif?.body || "",
            data: { url: notif?.url },
          });
        });
      }
      setIsInitializing(false);
    };
    init();

    // Set up foreground & tap notification listeners
    const unsubscribe = setupNotificationListeners();
    return () => {
      unsubscribe();
      socketService.offNewMessage();
      socketService.offNotification();
    };
  }, [dispatch]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}
