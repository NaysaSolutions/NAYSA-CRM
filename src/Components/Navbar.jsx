import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../Authentication/AuthContext"; 
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white px-6 py-3 shadow-md flex justify-end items-center sticky top-0 z-50 ml-64">

      {/* Right - Icons */}
      <div className="flex items-center space-x-4 relative">
        {/* Bell Icon */}
        <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-gray-500 cursor-pointer" />

        {/* Profile Dropdown */}
        <div className="cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <img src="3135715.png" alt="Profile" className="w-8 h-8 rounded-full" />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-10 w-48 bg-white rounded-lg shadow-md py-2">
            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
              Account Management
            </button>
            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
              Settings
            </button>
            <button
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              onClick={() => navigate("/")}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
