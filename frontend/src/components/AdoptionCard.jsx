import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdoptionCard = ({ post, currentUser, refresh }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to delete this post.");

    try {
      await axios.delete(`http://localhost:5000/adoptions/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh(); // refresh the posts list
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Make sure you are logged in and own this post.");
    }
  };

  const handleRequest = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to request this adoption.");

    try {
      await axios.post(
        `http://localhost:5000/adoptions/${post._id}/request`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      refresh();
      alert("Request submitted successfully.");
    } catch (err) {
      console.error(err);
      alert("Unable to submit request. Please try again.");
    }
  };

  const handleAccept = async (requestId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to accept requests.");

    try {
      await axios.put(
        `http://localhost:5000/adoptions/${post._id}/requests/${requestId}/accept`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (err) {
      console.error(err);
      alert("Unable to accept request.");
    }
  };

  const handleReject = async (requestId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to reject requests.");

    try {
      await axios.put(
        `http://localhost:5000/adoptions/${post._id}/requests/${requestId}/reject`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (err) {
      console.error(err);
      alert("Unable to reject request.");
    }
  };

  const handleSendMessage = () => {
    if (!localStorage.getItem("token")) return alert("You must be logged in to send messages.");

    navigate(`/inbox/${post._id}`);
  };

  const storedUser = typeof window !== "undefined" && localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const activeUser = currentUser || storedUser;
  const isOwner = Boolean(
    activeUser && (
      post.poster?._id?.toString() === activeUser._id ||
      post.poster?.toString() === activeUser._id ||
      post.poster?.username === activeUser.username ||
      post.poster === activeUser.username
    )
  );

  const requestEntry = activeUser
    ? post.requests?.find((r) => {
        const requesterId = r.requester?._id?.toString ? r.requester._id.toString() : r.requester?.toString();
        return requesterId === activeUser._id;
      })
    : null;
  const hasRequested = Boolean(requestEntry);
  const pendingRequests = isOwner
    ? post.requests?.filter((r) => r.status === "pending") || []
    : [];

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <img
        src={post.imageUrl || "/placeholder.png"}
        alt={post.name}
        className="rounded w-full h-48 object-cover mb-2"
      />
      <h3 className="font-bold text-lg">{post.name}</h3>
      <p className="text-sm text-stone-600">{post.description}</p>
      <p className="text-sm mt-1">Location: {post.location}</p>
      <p className="text-sm mt-1">Posted by: {post.poster?.username || post.poster || "Unknown"}</p>
      <p className="text-sm mt-1">Contact: {post.contact || "N/A"}</p>

      {!isOwner && !hasRequested && (
        <button
          onClick={handleRequest}
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          Request Adoption
        </button>
      )}

      {!isOwner && hasRequested && (
        <p className="mt-2 text-sm text-stone-600">
          Request status: {requestEntry?.status || "pending"}
        </p>
      )}

      {isOwner && pendingRequests.length > 0 && (
        <div className="mt-4 p-3 bg-slate-50 border rounded">
          <h4 className="font-semibold mb-2">Pending requests</h4>
          {pendingRequests.map((req) => {
            const requesterName = req.requester?.username || req.requester || "Unknown";
            return (
              <div key={req._id || req.requester?._id || requesterName} className="mb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-stone-700">{requesterName}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(isOwner || hasRequested) && (
        <button
          onClick={handleSendMessage}
          className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
        >
          Send Message
        </button>
      )}

      {isOwner && (
        <button
          onClick={handleDelete}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default AdoptionCard;