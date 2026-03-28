import axios from "axios";

const API_URL = "http://localhost:5000/adoptions";

// Fetch all adoption posts
export const getAdoptions = async () => {
  return axios.get(API_URL);
};

// Create a new adoption post
export const createAdoption = async (data) => {
  const token = localStorage.getItem("token");
  return axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};