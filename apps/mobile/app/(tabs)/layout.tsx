import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: "#f0f2f5" },
      headerTitleStyle: { fontWeight: "bold", color: "#16a34a" },
      tabBarActiveTintColor: "#16a34a",
      tabBarInactiveTintColor: "#6b7280",
      tabBarStyle: { backgroundColor: "#f0f2f5", borderTopColor: "#d1d5db" },
    }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: "🌱 Feed",
          headerTitle: "WellConnect",
          tabBarIcon: function() { return <Text style={{ fontSize: 20 }}>🏠</Text>; },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: function() { return <Text style={{ fontSize: 20 }}>💬</Text>; },
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: function() { return <Text style={{ fontSize: 20 }}>🧠</Text>; },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: function() { return <Text style={{ fontSize: 20 }}>👤</Text>; },
        }}
      />
    </Tabs>
  );
}