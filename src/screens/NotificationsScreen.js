import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../theme";
import { api, timeAgo } from "../api";
import { Avatar } from "../components/PostCard";

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      api("/api/notifications").then((d) => setItems(d.notifications)).catch(() => {});
    }, [])
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={items}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={{ padding: 12 }}
      ListHeaderComponent={<Text style={styles.title}>Notifications</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity style={[styles.notif, !item.read && styles.unread]} onPress={() => item.post_id && navigation.navigate(`/post/${item.post_id}`)}>
          <Avatar u={item.actor} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.body}>
              <Text style={styles.name}>{item.actor.display_name}</Text> {item.label}
            </Text>
            <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontWeight: "900", fontSize: 22, marginBottom: 12 },
  notif: { flexDirection: "row", gap: 12, backgroundColor: colors.card, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  unread: { borderLeftWidth: 3, borderLeftColor: colors.accent },
  name: { color: colors.ink, fontWeight: "800" },
  body: { color: colors.ink, fontSize: 14 },
  time: { color: colors.faint, fontSize: 12, marginTop: 2 },
});
