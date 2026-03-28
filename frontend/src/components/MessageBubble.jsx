const MessageBubble = ({ message, currentUserId }) => {
  const senderId = message.sender?._id?.toString?.() || message.sender?.toString?.();
  const isMine = senderId === currentUserId;
  const senderName = message.sender?.username || (isMine ? "You" : "Other");

  return (
    <div className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl p-3 ${isMine ? "bg-orange-500 text-white" : "bg-slate-100 text-stone-800"}`}>
        <div className="mb-1 text-xs uppercase tracking-[0.08em] text-stone-500">
          {senderName}
        </div>
        <div>{message.message}</div>
        <div className="mt-2 text-right text-[11px] text-stone-400">
          {new Date(message.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
