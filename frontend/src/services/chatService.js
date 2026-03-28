import axios from "axios";

const API_URL = "http://localhost:5000/chat";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getConversations = async () => {
  return axios.get(`${API_URL}/conversations`, {
    headers: authHeaders(),
  });
};

export const getConversationMessages = async (postId) => {
  return axios.get(`${API_URL}/conversations/${postId}`, {
    headers: authHeaders(),
  });
};

export const sendConversationMessage = async (postId, message) => {
  return axios.post(
    `${API_URL}/conversations/${postId}/messages`,
    { message },
    {
      headers: authHeaders(),
    }
  );
};
