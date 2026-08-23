import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../theme";
import { api, assetUrl } from "../api";
import { useAuth } from "../AuthContext";
import PostCard, { Avatar } from "../components/PostCard";

export default function ProfileScreen({ navigation, route }) {
  const { user } = useAuth();
  const username = route.params?.username || user?.username;
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const d = await api(`/api/posts/user/${encodeURIComponent(username)}`);
      setData(d);
    } catch (e) {
      alert(e.message);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [username]));

  const follow = async () => {
    const u = data.user;
    const act = u.is_following ? "unfollow" : "follow";
    try {
      await api(`/api/users/${username}/${act}`, { method: "POST" });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const header = () => {
    if (!data) return null;
    const u = data.user;
    const own = user?.username === u.username;
    return (
      <View>
        {u.cover ? <ImageSource uri={u.cover} /> : null}
        <View style={styles.profileCard}>
          <View style={styles.head}>
            <Avatar u={u} size={72} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{u.display_name} {u.is_verified ? "✓" : ""}</Text>
              <Text style={styles.uname}>@{u.username}</Text>
            </View>
          </View>
          <View style={styles.stats}>
            <Stat n={u.posts_count} label="posts" />
            <Stat n={u.followers_count} label="followers" />
            <Stat n={u.following_count} label="following" />
          </View>
          {u.bio ? <Text style={styles.bio}>{u.bio}</Text> : null}
          {!own ? (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.followBtn, u.is_following && { backgroundColor: colors.card2 }]} onPress={follow}>
                <Text style={styles.followText}>{u.is_following ? "Following ✓" : u.requested ? "Requested ✓" : "Follow"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.msgBtn} onPress={() => navigation.navigate("Thread", { username })}>
                <Text style={styles.msgText}>💬 Message</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={data?.posts || []}
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
      ListHeaderComponent={header}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.accent} />}
      contentContainerStyle={{ padding: 12 }}
    />
  );
}

function ImageSource({ uri }) {
  return null;
}

function Stat({ n, label }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  head: { flexDirection: "row", alignItems: "center", gap: 14 },
  name: { color: colors.ink, fontWeight: "900", fontSize: 20 },
  uname: { color: colors.muted, fontWeight: "600" },
  stats: { flexDirection: "row", gap: 24, marginTop: 12 },
  statN: { color: colors.ink, fontWeight: "900", fontSize: 16 },
  statL: { color: colors.muted, fontSize: 12 },
  bio: { color: colors.muted, marginTop: 10 },
  followBtn: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, flex: 1, alignItems: "center" },
  msgBtn: { backgroundColor: colors.bgElev, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, flex: 1, alignItems: "center" },
  followText: { color: "#fff", fontWeight: "800" },
  msgText: { color: colors.ink, fontWeight: "800" },
});
