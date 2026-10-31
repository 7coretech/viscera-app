import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onSend: (text: string) => void;
};

const ChatInput: React.FC<Props> = ({ onSend }) => {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View
      className="flex-row items-center px-4 pt-2 bg-white border-t border-gray-light"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#6B7280"
        style={{ color: "#111827", fontSize: 14 }}
        selectionColor="#0141C5"
        className="flex-1 bg-gray-extraLight px-4 py-2 rounded-full text-body1 text-text-primary"
      />

      <TouchableOpacity
        onPress={handleSend}
        className="mx-2 w-10 h-10 rounded-full bg-primary-main items-center justify-center"
      >
        <Ionicons name="send" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;
