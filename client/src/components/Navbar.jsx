import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, Menu, X, Search, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const isLoggedIn = false; 
  const user = null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${searchQuery}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-linear-to-b from-black/95 to-black/85 backdrop-blur-md z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between gap-8">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-red-600 text-2xl font-extrabold no-underline transition-all duration-300 hover:scale-105 hover:text-red-500 shrink-0"
          onClick={handleLinkClick}
        >
          <Film size={32} strokeWidth={2.5} />
          <span className="text-white tracking-tight">TicketFlix</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0 flex-1 justify-center">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-gray-400 text-base font-medium no-underline px-1 py-2 relative transition-colors duration-300 hover:text-white ${
                  isActive ? 'text-white font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-600' : 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full'
                }`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/movies" 
              className={({ isActive }) => 
                `text-gray-400 text-base font-medium no-underline px-1 py-2 relative transition-colors duration-300 hover:text-white ${
                  isActive ? 'text-white font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-600' : 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full'
                }`
              }
            >
              Movies
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/theaters" 
              className={({ isActive }) => 
                `text-gray-400 text-base font-medium no-underline px-1 py-2 relative transition-colors duration-300 hover:text-white ${
                  isActive ? 'text-white font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-600' : 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full'
                }`
              }
            >
              Theaters
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/releases" 
              className={({ isActive }) => 
                `text-gray-400 text-base font-medium no-underline px-1 py-2 relative transition-colors duration-300 hover:text-white ${
                  isActive ? 'text-white font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-600' : 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full'
                }`
              }
            >
              Releases
            </NavLink>
          </li>
        </ul>

        <div className="flex items-center gap-4 shrink-0">
          <div className="relative flex items-center gap-2">
            {isSearchOpen && (
              <form onSubmit={handleSearch} className="absolute right-11 top-1/2 -translate-y-1/2">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-0 md:w-52 px-3 py-2 bg-transparent border-b-2 border-red-600 text-white text-sm outline-none transition-all duration-300 opacity-0 md:opacity-100"
                  style={{ width: isSearchOpen ? '200px' : '0', opacity: isSearchOpen ? '1' : '0' }}
                />
              </form>
            )}
            <button
              className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 hover:text-white"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white/10 border-none text-white px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-all duration-300 hover:bg-white/15">
                <User size={20} />
                <span>{user?.name || 'Profile'}</span>
              </button>
              <button 
                className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="hidden md:inline-block bg-red-600 text-white px-6 py-2.5 rounded-md text-[15px] font-semibold no-underline transition-all duration-300 hover:bg-red-500 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(229,9,20,0.4)]"
            >
              Login
            </Link>
          )}

          <button
            className="md:hidden bg-transparent border-none text-white cursor-pointer p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`fixed top-0 ${isMenuOpen ? 'right-0' : '-right-full'} w-[280px] h-screen from-neutral-900 to-black shadow-[-5px_0_20px_rgba(0,0,0,0.5)] pt-20 px-6 pb-6 transition-all duration-300 z-1001 overflow-y-auto`}>
          <button
            className="absolute top-5 right-5 bg-transparent border-none text-white cursor-pointer p-2"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>

          <ul className="list-none p-0 mb-8 flex flex-col gap-1">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `block text-gray-400 text-lg font-medium py-3.5 px-4 no-underline rounded-lg transition-all duration-300 hover:bg-white/5 hover:text-white ${
                    isActive ? 'bg-red-600/10 text-red-600 font-semibold' : ''
                  }`
                }
                onClick={handleLinkClick}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/movies" 
                className={({ isActive }) => 
                  `block text-gray-400 text-lg font-medium py-3.5 px-4 no-underline rounded-lg transition-all duration-300 hover:bg-white/5 hover:text-white ${
                    isActive ? 'bg-red-600/10 text-red-600 font-semibold' : ''
                  }`
                }
                onClick={handleLinkClick}
              >
                Movies
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/theaters" 
                className={({ isActive }) => 
                  `block text-gray-400 text-lg font-medium py-3.5 px-4 no-underline rounded-lg transition-all duration-300 hover:bg-white/5 hover:text-white ${
                    isActive ? 'bg-red-600/10 text-red-600 font-semibold' : ''
                  }`
                }
                onClick={handleLinkClick}
              >
                Theaters
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/releases" 
                className={({ isActive }) => 
                  `block text-gray-400 text-lg font-medium py-3.5 px-4 no-underline rounded-lg transition-all duration-300 hover:bg-white/5 hover:text-white ${
                    isActive ? 'bg-red-600/10 text-red-600 font-semibold' : ''
                  }`
                }
                onClick={handleLinkClick}
              >
                Releases
              </NavLink>
            </li>
          </ul>

          <div className="border-t border-neutral-800 pt-6 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 bg-white/5 text-white py-3.5 px-4 rounded-lg text-base font-medium no-underline transition-all duration-300 hover:bg-white/10"
                  onClick={handleLinkClick}
                >
                  <User size={20} />
                  <span>{user?.name || 'My Profile'}</span>
                </Link>
                <button 
                  className="flex items-center justify-center gap-3 bg-transparent border-2 border-neutral-800 text-gray-400 py-3.5 px-4 rounded-lg text-base font-medium cursor-pointer transition-all duration-300 hover:border-red-600 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-red-600 text-white py-3.5 px-6 rounded-lg text-base font-semibold text-center no-underline transition-all duration-300 hover:bg-red-500"
                onClick={handleLinkClick}
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div 
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 z-999 animate-[fadeIn_0.3s_ease]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;