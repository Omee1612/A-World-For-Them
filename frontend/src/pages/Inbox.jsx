
import { useEffect, useState } from "react";
import ConversationCard from "../components/ConversationCard";
import { getConversations } from "../services/chatService";



const Inbox = ({ currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const res = await getConversations();
        setConversations(res.data);
      } catch (err) {
        console.error("Inbox load failed", err);
        setError("Unable to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-amber-50/50 py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow">
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="mt-4 text-stone-600">Sign in to access your adoption conversations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Inbox</h1>
            <p className="text-stone-600 mt-2">All your adoption conversations in one place.</p>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-10 shadow">Loading conversations…</div>
        )}

        {error && !loading && (
          <div className="rounded-3xl bg-white p-10 shadow text-red-600">{error}</div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="rounded-3xl bg-white p-10 shadow">
            <p className="text-stone-600">No conversations found yet. Request an adoption or send a message to start one.</p>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {conversations.map((conversation) => (
              <ConversationCard key={conversation.postId} conversation={conversation} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;

