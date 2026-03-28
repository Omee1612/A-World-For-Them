import { useEffect, useState } from "react";
import axios from "axios";
import AdoptionCard from "./AdoptionCard";
import CreateAdoptionModal from "./CreateAdoptionModal";

const Adoption = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/adoptions");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = () => {
    if (!localStorage.getItem("token")) {
      return alert("Please login first!");
    }
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-amber-50/50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold text-stone-800">
              Animals Looking for a Home
            </h2>
            <p className="text-stone-600 mt-2">
              Help stray animals find a loving family.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg"
          >
            Create Adoption Post
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <AdoptionCard key={post._id} post={post} currentUser={currentUser} refresh={fetchPosts} />
          ))}
        </div>
      </div>

      {open && <CreateAdoptionModal closeModal={() => setOpen(false)} refresh={fetchPosts} />}
    </div>
  );
};

export default Adoption;