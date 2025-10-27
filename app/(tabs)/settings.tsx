import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Units = "metric" | "imperial";
type GoalType = "lose" | "gain" | "maintain";

type Settings = {
    name: string;
    email: string;
    avatar?: string; // uri
    goalType: GoalType;
    targetWeight: number | "";
    weeklyWorkouts: number;
    units: Units;
    reminders: boolean;
    weeklySummary: boolean;
    publicProfile: boolean;
    plan: "free" | "pro" | "premium";
};

const defaultSettings: Settings = {
    name: "",
    email: "",
    avatar: undefined,
    goalType: "maintain",
    targetWeight: "",
    weeklyWorkouts: 3,
    units: "metric",
    reminders: true,
    weeklySummary: true,
    publicProfile: false,
    plan: "free",
};

const storageKey = "gymapp.settings.v1";

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(storageKey);
                if (raw) {
                    const parsed = JSON.parse(raw) as Settings;
                    setSettings((s) => ({ ...s, ...parsed }));
                }
            } catch (err) {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (status) {
            const t = setTimeout(() => setStatus(null), 2500);
            return () => clearTimeout(t);
        }
    }, [status]);

    function update<K extends keyof Settings>(key: K, value: Settings[K]) {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave() {
        setSaving(true);
        try {
            await AsyncStorage.setItem(storageKey, JSON.stringify(settings));
            setStatus("Settings saved");
        } catch {
            setStatus("Failed to save settings");
        } finally {
            setSaving(false);
        }
    }

    async function pickAvatar() {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission required", "Camera roll permission is required to choose an avatar.");
                return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                quality: 0.6,
                allowsMultipleSelection: false,
            });
            // Newer Expo ImagePicker returns an `assets` array; each asset has a `uri`.
            if (!res.canceled && res.assets && res.assets.length > 0) {
                update("avatar", res.assets[0].uri);
            }
        } catch {
            // ignore
        }
    }

    function removeAvatar() {
        update("avatar", undefined);
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.subheading}>Profile</Text>
                <View style={styles.row}>
                    <View style={styles.avatarCol}>
                        <View style={styles.avatarPreview}>
                            {settings.avatar ? (
                                <Image source={{ uri: settings.avatar }} style={styles.avatarImg} />
                            ) : (
                                <Text style={styles.avatarPlaceholder}>No avatar</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={pickAvatar} style={styles.linkButton}>
                            <Text style={styles.linkButtonText}>Choose avatar</Text>
                        </TouchableOpacity>
                        {settings.avatar && (
                            <TouchableOpacity onPress={removeAvatar} style={[styles.linkButton, styles.removeBtn]}>
                                <Text style={styles.linkButtonText}>Remove</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.col}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.name}
                            onChangeText={(t) => update("name", t)}
                            placeholder="Your name"
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.email}
                            onChangeText={(t) => update("email", t)}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.subheading}>Goals</Text>
                <View style={styles.rowWrap}>
                    <View style={styles.inline}>
                        <Text style={styles.inlineLabel}>Goal</Text>
                        <View style={styles.optionRow}>
                            {(["lose", "gain", "maintain"] as GoalType[]).map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => update("goalType", g)}
                                    style={[styles.optionButton, settings.goalType === g && styles.optionActive]}
                                >
                                    <Text style={styles.optionText}>
                                        {g === "lose" ? "Lose" : g === "gain" ? "Gain" : "Maintain"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inline}>
                        <Text style={styles.inlineLabel}>Target weight ({settings.units === "metric" ? "kg" : "lb"})</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.targetWeight === "" ? "" : String(settings.targetWeight)}
                            onChangeText={(t) => update("targetWeight", t === "" ? "" : Number(t))}
                            placeholder={settings.units === "metric" ? "e.g. 70.0" : "e.g. 154"}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inline}>
                        <Text style={styles.inlineLabel}>Weekly workouts</Text>
                        <View style={styles.rowBetween}>
                            <TouchableOpacity
                                onPress={() => update("weeklyWorkouts", Math.max(0, settings.weeklyWorkouts - 1))}
                                style={styles.smallBtn}
                            >
                                <Text>-</Text>
                            </TouchableOpacity>
                            <Text style={{ marginHorizontal: 12 }}>{settings.weeklyWorkouts} sessions / week</Text>
                            <TouchableOpacity
                                onPress={() => update("weeklyWorkouts", Math.min(14, settings.weeklyWorkouts + 1))}
                                style={styles.smallBtn}
                            >
                                <Text>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.subheading}>Units & Notifications</Text>
                <View style={styles.rowWrap}>
                    <View style={styles.inline}>
                        <Text style={styles.inlineLabel}>Units</Text>
                        <View style={styles.optionRow}>
                            {(["metric", "imperial"] as Units[]).map((u) => (
                                <TouchableOpacity
                                    key={u}
                                    onPress={() => update("units", u)}
                                    style={[styles.optionButton, settings.units === u && styles.optionActive]}
                                >
                                    <Text style={styles.optionText}>
                                        {u === "metric" ? "Metric (kg, km)" : "Imperial (lb, mi)"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.inline, { alignItems: "flex-start" }]}>
                        <Text style={{ marginBottom: 6 }}>Notifications</Text>
                        <View style={styles.toggleRow}>
                            <Switch value={settings.reminders} onValueChange={(v) => update("reminders", v)} />
                            <Text style={styles.toggleLabel}> Class reminders</Text>
                        </View>
                        <View style={styles.toggleRow}>
                            <Switch value={settings.weeklySummary} onValueChange={(v) => update("weeklySummary", v)} />
                            <Text style={styles.toggleLabel}> Weekly summary (email)</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.subheading}>Privacy & Subscription</Text>
                <View style={styles.rowWrap}>
                    <View style={styles.inline}>
                        <Text style={styles.inlineLabel}>Public profile</Text>
                        <View style={styles.toggleRow}>
                            <Switch value={settings.publicProfile} onValueChange={(v) => update("publicProfile", v)} />
                            <Text style={{ marginLeft: 8 }}>Allow others to view my profile and achievements</Text>
                        </View>
                    </View>

                    <View style={styles.inline}>
                        <Text style={styles.inlineLabel}>Plan</Text>
                        <View style={{ flexDirection: "row", marginTop: 8 }}>
                            {(["free", "pro", "premium"] as Settings["plan"][]).map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => update("plan", p)}
                                    style={[styles.planBtn, settings.plan === p && styles.planActive]}
                                >
                                    <Text>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={{ marginTop: 8, color: "#666" }}>Manage billing in your account</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity onPress={handleSave} style={styles.primaryButton} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Save changes</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        setSettings(defaultSettings);
                        setStatus("Restored defaults");
                    }}
                    style={styles.ghostButton}
                >
                    <Text>Restore defaults</Text>
                </TouchableOpacity>

                <View style={{ marginLeft: 12, minWidth: 140 }}>
                    {status ? <Text style={{ color: "#2d8f2d" }}>{status}</Text> : <Text />}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    container: { padding: 20, paddingBottom: 40, backgroundColor: "#fff" },
    heading: { fontSize: 28, marginBottom: 12, color: "#111" },
    section: { padding: 14, borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 8, backgroundColor: "#fff", marginBottom: 12 },
    subheading: { fontSize: 16, marginBottom: 8 },
    row: { flexDirection: "row", alignItems: "flex-start" },
    rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 as any },
    avatarCol: { width: 140, alignItems: "flex-start" },
    avatarPreview: { width: 96, height: 96, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#ddd", justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" },
    avatarImg: { width: "100%", height: "100%", resizeMode: "cover" as any },
    avatarPlaceholder: { fontSize: 12, color: "#888" },
    linkButton: { marginTop: 8, paddingVertical: 6 },
    removeBtn: { marginTop: 4 },
    linkButtonText: { color: "#0070f3" },
    col: { flex: 1, marginLeft: 12 },
    label: { fontSize: 13, marginBottom: 6 },
    input: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#dcdcdc", marginBottom: 8 },
    inline: { width: 260, marginRight: 12 },
    inlineLabel: { fontSize: 13, marginBottom: 6 },
    optionRow: { flexDirection: "row", flexWrap: "wrap" },
    optionButton: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginRight: 8, marginBottom: 8 },
    optionActive: { borderColor: "#0070f3", backgroundColor: "rgba(0,112,243,0.08)" },
    optionText: { fontSize: 13 },
    rowBetween: { flexDirection: "row", alignItems: "center" },
    smallBtn: { padding: 8, borderWidth: 1, borderColor: "#ddd", borderRadius: 6 },
    toggleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    toggleLabel: { marginLeft: 6 },
    planBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", marginRight: 8 },
    planActive: { borderColor: "#0070f3", backgroundColor: "rgba(0,112,243,0.08)" },
    actions: { flexDirection: "row", alignItems: "center", marginTop: 12 },
    primaryButton: { backgroundColor: "#0070f3", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
    primaryText: { color: "#fff", fontWeight: "600" },
    ghostButton: { marginLeft: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
});