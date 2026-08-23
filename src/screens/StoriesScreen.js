import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../theme";
import { api, upload, assetUrl } from "../api";
import { Avatar } from "../components/PostCard";

export default function StoriesScreen() {
  const [stories, setStories] = useState([]);

  const load = async () => {
    try {
      const d = await api("/api/stories");
      setStories(d.stories);
    } catch {}
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const addStory = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    const uri = r.assets?.[0]?.uri;
    if (!uri) return;
    const fd = new FormData();
    fd.append("image", { uri, name: uri.split("/").pop(), type: "image/jpeg" });
    try {
      await upload("/api/stories", fd);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const openStory = (story) => {
    Alert.alert(story.display_name, "", [
      { text: "Close", style: "cancel" },
    ]);
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={stories}
      keyExtractor={(s) => String(s.id)}
      contentContainerStyle={{ padding: 12 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Stories</Text>
          <TouchableOpacity style={styles.addBtn} onPress={addStory}>
            <Text style={styles.addText}>+ Add story</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.story}>
          <Avatar u={item} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.display_name}</Text>
            <Text style={styles.views}>{item.views} views · 24h</Text>
          </View>
          <TouchableOpacity onPress={openStory(item)}>
            <Image source={{ uri: assetUrl(item.image) }} style={styles.thumb} />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No stories yet. Post one!</Text>}
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { color: colors.ink, fontWeight: "900", fontSize: 22 },
  addBtn: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  addText: { color: "#fff", fontWeight: "800" },
  story: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  name: { color: colors.ink, fontWeight: "800" },
  views: { color: colors.muted, fontSize: 12 },
  thumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: colors.card2 },
  empty: { color: colors.muted, textAlign: "center", padding: 40 },
});
