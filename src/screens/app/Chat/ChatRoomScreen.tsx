import ChatInput from "@/src/components/ChatInput";
import chatService from "@/src/services/chatService";
import socketService from "@/src/services/socketService";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatRoomScreen = () => {
  const router = useRouter();
  const { conversationId, name, avatar, jobTitle } = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();

    // Initialize socket and join conversation
    socketService.initialize();
    if (conversationId) {
      socketService.joinConversation(conversationId as string);
    }

    // Listen for new messages
    socketService.onNewMessage((newMessage) => {
      setMessages((prev) => {
        const id = newMessage.id || newMessage._id || newMessage.messageId;
        const exists = prev.some(
          (m) => (m.id || m._id || m.messageId) === id && id
        );
        if (exists) return prev;
        return [...prev, newMessage];
      });
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Also poll messages every 5 seconds for reliability
    const interval = setInterval(() => {
      if (conversationId) {
        chatService
          .getMessages(conversationId as string)
          .then((res) => {
            const base = res?.data || res;
            const d = base?.data || base || {};
            const list = Array.isArray(d?.messages)
              ? d.messages
              : Array.isArray(base?.messages)
              ? base.messages
              : Array.isArray(d)
              ? d
              : Array.isArray(base)
              ? base
              : [];
            if (Array.isArray(list) && list.length > 0) {
              setMessages(list);
            }
          })
          .catch(() => {});
      }
    }, 5000);

    return () => {
      socketService.offNewMessage();
      clearInterval(interval);
    };
  }, [conversationId]);

  const loadInitialData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.userId || user.id || user._id);
      }

      if (conversationId) {
        const response = await chatService.getMessages(conversationId as string);
        const base = response?.data || response;
        const d = base?.data || base || {};
        const list = Array.isArray(d?.messages)
          ? d.messages
          : Array.isArray(base?.messages)
          ? base.messages
          : Array.isArray(d)
          ? d
          : Array.isArray(base)
          ? base
          : [];
        setMessages(list);
      }
    } catch (error) {
      console.log("Error loading chat data:", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !conversationId) return;

    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: text,
      from: currentUserId,
      timestamp: new Date().toISOString(),
      isMe: true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      await chatService.sendMessage(conversationId as string, text);
      const res = await chatService.getMessages(conversationId as string);
      const base = res?.data || res;
      const d = base?.data || base || {};
      const list = Array.isArray(d?.messages)
        ? d.messages
        : Array.isArray(base?.messages)
        ? base.messages
        : Array.isArray(d)
        ? d
        : Array.isArray(base)
        ? base
        : [];
      if (Array.isArray(list) && list.length > 0) {
        setMessages(list);
      }
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-white">
        <ActivityIndicator size="large" color="#0141C5" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView className="flex-1 bg-gray-white">
        {/* Header */}
        <View className="w-full flex-row items-center px-4 py-3 bg-white border-b border-gray-light">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>

          <Image
            source={{
              uri: (avatar as string) || "https://i.pravatar.cc/150",
            }}
            className="w-10 h-10 rounded-full mr-3 border border-gray-light"
          />

          <View className="flex-1">
            <Text className="text-body1 font-bold text-text-primary" numberOfLines={1}>
              {name || "Recruiter"}
            </Text>
            {jobTitle ? (
              <Text className="text-caption text-primary-main font-medium" numberOfLines={1}>
                {jobTitle}
              </Text>
            ) : (
              <Text className="text-caption text-action-green font-semibold">
                Active
              </Text>
            )}
          </View>
        </View>

        {/* Message Thread */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            item.id?.toString() ||
            item._id?.toString() ||
            item.messageId?.toString() ||
            index.toString()
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View className="py-20 items-center justify-center">
              <Text className="text-small text-text-secondary">
                No messages yet. Send a message to get started!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe =
              Boolean(item.isMe) ||
              String(item.from || "").toLowerCase() ===
                String(currentUserId || "").toLowerCase() ||
              String(item.senderId || "").toLowerCase() ===
                String(currentUserId || "").toLowerCase();

            const timeStr = item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : item.time || "";

            return (
              <View
                className={`mb-3 max-w-[80%] ${
                  isMe ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <View
                  className={`px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? "bg-primary-main rounded-br-sm"
                      : "bg-white border border-gray-light rounded-bl-sm"
                  }`}
                >
                  <Text
                    className={`text-body2 ${
                      isMe ? "text-white" : "text-text-primary"
                    }`}
                  >
                    {item.content || item.message || item.text}
                  </Text>
                </View>

                {timeStr ? (
                  <Text className="text-[11px] text-text-secondary mt-1 px-1">
                    {timeStr}
                  </Text>
                ) : null}
              </View>
            );
          }}
        />

        <ChatInput onSend={handleSend} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatRoomScreen;
