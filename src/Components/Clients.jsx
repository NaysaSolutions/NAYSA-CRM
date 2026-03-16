import React, { useEffect, useMemo, useState } from "react";
import AddClientForm from "./AddClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faSort,
  faSortUp,
  faSortDown,
  faPlus,
  faFileExcel,
  faRotateRight,
  faMagnifyingGlass,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { GetAPI } from "../api";
import * as XLSX from "xlsx";

const ClientsInformation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("ALL");
  const [selectedActive, setSelectedActive] = useState("ALL");
  const [selectedAppType, setSelectedAppType] = useState("ALL");
  const [selectedArea, setSelectedArea] = useState("ALL");
  const [selectedEconomicZone, setSelectedEconomicZone] = useState("ALL");

  const itemsPerPage = 50;

  const appGroups = [
    {
      key: "financials",
      label: "Financials",
      columns: [
        "cas",
        "sma",
        "live",
        "active",
        "contractdate",
        "smadate",
        "environment",
        "deployment_type",
      ],
    },
    {
      key: "hrpay",
      label: "HR-PAY",
      columns: [
        "sma",
        "live",
        "active",
        "contractdate",
        "smadate",
        "environment",
        "deployment_type",
      ],
    },
    {
      key: "realty",
      label: "Realty",
      columns: [
        "sma",
        "live",
        "active",
        "contractdate",
        "smadate",
        "environment",
        "deployment_type",
      ],
    },
    {
      key: "wms",
      label: "WMS",
      columns: [
        "sma",
        "live",
        "active",
        "contractdate",
        "smadate",
        "environment",
        "deployment_type",
      ],
    },
  ];

  const columnLabels = {
    cas: "CAS",
    sma: "SMA",
    live: "Live",
    active: "Active",
    contractdate: "Contract Date",
    smadate: "SMA Date",
    environment: "Environment",
    deployment_type: "Deployment Type",
  };

  const basicColumns = [
    { key: "client_code", label: "Client Code", width: "140px" },
    { key: "client_name", label: "Client Name", width: "300px" },
    { key: "main_address", label: "Main Address", width: "320px" },
    { key: "area", label: "Area" },
    { key: "economic_zone", label: "Economic Zone" },
    { key: "industry", label: "Industry" },
    { key: "industry_class", label: "Industry Class", width: "250px" },
    { key: "apps", label: "Apps" },
  ];

  const initializeSearchFields = () => {
    const fields = {};

    basicColumns.forEach(({ key }) => {
      fields[key] = "";
    });

    appGroups.forEach((group) => {
      group.columns.forEach((col) => {
        fields[`${group.key}_${col}`] = "";
      });
    });

    return fields;
  };

  const [searchFields, setSearchFields] = useState(initializeSearchFields());

  const [sortConfig, setSortConfig] = useState({
    key: "client_code",
    direction: "asc",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const drilldownIndustry = location.state?.drilldownIndustry;

    if (drilldownIndustry) {
      setSelectedIndustry(drilldownIndustry);
      setCurrentPage(1);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, location.pathname, navigate]);


    useEffect(() => {
    const drilldownArea = location.state?.drilldownArea;

    if (drilldownArea) {
      setSelectedArea(drilldownArea);
      setCurrentPage(1);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, location.pathname, navigate]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await GetAPI("getClients");

      let data;
      if (response?.data?.data) {
        data = response.data.data;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        data = [];
      }

      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e, key) => {
    const value = e.target.value.toLowerCase();
    setSearchFields((prev) => ({
      ...prev,
      [key]: value,
    }));
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

  const getHasAppType = (client, selected) => {
    if (selected === "ALL") return true;

    const appMap = {
      FINANCIALS: "financials",
      "HR-PAY": "hrpay",
      REALTY: "realty",
      WMS: "wms",
    };

    const keyPrefix = appMap[selected];
    if (!keyPrefix) return true;

    return (
      client[`${keyPrefix}_sma`] ||
      client[`${keyPrefix}_live`] ||
      client[`${keyPrefix}_active`] ||
      (client.apps || "").toUpperCase().includes(selected)
    );
  };

  const getActiveMatch = (client, selected) => {
    if (selected === "ALL") return true;

    const activeFields = [
      client.financials_active,
      client.hrpay_active,
      client.realty_active,
      client.wms_active,
    ]
      .map((v) => String(v || "").toUpperCase())
      .filter(Boolean);

    const hasActiveY = activeFields.includes("Y");
    const hasNoActiveY = !hasActiveY;

    if (selected === "Y") return hasActiveY;
    if (selected === "N") return hasNoActiveY;

    return true;
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  };

  const isDateColumn = (key) => {
    return key.toLowerCase().includes("date");
  };

  const formatCellValue = (key, value) => {
    if (!value) return "-";
    if (isDateColumn(key)) return formatDate(value);
    return value;
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const globalNeedle = globalSearch.trim().toLowerCase();

      const matchesGlobal =
        !globalNeedle ||
        [
          client.client_code,
          client.client_name,
          client.main_address,
          client.area,
          client.economic_zone,
          client.industry,
          client.industry_class,
          client.apps,
        ]
          .join(" ")
          .toLowerCase()
          .includes(globalNeedle);

      const matchesIndustry =
        selectedIndustry === "ALL" ||
        (client.industry || "") === selectedIndustry;

      const matchesActive = getActiveMatch(client, selectedActive);
      const matchesAppType = getHasAppType(client, selectedAppType);

      const matchesColumnFilters = Object.entries(searchFields).every(
        ([field, searchValue]) => {
          if (!searchValue) return true;
          const fieldValue = client[field];
          return (
            fieldValue &&
            fieldValue.toString().toLowerCase().includes(searchValue)
          );
        }
      );

      const matchesArea =
        selectedArea === "ALL" || (client.area || "") === selectedArea;

      const matchesEconomicZone =
        selectedEconomicZone === "ALL" ||
        (client.economic_zone || "") === selectedEconomicZone;

      return (
        matchesGlobal &&
        matchesIndustry &&
        matchesArea &&
        matchesEconomicZone &&
        matchesActive &&
        matchesAppType &&
        matchesColumnFilters
      );
    });
  }, [
    clients,
    globalSearch,
    selectedIndustry,
    selectedActive,
    selectedAppType,
    searchFields,
    selectedArea,
    selectedEconomicZone,
  ]);

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const aCode = a.client_code || "";
      const bCode = b.client_code || "";

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;

      if (
        typeof aValue === "string" &&
        typeof bValue === "string" &&
        !isDateColumn(sortConfig.key)
      ) {
        comparison = aValue.localeCompare(bValue);
      } else if (isDateColumn(sortConfig.key)) {
        comparison =
          new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      if (comparison === 0 && sortConfig.key !== "client_code") {
        comparison = aCode.localeCompare(bCode);
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredClients, sortConfig]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedClients.length / itemsPerPage));
  }, [sortedClients]);

  const currentItems = useMemo(() => {
    return sortedClients.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedClients, currentPage]);

  const industryOptions = useMemo(() => {
    return [...new Set(clients.map((c) => c.industry).filter(Boolean))].sort();
  }, [clients]);

  const areaOptions = useMemo(() => {
    return [...new Set(clients.map((c) => c.area).filter(Boolean))].sort();
  }, [clients]);

  const economicZoneOptions = useMemo(() => {
    return [...new Set(clients.map((c) => c.economic_zone).filter(Boolean))].sort();
  }, [clients]);

  const resetFilters = () => {
    setGlobalSearch("");
    setSelectedIndustry("ALL");
    setSelectedActive("ALL");
    setSelectedArea("ALL");
    setSelectedEconomicZone("ALL");
    setSelectedAppType("ALL");
    setSearchFields(initializeSearchFields());
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const exportData = sortedClients.map((client) => ({
      "Client Code": client.client_code || "",
      "Client Name": client.client_name || "",
      "Main Address": client.main_address || "",
      Area: client.area || "",
      "Economic Zone": client.economic_zone || "",
      Industry: client.industry || "",
      "Industry Class": client.industry_class || "",
      Apps: client.apps || "",

      "Financials CAS": client.financials_cas || "",
      "Financials SMA": client.financials_sma || "",
      "Financials Live": client.financials_live || "",
      "Financials Active": client.financials_active || "",
      "Financials Contract Date": formatDate(client.financials_contractdate),
      "Financials SMA Date": formatDate(client.financials_smadate),
      "Financials Environment": client.financials_environment || "",
      "Financials Deployment Type": client.financials_deployment_type || "",

      "HR-PAY SMA": client.hrpay_sma || "",
      "HR-PAY Live": client.hrpay_live || "",
      "HR-PAY Active": client.hrpay_active || "",
      "HR-PAY Contract Date": formatDate(client.hrpay_contractdate),
      "HR-PAY SMA Date": formatDate(client.hrpay_smadate),
      "HR-PAY Environment": client.hrpay_environment || "",
      "HR-PAY Deployment Type": client.hrpay_deployment_type || "",

      "Realty SMA": client.realty_sma || "",
      "Realty Live": client.realty_live || "",
      "Realty Active": client.realty_active || "",
      "Realty Contract Date": formatDate(client.realty_contractdate),
      "Realty SMA Date": formatDate(client.realty_smadate),
      "Realty Environment": client.realty_environment || "",
      "Realty Deployment Type": client.realty_deployment_type || "",

      "WMS SMA": client.wms_sma || "",
      "WMS Live": client.wms_live || "",
      "WMS Active": client.wms_active || "",
      "WMS Contract Date": formatDate(client.wms_contractdate),
      "WMS SMA Date": formatDate(client.wms_smadate),
      "WMS Environment": client.wms_environment || "",
      "WMS Deployment Type": client.wms_deployment_type || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    const fileName = `Clients_Information_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const renderStatusCell = (value, type = "default", dataKey = "") => {
    const val = String(value || "").toUpperCase();

    if (!val) {
      return <span className="text-slate-300">-</span>;
    }

    if (isDateColumn(dataKey)) {
      return (
        <span className="whitespace-nowrap text-slate-700">
          {formatDate(value)}
        </span>
      );
    }

    const baseClass =
      "inline-flex min-w-[46px] items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold";

    if (val === "Y") {
      return (
        <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>
          {val}
        </span>
      );
    }

    if (val === "N") {
      return (
        <span className={`${baseClass} bg-rose-100 text-rose-700`}>
          {val}
        </span>
      );
    }

    if (type === "cas") {
      return (
        <span className={`${baseClass} bg-blue-100 text-blue-700`}>
          {value}
        </span>
      );
    }

    return (
      <span className={`${baseClass} bg-slate-100 text-slate-700`}>
        {value}
      </span>
    );
  };

  const PINNED_CODE_WIDTH = 140;
  const PINNED_NAME_WIDTH = 300;

  const HEADER_ROW_1_TOP = 0;
  const HEADER_ROW_2_TOP = 30;
  const FILTER_ROW_TOP = 65;

  const getPinnedColumnClass = (key) => {
    if (key === "client_code" || key === "client_name") {
      return "sticky z-30 bg-white group-hover:bg-blue-50 shadow-[2px_0_0_0_rgba(226,232,240,1)]";
    }
    return "";
  };

  const getPinnedHeaderClass = (key) => {
    if (key === "client_code" || key === "client_name") {
      return "sticky z-[70] bg-blue-100 shadow-[2px_0_0_0_rgba(203,213,225,1)]";
    }
    return "";
  };

  const getPinnedFilterClass = (key) => {
    if (key === "client_code" || key === "client_name") {
      return "sticky z-[65] bg-slate-50 shadow-[2px_0_0_0_rgba(226,232,240,1)]";
    }
    return "";
  };

  const getPinnedLeft = (key) => {
    if (key === "client_code") return 0;
    if (key === "client_name") return PINNED_CODE_WIDTH;
    return undefined;
  };

  const getPinnedStyle = (key, top = undefined, width = undefined) => {
    const left = getPinnedLeft(key);

    return {
      ...(left !== undefined ? { left: `${left}px` } : {}),
      ...(top !== undefined ? { top: `${top}px` } : {}),
      ...(width ? { minWidth: width, width } : {}),
    };
  };

  if (showAddClientForm) return <AddClientForm />;

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50 p-3 md:p-2">
      <div className="mb-2 rounded-2xl bg-blue-100 px-4 py-3 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-800 leading-none">Clients Information</h2>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center justify-center"
              type="button"
            >
              <img
                src="3135715.png"
                alt="Profile"
                className="h-9 w-9 rounded-full border-2 border-white/60 shadow-sm"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <ul className="py-2 text-sm text-gray-700">
                  <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUser} /> Profile
                  </li>
                  <li
                    className="flex cursor-pointer items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-2 space-y-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search client code, name, address, industry, apps..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FontAwesomeIcon icon={faRotateRight} />
                Reset
              </button>

              <button
                onClick={exportToExcel}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <FontAwesomeIcon icon={faFileExcel} />
                Export
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                onClick={() => navigate("/Addclients")}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Client
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Areas</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <select
              value={selectedEconomicZone}
              onChange={(e) => {
                setSelectedEconomicZone(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Economic Zones</option>
              {economicZoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>

            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Industries</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            <select
              value={selectedActive}
              onChange={(e) => {
                setSelectedActive(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Status</option>
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>

            <select
              value={selectedAppType}
              onChange={(e) => {
                setSelectedAppType(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All App Types</option>
              <option value="FINANCIALS">Financials</option>
              <option value="HR-PAY">HR-PAY</option>
              <option value="REALTY">Realty</option>
              <option value="WMS">WMS</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="w-72 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
                <div className="absolute inset-1 rounded-full bg-white" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-800">Loading clients</p>
                <p className="mt-1 text-sm text-slate-500">
                  Please wait while records are being loaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-3 py-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <FontAwesomeIcon icon={faFilter} className="text-slate-400" />
              <span>
                Showing <strong>{sortedClients.length}</strong> filtered record
                {sortedClients.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </div>
          </div>

          <div className="max-h-[72vh] w-full overflow-auto rounded-b-2xl">
            <table className="min-w-max w-full border-collapse text-center text-[11px]">
              <thead>
                <tr
                  className="sticky z-40 select-none bg-blue-100 text-center text-gray-800"
                  style={{ top: `${HEADER_ROW_1_TOP}px` }}
                >
                  {basicColumns.map(({ key, label, width }) => (
                    <th
                      key={key}
                      rowSpan={2}
                      onClick={() => requestSort(key)}
                      style={getPinnedStyle(key, HEADER_ROW_1_TOP, width)}
                      className={`cursor-pointer whitespace-nowrap border border-blue-200 px-2 py-3 align-middle ${getPinnedHeaderClass(
                        key
                      )}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {label}
                        <FontAwesomeIcon icon={getSortIcon(key)} className="text-xs" />
                      </div>
                    </th>
                  ))}

                  {appGroups.map((group) => (
                    <th
                      key={group.key}
                      colSpan={group.columns.length}
                      className="sticky z-[60] border border-blue-200 bg-blue-100 px-2 py-2 align-middle whitespace-nowrap uppercase"
                      style={{ top: `${HEADER_ROW_1_TOP}px` }}
                    >
                      {group.label}
                    </th>
                  ))}
                </tr>

                <tr
                  className="sticky z-[41] select-none bg-blue-100 text-center text-gray-800"
                  style={{ top: `${HEADER_ROW_2_TOP}px` }}
                >
                  {appGroups.flatMap((group) =>
                    group.columns.map((col) => {
                      const sortKey = `${group.key}_${col}`;

                      return (
                        <th
                          key={sortKey}
                          onClick={() => requestSort(sortKey)}
                          className="sticky z-[60] cursor-pointer border border-blue-200 bg-blue-100 px-2 py-2 align-middle whitespace-nowrap"
                          style={{ top: `${HEADER_ROW_2_TOP}px` }}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {columnLabels[col] || col}
                            <FontAwesomeIcon
                              icon={getSortIcon(sortKey)}
                              className="text-xs"
                            />
                          </div>
                        </th>
                      );
                    })
                  )}
                </tr>

                <tr
                  className="sticky z-30 bg-slate-50"
                  style={{ top: `${FILTER_ROW_TOP}px` }}
                >
                  {basicColumns.map(({ key, width }) => (
                    <th
                      key={key}
                      style={getPinnedStyle(key, FILTER_ROW_TOP, width)}
                      className={`border border-slate-200 bg-slate-50 px-2 py-2 ${getPinnedFilterClass(
                        key
                      )}`}
                    >
                      <input
                        type="text"
                        value={searchFields[key]}
                        onChange={(e) => handleSearchChange(e, key)}
                        placeholder="Filter"
                        className="w-full min-w-[90px] rounded-md border border-slate-300 px-2 py-1 text-[10px] font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </th>
                  ))}

                  {appGroups.flatMap((group) =>
                    group.columns.map((col) => {
                      const filterKey = `${group.key}_${col}`;

                      return (
                        <th
                          key={filterKey}
                          className="sticky z-[50] border border-slate-200 bg-slate-50 px-2 py-2"
                          style={{ top: `${FILTER_ROW_TOP}px` }}
                        >
                          <input
                            type="text"
                            value={searchFields[filterKey] || ""}
                            onChange={(e) => handleSearchChange(e, filterKey)}
                            placeholder="Filter"
                            className="w-full min-w-[70px] rounded-md border border-slate-300 px-2 py-1 text-[10px] font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </th>
                      );
                    })
                  )}
                </tr>
              </thead>

              <tbody>
                {currentItems.map((client, index) => (
                  <tr
                    key={index}
                    className="group cursor-pointer bg-white transition hover:bg-blue-50"
                    onClick={() => navigate("/Addclients", { state: client })}
                    title="Click to view client"
                  >
                    {basicColumns.map(({ key, width }) => (
                      <td
                        key={key}
                        title={client[key]}
                        style={getPinnedStyle(key, undefined, width)}
                        className={`border border-slate-200 px-3 py-2 text-left align-middle ${
                          key === "client_code"
                            ? "font-semibold text-slate-800"
                            : "text-slate-700"
                        } ${getPinnedColumnClass(key)}`}
                      >
                        <div
                          className={
                            key === "main_address"
                              ? "max-w-[350px] min-w-[300px] truncate"
                              : key === "client_name"
                              ? "max-w-[350px] min-w-[300px] truncate"
                              : key === "industry_class"
                              ? "max-w-[250px] min-w-[250px] truncate"
                              : "whitespace-nowrap"
                          }
                        >
                          {formatCellValue(key, client[key])}
                        </div>
                      </td>
                    ))}

                    {appGroups.flatMap((group) =>
                      group.columns.map((col) => {
                        const dataKey = `${group.key}_${col}`;

                        return (
                          <td
                            key={dataKey}
                            className="border border-slate-200 px-2 py-1 align-middle"
                          >
                            {renderStatusCell(
                              client[dataKey],
                              col === "cas" ? "cas" : "default",
                              dataKey
                            )}
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}

                {currentItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={
                        basicColumns.length +
                        appGroups.reduce((sum, group) => sum + group.columns.length, 0)
                      }
                      className="border border-slate-200 py-8 text-center text-slate-500"
                    >
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
            <span>
              Showing {sortedClients.length ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
              {Math.min(currentPage * itemsPerPage, sortedClients.length)} of{" "}
              {sortedClients.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`rounded-lg px-4 py-2 ${
                  currentPage === 1
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
              >
                Prev
              </button>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`rounded-lg px-4 py-2 ${
                  currentPage === totalPages
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-blue-700 text-white hover:bg-blue-800"
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