import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  //make it null to see log out view - omee
  const [user, setUser] = useState({ username: "CatRescuer99" }); 
  

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-amber-50 text-amber-900 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        
    
        <Link to="/" className="text-2xl font-bold tracking-tight text-orange-600">
          A World For Them 🐾
        </Link>


        <div className="hidden md:flex space-x-6 font-medium">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <Link to="/adoption" className="hover:text-orange-500 transition-colors">Adoption</Link>
          <Link to="/veterinary" className="hover:text-orange-500 transition-colors">Veterinary Care</Link>
          <Link to="/about" className="hover:text-orange-500 transition-colors">About</Link>
        </div>

       
        <div className="flex items-center space-x-4 font-medium">
          {user ? (
            
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 hover:text-orange-600 transition-colors focus:outline-none"
              >
                <span>{user.username}</span>
               
                <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

            
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg py-2 border border-amber-100 flex flex-col">
                  <Link 
                    to="/settings" 
                    className="flex items-center px-4 py-2 text-stone-700 hover:bg-amber-50 hover:text-orange-600 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                   
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Settings
                  </Link>
                  
                  <button 
                    onClick={() => {
                      setUser(null); 
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                  
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
          
            <>
              <Link to="/login" className="hover:text-orange-500 transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-5 rounded-full transition-transform hover:scale-105">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;