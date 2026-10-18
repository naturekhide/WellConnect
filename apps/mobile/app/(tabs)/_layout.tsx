import React from "react";
import { Tabs, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useColors } from "../../src/theme";

export default function TabsLayout() {
    var colors = useColors();
    var router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: Platform.OS === "ios" ? 88 : 65,
                    paddingBottom: Platform.OS === "ios" ? 24 : 10,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "500",
                    marginTop: 2,
                },
            }}
        >
            {/* 1. HOME */}
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>🏠</Text>; },
                }}
            />

            {/* 2. CONNECT */}
            <Tabs.Screen
                name="connect"
                options={{
                    title: "Connect",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>🌍</Text>; },
                }}
            />

            {/* 3. + BUTTON */}
            <Tabs.Screen
                name="new-post"
                options={{
                    title: "",
                    tabBarButton: function () {
                        return (
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onPress={function () { router.push("/feed/new"); }} // <--- FIXED ROUTE HERE
                            >
                                <View
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 26,
                                        backgroundColor: colors.primary,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginTop: -20,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 4,
                                        elevation: 5,
                                    }}
                                >
                                    <Text style={{ fontSize: 28, color: "#fff", marginTop: -2 }}>+</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    },
                }}
            />

            {/* 4. JOURNAL */}
            <Tabs.Screen
                name="journal"
                options={{
                    title: "Journal",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>📝</Text>; },
                }}
            />

            {/* 5. YOU */}
            <Tabs.Screen
                name="you"
                options={{
                    title: "You",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>👤</Text>; },
                }}
            />

            {/* HIDDEN SCREENS */}
            <Tabs.Screen name="goals" options={{ href: null }} />
        </Tabs>
    );
}