import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MessageSquare, CornerDownRight, Send,
  ChevronDown, Loader, Shield, User,
} from "lucide-react";
import NavCHW from "../../Components/NavCHW";
import { getCHWCommunityPosts, replyToPostAsCHW } from "../../API/chw";

export default function CHWCommunity() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState({});
  const [expandedReplies, setExpanded] = useState([]);
  const [openReplyInput, setOpenReply] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await getCHWCommunityPosts();
        setPosts(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch community posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  async function handleReply(postId) {
    const text = (replyInputs[postId] || "").trim();
    if (!text) return;
    try {
      const res = await replyToPostAsCHW(postId, text);
      const newReply = res.data.data;
      setPosts((prev) =>
        prev.map((p) =>
          (p.id === postId || p._id === postId)
            ? { ...p, replies: [...(p.replies || []), newReply] }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to reply:", err);
    }
    setReplyInputs((prev) => ({ ...prev, [postId]: "" }));
    setOpenReply(null);
  }

  function toggleReplies(id) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  if (loading) {
    return (
      <>
        <NavCHW />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader size={24} className="animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavCHW />

      <div className="min-h-screen bg-gray-50 font-['Manrope'] pb-28">
        <div className="md:ml-64">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => navigate("/chw")}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Community</h1>
                <div className="w-9" />
              </div>
              <p className="text-xs text-gray-500">
                Anonymous patient posts. Reply as a health worker — your name will be shown.
              </p>
            </div>
          </div>

          {/* Posts */}
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No community posts yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Posts will appear here as patients share.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const postId = post.id || post._id;
                  const replyCount = (post.replies || []).length;

                  return (
                    <div
                      key={postId}
                      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
                    >
                      {/* Post header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <User size={13} className="text-gray-400" />
                          </div>
                          <span className="text-xs font-medium text-gray-400">
                            Anonymous
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{post.timeAgo}</span>
                      </div>

                      {/* Post content */}
                      <p className="text-sm text-gray-800 leading-relaxed mb-4">
                        {post.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleReplies(postId)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
                        >
                          <MessageSquare size={13} />
                          {replyCount} {replyCount === 1 ? "reply" : "replies"}
                          {replyCount > 0 && (
                            <ChevronDown
                              size={11}
                              className={`transition-transform ${
                                expandedReplies.includes(postId) ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setOpenReply(
                              openReplyInput === postId ? null : postId
                            )
                          }
                          className="flex items-center gap-1.5 text-xs text-green-600 font-medium hover:text-green-700 transition"
                        >
                          <CornerDownRight size={13} />
                          Reply as health worker
                        </button>
                      </div>

                      {/* Replies */}
                      {expandedReplies.includes(postId) && replyCount > 0 && (
                        <div className="border-t border-gray-100 mt-4 pt-4 space-y-3">
                          {post.replies.map((r) => (
                            <div
                              key={r.id || r._id}
                              className={`rounded-xl p-3 ${
                                r.isChw
                                  ? "bg-green-50 border border-green-100"
                                  : "bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  {r.isChw ? (
                                    <>
                                      <Shield size={11} className="text-green-600" />
                                      <span className="text-[11px] font-semibold text-green-700">
                                        {r.chwName || "Health Worker"}
                                      </span>
                                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                        Health Worker
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-[11px] font-medium text-gray-400">
                                      Anonymous
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-gray-400">
                                  {r.timeAgo}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {r.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {openReplyInput === postId && (
                        <div className="flex items-center gap-2 border-t border-gray-100 mt-4 pt-4">
                          <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1 flex-shrink-0">
                            <Shield size={10} className="text-green-600" />
                            <span className="text-[10px] font-semibold text-green-700">
                              Public reply
                            </span>
                          </div>
                          <input
                            value={replyInputs[postId] || ""}
                            onChange={(e) =>
                              setReplyInputs((p) => ({
                                ...p,
                                [postId]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleReply(postId)
                            }
                            placeholder="Write a supportive reply..."
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-400"
                          />
                          <button
                            onClick={() => handleReply(postId)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex-shrink-0"
                          >
                            <Send size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}