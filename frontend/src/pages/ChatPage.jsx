import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getConversationMessages, sendConversationMessage } from "../services/chatService";
import MessageBubble from "../components/MessageBubble";

const ChatPage = ({ currentUser }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const currentUserId = currentUser?._id || null;

  useEffect(() => {
    if (!currentUser) return;

    const loadConversation = async () => {
      try {
        const res = await getConversationMessages(postId);
        setConversation(res.data);
      } catch (err) {
        console.error("Failed to load chat", err);
        setError("Unable to load conversation.");
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [currentUser, postId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendConversationMessage(postId, messageText.trim());
      setMessageText("");
      const res = await getConversationMessages(postId);
      setConversation(res.data);
    } catch (err) {
      console.error("Send message failed", err);
      setError("Unable to send message.");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-amber-50/50 py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow">
          <h1 className="text-3xl font-bold">Chat</h1>
          <p className="mt-4 text-stone-600">Sign in to access your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/50 py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button onClick={() => navigate(-1)} className="text-sm text-orange-600 hover:underline">
              ← Back to inbox
            </button>
            <h1 className="mt-3 text-3xl font-bold text-stone-900">Chat</h1>
            <p className="mt-2 text-stone-600">Speak directly with other adoption users.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 shadow">Loading conversation…</div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-10 shadow text-red-600">{error}</div>
        ) : !conversation ? (
          <div className="rounded-3xl bg-white p-10 shadow">Conversation not found.</div>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="mb-6 rounded-3xl bg-amber-50 p-4">
              <div className="text-sm text-stone-500">Adoption</div>
              <h2 className="text-2xl font-semibold text-stone-900">{conversation.name}</h2>
              <div className="mt-2 text-sm text-stone-600">Posted by {conversation.poster?.username || "Unknown"}</div>
            </div>

            <div className="space-y-2">
              {(conversation.chat || []).map((message) => (
                <MessageBubble key={message._id || message.createdAt} message={message} currentUserId={currentUserId} />
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="mt-6 flex flex-col gap-3">
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                rows={4}
                placeholder="Write a message to the other user..."
                className="w-full rounded-3xl border border-stone-200 bg-slate-50 px-4 py-3 text-stone-900 outline-none focus:border-orange-400"
              />
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-stone-500">Only participants of this adoption can message here.</span>
                <button
                  type="submit"
                  className="rounded-3xl bg-orange-500 px-6 py-3 text-white hover:bg-orange-600"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
