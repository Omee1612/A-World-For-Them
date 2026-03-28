<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications } from "../services/userService";

const InboxIcon = ({ user }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const res = await getNotifications();
        const unread = res.data.filter((item) => item.read === false).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, [user]);

  if (!user) return null;

  return (
    <Link to="/inbox" className="relative inline-flex items-center px-3 py-2 rounded-lg bg-white text-stone-800 hover:bg-slate-100">
      <span className="text-xl">📥</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
          {unreadCount}
        </span>
      )}
    </Link>
  );
};

export default InboxIcon;
=======
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications } from "../services/userService";

const InboxIcon = ({ user }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const res = await getNotifications();
        const unread = res.data.filter((item) => item.read === false).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, [user]);

  if (!user) return null;

  return (
    <Link to="/inbox" className="relative inline-flex items-center px-3 py-2 rounded-lg bg-white text-stone-800 hover:bg-slate-100">
      <span className="text-xl">📥</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
          {unreadCount}
        </span>
      )}
    </Link>
  );
};

export default InboxIcon;
>>>>>>> 476d539871ed22d8326fde53b32eb49fb7a3b5bb
