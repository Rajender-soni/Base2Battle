import logo from '/devCompete.png';
import { IoPersonCircle } from "react-icons/io5";
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { serverURL } from '../App';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import { MdLeaderboard } from "react-icons/md";
import { BiMessageSquareDetail } from "react-icons/bi";
import { ChevronDown, BookOpen, Building2, Code2 } from "lucide-react";
import NotificationBell from './NotificationBell';
import SearchUsers from './SearchUsers';

function Navbar() {
  const navigate = useNavigate();
  const { userData } = useUser();
  const isLoggedIn = !!userData;

  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResourcesDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleLogoutConfirm = async () => {
    try {
      await axios.get(serverURL + '/auth/logout', { withCredentials: true });
      toast.success("Logged out successfully");
      window.location.reload();
      navigate('/');
    } catch (error) {
      toast.error("Logout failed");
    }
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => setShowLogoutModal(false);

  return (
    <>
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-8 z-10 min-w-[320px] flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-white">Confirm Logout</h2>
            <p className="mb-6 text-zinc-300">Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={handleLogoutConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
              >
                Logout
              </button>
              <button
                onClick={handleLogoutCancel}
                className="px-5 py-2 bg-zinc-700 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-12 w-12" />
            </Link>

            <div className="flex items-center gap-3">

              {isLoggedIn && <SearchUsers />}

              {/* Resources Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowResourcesDropdown(!showResourcesDropdown)}
                  className="md:flex items-center gap-2 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Resources</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showResourcesDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showResourcesDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-60 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50"
                  >

                    {/* DSA Sheets */}
                    <Link
                      to="/dsa-sheets"
                      className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                      onClick={() => setShowResourcesDropdown(false)}
                    >
                      <Code2 className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-medium">DSA Sheets</div>
                        <div className="text-xs text-zinc-500">
                          Topic-wise DSA practice
                        </div>
                      </div>
                    </Link>

                    {/* Company Sheets */}
                    <Link
                      to="/sheets"
                      className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all border-t border-zinc-800"
                      onClick={() => setShowResourcesDropdown(false)}
                    >
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-medium">Company Sheets</div>
                        <div className="text-xs text-zinc-500">
                          Company-wise problems
                        </div>
                      </div>
                    </Link>

                    {/* System Design */}
                    <Link
                      to="/system-design"
                      className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all border-t border-zinc-800"
                      onClick={() => setShowResourcesDropdown(false)}
                    >
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="font-medium">System Design</div>
                        <div className="text-xs text-zinc-500">
                          Design concepts & notes
                        </div>
                      </div>
                    </Link>

                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <Link
                to="/leaderboard"
                className="md:flex items-center gap-2 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
              >
                <MdLeaderboard className="w-6 h-6" />
                <span className="font-medium">Leaderboard</span>
              </Link>

              {isLoggedIn && (
                <Link
                  to="/messages"
                  className="md:flex items-center gap-2 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                >
                  <BiMessageSquareDetail className="w-6 h-6" />
                  <span className="font-medium">Messages</span>
                </Link>
              )}

              {/* Auth Section */}
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="md:flex items-center gap-3 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-zinc-700 border-2 border-zinc-600">
                      {userData?.photoURL ? (
                        <img
                          src={userData.photoURL}
                          alt={userData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : userData?.name ? (
                        <span className="text-sm font-bold uppercase text-white">
                          {userData.name.charAt(0)}
                        </span>
                      ) : (
                        <IoPersonCircle className="w-8 h-8 text-zinc-400" />
                      )}
                    </div>
                    <span className="font-medium truncate">
                      {userData.name || "Profile"}
                    </span>
                  </Link>

                  <NotificationBell />

                  <button
                    onClick={handleLogoutClick}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2 text-white hover:text-blue-400 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}

            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
