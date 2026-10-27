import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors, spacing, radius } from "../../src/theme";

export default function TabLayout() {
    var colors = useColors();
    var router = useRouter();
    var [showComposeMenu, setShowComposeMenu] = useState(false);

    var menuItems = [
        {
            title: "Share a Moment",
            subtitle: "Post to the community feed",
            emoji: "✨",
            route: "/compose/moment"
        },
        {
            title: "Mood Check-in",
            subtitle: "How are you feeling?",
            emoji: "🧠",
            route: "/(tabs)/home"
        },
        {
            title: "Write Journal",
            subtitle: "Reflect on your day",
            emoji: "📝",
            route: "/(tabs)/journal"
        },
        {
            title: "Add Goal",
            subtitle: "Track something new",
            emoji: "🎯",
            route: "/(tabs)/goals"
        }
    ];

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: colors.background,
                        borderTopColor: colors.border,
                        height: 70,
                        paddingBottom: 10,
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textSecondary,
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Home",
                        tabBarIcon: function ({ color }) {
                            return <Ionicons name="home" size={24} color={color} />;
                        },
                    }}
                />
                <Tabs.Screen
                    name="connect"
                    options={{
                        title: "Connect",
                        tabBarIcon: function ({ color }) {
                            return <Ionicons name="globe" size={24} color={color} />;
                        },
                    }}
                />

                {/* 🚨 UPDATED: Using your actual filename 'new-post' */}
                <Tabs.Screen
                    name="new-post"
                    options={{
                        title: "",
                        tabBarIcon: function () {
                            return (
                                <View style={{
                                    width: 50, height: 50, borderRadius: 25,
                                    backgroundColor: colors.primary,
                                    justifyContent: "center", alignItems: "center",
                                    marginTop: -15,
                                    shadowColor: colors.primary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 5,
                                    elevation: 5,
                                }}>
                                    <Ionicons name="add" size={30} color="#fff" />
                                </View>
                            );
                        },
                    }}
                    listeners={{
                        tabPress: function (e) {
                            // Prevent default navigation to the new-post screen
                            e.preventDefault();
                            // Open our custom bottom sheet instead
                            setShowComposeMenu(true);
                        },
                    }}
                />

                <Tabs.Screen
                    name="journal"
                    options={{
                        title: "Journal",
                        tabBarIcon: function ({ color }) {
                            return <Ionicons name="book" size={24} color={color} />;
                        },
                    }}
                />

                {/* 🚨 UPDATED: Using your actual filename 'you' */}
                <Tabs.Screen
                    name="you"
                    options={{
                        title: "You",
                        tabBarIcon: function ({ color }) {
                            return <Ionicons name="person" size={24} color={color} />;
                        },
                    }}
                />

                {/* Hide the 'goals' tab from the bottom bar so it doesn't show up as an extra tab */}
                <Tabs.Screen
                    name="goals"
                    options={{
                        href: null, // This hides it from the tab bar
                    }}
                />
            </Tabs>

            {/* 🚨 THE CUSTOM COMPOSE MENU (Bottom Sheet) */}
            <Modal
                visible={showComposeMenu}
                transparent={true}
                animationType="slide"
                onRequestClose={function () { setShowComposeMenu(false); }}
            >
                <View style={styles.modalContainer}>
                    {/* Clicking the dark background closes the menu */}
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={function () { setShowComposeMenu(false); }}
                    />

                    <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>What's on your mind?</Text>
                            <TouchableOpacity
                                onPress={function () { setShowComposeMenu(false); }}
                                style={[styles.closeBtn, { backgroundColor: colors.surface }]}
                            >
                                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ gap: spacing.sm }}>
                            {menuItems.map(function (item, index) {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={function () {
                                            setShowComposeMenu(false); // Close menu first
                                            setTimeout(function () { router.push(item.route as any); }, 100);
                                        }}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                                            <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                            <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                                        </View>
                                        <Text style={{ color: colors.textTertiary, fontSize: 20 }}>›</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

var styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
    sheet: {
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        padding: spacing.lg,
        paddingBottom: 40,
        borderWidth: 1,
        borderBottomWidth: 0
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
    title: { fontSize: 18, fontWeight: "700" },
    closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    menuItem: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md },
    iconContainer: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    itemTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    itemSub: { fontSize: 13 },
});