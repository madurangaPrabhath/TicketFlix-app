import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, Menu, X, Search, TicketPlus } from 'lucide-react';
import { useClerk, useUser, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);
  
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn, signOut } = useClerk();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSearchOpen &&
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${searchQuery}`);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-linear-to-b from-black/40 to-black/20 backdrop-blur-sm z-50">
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
          <button
            ref={searchButtonRef}
            className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 hover:text-white"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            <Search className="w-6 h-6" />
          </button>

          {isSearchOpen && (
            <form 
              ref={searchRef}
              onSubmit={handleSearch} 
              className="absolute left-6 right-6 md:left-auto md:right-24 top-1/2 -translate-y-1/2 z-50"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full md:w-64 px-4 py-2.5 md:py-2 bg-neutral-900/95 md:bg-transparent border-2 md:border-0 md:border-b-2 border-red-600 text-white text-sm md:text-base rounded-lg md:rounded-none outline-none transition-all duration-300 backdrop-blur-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-md transition-all duration-300 md:hidden"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {!isLoaded ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="w-24 h-10 bg-white/10 rounded-full animate-pulse"></div>
            </div>
          ) : !user ? (
            <button 
              onClick={() => openSignIn()}
              className="hidden md:inline-block px-4 py-1 sm:px-7 sm:py-2 bg-red-600 hover:bg-red-700 transition rounded-full font-medium cursor-pointer text-white border-none text-sm sm:text-base"
            >
              Login
            </button>
          ) : (
            <div className="hidden md:block">
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Action 
                    label="My Bookings" 
                    labelIcon={<TicketPlus width={15} />}
                    onClick={() => navigate('/booking')}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          )}

          <button
            className="md:hidden bg-transparent border-none text-white cursor-pointer p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`fixed top-0 ${isMenuOpen ? 'right-0' : '-right-full'} w-[280px] h-screen bg-linear-to-b from-neutral-900 to-black shadow-[-5px_0_20px_rgba(0,0,0,0.5)] pt-20 px-6 pb-6 transition-all duration-300 z-1001 overflow-y-auto`}>
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
            {!isLoaded ? (
              <div className="w-full h-14 bg-white/5 rounded-lg animate-pulse"></div>
            ) : !user ? (
              <button 
                onClick={() => {
                  openSignIn();
                  handleLinkClick();
                }}
                className="px-4 py-3.5 sm:px-7 sm:py-3.5 bg-red-600 hover:bg-red-700 transition rounded-full font-medium cursor-pointer text-white border-none text-base text-center w-full"
              >
                Login
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/5 text-white py-3.5 px-4 rounded-lg">
                  <UserButton afterSignOutUrl="/">
                    <UserButton.MenuItems>
                      <UserButton.Action 
                        label="My Bookings" 
                        labelIcon={<TicketPlus width={15} />}
                        onClick={() => navigate('/booking')}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user.fullName || user.username}</span>
                    <span className="text-xs text-gray-400">{user.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </div>
                <Link 
                  to="/booking" 
                  className="flex items-center gap-3 bg-white/5 text-white py-3.5 px-4 rounded-lg text-base font-medium no-underline transition-all duration-300 hover:bg-white/10"
                  onClick={handleLinkClick}
                >
                  <TicketPlus size={20} />
                  <span>My Bookings</span>
                </Link>
                <button 
                  className="px-4 py-3.5 bg-transparent border-2 border-neutral-800 text-gray-400 hover:border-red-600 hover:text-red-600 transition rounded-lg font-medium cursor-pointer text-base"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
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