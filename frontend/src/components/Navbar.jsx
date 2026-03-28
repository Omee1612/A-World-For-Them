<<<<<<< HEAD
import { useState } from 'react';
import { Link } from 'react-router-dom';
import InboxIcon from './InboxIcon';

 const Navbar = ({ user, setUser }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-amber-50 text-amber-900 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight text-orange-600">
          A World For Them 🐾
        </Link>

        <div className="flex items-center space-x-4 font-medium">
          {user && <InboxIcon user={user} />}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1"
              >
                <span>{user.username}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg py-2">
                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
=======
import { useState } from 'react';
import { Link } from 'react-router-dom';
import InboxIcon from './InboxIcon';

 const Navbar = ({ user, setUser }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-amber-50 text-amber-900 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight text-orange-600">
          A World For Them 🐾
        </Link>

        <div className="flex items-center space-x-4 font-medium">
          {user && <InboxIcon user={user} />}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1"
              >
                <span>{user.username}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg py-2">
                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
>>>>>>> 476d539871ed22d8326fde53b32eb49fb7a3b5bb
