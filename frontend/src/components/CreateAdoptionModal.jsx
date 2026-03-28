
import { useState } from "react";
import axios from "axios";

const CreateAdoptionModal = ({ closeModal, refresh }) => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    trait: "",
    location: "",
    description: "",
    contact: "",
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    try {
      const data = new FormData(e.target);
      if (image) data.set("image", image);

      await axios.post("http://localhost:5000/adoptions", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      refresh();
      closeModal();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl w-[420px] space-y-4">
        <h2 className="text-2xl font-bold">Create Adoption Post</h2>

        <input
          name="name"
          placeholder="Animal Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />
        <input
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <input
          name="trait"
          placeholder="Traits"
          value={form.trait}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <input
          name="location"
          placeholder="Location Found"
          value={form.location}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />
        <input
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />

        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full">Post</button>
          <button type="button" onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded w-full">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdoptionModal;