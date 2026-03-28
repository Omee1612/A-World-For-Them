import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({setUser}) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/user/login", formData);
      console.log("Login success:", res.data);
      setFormData({ email: '', password: '' });
     localStorage.setItem('token', res.data.token);
       const loggedInUser = { _id: res.data._id,username: res.data.username, email: res.data.email };
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser); // update Navbar immediately
     navigate('/');
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
        <h2 className="text-3xl font-bold text-center text-stone-800 mb-2">Welcome Back 🐾</h2>
        <p className="text-center text-stone-500 mb-8">Sign in to manage your adoptions.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">
            Sign In
          </button>
        </form>
        
        <p className="mt-6 text-center text-stone-600">
          Don't have an account? <Link to="/signup" className="text-teal-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;