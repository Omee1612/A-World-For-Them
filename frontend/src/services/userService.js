import axios from "axios";

const API_URL = "http://localhost:5000/user";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = async () => {
  return axios.get(`${API_URL}/notifications`, {
    headers: authHeaders(),
  });
};

export const markNotificationRead = async (notificationId) => {
  return axios.put(
    `${API_URL}/notifications/${notificationId}/read`,
    null,
    {
      headers: authHeaders(),
    }
  );
};
