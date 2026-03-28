const Adoption = require("../models/Adoption");
const { addNotification } = require("./userController");

const buildUserMap = (post) => {
  const map = new Map();
  if (post.poster) {
    const id = post.poster._id?.toString ? post.poster._id.toString() : post.poster.toString();
    map.set(id, post.poster.username || "Owner");
  }
  if (Array.isArray(post.requests)) {
    post.requests.forEach((request) => {
      const id = request.requester?._id?.toString?.() || request.requester?.toString?.();
      if (id) {
        map.set(id, request.requester?.username || "Requester");
      }
    });
  }
  return map;
};

const isParticipant = (post, userId) => {
  const posterId = post.poster?._id?.toString?.() || post.poster?.toString?.();
  if (posterId === userId) return true;
  return post.requests?.some((request) => {
    const requesterId = request.requester?._id?.toString?.() || request.requester?.toString?.();
    return requesterId === userId;
  });
};

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const posts = await Adoption.find({
      $or: [
        { poster: req.user._id },
        { "requests.requester": req.user._id },
      ],
    })
      .populate("poster", "username _id")
      .populate("requests.requester", "username _id")
      .lean();

    const conversations = posts.map((post) => {
      const role = post.poster?._id?.toString?.() === userId ? "owner" : "requester";
      const lastMessage = post.chat?.length ? post.chat[post.chat.length - 1] : null;
      const lastSender = lastMessage?.sender;
      const lastSenderName = lastSender?.username || (lastSender?._id?.toString?.() === userId ? "You" : "Other");
      const requestEntry = post.requests?.find((request) => {
        const requesterId = request.requester?._id?.toString?.() || request.requester?.toString?.();
        return requesterId === userId;
      });

      return {
        postId: post._id,
        name: post.name,
        image: post.image,
        imageUrl: post.image ? `${req.protocol}://${req.get("host")}/uploads/${post.image}` : null,
        poster: post.poster,
        role,
        status: post.isActive ? "open" : "closed",
        requestStatus: role === "requester" ? requestEntry?.status || "pending" : undefined,
        pendingRequests: role === "owner" ? post.requests?.filter((r) => r.status === "pending").length || 0 : undefined,
        lastMessage: lastMessage ? {
          text: lastMessage.message,
          senderName: lastSenderName,
          createdAt: lastMessage.createdAt,
        } : null,
        updatedAt: post.updatedAt,
      };
    });

    res.status(200).json(conversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const postId = req.params.postId;
    const post = await Adoption.findById(postId)
      .populate("poster", "username _id")
      .populate("requests.requester", "username _id")
      .populate("chat.sender", "username _id")
      .lean();

    if (!post) return res.status(404).json({ msg: "Conversation not found" });
    if (!isParticipant(post, userId)) return res.status(403).json({ msg: "Access denied" });

    res.status(200).json({
      postId: post._id,
      name: post.name,
      imageUrl: post.image ? `${req.protocol}://${req.get("host")}/uploads/${post.image}` : null,
      poster: post.poster,
      isActive: post.isActive,
      requests: post.requests,
      chat: post.chat || [],
    });
  } catch (err) {
    console.error("Get conversation messages error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const postId = req.params.postId;
    const { message } = req.body;

    if (!message?.trim()) return res.status(400).json({ msg: "Message is required" });

    const post = await Adoption.findById(postId).populate("poster", "username _id");
    if (!post) return res.status(404).json({ msg: "Conversation not found" });

    const posterId = post.poster?._id?.toString?.() || post.poster?.toString?.();
    const isOwner = posterId === userId;
    const isRequester = post.requests?.some((request) => {
      const requesterId = request.requester?._id?.toString?.() || request.requester?.toString?.();
      return requesterId === userId;
    });
    if (!isOwner && !isRequester) return res.status(403).json({ msg: "Access denied" });

    post.chat.push({ sender: req.user._id, message });
    await post.save();

    const recipients = new Set();
    if (!isOwner && posterId) recipients.add(posterId);
    post.requests?.forEach((request) => {
      const requesterId = request.requester?._id?.toString?.() || request.requester?.toString?.();
      if (requesterId && requesterId !== userId) recipients.add(requesterId);
    });

    const notificationPromises = Array.from(recipients).map((recipientId) =>
      addNotification(
        recipientId,
        "chat",
        `New message on adoption ${post.name}`,
        { postId: post._id.toString(), senderId: userId }
      )
    );
    await Promise.all(notificationPromises);

    res.status(200).json({ msg: "Message sent" });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};
