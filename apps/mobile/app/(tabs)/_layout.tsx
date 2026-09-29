import { Tabs, useRouter } from "expo-router";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "../../src/theme";

function PlusButton() {
    var router = useRouter();
    var colors = useColors();
    return (
        <TouchableOpacity
            style={styles.plusWrapper}
            onPress={function () { router.push("/modal/new-post"); }}
            activeOpacity={0.8}
        >
            <View style={[styles.plusButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                <Text style={styles.plusText}>+</Text>
            </View>
        </TouchableOpacity>
    );
}

export default function TabLayout() {
    var colors = useColors();

    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTitleStyle: { fontWeight: "600", color: colors.primary },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 68,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>🏠</Text>; },
                }}
            />
            <Tabs.Screen
                name="connect"
                options={{
                    title: "Connect",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>🌍</Text>; },
                }}
            />
            <Tabs.Screen
                name="new-post"
                options={{
                    title: "",
                    tabBarButton: function () { return <PlusButton />; },
                }}
            />
            <Tabs.Screen
                name="journal"
                options={{
                    title: "Journal",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>💭</Text>; },
                }}
            />
            <Tabs.Screen
                name="you"
                options={{
                    title: "You",
                    tabBarIcon: function () { return <Text style={{ fontSize: 22 }}>👤</Text>; },
                }}
            />
            <Tabs.Screen
                name="goals"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}

var styles = StyleSheet.create({
    plusWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
    plusButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        marginTop: -20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    plusText: { color: "#fff", fontSize: 32, fontWeight: "300", marginTop: -3 },
});