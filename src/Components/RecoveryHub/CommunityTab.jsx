import { useState, useEffect } from "react";
import { PenLine, MessageSquare, CornerDownRight, Send, X, Sparkles, ChevronDown, Loader } from "lucide-react";
import { getCommunityPosts, createCommunityPost } from "../../API/recovery";

const font = "'Manrope', sans-serif";

export default function CommunityTab() {
  const [posts, setPosts]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [newPostText, setNewPostText]     = useState("");
  const [replyInputs, setReplyInputs]     = useState({});
  const [expandedReplies, setExpanded]    = useState([]);
  const [openReplyInput, setOpenReply]    = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await getCommunityPosts();
        setPosts(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch community posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  async function handlePost() {
    if (!newPostText.trim()) return;
    try {
      const res = await createCommunityPost({ content: newPostText.trim() });
      setPosts(prev => [res.data.data, ...prev]);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
    setNewPostText(""); setShowModal(false);
  }

  function handleReply(postId) {
    const text = replyInputs[postId]?.trim();
    if (!text) return;
    setPosts(prev => prev.map(p => p.id === postId || p._id === postId
      ? { ...p, replies: [...(p.replies || []), { id: Date.now(), content: text, timeAgo: "Just now" }] } : p));
    setReplyInputs(prev => ({ ...prev, [postId]: "" }));
    setOpenReply(null);
  }

  function toggleReplies(id) {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div style={{ fontFamily: font, display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Title */}
      <div>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 600, color: "#111", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Stories from<br /><em style={{ fontStyle: "italic", fontWeight: 400, color: "#555" }}>women like you.</em>
        </p>
        <p style={{ fontSize: 13, color: "#aaa", fontWeight: 300, marginBottom: 0 }}>Anonymous. Safe. Real.</p>
      </div>

      {/* Daily prompt */}
      <div style={{ borderLeft: "3px solid #16a34a", paddingLeft: 14, paddingTop: 12, paddingBottom: 12, paddingRight: 12, background: "#f0fdf4", borderRadius: "0 14px 14px 0", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Sparkles size={14} color="#16a34a" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>
          <span style={{ fontWeight: 600, color: "#16a34a" }}>Today's reflection</span> — Many women have found that writing down one small thing they noticed today, no matter how small, helps during recovery. Would you like to share yours?
        </p>
      </div>

      {/* Share button */}
      <button onClick={() => setShowModal(true)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "14px 18px", border: "1.5px solid #e5e7eb", borderRadius: 16,
        fontSize: 14, fontWeight: 500, color: "#111", background: "#fff",
        cursor: "pointer", fontFamily: font, transition: "border-color 0.15s",
      }}>
        Share your story
        <PenLine size={15} strokeWidth={1.8} color="#9ca3af" />
      </button>

      {/* Posts */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <Loader size={20} className="animate-spin" color="#aaa" />
        </div>
      ) : posts.length === 0 ? (
        <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "32px 0", lineHeight: 1.7 }}>
          Be the first to share.<br />Your story might be exactly what someone else needs to hear.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {posts.map(post => (
            <div key={post.id || post._id} style={{ border: "1.5px solid #e8e6e1", borderRadius: 20, padding: "18px", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>Anonymous</span>
                <span style={{ fontSize: 12, color: "#bbb" }}>{post.timeAgo}</span>
              </div>
              <p style={{ fontSize: 14, color: "#111", lineHeight: 1.7, marginBottom: 16 }}>{post.content}</p>
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <button onClick={() => toggleReplies(post.id || post._id)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontFamily: font, padding: 0 }}>
                  <MessageSquare size={13} strokeWidth={1.8} />
                  {(post.replies || []).length} {(post.replies || []).length === 1 ? "reply" : "replies"}
                  {(post.replies || []).length > 0 && (
                    <ChevronDown size={11} strokeWidth={2.5} style={{ transform: expandedReplies.includes(post.id || post._id) ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  )}
                </button>
                <button onClick={() => setOpenReply(openReplyInput === (post.id || post._id) ? null : (post.id || post._id))} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontFamily: font, padding: 0 }}>
                  <CornerDownRight size={13} strokeWidth={1.8} /> Reply
                </button>
              </div>

              {expandedReplies.includes(post.id || post._id) && (post.replies || []).length > 0 && (
                <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 14, paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  {post.replies.map(r => (
                    <div key={r.id || r._id} style={{ background: "#f9fafb", borderRadius: 12, padding: "11px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "#bbb", fontWeight: 500 }}>Anonymous</span>
                        <span style={{ fontSize: 11, color: "#bbb" }}>{r.timeAgo}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{r.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {openReplyInput === (post.id || post._id) && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid #f3f4f6", marginTop: 14, paddingTop: 14 }}>
                  <input value={replyInputs[post.id || post._id] || ""} onChange={e => setReplyInputs(p => ({ ...p, [post.id || post._id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleReply(post.id || post._id)}
                    placeholder="Write a reply..."
                    style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#111", fontFamily: font, outline: "none", background: "#fff" }}
                  />
                  <button onClick={() => handleReply(post.id || post._id)} style={{ padding: "10px", background: "#111", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <Send size={13} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal — centered, safe from bottom nav */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.45)", padding: "20px",
        }}>
          <div style={{
            background: "#fff", borderRadius: 28, width: "100%",
            maxWidth: 560, padding: 28, display: "flex",
            flexDirection: "column", gap: 18,
            boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 4, fontFamily: font }}>Share with the community</p>
                <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: font }}>You are anonymous. No one will know who you are.</p>
              </div>
              <button onClick={() => { setShowModal(false); setNewPostText(""); }} style={{ padding: 7, borderRadius: "50%", border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={15} strokeWidth={2} color="#6b7280" />
              </button>
            </div>
            <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} rows={5} placeholder="Share what is on your heart..." autoFocus
              style={{ width: "100%", resize: "none", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "14px 16px", fontSize: 14, color: "#111", fontFamily: font, outline: "none", boxSizing: "border-box", lineHeight: 1.65 }}
            />
            <button onClick={handlePost} style={{ width: "100%", padding: "14px", background: "#111", color: "#fff", border: "none", borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}