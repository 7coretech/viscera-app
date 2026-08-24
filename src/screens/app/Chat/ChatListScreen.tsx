import chatService from "@/src/services/chatService";
import { useTheme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatMessageTime = (dateStr?: string) => {
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

const ChatListScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await chatService.getConversations();
      const base = response?.data || response;
      const d = base?.data || base || {};
      const rawList = Array.isArray(d?.conversations)
        ? d.conversations
        : Array.isArray(base?.conversations)
        ? base.conversations
        : Array.isArray(d)
        ? d
        : Array.isArray(base)
        ? base
        : [];
      setConversations(rawList);
    } catch (error) {
      console.log("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      const interval = setInterval(() => {
        fetchConversations();
      }, 5000);
      return () => clearInterval(interval);
    }, [fetchConversations])
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-white">
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
        <Text className="text-small text-text-secondary mt-2">Loading messages...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-white">
      <View className="px-4 py-3 bg-white border-b border-gray-light flex-row items-center justify-between">
        <Text className="text-h2 font-bold text-text-primary">
          Messages
        </Text>
        {conversations.length > 0 && (
          <View className="bg-primary-main/10 px-2.5 py-1 rounded-full">
            <Text className="text-caption font-semibold text-primary-main">
              {conversations.length} Active
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item, index) =>
          item.conversationId?.toString() ||
          item.applicationId?.toString() ||
          item.id?.toString() ||
          index.toString()
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchConversations(true)}
            colors={[theme.palette.primary.main]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20 px-6">
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={theme.palette.gery.darkGray}
            />
            <Text className="text-h3 font-bold text-text-primary mt-4 text-center">
              No conversations yet
            </Text>
            <Text className="text-small text-text-secondary text-center mt-2 px-4">
              When recruiters shortlist your applications or start conversations, they will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const conversationId =
            item.conversationId || item.applicationId || item.id || item._id;
          const recipientName =
            item.participant?.name ||
            item.recipientName ||
            (item.application?.jobTitle
              ? `Recruiter (${item.application.jobTitle})`
              : "Recruiter");
          const avatarUrl =
            item.participant?.avatar ||
            item.recipientAvatar ||
            "";
          const initialLetter = (recipientName || "R").charAt(0).toUpperCase();
          const jobTitle = item.application?.jobTitle || item.jobTitle || "";

          let lastMsg = "Tap to chat with recruiter";
          let lastMsgTime = "";

          if (typeof item.lastMessage === "string") {
            lastMsg = item.lastMessage;
          } else if (item.lastMessage) {
            lastMsg =
              item.lastMessage.content ||
              item.lastMessage.message ||
              item.lastMessage.text ||
              "Tap to chat with recruiter";
            lastMsgTime = formatMessageTime(
              item.lastMessage.timestamp || item.lastMessage.createdAt
            );
          }

          if (!lastMsgTime && item.lastMessageTime) {
            lastMsgTime = formatMessageTime(item.lastMessageTime);
          }

          const unread = Number(item.unreadCount || 0);

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/app/ChatRoom",
                  params: {
                    conversationId,
                    name: recipientName,
                    avatar: avatarUrl,
                    jobTitle: jobTitle,
                  },
                })
              }
              className={`flex-row items-center px-4 py-3.5 border-b border-gray-light ${
                unread > 0 ? "bg-primary-main/5" : "bg-white"
              }`}
            >
              <View className="relative mr-3">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-12 h-12 rounded-full border border-gray-light"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-primary-main items-center justify-center border border-primary-main/20">
                    <Text className="text-white text-h4 font-bold">
                      {initialLetter}
                    </Text>
                  </View>
                )}
                {item.isOnline && (
                  <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-action-green rounded-full border-2 border-white" />
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text
                    className={`text-body1 font-bold ${
                      unread > 0 ? "text-primary-main" : "text-text-primary"
                    }`}
                    numberOfLines={1}
                  >
                    {recipientName}
                  </Text>
                  {lastMsgTime ? (
                    <Text className="text-caption text-text-secondary font-medium">
                      {lastMsgTime}
                    </Text>
                  ) : null}
                </View>

                {jobTitle ? (
                  <View className="self-start bg-primary-main/10 px-1.5 py-0.5 rounded mb-1">
                    <Text
                      className="text-caption text-primary-main font-semibold"
                      numberOfLines={1}
                    >
                      {jobTitle}
                    </Text>
                  </View>
                ) : null}

                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-small flex-1 mr-2 ${
                      unread > 0
                        ? "text-text-primary font-semibold"
                        : "text-text-secondary"
                    }`}
                    numberOfLines={1}
                  >
                    {lastMsg}
                  </Text>

                  {unread > 0 && (
                    <View className="bg-primary-main rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
                      <Text className="text-white text-[11px] font-bold">
                        {unread}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;
