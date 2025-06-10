import React, { useState, useEffect, useMemo } from "react";
import AddClientForm from "./AddClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faSignOutAlt,
  faSort,
  faSortUp,
  faSortDown,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { GetAPI } from "../api";

const ClientsInformation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const itemsPerPage = 50;

  // App types and statuses to dynamically generate columns
  const appTypes = ["financials", "hrpay", "realty", "wms"];
  const statuses = ["sma", "live", "active"];

  // Basic columns before app types
  const basicColumns = [
    { key: "client_code", label: "Client Code" },
    { key: "client_name", label: "Client Name" },
    { key: "main_address", label: "Main Address" },
    { key: "apps", label: "Apps" },
    { key: "cas", label: "CAS" },
  ];

  // Initialize search fields for all columns dynamically
  const initializeSearchFields = () => {
    const fields = {};
    basicColumns.forEach(({ key }) => {
      fields[key] = "";
    });
    appTypes.forEach((appType) => {
      statuses.forEach((status) => {
        fields[`${appType}_${status}`] = "";
      });
    });
    return fields;
  };

  const [searchFields, setSearchFields] = useState(initializeSearchFields());

  // Sorting config, default by client_name ascending
  const [sortConfig, setSortConfig] = useState({
    key: "client_name",
    direction: "asc",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await GetAPI("getClients");
      const data = response.data.data; // Laravel wraps results in `data`

      if (Array.isArray(data)) {
        setClients(data);
        setFilteredClients(data);
      } else {
        console.error("Expected array but got:", data);
      }

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

    // Filter clients based on every active search field
    const filtered = clients.filter((client) =>
      Object.entries(updatedSearchFields).every(([field, searchValue]) => {
        if (!searchValue) return true;
        const fieldValue = client[field];
        return (
          fieldValue &&
          fieldValue.toString().toLowerCase().includes(searchValue)
        );
      })
    );

    setFilteredClients(filtered);
    setCurrentPage(1);
  };

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

  if (showAddClientForm) return <AddClientForm />;

  // Memoized sorted clients
  const sortedClients = useMemo(() => {
    if (!Array.isArray(filteredClients)) return [];
    return [...filteredClients].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === "asc"
          ? aValue < bValue
            ? -1
            : aValue > bValue
            ? 1
            : 0
          : aValue > bValue
          ? -1
          : aValue < bValue
          ? 1
          : 0;
      }
    });
  }, [filteredClients, sortConfig]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedClients.length / itemsPerPage);
  }, [sortedClients, itemsPerPage]);

  const currentItems = useMemo(() => {
    return sortedClients.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedClients, currentPage, itemsPerPage]);

  return (
    <div className="p-2 bg-white mt-8">
      {/* Header */}
      <div className="absolute top-3 right-6 flex items-center gap-4">
        <FontAwesomeIcon
          icon={faBell}
          className="w-5 h-5 text-gray-600 hover:text-blue-700 cursor-pointer transition-colors"
        />
        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="cursor-pointer"
          >
            <img
              src="3135715.png"
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            />
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
        <h2 className="text-2xl font-bold text-gray-800">Clients Information</h2>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded-full hover:bg-blue-900 transition"
          // onClick={() => setShowAddClientForm(true)}
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
            <table className="w-full text-[11px] text-center border-collapse border border-gray-300">
              <thead className="bg-gray-200 sticky top-0 z-10 text-[10px]">
                {/* First header row */}
                <tr className="bg-blue-700 text-white text-center select-none">
                  {/* Basic columns */}
                  {basicColumns.map(({ key, label }) => (
                    <th
                      key={key}
                      rowSpan={2}
                      className="px-2 py-3 border cursor-pointer "
                      onClick={() => requestSort(key)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {label}
                        <FontAwesomeIcon icon={getSortIcon(key)} className="text-xs" />
                      </div>
                    </th>
                  ))}

                  {/* Grouped app columns */}
                  {appTypes.map((appType) => (
                    <th
                      key={appType}
                      colSpan={statuses.length}
                      className="px-2 py-3 border uppercase"
                    >
                      {appType}
                    </th>

                  ))}

                  {/* Action column */}
                  {/* <th rowSpan={2} className="px-2 py-3 border">
                    Action
                  </th> */}
                </tr>

                {/* Second header row for statuses */}
                <tr className="bg-blue-600 text-white text-center select-none">
                  {appTypes.flatMap((appType) =>
                    statuses.map((status) => {
                      const key = `${appType}_${status}`;
                      return (
                        <th
                          key={key}
                          className="px-2 py-3 border cursor-pointer"
                          onClick={() => requestSort(key)}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {status.toUpperCase()}
                            {/* {status.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")} */}

                            <FontAwesomeIcon icon={getSortIcon(key)} className="text-xs" />
                          </div>
                        </th>
                      );
                    })
                  )}
                </tr>

                {/* Third header row for filters */}
                <tr className="bg-gray-100 sticky top-[72px] z-10">
                  {/* Basic columns filters */}
                  {basicColumns.map(({ key }) => (
                    <td key={key} className="px-2 py-2 border">
                      <input
                        type="text"
                        value={searchFields[key]}
                        onChange={(e) => handleSearchChange(e, key)}
                        placeholder="Filter"
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-[10px]"
                      />
                    </td>
                  ))}

                  {/* App type/status filters */}
                  {appTypes.flatMap((appType) =>
                    statuses.map((status) => {
                      const key = `${appType}_${status}`;
                      return (
                        <td key={key} className="px-2 py-2 border">
                          <input
                            type="text"
                            value={searchFields[key] || ""}
                            onChange={(e) => handleSearchChange(e, key)}
                            placeholder="Filter"
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-[10px]"
                          />
                        </td>
                      );
                    })
                  )}

                  {/* Empty cell for action */}
                  {/* <td className="px-2 py-2 border"></td> */}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentItems.map((client, index) => (
                  <tr
                    key={index}
                    className="bg-white hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => navigate("/Addclients", { state: client })}
                    title="Click to View Document"
                  >
                    {/* Basic info */}
                    {basicColumns.map(({ key }) => (
                      <td
                        key={key}
                        className={`px-2 py-2 border text-left ${
                          key === "client_name","main_address" ? "w-[150px]" : ""
                        } text-blue-800`}
                        title={client[key]}
                      >
                        {client[key]}
                      </td>
                    ))}

                    {/* Dynamic app columns */}
                    {appTypes.flatMap((appType) =>
                      statuses.map((status) => {
                        const key = `${appType}_${status}`;
                        return (
                          <td key={key} className="px-2 py-2 border w-[150px]">
                            {client[key] || "-"}
                          </td>
                        );
                      })
                    )}

                    {/* Action button */}
                    {/* <td className="px-2 py-2 border">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/Addclients", { state: client });
                        }}
                      >
                        View
                      </button>
                    </td> */}
                  </tr>
                ))}

                {currentItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={basicColumns.length + appTypes.length * statuses.length + 1}
                      className="text-center py-6 text-gray-500"
                    >
                      No results found.
                    </td>
                  </tr>
                )}
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

export default ClientsInformation;
