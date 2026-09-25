import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function YouScreen() {
    var router = useRouter();
    var { user, logout } = useAuthStore();

    var handleLogout = function () {
        logout();
        router.replace("/auth/login");
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
                </View>
                <Text style={styles.name}>{user?.name || "Friend"}</Text>
                <Text style={styles.username}>@{user?.username || "user"}</Text>

                <View style={styles.menu}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>⚙️ Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>🔔 Notifications</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>🔒 Privacy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>❓ Help</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

var styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8faf9" },
    content: { padding: 16, gap: 14, alignItems: "center" },
    avatar: { height: 80, width: 80, borderRadius: 40, backgroundColor: "#059669", justifyContent: "center", alignItems: "center", marginTop: 16 },
    avatarText: { fontSize: 32, fontWeight: "700", color: "#fff" },
    name: { fontSize: 20, fontWeight: "700", color: "#111827" },
    username: { fontSize: 14, color: "#6b7280" },
    menu: { width: "100%", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden", marginTop: 8 },
    menuItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
    menuText: { fontSize: 15, color: "#374151" },
    logoutButton: { width: "100%", backgroundColor: "#fff", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#fca5a5", marginTop: 8 },
    logoutText: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
});