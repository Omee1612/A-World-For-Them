import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdoptionPage from './pages/AdoptionPage';
import VeterinaryCare from './pages/VeterinaryCare';
import About from './pages/About';
import Inbox from './pages/Inbox';
import ChatPage from './pages/ChatPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    console.log(storedUser);
    console.log(user);
    setLoaded(true);
  }, []);
  useEffect(() => {
  console.log("Updated user:", user);
}, [user]);

  if (!loaded) return null; // wait until user state is ready

  return (
    <div className="font-sans text-stone-900 selection:bg-orange-200">
      <Navbar user={user} setUser={setUser} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adoption" element={<AdoptionPage currentUser={user} />} />
          <Route path="/inbox" element={<Inbox currentUser={user} />} />
          <Route path="/inbox/:postId" element={<ChatPage currentUser={user} />} />
          <Route path="/veterinary" element={<VeterinaryCare />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;