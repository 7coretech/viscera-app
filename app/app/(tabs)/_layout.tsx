// app/app/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useEffect } from "react";
import { fetchUnreadChatCount } from "@/src/store/chatSlice";

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const { unreadCount } = useSelector((state: RootState) => state.chat);
    const { accessToken } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (accessToken) {
            dispatch(fetchUnreadChatCount() as any);
        }
    }, [accessToken, dispatch]);
  return (
    <Tabs 
screenOptions={{
  headerShown: false,
  tabBarActiveTintColor: "#0141C5",
  tabBarInactiveTintColor: "#9DA3B4",
  tabBarStyle: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E6ECFA",
    height: Platform.OS === 'ios' ? 60 + insets.bottom : 65 + insets.bottom,
    paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
    paddingTop: 8,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
}}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs/index"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-sharp" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chat",
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#EF4444",
            color: "#ffffff",
            fontSize: 10,
            fontWeight: "700",
            lineHeight: 14,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
