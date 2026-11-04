import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

export default function AppStackLayout() {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  if (!accessToken) {
    return <Redirect href="/auth/login/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat-room" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="JobDetails" />
      <Stack.Screen name="Profile" />
    </Stack>
  );
}
