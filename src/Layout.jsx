import React, { useState } from 'react';
import Sidebar from './Components/Sidebar';
import AddClientForm from './Components/AddClient';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [currentSection, setCurrentSection] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onAddClient={() => {
          setShowAddClientForm(true);
          setCurrentSection('add-client');
        }}
        closeAddClientForm={() => {
          setShowAddClientForm(false);
          setCurrentSection(false);
        }}
        currentSection={currentSection}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 p-2 font-poppins min-h-screen w-full ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {showAddClientForm ? <AddClientForm /> : children}
      </div>
    </div>
  );
};

export default Layout;
