import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTh,
  faUsers,
  faQuestionCircle,
  faBars,
  faAdd,
  faListUl,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({
  isOpen,
  setIsOpen,
  onAddClient,
  closeAddClientForm,
  showAddClientForm,
  currentSection,
  isMobile,
}) => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/addclients" && showAddClientForm) {
      closeAddClientForm();
    }
  }, [location.pathname, showAddClientForm, closeAddClientForm]);

  const handleNavClick = (callback) => {
    if (callback) callback();
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* Top Toggle Button */}
      <button
        className="fixed top-3 left-3 md:top-4 md:left-4 mb-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg z-50 w-10 h-10 flex items-center justify-center shadow-lg transition"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FontAwesomeIcon icon={isMobile && isOpen ? faXmark : faBars} className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white shadow-xl font-poppins z-40
          flex flex-col justify-between overflow-hidden
          transition-all duration-300 ease-in-out
          ${isMobile
            ? `${isOpen ? "translate-x-0" : "-translate-x-full"} w-[280px]`
            : `${isOpen ? "w-64" : "w-20"} translate-x-0`
          }
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div
            className={`
              transition-all duration-300 flex items-center justify-center
              ${isOpen ? "px-4 pt-16 pb-6" : "px-2 pt-16 pb-6"}
            `}
          >
            <img
              src={isOpen ? "/NSI_LOGO_2.avif" : "/naysa_logo.png"}
              alt="Logo"
              className={`
                object-contain transition-all duration-300
                ${isOpen ? "w-[160px] sm:w-[180px]" : "w-10"}
              `}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2 px-3">
              <SidebarLink
                to="/dashboard"
                icon={faTh}
                label="Dashboard"
                isActive={location.pathname === "/dashboard"}
                isOpen={isOpen}
                onClick={() => handleNavClick(closeAddClientForm)}
              />

              <SidebarLink
                to="/clients"
                icon={faUsers}
                label="Clients (All)"
                isActive={location.pathname === "/clients"}
                isOpen={isOpen}
                onClick={() => handleNavClick(closeAddClientForm)}
              />

              <SidebarLink
                to="/clientsfinancials"
                icon={faListUl}
                label="Clients (Financials)"
                isActive={location.pathname === "/clientsfinancials"}
                isOpen={isOpen}
                onClick={() => handleNavClick(closeAddClientForm)}
              />

              <SidebarLink
                to="/clientspayroll"
                icon={faListUl}
                label="Clients (HR-Pay)"
                isActive={location.pathname === "/clientspayroll"}
                isOpen={isOpen}
                onClick={() => handleNavClick(closeAddClientForm)}
              />

              <SidebarLink
                to="/addclients"
                icon={faAdd}
                label="Add New Client"
                isActive={location.pathname === "/addclients"}
                isOpen={isOpen}
                onClick={() => handleNavClick(onAddClient)}
              />
            </ul>
          </nav>
        </div>

        {/* Help */}
        <div className="p-3 sm:p-4">
          <div
            className={`
              text-gray-600 hover:bg-blue-100 rounded-lg flex items-center
              cursor-pointer transition p-3
              ${isOpen ? "justify-start space-x-3" : "justify-center"}
            `}
          >
            <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5" />
            {isOpen && <span className="text-sm sm:text-base">Help</span>}
          </div>
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({ to, icon, label, isActive, isOpen, onClick }) => {
  const content = (
    <div
      className={`
        flex items-center rounded-lg transition cursor-pointer
        min-h-[48px] px-3
        ${isOpen ? "justify-start space-x-4" : "justify-center"}
        ${
          isActive
            ? "text-blue-700 font-semibold bg-blue-100"
            : "text-gray-700 hover:bg-blue-50"
        }
      `}
    >
      <FontAwesomeIcon icon={icon} className="w-5 h-5 shrink-0" />
      {isOpen && (
        <span className="text-sm sm:text-[15px] leading-tight break-words">
          {label}
        </span>
      )}
    </div>
  );

  return (
    <li onClick={onClick}>
      {to ? <Link to={to}>{content}</Link> : content}
    </li>
  );
};

export default Sidebar;