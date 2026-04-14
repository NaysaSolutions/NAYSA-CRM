import React, { useState, useEffect } from 'react';
import Sidebar from './Components/Sidebar';
import AddClientForm from './Components/AddClient';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [currentSection, setCurrentSection] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Default sidebar behavior based on screen size
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onAddClient={() => {
          setShowAddClientForm(true);
          setCurrentSection('add-client');
          if (isMobile) setIsSidebarOpen(false);
        }}
        closeAddClientForm={() => {
          setShowAddClientForm(false);
          setCurrentSection(false);
          if (isMobile) setIsSidebarOpen(false);
        }}
        currentSection={currentSection}
        isMobile={isMobile}
      />

      <main
        className={`
          min-h-screen transition-all duration-300
          pt-16 md:pt-4
          px-3 sm:px-4 md:px-5 lg:px-6
          ${!isMobile ? (isSidebarOpen ? 'md:ml-60' : 'md:ml-16') : 'ml-0'}
        `}
      >
        <div className="w-full max-w-[1600px] mx-auto">
          {showAddClientForm ? <AddClientForm /> : children}
        </div>
      </main>
    </div>
  );
};

export default Layout;