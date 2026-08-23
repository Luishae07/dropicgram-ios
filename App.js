import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/theme";
import { AuthProvider, useAuth } from "./src/AuthContext";
import { getToken, wsUrl } from "./src/api";

import LoginScreen from "./src/screens/LoginScreen";
import FeedScreen from "./src/screens/FeedScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import DMsScreen from "./src/screens/DMsScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import StoriesScreen from "./src/screens/StoriesScreen";
import SearchScreen from "./src/screens/SearchScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.ink,
    border: colors.border,
    primary: colors.accent,
  },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.ink,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarIcon: () => <Text>🏠</Text> }} />
      <Tab.Screen name="Stories" component={StoriesScreen} options={{ tabBarIcon: () => <Text>📸</Text> }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: () => <Text>🔍</Text> }} />
      <Tab.Screen name="DMs" component={DMsScreen} options={{ tabBarIcon: () => <Text>💬</Text> }} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} options={{ tabBarIcon: () => <Text>🔔</Text> }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Thread" component={DMsScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Root />
    </NavigationContainer>
  );
}

function RealTime() {
  const { user } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!user || !getToken()) return;
    let ws;
    try {
      ws = new WebSocket(wsUrl());
    } catch {
      return;
    }
    ws.onmessage = (e) => {
      try {
        const m = JSON.parse(e.data);
        if (m.type === "notification" || m.type === "dm") setTick((t) => t + 1);
      } catch {}
    };
    ws.onclose = () => {
      setTimeout(() => setTick((t) => t + 1), 3000);
    };
    return () => ws?.close();
  }, [user]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <RealTime />
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
