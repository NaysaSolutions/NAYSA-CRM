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
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({
  isOpen,
  setIsOpen,
  onAddClient,
  closeAddClientForm,
  showAddClientForm,
  currentSection,
}) => {
  const location = useLocation();

  useEffect(() => {
    // close add form only when leaving add client page
    if (location.pathname !== "/addclients" && showAddClientForm) {
      closeAddClientForm();
    }
  }, [location.pathname, showAddClientForm, closeAddClientForm]);

  return (
    <>
      {/* Toggle Button */}
      <button
        className="p-2 fixed top-4 left-4 bg-blue-700 text-white rounded-lg z-50 ml-2"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white shadow-lg font-poppins z-40
          flex flex-col justify-between overflow-hidden
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-20"}
        `}
      >
        <div>
          {/* Logo */}
          <div
            className={`transition-all duration-300 ${
              isOpen ? "px-5 ml-12 mt-3 mb-6" : "ml-0 mb-6 mt-20"
            }`}
          >
            <img
              src={isOpen ? "/NSI_LOGO_2.avif" : "/naysa_logo.png"}
              alt="Logo"
              className={`mx-auto ${isOpen ? "w-[180px]" : "w-10"}`}
            />
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-3 ml-4 mr-4">
              <SidebarLink
                to="/dashboard"
                icon={faTh}
                label="Dashboard"
                isActive={location.pathname === "/dashboard"}
                isOpen={isOpen}
                onClick={closeAddClientForm}
              />

              <SidebarLink
                to="/clients"
                icon={faUsers}
                label="Clients (All)"
                isActive={location.pathname === "/clients"}
                isOpen={isOpen}
                onClick={closeAddClientForm}
              />

              <SidebarLink
                to="/clientsfinancials"
                icon={faListUl}
                label="Clients (Financials)"
                isActive={location.pathname === "/clientsfinancials"}
                isOpen={isOpen}
                onClick={closeAddClientForm}
              />

              <SidebarLink
                to="/clientspayroll"
                icon={faListUl}
                label="Clients (HR-Pay)"
                isActive={location.pathname === "/clientspayroll"}
                isOpen={isOpen}
                onClick={closeAddClientForm}
              />

              <SidebarLink
                to="/addclients"
                icon={faAdd}
                label="Add New Client"
                isActive={location.pathname === "/addclients"}
                isOpen={isOpen}
                onClick={onAddClient}
              />
            </ul>
          </nav>
        </div>

        {/* Help */}
        <div className="p-4 text-gray-500 hover:bg-blue-200 rounded-lg flex items-center space-x-3 m-4 cursor-pointer">
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
      className={`flex items-center space-x-4 p-3 rounded-lg transition cursor-pointer ${
        isActive
          ? "text-blue-700 font-semibold bg-blue-200"
          : "text-gray-700 hover:bg-blue-100"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      {isOpen && <span>{label}</span>}
    </div>
  );

  return <li onClick={onClick}>{to ? <Link to={to}>{content}</Link> : content}</li>;
};

export default Sidebar;