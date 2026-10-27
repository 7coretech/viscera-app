import ChatInput from "@/src/components/ChatInput";
import appService from "@/src/services/appApi/appService";
import chatService from "@/src/services/chatService";
import socketService from "@/src/services/socketService";
import { fetchUnreadChatCount } from "@/src/store/chatSlice";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useDispatch } from "react-redux";

// Safe Base64 decoder fallback without external dependencies
const safeBase64Decode = (str: string): string => {
  try {
    if (typeof atob === "function") {
      return atob(str);
    }
  } catch {}
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  str = String(str).replace(/=+$/, "");
  for (
    let bc = 0, bs = 0, buffer: any, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
};

// Date label helper for chat timeline separators
const getDateLabel = (timestamp?: string | number | Date): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
};

const ChatRoomScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { conversationId, name, avatar, jobTitle, recipientId } =
    useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Robust current user resolution
  const resolveCurrentUserId = useCallback(async (): Promise<string | null> => {
    // 1. AsyncStorage 'user'
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const uid = u?.userId || u?.id || u?._id;
        if (uid) return String(uid);
      }
    } catch {}

    // 2. JWT Access Token decode
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token && typeof token === "string") {
        const parts = token.split(".");
        if (parts.length === 3) {
          const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const decoded = JSON.parse(safeBase64Decode(b64));
          if (decoded?.id) return String(decoded.id);
        }
      }
    } catch {}

    // 3. App Service User Profile
    try {
      const res = await appService.getUserProfile();
      const profile = res?.data?.data || res?.data;
      if (profile) {
        const uid = profile?.userId || profile?.id || profile?._id;
        if (uid) {
          await AsyncStorage.setItem("user", JSON.stringify(profile));
          return String(uid);
        }
      }
    } catch {}

    return null;
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const resolvedId = await resolveCurrentUserId();
      if (resolvedId) {
        setCurrentUserId(resolvedId);
      }

      if (conversationId) {
        const response = await chatService.getMessages(conversationId as string);
        const base = response?.data || response;
        const d = base?.data || base || {};

        const backendUserId = d?.currentUserId || base?.currentUserId;
        if (backendUserId && !resolvedId) {
          setCurrentUserId(String(backendUserId));
        }

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
        dispatch(fetchUnreadChatCount() as any);
      }
    } catch (error) {
      console.log("Error loading chat data:", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 250);
    }
  }, [conversationId, dispatch, resolveCurrentUserId]);

  useEffect(() => {
    loadInitialData();

    // Socket setup
    socketService.initialize();
    if (conversationId) {
      socketService.joinConversation(conversationId as string);
    }

    // Listen for real-time messages
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

    // Polling fallback every 5 seconds
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
      dispatch(fetchUnreadChatCount() as any);
    };
  }, [conversationId, dispatch, loadInitialData]);

  // Industry-standard check: Is this message sent by the current user?
  const isMessageFromMe = useCallback(
    (item: any): boolean => {
      // 1. Explicit boolean flag
      if (typeof item.isMe === "boolean") {
        return item.isMe;
      }

      const sender = String(
        item.from || item.senderId || item.sender || ""
      )
        .trim()
        .toLowerCase();
      const myId = String(currentUserId || "").trim().toLowerCase();
      const otherId = String(recipientId || "").trim().toLowerCase();

      // 2. If recipientId (recruiter) is known and matches sender -> definitely NOT me (LEFT)
      if (otherId && sender && sender === otherId) {
        return false;
      }

      // 3. If myId is known and matches sender -> definitely IS me (RIGHT)
      if (myId && sender && sender === myId) {
        return true;
      }

      // 4. Check recipient / 'to' field: if sent TO me -> NOT me (LEFT)
      const receiver = String(
        item.to || item.recipientId || item.receiverId || ""
      )
        .trim()
        .toLowerCase();
      if (myId && receiver && receiver === myId) {
        return false;
      }
      if (otherId && receiver && receiver === otherId) {
        return true;
      }

      // Default to incoming (left) rather than falsely showing as outgoing
      return false;
    },
    [currentUserId, recipientId]
  );

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
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F9FAFB]">
        <ActivityIndicator size="large" color="#0141C5" />
      </SafeAreaView>
    );
  }

  const recipientInitial = ((name as string) || "R").charAt(0).toUpperCase();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
        {/* Header */}
        <View className="w-full flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-2 p-1.5 rounded-full active:bg-gray-100"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>

          {avatar ? (
            <Image
              source={{ uri: avatar as string }}
              className="w-10 h-10 rounded-full mr-3 border border-gray-200 bg-gray-100"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-[#0141C5] items-center justify-center mr-3 shadow-sm">
              <Text className="text-white text-base font-bold">
                {recipientInitial}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {name || "Recruiter"}
            </Text>
            {jobTitle ? (
              <Text
                className="text-xs text-[#0141C5] font-semibold"
                numberOfLines={1}
              >
                {jobTitle}
              </Text>
            ) : (
              <View className="flex-row items-center mt-0.5">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="text-xs text-emerald-600 font-medium">
                  Active Now
                </Text>
              </View>
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
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View className="py-24 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-3">
                <Ionicons name="chatbubbles-outline" size={30} color="#0141C5" />
              </View>
              <Text className="text-sm font-semibold text-gray-800">
                Start the Conversation
              </Text>
              <Text className="text-xs text-gray-500 mt-1 text-center px-8">
                Send a message to discuss your application with the recruiter.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const isMe = isMessageFromMe(item);
            const content =
              item.content || item.message || item.text || "";

            const timeStr = item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : item.time || "";

            // Date separator
            const currentDateLabel = getDateLabel(item.timestamp || item.createdAt);
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const prevDateLabel = prevMessage
              ? getDateLabel(prevMessage.timestamp || prevMessage.createdAt)
              : null;
            const showDateHeader =
              Boolean(currentDateLabel) && currentDateLabel !== prevDateLabel;

            return (
              <View className="w-full">
                {/* Timeline Date Divider */}
                {showDateHeader && (
                  <View className="items-center my-3">
                    <View className="bg-gray-200/80 px-3 py-1 rounded-full">
                      <Text className="text-[11px] font-semibold text-gray-600">
                        {currentDateLabel}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Message Bubble Row */}
                <View
                  className={`w-full flex-row my-1.5 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Recruiter Avatar on the left */}
                  {!isMe && (
                    <View className="mr-2 self-end mb-1">
                      {avatar ? (
                        <Image
                          source={{ uri: avatar as string }}
                          className="w-7 h-7 rounded-full border border-gray-200 bg-gray-100"
                        />
                      ) : (
                        <View className="w-7 h-7 rounded-full bg-[#0141C5] items-center justify-center">
                          <Text className="text-white text-[11px] font-bold">
                            {recipientInitial}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View
                    className={`max-w-[78%] ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    {/* The Bubble */}
                    <View
                      className={`px-4 py-3 rounded-2xl ${
                        isMe
                          ? "bg-[#0141C5] rounded-br-xs shadow-sm"
                          : "bg-white border border-gray-200 rounded-bl-xs shadow-xs"
                      }`}
                    >
                      <Text
                        className={`text-[15px] leading-5 ${
                          isMe ? "text-white font-normal" : "text-gray-900 font-normal"
                        }`}
                      >
                        {content}
                      </Text>
                    </View>

                    {/* Timestamp */}
                    {timeStr ? (
                      <View className="flex-row items-center mt-1 px-1">
                        <Text className="text-[11px] text-gray-400 font-medium">
                          {timeStr}
                        </Text>
                        {isMe && (
                          <Ionicons
                            name="checkmark-done"
                            size={14}
                            color="#0141C5"
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>
                    ) : null}
                  </View>
                </View>
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
