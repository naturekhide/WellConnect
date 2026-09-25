import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            headerStyle: { backgroundColor: "#f8faf9" },
            headerTitleStyle: { fontWeight: "600", color: "#059669" },
            tabBarActiveTintColor: "#059669",
            tabBarInactiveTintColor: "#9ca3af",
            tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e5e7eb", paddingBottom: 4, height: 60 },
            tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerTitle: "WellConnect",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>🏠</Text>; },
                }}
            />
            <Tabs.Screen
                name="journal"
                options={{
                    title: "Journal",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>📝</Text>; },
                }}
            />
            <Tabs.Screen
                name="goals"
                options={{
                    title: "Goals",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>🎯</Text>; },
                }}
            />
            <Tabs.Screen
                name="you"
                options={{
                    title: "You",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>👤</Text>; },
                }}
            />
        </Tabs>
    );
}