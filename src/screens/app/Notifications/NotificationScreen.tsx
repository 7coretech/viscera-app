import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationType = "job" | "viewed" | "message" | "system";

interface NotificationItemType {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  raw?: any;
}

const formatNotificationTime = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
};

const resolveNotificationType = (raw: any): NotificationType => {
  const typeStr = String(raw?.type || raw?.category || "").toLowerCase();
  const text = `${raw?.title || ""} ${raw?.message || ""} ${raw?.content || ""}`.toLowerCase();

  if (typeStr.includes("message") || typeStr.includes("chat") || text.includes("message") || text.includes("sent you")) {
    return "message";
  }
  if (typeStr.includes("view") || text.includes("viewed")) {
    return "viewed";
  }
  if (typeStr.includes("job") || typeStr.includes("application") || text.includes("shortlisted") || text.includes("job")) {
    return "job";
  }
  return "system";
};

const getIconConfig = (type: NotificationType) => {
  switch (type) {
    case "job":
      return {
        icon: "briefcase" as const,
        bgClass: "bg-primary-light1",
        iconColor: "#0141C5",
      };
    case "viewed":
      return {
        icon: "checkmark-circle" as const,
        bgClass: "bg-actionLight-green",
        iconColor: "#006900",
      };
    case "message":
      return {
        icon: "chatbubble" as const,
        bgClass: "bg-actionLight-purple2",
        iconColor: "#780078",
      };
    default:
      return {
        icon: "notifications" as const,
        bgClass: "bg-primary-light1",
        iconColor: "#0141C5",
      };
  }
};

interface ItemProps {
  item: NotificationItemType;
  onPress: () => void;
}

const NotificationItem = ({ item, onPress }: ItemProps) => {
  const { icon, bgClass, iconColor } = getIconConfig(item.type);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`flex-row px-4 py-4 border-b border-gray-light ${
        !item.isRead ? "bg-primary-main/5" : "bg-white"
      }`}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${bgClass}`}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-h6 flex-1 pr-2 ${
              item.isRead
                ? "font-semibold text-text-primary/80"
                : "font-bold text-text-primary"
            }`}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {!item.isRead && (
            <View className="w-2.5 h-2.5 rounded-full bg-primary-main" />
          )}
        </View>

        <Text
          className="text-body2 text-text-secondary font-normal mt-1"
          numberOfLines={2}
        >
          {item.message}
        </Text>

        <Text className="text-caption text-text-secondary mt-1">
          {item.time}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const NotificationScreen = () => {
  const router = useRouter();
  const theme = useTheme();

  const [notifications, setNotifications] = useState<NotificationItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await appService.getNotifications();
      const base = res?.data || res;
      const d = base?.data || base || {};
      const rawList = Array.isArray(d?.notifications)
        ? d.notifications
        : Array.isArray(base?.notifications)
        ? base.notifications
        : Array.isArray(d)
        ? d
        : Array.isArray(base)
        ? base
        : [];

      const list: NotificationItemType[] = rawList.map((item: any) => {
        const id = item.id || item._id || item.notificationId;
        const title = item.title || item.heading || "Notification";
        const message = item.message || item.body || item.content || "";
        const time = formatNotificationTime(item.createdAt || item.timestamp || item.date);
        const isRead = Boolean(item.isRead || item.read || item.status === "READ");
        const type = resolveNotificationType(item);

        return {
          id,
          type,
          title,
          message,
          time,
          isRead,
          raw: item,
        };
      });

      setNotifications(list);
    } catch (error) {
      console.log("Error fetching notifications in app:", error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
      return () => clearInterval(interval);
    }, [fetchNotifications])
  );

  const handleNotificationClick = async (item: NotificationItemType) => {
    // Mark as read locally and remotely
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    if (item.id) {
      appService.markNotificationAsRead(item.id).catch(() => {});
    }

    const raw = item.raw || {};
    const text = `${item.title} ${item.message}`.toLowerCase();

    // Smart routing based on notification intent
    if (
      item.type === "message" ||
      raw.conversationId ||
      raw.applicationId ||
      text.includes("shortlist") ||
      text.includes("message")
    ) {
      const convId = raw.conversationId || raw.applicationId;
      if (convId) {
        router.push({
          pathname: "/app/ChatRoom",
          params: {
            conversationId: convId,
            name: raw.senderName || "Recruiter",
          },
        });
      } else {
        router.push("/app/(tabs)/chat");
      }
    } else if (raw.jobId || text.includes("job")) {
      if (raw.jobId) {
        router.push({
          pathname: "/app/JobDetails",
          params: { jobId: raw.jobId },
        });
      } else {
        router.push("/app/(tabs)/jobs");
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-white w-full">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-light">
        <View className="flex-row gap-4 items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.palette.gery.darkGray}
            />
          </TouchableOpacity>

          <Text className="text-h2 font-bold text-text-primary">
            Notifications
          </Text>
        </View>

        {unreadCount > 0 && (
          <View className="bg-primary-main/10 px-3 py-1 rounded-full">
            <Text className="text-caption text-primary-main font-bold">
              {unreadCount} New
            </Text>
          </View>
        )}
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
          <Text className="text-small text-text-secondary mt-2">
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item.id || index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              colors={[theme.palette.primary.main]}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20 px-6">
              <Ionicons
                name="notifications-off-outline"
                size={56}
                color={theme.palette.gery.darkGray}
              />
              <Text className="text-h3 font-bold text-text-primary mt-4 text-center">
                No notifications yet
              </Text>
              <Text className="text-small text-text-secondary text-center mt-2 px-4">
                You will see updates here when recruiters view or shortlist your applications.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              onPress={() => handleNotificationClick(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;
