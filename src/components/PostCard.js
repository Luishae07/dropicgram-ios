import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, FlatList } from "react-native";
import { colors } from "../theme";
import { api, assetUrl, timeAgo } from "../api";
import { useAuth } from "../AuthContext";

function Avatar({ u, size = 36 }) {
  const initial = (u?.display_name || u?.username || "?").charAt(0).toUpperCase();
  return u?.avatar ? (
    <Image source={{ uri: assetUrl(u.avatar) }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.card2 }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.4 }}>{initial}</Text>
    </View>
  );
}

export { Avatar };

export default function PostCard({ post, onNavigate, onRefresh }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [p, setP] = useState(post);

  const like = async () => {
    if (!user) return;
    const act = p.liked_by_me ? "unlike" : "like";
    setP({ ...p, liked_by_me: !p.liked_by_me, likes_count: p.likes_count + (p.liked_by_me ? -1 : 1) });
    try {
      const d = await api(`/api/posts/${p.id}/${act}`, { method: "POST" });
      setP(d.post);
    } catch {}
  };

  const sendComment = async () => {
    if (!comment.trim()) return;
    setBusy(true);
    try {
      const d = await api(`/api/posts/${p.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: comment }),
      });
      setP(d.post);
      setComment("");
    } catch (e) {
      alert(e.message);
    }
    setBusy(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate(`/u/${p.username}`)}>
          <Avatar u={p} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate(`/u/${p.username}`)} style={{ flex: 1 }}>
          <Text style={styles.name}>{p.display_name} {p.is_verified ? "✓" : ""}</Text>
          <Text style={styles.uname}>@{p.username}</Text>
        </TouchableOpacity>
        <Text style={styles.time}>{timeAgo(p.created_at)}</Text>
      </View>

      {p.image ? (
        <TouchableOpacity activeOpacity={0.9} onPress={like}>
          <Image source={{ uri: assetUrl(p.image) }} style={styles.img} resizeMode="cover" />
        </TouchableOpacity>
      ) : null}

      {p.body ? <Text style={styles.body}>{p.body}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actBtn} onPress={like}>
          <Text style={[styles.actText, p.liked_by_me && { color: colors.accent }]}>
            {p.liked_by_me ? "♥" : "♡"} {p.likes_count}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actBtn} onPress={() => setShowComments(!showComments)}>
          <Text style={styles.actText}>💬 {p.comments_count}</Text>
        </TouchableOpacity>
      </View>

      {showComments ? (
        <View style={styles.comments}>
          {p.comments?.map((c) => (
            <View key={c.id} style={styles.comment}>
              <Avatar u={c} size={26} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cname}>{c.display_name} <Text style={styles.ctime}>{timeAgo(c.created_at)}</Text></Text>
                <Text style={styles.cbody}>{c.body}</Text>
              </View>
            </View>
          ))}
          {user ? (
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment…"
                placeholderTextColor={colors.faint}
                value={comment}
                onChangeText={setComment}
              />
              <TouchableOpacity style={styles.commentSend} onPress={sendComment} disabled={busy}>
                <Text style={styles.commentSendText}>Post</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  name: { color: colors.ink, fontWeight: "800", fontSize: 15 },
  uname: { color: colors.muted, fontSize: 13 },
  time: { color: colors.faint, fontSize: 12 },
  img: { width: "100%", aspectRatio: 1.5, backgroundColor: "#000" },
  body: { padding: 14, color: colors.ink, fontSize: 15 },
  actions: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderTopColor: colors.border },
  actBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  actText: { color: colors.ink, fontWeight: "800", fontSize: 15 },
  comments: { padding: 14, borderTopWidth: 1, borderTopColor: colors.border },
  comment: { flexDirection: "row", gap: 8, marginBottom: 10 },
  cname: { color: colors.ink, fontWeight: "800", fontSize: 13 },
  ctime: { color: colors.faint, fontSize: 11, fontWeight: "500" },
  cbody: { color: colors.ink, fontSize: 14, marginTop: 2 },
  commentInputRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  commentInput: { flex: 1, backgroundColor: colors.bgElev, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, color: colors.ink, borderWidth: 1, borderColor: colors.border },
  commentSend: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 18, justifyContent: "center" },
  commentSendText: { color: "#fff", fontWeight: "800" },
});
