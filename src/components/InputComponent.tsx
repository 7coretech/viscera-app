import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View
} from "react-native";

export interface InputComponentProps extends TextInputProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;

    loading?: boolean;
    error?: boolean;
    helperText?: string;

    type?: "text" | "password";
    showPasswordToggle?: boolean;

    editable?: boolean;
    multiline?: boolean;

    customHeight?: number;
     leftIconName?: keyof typeof Ionicons.glyphMap; 
  leftIconColor?: string;
  leftIconSize?: number;
  leftIconSpace?: number; 
  rightIconName?: keyof typeof Ionicons.glyphMap;
rightIconColor?: string;
rightIconSize?: number;
onRightIconPress?: () => void;
}

const InputComponent = forwardRef<TextInput, InputComponentProps>(
    (
        {
            value,
            onChangeText,
            placeholder,
            secureTextEntry,
            loading = false,
            error = false,
            helperText,
            type = "text",
            showPasswordToggle = false,
            editable = true,
            multiline = false,
            customHeight,
               leftIconName,
      leftIconColor = "#999999",
      leftIconSize = 18,
      leftIconSpace = 8,
      rightIconName,
rightIconColor = "#999999",
rightIconSize = 18,
onRightIconPress,

            ...rest
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const [focused, setFocused] = useState(false);

        const isPassword = type === "password" || secureTextEntry;

        return (
            <View className="w-full ">
                <View
                    className={`
            flex-row items-center px-3 rounded-lg border
            ${multiline ? "items-start" : "items-center"}
            ${focused ? "border-primary-main border-2" : "border-gray-medium border"}
            ${error ? "border-red-500" : ""}
            ${!editable ? "opacity-60" : ""}
           
          `}
                    style={{ 
                        height: customHeight || (multiline ? 100 : 50), 
                           alignItems: multiline ? "flex-start" : "center",
                          paddingHorizontal: 8,
                        
                     }}
                >
                    {leftIconName && (
            <Ionicons
              name={leftIconName}
              size={leftIconSize}
              color={leftIconColor}
              style={{ marginRight: leftIconSpace }}
            />
          )}
                    <TextInput
                        ref={ref}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor="#4D4D4D"
                        secureTextEntry={isPassword && !showPassword}
                        editable={editable && !loading}
                        multiline={multiline}
                        textAlignVertical={multiline ? "top" : "center"}
                        className="flex-1 text-gray-black font-inter text-small"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        {...rest}
                    />
                    {rightIconName && !loading && (
  <TouchableOpacity
    onPress={onRightIconPress}
    disabled={!onRightIconPress}
    className="ml-2"
  >
    <Ionicons
      name={rightIconName}
      size={rightIconSize}
      color={rightIconColor}
    />
  </TouchableOpacity>
)}

                    {loading ? (
                        <ActivityIndicator size="small" color="#999" />
                    ) : (
                        showPasswordToggle &&
                        isPassword && (
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="ml-[-20px]"
                            >
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#000"
                                />
                            </TouchableOpacity>
                        )
                    )}
                </View>

                {helperText && (
                    <Text className={`mt-1 text-small ${error ? "text-red-500" : "text-gray-dark"}`}>
                        {helperText}
                    </Text>
                )}
            </View>
        );
    }
);
InputComponent.displayName = 'InputComponent';

export default InputComponent;
