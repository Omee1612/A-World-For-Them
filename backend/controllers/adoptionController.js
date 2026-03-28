const Adoption = require("../models/Adoption");
const { addNotification } = require("./userController");

// Get all adoption posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Adoption.find({ isActive: true })
      .populate({ path: "poster", select: "username _id", strictPopulate: false })
      .populate({ path: "requests.requester", select: "username _id", strictPopulate: false })
      .lean();

    const postsWithImageUrl = posts.map((post) => {
      if (post.image) {
        post.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${post.image}`;
      }
      return post;
    });

    res.status(200).json(postsWithImageUrl);
  } catch (err) {
    console.error("Error fetching adoptions:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Create a new adoption post
exports.createPost = async (req, res) => {
  try {
    console.log('createPost req.body:', req.body);
    console.log('createPost req.file:', req.file);
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });

    const postData = {
      ...req.body,
      image: req.file ? req.file.filename : null,
      poster: req.user._id,
      requests: [],
    };
    console.log('createPost postData:', postData);

    const newPost = new Adoption(postData);
    const savedPost = await newPost.save();
    console.log('createPost savedPost:', savedPost.toObject());
    const populatedPost = await Adoption.findById(savedPost._id)
      .populate({ path: "poster", select: "username _id", strictPopulate: false })
      .lean();

    const responsePost = populatedPost || savedPost.toObject();
    if (responsePost.image) {
      responsePost.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${responsePost.image}`;
    }

    res.status(201).json(responsePost);
  } catch (err) {
    console.error("Create adoption post error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Request adoption
exports.requestAdoption = async (req, res) => {
  try {
    const postId = req.params.id;
    const requesterId = req.user?._id?.toString();
    if (!requesterId) return res.status(401).json({ msg: "Unauthorized" });

    const post = await Adoption.findById(postId).populate("poster");
    if (!post) return res.status(404).json({ msg: "Adoption post not found" });

    if (post.poster?._id?.toString() === requesterId) {
      return res.status(400).json({ msg: "You cannot request your own adoption post" });
    }

    const alreadyRequested = post.requests.find(
      (r) => r.requester.toString() === requesterId && r.status === "pending"
    );
    if (alreadyRequested) return res.status(400).json({ msg: "You already requested this adoption" });

    post.requests.push({ requester: requesterId });
    await post.save();

    await addNotification(
      post.poster._id,
      "request",
      `New adoption request for ${post.name}`,
      { postId: post._id.toString(), requesterId }
    );

    res.status(200).json({ msg: "Adoption request sent" });
  } catch (err) {
    console.error("Request adoption error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Accept adoption request
exports.acceptRequest = async (req, res) => {
  try {
    const postId = req.params.id;
    const requestId = req.params.requestId;
    const ownerId = req.user?._id?.toString();
    if (!ownerId) return res.status(401).json({ msg: "Unauthorized" });

    const post = await Adoption.findById(postId);
    if (!post) return res.status(404).json({ msg: "Adoption post not found" });

    const posterId = post.poster?._id?.toString() || post.poster?.toString();
    if (posterId !== ownerId) return res.status(403).json({ msg: "Only the owner can accept requests" });

    const request = post.requests.id(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ msg: "Request has already been processed" });

    request.status = "accepted";
    post.isActive = false;
    post.acceptedBy = request.requester;
    await post.save();

    await addNotification(
      request.requester,
      "request-accepted",
      `Your adoption request for ${post.name} was accepted`,
      { postId: post._id.toString() }
    );

    res.status(200).json({ msg: "Adoption request accepted" });
  } catch (err) {
    console.error("Accept request error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Reject adoption request
exports.rejectRequest = async (req, res) => {
  try {
    const postId = req.params.id;
    const requestId = req.params.requestId;
    const ownerId = req.user?._id?.toString();
    if (!ownerId) return res.status(401).json({ msg: "Unauthorized" });

    const post = await Adoption.findById(postId);
    if (!post) return res.status(404).json({ msg: "Adoption post not found" });

    const posterId = post.poster?._id?.toString() || post.poster?.toString();
    if (posterId !== ownerId) return res.status(403).json({ msg: "Only the owner can reject requests" });

    const request = post.requests.id(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ msg: "Request has already been processed" });

    request.status = "rejected";
    await post.save();

    await addNotification(
      request.requester,
      "request-rejected",
      `Your adoption request for ${post.name} was rejected`,
      { postId: post._id.toString() }
    );

    res.status(200).json({ msg: "Adoption request rejected" });
  } catch (err) {
    console.error("Reject request error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Add chat message to adoption post
exports.addChatMessage = async (req, res) => {
  try {
    const postId = req.params.id;
    const senderId = req.user?._id?.toString();
    const { message } = req.body;

    if (!senderId) return res.status(401).json({ msg: "Unauthorized" });
    if (!message?.trim()) return res.status(400).json({ msg: "Message is required" });

    const post = await Adoption.findById(postId).populate("poster");
    if (!post) return res.status(404).json({ msg: "Adoption post not found" });

    const posterId = post.poster?._id?.toString() || post.poster?.toString();
    const requesterIds = post.requests.map((r) => r.requester?._id?.toString?.() || r.requester?.toString?.());
    if (posterId !== senderId && !requesterIds.includes(senderId)) {
      return res.status(403).json({ msg: "Only the owner or requesters can send messages" });
    }

    post.chat.push({ sender: senderId, message });
    await post.save();

    const acceptedRequester = post.acceptedBy?._id?.toString?.() || post.acceptedBy?.toString?.();
    const recipientId = posterId === senderId
      ? acceptedRequester || requesterIds[0]
      : posterId;
    if (recipientId) {
      await addNotification(
        recipientId,
        "chat",
        `New message on adoption ${post.name}`,
        { postId: post._id.toString(), senderId }
      );
    }

    res.status(200).json({ msg: "Message added" });
  } catch (err) {
    console.error("Add chat message error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });

    const post = await Adoption.findById(postId);
    if (!post) return res.status(404).json({ msg: "Adoption post not found" });

    const posterId = post.poster?._id ? post.poster._id.toString() : post.poster?.toString();
    const userId = req.user?._id?.toString();
    if (!posterId || !userId || posterId !== userId) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    await post.deleteOne();
    res.status(200).json({ msg: "Adoption post deleted" });
  } catch (err) {
    console.error("Delete adoption error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};