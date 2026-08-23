import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme";
import { api } from "../api";
import { Avatar } from "../components/PostCard";

export default function SearchScreen({ navigation }) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    try {
      const d = await api(`/api/search?q=${encodeURIComponent(q.trim())}`);
      setUsers(d.users);
      setSearched(true);
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search people…"
          placeholderTextColor={colors.faint}
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.btn} onPress={search}>
          <Text style={styles.btnText}>Search</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate(`/u/${item.username}`)}>
            <Avatar u={item} size={40} />
            <View>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.uname}>@{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          searched ? <Text style={styles.empty}>No users found</Text> : <Text style={styles.empty}>Search for someone</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: "row", gap: 8, padding: 12 },
  input: { flex: 1, backgroundColor: colors.bgElev, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, color: colors.ink, borderWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 16, justifyContent: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  name: { color: colors.ink, fontWeight: "800" },
  uname: { color: colors.muted },
  empty: { color: colors.muted, textAlign: "center", padding: 40 },
});
