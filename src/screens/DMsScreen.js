import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../theme";
import { api, upload } from "../api";
import { useAuth } from "../AuthContext";
import { Avatar } from "../components/PostCard";

export default function DMsScreen({ navigation, route }) {
  const { user } = useAuth();
  const [convs, setConvs] = useState([]);
  const [thread, setThread] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [body, setBody] = useState("");

  const username = route.params?.username || null;

  useFocusEffect(
    useCallback(() => {
      if (!username) {
        api("/api/messages/conversations").then((d) => setConvs(d.conversations)).catch(() => {});
      } else {
        api(`/api/messages/${encodeURIComponent(username)}`).then((d) => setMsgs(d.messages)).catch(() => {});
      }
    }, [username])
  );

  const send = async () => {
    if (!body.trim()) return;
    try {
      await upload(`/api/messages/${encodeURIComponent(username)}`, (() => {
        const fd = new FormData();
        fd.append("body", body.trim());
        return fd;
      })());
      setBody("");
      const d = await api(`/api/messages/${encodeURIComponent(username)}`);
      setMsgs(d.messages);
    } catch (e) {
      alert(e.message);
    }
  };

  if (username) {
    return (
      <View style={styles.wrap}>
        <View style={styles.pageHead}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headTitle}>@{username}</Text>
        </View>
        <FlatList
          style={{ flex: 1 }}
          data={msgs}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.msg, item.sender === "me" ? styles.msgMe : styles.msgThem]}>
              {item.body ? <Text style={item.sender === "me" ? styles.msgTextMe : styles.msgTextThem}>{item.body}</Text> : null}
              <Text style={styles.msgTime}>{item.read && item.sender === "me" ? "✓✓" : ""}</Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Message…" placeholderTextColor={colors.faint} value={body} onChangeText={setBody} />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={convs}
      keyExtractor={(c) => c.other.username}
      contentContainerStyle={{ padding: 12 }}
      ListHeaderComponent={<Text style={styles.title}>Messages</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.conv} onPress={() => navigation.navigate("Thread", { username: item.other.username })}>
          <Avatar u={item.other} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.convName}>{item.other.display_name}</Text>
            <Text style={styles.convLast} numberOfLines={1}>{item.last_message}</Text>
          </View>
          <Text style={styles.convTime}>{item.unread ? `● ${item.unread}` : ""}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  pageHead: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  back: { color: colors.accent, fontSize: 22, fontWeight: "900" },
  headTitle: { color: colors.ink, fontWeight: "900", fontSize: 18 },
  title: { color: colors.ink, fontWeight: "900", fontSize: 22, marginBottom: 12 },
  conv: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  convName: { color: colors.ink, fontWeight: "800" },
  convLast: { color: colors.muted, fontSize: 13 },
  convTime: { color: colors.accent, fontWeight: "800" },
  msg: { maxWidth: "80%", padding: 12, borderRadius: 16, marginBottom: 8 },
  msgMe: { alignSelf: "flex-end", backgroundColor: colors.accent },
  msgThem: { alignSelf: "flex-start", backgroundColor: colors.card2 },
  msgTextMe: { color: "#fff", fontSize: 15 },
  msgTextThem: { color: colors.ink, fontSize: 15 },
  msgTime: { color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 3 },
  inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.bgElev, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 12, color: colors.ink, borderWidth: 1, borderColor: colors.border },
  sendBtn: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 18, justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "800" },
});
