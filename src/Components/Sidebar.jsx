import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTh,
  faUsers,
  faQuestionCircle,
  faBars,
  faAdd,
  faListUl
} from "@fortawesome/free-solid-svg-icons";

// console.log("typeof setIsMobileOpen:", typeof setIsMobileOpen);

const Sidebar = ({
  isOpen,
  setIsOpen,
  // isMobileOpen,
  // setIsMobileOpen = () => console.warn("setIsMobileOpen not passed"),
  onAddClient,
  closeAddClientForm,
  showAddClientForm,
  currentSection
}) => {
  const location = useLocation();

  useEffect(() => {
    if (showAddClientForm) {
      closeAddClientForm();
    }
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Toggle Button */}
      <button
        // className="p-2 fixed top-4 left-4 bg-blue-700 text-white rounded-lg z-50 ml-2 hidden sm:block"
        className="p-2 fixed top-4 left-4 bg-blue-700 text-white rounded-lg z-50 ml-2"
        // className="p-2 fixed top-4 left-4 bg-blue-700 text-white rounded-lg z-50 ml-2 hidden sm:block"
        // className={`p-2 fixed top-4 left-4 bg-blue-700 text-white rounded-lg z-50 ml-2
        //   ${isOpen ? "sm:hidden lg:block" : "sm:hidden lg:block"}
        // `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
      </button>

      {/* Mobile Toggle Button */}
      {/* <button
        className="p-2 fixed top-4 left-4 bg-green-700 text-white rounded-lg z-50 ml-2 hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
      </button>  */}

      {/* Optional Backdrop for Mobile */}
       {/* {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )} */}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white shadow-lg font-poppins z-40
          flex flex-col justify-between overflow-hidden
          transition-all duration-300 ease-in-out transform

          ${isOpen ? "w-64 sm:w-64" : "w-20 sm:w-20 ml-0"}
        `}
      >

        <div>
          {/* Logo */}
          <div className={`transition-all duration-300 ${isOpen ? "px-5 ml-12 mt-3 mb-6" : "ml-0 mb-6 mt-20"}`}>
            <img
              src={isOpen ? "/NSI_LOGO_2.avif" : "/naysa_logo.png"}
              alt="Logo"
              className={`mx-auto ${isOpen ? "w-[180px]" : "w-10"}`}
            />
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-6 ml-5 mr-4">
              <SidebarLink
                to="/dashboard"
                icon={faTh}
                label="Dashboard"
                isActive={location.pathname === "/dashboard" && currentSection !== "add-client"}
                isOpen={isOpen}
                onClick={() => {
                  closeAddClientForm();
                  // setIsMobileOpen(false); // Close mobile on nav
                }}
              />
              <SidebarLink
                to="/clients"
                icon={faUsers}
                label="Clients (All)"
                isActive={location.pathname === "/clients" && currentSection !== "add-client"}
                isOpen={isOpen}
                onClick={() => {
                  closeAddClientForm();
                  // setIsMobileOpen(false); // Close mobile on nav
                }}
              />
                <SidebarLink
                to="/clientsfinancials"
                icon={faListUl}
                label="Clients (Financials)"
                isActive={location.pathname === "/clientsfinancials" && currentSection !== "add-client"}
                isOpen={isOpen}
                onClick={() => {
                  closeAddClientForm();
                  // setIsMobileOpen(false); // Close mobile on nav
                }}
              />
               <SidebarLink
                to="/clientspayroll"
                icon={faListUl}
                label="Clients (HR-Pay)"
                isActive={location.pathname === "/clientspayroll" && currentSection !== "add-client"}
                isOpen={isOpen}
                onClick={() => {
                  closeAddClientForm();
                  // setIsMobileOpen(false); // Close mobile on nav
                }}
              />



              <SidebarLink
                to="/Addclients"
                icon={faAdd}
                label="Add New Client"
                isActive={location.pathname === "/Addclients" && currentSection !== "add-client"}
                isOpen={isOpen}
                onClick={() => {
                  onAddClient();
                  // setIsMobileOpen(false);
                }}
              />
            </ul>
          </nav>
        </div>

        {/* Help Link */}
        <div className="p-4 text-gray-500 hover:bg-blue-200 rounded-lg flex items-center space-x-3">
          <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5" />
          {isOpen && <span>Help</span>}
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({ to, icon, label, isActive, isOpen, onClick }) => {
  const content = (
    <div
      className={`flex items-center space-x-4 p-2 rounded-lg transition cursor-pointer ${
        isActive ? "text-blue-700 font-semibold bg-blue-200" : "text-gray-700 hover:bg-blue-100"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      {isOpen && <span>{label}</span>}
    </div>
  );

  return (
    <li onClick={onClick}>
      {to ? <Link to={to}>{content}</Link> : content}
    </li>
  );
};

export default Sidebar;
