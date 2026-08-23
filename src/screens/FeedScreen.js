import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../theme";
import { api, upload } from "../api";
import { useAuth } from "../AuthContext";
import PostCard from "../components/PostCard";

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    try {
      const d = await api("/api/posts/feed");
      setPosts(d.posts);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    return r.assets?.[0];
  };

  const makePost = async (imageUri) => {
    const fd = new FormData();
    if (body.trim()) fd.append("body", body.trim());
    if (imageUri) {
      const name = imageUri.split("/").pop();
      fd.append("image", { uri: imageUri, name, type: "image/jpeg" });
    }
    setPosting(true);
    try {
      await upload("/api/posts", fd);
      setBody("");
      await load();
    } catch (e) {
      if (e.status === 409 && e.body?.original_username) {
        alert(`Already uploaded by @${e.body.original_username}`);
      } else {
        alert(e.message);
      }
    }
    setPosting(false);
  };

  const renderHeader = () => (
    <View style={styles.compose}>
      <Text style={styles.logo}>Dropicgram</Text>
      <TextInput
        style={styles.input}
        placeholder="Share something…"
        placeholderTextColor={colors.faint}
        value={body}
        onChangeText={setBody}
        multiline
      />
      <View style={styles.composeRow}>
        <TouchableOpacity
          style={[styles.pickBtn, (posting || (!body.trim() && posts.length === 0 && false)) && {}]}
          onPress={async () => {
            const img = await pickImage();
            if (img) await makePost(img.uri);
          }}
        >
          <Text style={styles.pickText}>📷 Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => makePost(null)}
          disabled={posting || !body.trim()}
        >
          <Text style={styles.postBtnText}>{posting ? "…" : "Post"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={posts}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onNavigate={(p) => {
            if (p.startsWith("/u/")) navigation.navigate("Profile", { username: p.slice(3) });
            else if (p.startsWith("/dm/")) navigation.navigate("Thread", { username: p.slice(4) });
          }}
        />
      )}
      ListHeaderComponent={renderHeader}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.accent} />}
      ListEmptyComponent={<Text style={styles.empty}>Nothing here yet. Follow people or post your first pic!</Text>}
      contentContainerStyle={{ padding: 12 }}
    />
  );
}

const styles = StyleSheet.create({
  compose: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  logo: { fontSize: 18, fontWeight: "900", color: colors.accent, marginBottom: 10 },
  input: { backgroundColor: colors.bgElev, borderRadius: 12, padding: 12, color: colors.ink, fontSize: 15, minHeight: 60, textAlignVertical: "top", borderWidth: 1, borderColor: colors.border },
  composeRow: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
  pickBtn: { backgroundColor: colors.bgElev, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  pickText: { color: colors.ink, fontWeight: "700" },
  postBtn: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, marginLeft: "auto" },
  postBtnText: { color: "#fff", fontWeight: "800" },
  empty: { color: colors.muted, textAlign: "center", padding: 40 },
});
