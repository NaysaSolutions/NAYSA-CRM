import React, { useState, useEffect } from "react";
import AddClientForm from "./AddClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faSignOutAlt, faSort, faSortUp, faSortDown, faPlus, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { PostAPI } from "../api";

const ClientsPayroll = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const itemsPerPage = 100;

  // Sorting state - Changed to sort by client_code by default
  const [sortConfig, setSortConfig] = useState({
    key: "client_code", // Now sorting by client code by default
    direction: "asc"   // Default ascending order
  });

  const [searchFields, setSearchFields] = useState({
    client_code: "",
    client_name: "",
    contract_date: "",
    sma_date: "",
    live: "",
    with_sma: "",
    active: "",
    numberOfUsers: "",
    training_days: "",
    sma_days: "",
    post_training_days: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  // Sort clients whenever sortConfig or filteredClients changes
  useEffect(() => {
    const sortedItems = [...filteredClients].sort((a, b) => {
      // Special handling for client_code to sort numerically
      if (sortConfig.key === "client_code") {
        const numA = parseInt(a.client_code, 10);
        const numB = parseInt(b.client_code, 10);
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }
      
      // Default sorting for other fields
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    setFilteredClients(sortedItems);
  }, [sortConfig]);

  const fetchClients = async () => {
    try {
      const response = await PostAPI("getClientPerApp", {
        PARAMS: "HR-PAY"
      });

      const clientsArray = response.data.data;
      setClients(clientsArray);
      setFilteredClients(clientsArray);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setLoading(false);
    }
  };

  const handleSearchChange = (e, key) => {
    const value = e.target.value.toLowerCase();
    const updatedSearchFields = { ...searchFields, [key]: value };
    setSearchFields(updatedSearchFields);

    const filtered = clients.filter((client) => {
      return Object.entries(updatedSearchFields).every(([field, searchValue]) => {
        if (!searchValue) return true;
        const fieldValue = client[field];
        return fieldValue && fieldValue.toString().toLowerCase().includes(searchValue);
      });
    });

    setFilteredClients(filtered);
    setCurrentPage(1);
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (Array.isArray(filteredClients)) {
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const currentItems = filteredClients.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  } else {
    console.warn("filteredClients is not an array:", filteredClients);
  }

  if (showAddClientForm) return <AddClientForm />;

  // Before return (
  const totalPages = Array.isArray(filteredClients)
    ? Math.ceil(filteredClients.length / itemsPerPage)
    : 0;

  const currentItems = Array.isArray(filteredClients)
    ? filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

  return (
    <div className="p-2 bg-white mt-8">
      {/* Header */}
      <div className="absolute top-3 right-6 flex items-center gap-4">
        <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-gray-600 hover:text-blue-700 cursor-pointer transition-colors" />
        <div className="relative">
          <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="cursor-pointer">
            <img src="3135715.png" alt="Profile" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              <ul className="py-2 text-gray-700 text-sm">
                <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                  <FontAwesomeIcon icon={faUser} /> Profile
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Title and Button */}
      <div className="flex justify-between items-center mt-2 mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Clients Information (HR-PAY)</h2>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded-full hover:bg-blue-900 transition"
          onClick={() => navigate("/Addclients")}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Client
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 w-64 animate-fade-in">
            {/* Spinner */}
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-blue-800 border-t-transparent animate-spin"></div>
              <div className="absolute inset-1 bg-white rounded-full"></div>
            </div>
            
            {/* Loading Text */}
            <p className="text-gray-800 text-center text-base font-medium">Loading clients...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-xs text-center">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr className="bg-blue-700 text-white text-center">
                  {[
                    { key: "client_code", label: "Client Code" },
                    { key: "client_name", label: "Client Name" },
                    { key: "contract_date", label: "Contract Date" },
                    { key: "sma_date", label: "SMA Date" },
                    { key: "live", label: "Live" },
                    { key: "with_sma", label: "With SMA?" },
                    { key: "active", label: "Active" },
                    { key: "numberOfUsers", label: "User License" },
                    { key: "training_days", label: "Training Days" },
                    { key: "sma_days", label: "SMA Days" },
                    { key: "post_training_days", label: "Post Training Days" },
                    { key: "action", label: "Action" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-2 py-3 border text-center cursor-pointer select-none"
                      onClick={() => key !== "action" && requestSort(key)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {label}
                        {key !== "action" && (
                          <FontAwesomeIcon icon={getSortIcon(key)} className="text-xs" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
                <tr className="bg-gray-100 sticky top-[40px] z-10">
                  {Object.keys(searchFields).map((key) => (
                    <td key={key} className="px-2 py-2 border">
                      <input
                        type="text"
                        value={searchFields[key]}
                        onChange={(e) => handleSearchChange(e, key)}
                        placeholder="Filter"
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-xs"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1"></td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((client, index) => (
                  <tr key={index} 
                      className="bg-white hover:bg-blue-50 transition cursor-pointer"
                      onClick={() => navigate("/Addclients", { state: client })}
                      title="Click to View Document"
                  >
                    <td className="px-2 py-2 border text-left text-blue-800">{client.client_code}</td>
                    <td className="px-2 py-2 w-[300px] border text-left">{client.client_name}</td>
                    <td className="px-2 py-2 border">
                      {new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }).format(new Date(client.contract_date))}
                    </td>
                    <td className="px-2 py-2 border">
                      {new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }).format(new Date(client.sma_date))}
                    </td>
                    <td className="px-2 py-2 border">{client.live}</td>
                    <td className="px-2 py-2 border">{client.with_sma}</td>
                    <td className="px-2 py-2 border">{client.active}</td>
                    <td className="px-2 py-2 border">{client.numberOfUsers}</td>
                    <td className="px-2 py-2 border">{client.training_days}</td>
                    <td className="px-2 py-2 border">{client.sma_days}</td>
                    <td className="px-2 py-2 border">{client.post_training_days}</td>
                    <td className="px-2 py-2 border">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800 transition"
                        onClick={() => navigate("/Addclients", { state: client })}
                      >                
                        <FontAwesomeIcon icon={faFolderOpen} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t text-sm text-gray-700">
            <span>
              Showing {clients.length ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
              {Math.min(currentPage * itemsPerPage, clients.length)} of {clients.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-700 text-white hover:bg-blue-900"
                }`}
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-700 text-white hover:bg-blue-900"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPayroll;