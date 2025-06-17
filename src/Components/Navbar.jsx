import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isSidebarOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 bg-white shadow-sm z-50 h-16 transition-all duration-300 ${
        isSidebarOpen ? "ml-64" : "ml-20"
      }`}
    >

      <div className="max-w-full mx-auto px-4 sm:px-4 lg:px-4">
        <div className="flex justify-between items-center h-16">

          {/* Title */}
          <div className="flex-shrink-0">
            <h1 className="text-xs sm:text-2xl font-bold text-blue-800">
              NAYSA Customer Relations Management (CRM)
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4 relative">
            {/* Notification Icon */}
            <FontAwesomeIcon
              icon={faBell}
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              title="Notifications"
            />

            {/* Profile Image & Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <img
                  src="/3135715.png"
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500"
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 animate-fade-in">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Account Management
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => navigate("/")}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
