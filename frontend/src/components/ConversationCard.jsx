import { Link } from "react-router-dom";

const ConversationCard = ({ conversation }) => {
  return (
    <Link
      to={`/inbox/${conversation.postId}`}
      className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:border-orange-300 hover:shadow-md transition"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img
            src={conversation.imageUrl || "/placeholder.png"}
            alt={conversation.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-stone-900">{conversation.name}</h3>
          <p className="text-sm text-stone-500">Role: {conversation.role}</p>
          <p className="text-sm text-stone-500">Status: {conversation.status}</p>
          {conversation.requestStatus && (
            <p className="text-sm text-stone-500">Request: {conversation.requestStatus}</p>
          )}
        </div>
      </div>
      {conversation.lastMessage && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-stone-600">
          <div className="font-medium text-stone-800">{conversation.lastMessage.senderName}</div>
          <div>{conversation.lastMessage.text}</div>
        </div>
      )}
    </Link>
  );
};

export default ConversationCard;
