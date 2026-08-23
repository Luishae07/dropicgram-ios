import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { colors } from "../theme";
import { useAuth } from "../AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!username || !password) return setError("Username and password required");
    setBusy(true);
    try {
      await login(username, password, mode);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Dropicgram</Text>
        <Text style={styles.tag}>Share photos and moments with the world</Text>

        <View style={styles.tabs}>
          {["login", "register"].map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => { setMode(m); setError(""); }}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === "login" ? "Log in" : "Sign up"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === "register" && (
          <TextInput
            style={styles.input}
            placeholder="Display name"
            placeholderTextColor={colors.faint}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.faint}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.faint}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={[styles.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
          <Text style={styles.btnText}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, justifyContent: "center", padding: 28 },
  logo: {
    fontSize: 38, fontWeight: "900", color: colors.accent, textAlign: "center", letterSpacing: -0.5,
  },
  tag: { color: colors.muted, textAlign: "center", marginBottom: 28, marginTop: 6, fontSize: 15 },
  tabs: { flexDirection: "row", backgroundColor: colors.bgElev, borderRadius: 999, padding: 4, marginBottom: 18, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.muted, fontWeight: "800" },
  tabTextActive: { color: colors.white },
  input: {
    backgroundColor: colors.bgElev, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, color: colors.ink, marginBottom: 12, fontSize: 15,
  },
  error: { color: colors.danger, textAlign: "center", marginBottom: 10, fontWeight: "700" },
  btn: { backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  btnText: { color: colors.white, fontWeight: "800", fontSize: 16 },
});
