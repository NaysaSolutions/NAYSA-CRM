import React, { useEffect, useMemo, useState, useRef } from "react";
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
  faColumns,
  faLayerGroup,
  faChevronRight,
  faChevronDown,
  faFilePdf,
  faFileImage,
  faFileCsv,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { GetAPI } from "../api";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ClientsInformation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(200);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("ALL");
  const [selectedActive, setSelectedActive] = useState("ALL");
  const [selectedAppType, setSelectedAppType] = useState("ALL");
  const [selectedArea, setSelectedArea] = useState("ALL");
  const [selectedEconomicZone, setSelectedEconomicZone] = useState("ALL");
  
  // NEW: SMA Status Filter
  const [selectedSMA, setSelectedSMA] = useState("ALL");

  // Feature Toggles / Menus
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  
  // Data State for New Features
  const [hiddenCols, setHiddenCols] = useState([]);
  const [groupBy, setGroupBy] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  const exportContainerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportMenu(false);
        setShowColumnMenu(false);
        setShowGroupMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const appGroups = [
    {
      key: "financials",
      label: "Financials",
      columns: ["cas", "sma", "live", "active", "contractdate", "smadate", "environment", "deployment_type"],
    },
    {
      key: "hrpay",
      label: "HR-PAY",
      columns: ["sma", "live", "active", "contractdate", "smadate", "environment", "deployment_type"],
    },
    {
      key: "realty",
      label: "Realty",
      columns: ["sma", "live", "active", "contractdate", "smadate", "environment", "deployment_type"],
    },
    {
      key: "wms",
      label: "WMS",
      columns: ["sma", "live", "active", "contractdate", "smadate", "environment", "deployment_type"],
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
    { key: "client_code", label: "Client Code", width: 100 },
    { key: "client_name", label: "Client Name", width: 380 },
    { key: "main_address", label: "Main Address", width: 450 },
    { key: "area", label: "Area", width: 150 },
    { key: "economic_zone", label: "Economic Zone", width: 120 },
    { key: "principal_client", label: "Principal Client", width: 350 },
    { key: "industry", label: "Industry", width: 180 },
    { key: "industry_class", label: "Industry Class", width: 400 },
    { key: "apps", label: "Apps", width: 100 },
  ];

  const allAvailableColumns = [
    ...basicColumns.map(c => ({ key: c.key, label: c.label })),
    ...appGroups.flatMap(g => g.columns.map(c => ({ key: `${g.key}_${c}`, label: `${g.label} ${columnLabels[c] || c}` })))
  ];

  const initializeSearchFields = () => {
    const fields = {};
    basicColumns.forEach(({ key }) => { fields[key] = ""; });
    appGroups.forEach((group) => {
      group.columns.forEach((col) => { fields[`${group.key}_${col}`] = ""; });
    });
    return fields;
  };

  const [searchFields, setSearchFields] = useState(initializeSearchFields());
  const [sortConfig, setSortConfig] = useState({ key: "client_code", direction: "asc" });

  useEffect(() => {
    fetchClients();
  }, []);

  // Updated: Handle routing parameters sent from Dashboard
  useEffect(() => {
    let stateUpdated = false;

    if (location.state?.drilldownIndustry) {
      setSelectedIndustry(location.state.drilldownIndustry);
      stateUpdated = true;
    }
    if (location.state?.drilldownArea) {
      setSelectedArea(location.state.drilldownArea);
      stateUpdated = true;
    }
    if (location.state?.drilldownApp) {
      setSelectedAppType(location.state.drilldownApp.toUpperCase());
      stateUpdated = true;
    }
    if (location.state?.drilldownSma) {
      setSelectedSMA(location.state.drilldownSma);
      stateUpdated = true;
    }

    if (stateUpdated) {
      setCurrentPage(1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await GetAPI("getClients");
      let data = response?.data?.data || response?.data || response || [];
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
    setSearchFields((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
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
    const appMap = { FINANCIALS: "financials", "HR-PAY": "hrpay", REALTY: "realty", WMS: "wms" };
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
      client.financials_active, client.hrpay_active, client.realty_active, client.wms_active,
    ].map((v) => String(v || "").toUpperCase()).filter(Boolean);
    const hasActiveY = activeFields.includes("Y");
    return selected === "Y" ? hasActiveY : !hasActiveY;
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

  const isDateColumn = (key) => key.toLowerCase().includes("date");
  const formatCellValue = (key, value) => {
    if (!value) return "-";
    if (isDateColumn(key)) return formatDate(value);
    return value;
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const globalNeedle = globalSearch.trim().toLowerCase();
      const matchesGlobal = !globalNeedle || [
        client.client_code, client.client_name, client.main_address,
        client.area, client.economic_zone, client.principal_client, client.industry, client.industry_class, client.apps,
      ].join(" ").toLowerCase().includes(globalNeedle);

      const matchesIndustry = selectedIndustry === "ALL" || (client.industry || "") === selectedIndustry;
      const matchesArea = selectedArea === "ALL" || (client.area || "") === selectedArea;
      const matchesEconomicZone = selectedEconomicZone === "ALL" || (client.economic_zone || "") === selectedEconomicZone;
      const matchesActive = getActiveMatch(client, selectedActive);
      const matchesAppType = getHasAppType(client, selectedAppType);

      // SMA Check taking AppType into consideration
      const matchesSMA = (() => {
        if (selectedSMA === "ALL") return true;

        if (selectedAppType !== "ALL") {
          const appMap = { FINANCIALS: "financials", "HR-PAY": "hrpay", REALTY: "realty", WMS: "wms" };
          const keyPrefix = appMap[selectedAppType];
          if (keyPrefix) {
            const val = String(client[`${keyPrefix}_sma`] || "").toUpperCase();
            return selectedSMA === "Y" ? val === "Y" : val !== "Y";
          }
        }

        const smaFields = [
          client.financials_sma, client.hrpay_sma, client.realty_sma, client.wms_sma
        ].map(v => String(v || "").toUpperCase()).filter(Boolean);

        const hasSmaY = smaFields.includes("Y");
        return selectedSMA === "Y" ? hasSmaY : !hasSmaY;
      })();

      const matchesColumnFilters = Object.entries(searchFields).every(([field, searchValue]) => {
        if (!searchValue) return true;
        const fieldValue = client[field];
        return fieldValue && fieldValue.toString().toLowerCase().includes(searchValue);
      });

      return matchesGlobal && matchesIndustry && matchesArea && matchesEconomicZone && matchesActive && matchesAppType && matchesSMA && matchesColumnFilters;
    });
  }, [clients, globalSearch, selectedIndustry, selectedActive, selectedAppType, selectedSMA, searchFields, selectedArea, selectedEconomicZone]);

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string" && !isDateColumn(sortConfig.key)) {
        comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
      } else if (isDateColumn(sortConfig.key)) {
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      if (comparison === 0 && sortConfig.key !== "client_code") {
        comparison = (a.client_code || "").localeCompare(b.client_code || "");
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredClients, sortConfig]);

  // --- Group By Logic ---
  const getGroupNodeId = (node) => node?.path || `${node.key}-${node.rawValue}-${node.level}`;

  const toggleGroupExpand = (node, e) => {
    e.stopPropagation();
    const uniqueId = getGroupNodeId(node);
    setExpandedGroups((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  };

  const groupData = (rows, level = 0, activeGroupBy = [], parentPath = "") => {
    if (level >= activeGroupBy.length) return rows.map((r) => ({ ...r }));
    const groupKey = activeGroupBy[level];
    const groups = {};

    rows.forEach((row) => {
      const rawValue = String(row?.[groupKey] ?? "(Blank)");
      if (!groups[rawValue]) {
        groups[rawValue] = { rawValue, displayValue: rawValue, rows: [] };
      }
      groups[rawValue].rows.push(row);
    });

    return Object.values(groups)
      .sort((a, b) => a.displayValue.localeCompare(b.displayValue, undefined, { numeric: true }))
      .map((group) => {
        const nodePath = parentPath ? `${parentPath}__${groupKey}:${group.rawValue}` : `${groupKey}:${group.rawValue}`;
        return {
          isGroup: true, key: groupKey, rawValue: group.rawValue, value: group.displayValue,
          level, path: nodePath, children: groupData(group.rows, level + 1, activeGroupBy, nodePath),
          count: group.rows.length,
        };
      });
  };

  const processRenderList = (nodes, activeGroupBy) => {
    let list = [];
    nodes.forEach((node) => {
      if (node.isGroup) {
        list.push(node);
        const uniqueId = getGroupNodeId(node);
        if (expandedGroups[uniqueId] || !expandedGroups.hasOwnProperty(uniqueId)) { // auto expand by default
          if (node.level === activeGroupBy.length - 1) list = list.concat(node.children);
          else list = list.concat(processRenderList(node.children, activeGroupBy));
        }
      } else { list.push(node); }
    });
    return list;
  };

  const groupedStructure = useMemo(() => {
    if (groupBy.length === 0) return sortedClients;
    return groupData(sortedClients, 0, groupBy);
  }, [sortedClients, groupBy]);

  const fullFlatList = useMemo(() => {
    if (groupBy.length === 0) return sortedClients;
    return processRenderList(groupedStructure, groupBy);
  }, [groupedStructure, groupBy, expandedGroups]);

  const totalPages = Math.max(1, Math.ceil(fullFlatList.length / itemsPerPage));
  const currentItems = fullFlatList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setGlobalSearch(""); setSelectedIndustry("ALL"); setSelectedActive("ALL");
    setSelectedArea("ALL"); setSelectedEconomicZone("ALL"); setSelectedAppType("ALL");
    setSelectedSMA("ALL");
    setSearchFields(initializeSearchFields()); setGroupBy([]); setHiddenCols([]);
    setCurrentPage(1);
  };

  // --- Export Logic ---
  const handleExportExcelCsv = (isCsv = false) => {
    setShowExportMenu(false);
    const exportData = fullFlatList.map((client) => {
      if (client.isGroup) {
        const groupLabel = allAvailableColumns.find(c => c.key === client.key)?.label || client.key;
        return { "Group": `${groupLabel}: ${client.value} (${client.count})` };
      }
      let rowData = {};
      allAvailableColumns.filter(c => !hiddenCols.includes(c.key)).forEach(col => {
        rowData[col.label] = formatCellValue(col.key, client[col.key]);
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    const fileName = `Clients_Information_${new Date().toISOString().slice(0, 10)}`;
    if (isCsv) XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: "csv" });
    else XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleExportMedia = async (isPdf = false) => {
    setShowExportMenu(false);
    if (!exportContainerRef.current) return;
    const canvas = await html2canvas(exportContainerRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const fileName = `Clients_Information_${new Date().getTime()}`;

    if (isPdf) {
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`${fileName}.pdf`);
    } else {
      const link = document.createElement("a");
      link.href = imgData; link.download = `${fileName}.png`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
  };

  // --- Column Visibility ---
  const toggleColumn = (key) => {
    setHiddenCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const toggleGroupBy = (key) => {
    setGroupBy(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    setCurrentPage(1);
  };

  const visibleBasicColumns = basicColumns.filter(c => !hiddenCols.includes(c.key));
  const visibleAppGroups = appGroups.map(g => ({
    ...g, columns: g.columns.filter(c => !hiddenCols.includes(`${g.key}_${c}`))
  })).filter(g => g.columns.length > 0);

  const totalVisibleColumnsCount = visibleBasicColumns.length + visibleAppGroups.reduce((sum, g) => sum + g.columns.length, 0);

  const getPinnedLeft = (key) => {
    let left = 0;
    for (const col of visibleBasicColumns) {
      if (col.key === key) {
        if (key === "client_code" || key === "client_name") return left;
        return undefined;
      }
      if (col.key === "client_code" || col.key === "client_name") {
        left += col.width || 50;
      }
    }
    return undefined;
  };

  const getPinnedColumnClass = (key) => {
    if (key === "client_code" || key === "client_name") return "sticky z-10 bg-white group-hover:bg-blue-50 shadow-[2px_0_0_0_rgba(226,232,240,1)]";
    return "";
  };
  const getPinnedHeaderClass = (key) => {
    if (key === "client_code" || key === "client_name") return "sticky z-[70] bg-blue-100 shadow-[2px_0_0_0_rgba(203,213,225,1)]";
    return "sticky z-[60] bg-blue-100";
  };
  const getPinnedFilterClass = (key) => {
    if (key === "client_code" || key === "client_name") return "sticky z-[50] bg-slate-50 shadow-[2px_0_0_0_rgba(226,232,240,1)]";
    return "sticky z-[40] bg-slate-50";
  };

  const renderStatusCell = (value, type = "default", dataKey = "") => {
    const val = String(value || "").toUpperCase();
    if (!val) return <span className="text-slate-300">-</span>;
    if (isDateColumn(dataKey)) return <span className="whitespace-nowrap text-slate-700">{formatDate(value)}</span>;

    const baseClass = "inline-flex min-w-[35px] items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold";
    if (val === "Y") return <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>Yes</span>;
    if (val === "N") return <span className={`${baseClass} bg-rose-100 text-rose-700`}>No</span>;
    if (type === "cas") return <span className={`${baseClass} bg-blue-100 text-blue-700`}>{value}</span>;
    return <span className={`${baseClass} bg-slate-100 text-slate-700`}>{value}</span>;
  };

  const HEADER_ROW_1_TOP = 0;
  const HEADER_ROW_2_TOP = 40;
  const FILTER_ROW_TOP = 80;

  if (showAddClientForm) return <AddClientForm />;

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50 p-3 md:p-2">
      <div className="mb-2 rounded-2xl bg-blue-700 px-4 py-3 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold leading-none">Clients Information</h2>
          <div className="relative">
            <button onClick={() => setIsDropdownOpen((prev) => !prev)} className="flex items-center justify-center" type="button">
              <img src="3135715.png" alt="Profile" className="h-9 w-9 rounded-full border-2 border-white/60 shadow-sm" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <ul className="py-2 text-sm text-gray-700">
                  <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"><FontAwesomeIcon icon={faUser} /> Profile</li>
                  <li className="flex cursor-pointer items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-2 space-y-2" ref={dropdownRef}>
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={globalSearch} onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }} placeholder="Search client code, name, address, industry, apps..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button onClick={resetFilters} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200">
                <FontAwesomeIcon icon={faRotateRight} /> Reset
              </button>

              {/* Group By Menu */}
              <div className="relative z-[100]">
                <button onClick={() => { setShowGroupMenu(!showGroupMenu); setShowColumnMenu(false); setShowExportMenu(false); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                  <FontAwesomeIcon icon={faLayerGroup} /> Group By {groupBy.length > 0 && `(${groupBy.length})`}
                </button>
                {showGroupMenu && (
                  <div className="absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-xl border bg-white shadow-xl z-[100] p-2 text-sm">
                    <div className="font-semibold text-slate-600 mb-2 px-2">Group By Columns</div>
                    {allAvailableColumns.map(col => (
                      <label key={`grp_${col.key}`} className="flex items-center px-2 py-1.5 hover:bg-slate-50 cursor-pointer rounded-lg">
                        <input type="checkbox" checked={groupBy.includes(col.key)} onChange={() => toggleGroupBy(col.key)} className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="truncate">{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Columns Menu */}
              <div className="relative z-[100]">
                <button onClick={() => { setShowColumnMenu(!showColumnMenu); setShowGroupMenu(false); setShowExportMenu(false); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                  <FontAwesomeIcon icon={faColumns} /> Columns
                </button>
                {showColumnMenu && (
                  <div className="absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-xl border bg-white shadow-xl z-[100] p-2 text-sm">
                    <div className="font-semibold text-slate-600 mb-2 px-2">Show/Hide Columns</div>
                    {allAvailableColumns.map(col => (
                      <label key={`col_${col.key}`} className="flex items-center px-2 py-1.5 hover:bg-slate-50 cursor-pointer rounded-lg">
                        <input type="checkbox" checked={!hiddenCols.includes(col.key)} onChange={() => toggleColumn(col.key)} className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="truncate">{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Menu */}
              <div className="relative z-[100]">
                <button onClick={() => { setShowExportMenu(!showExportMenu); setShowColumnMenu(false); setShowGroupMenu(false); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                  <FontAwesomeIcon icon={faFileExcel} /> Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border bg-white shadow-xl z-[100]">
                    <button onClick={() => handleExportExcelCsv(false)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-emerald-50 text-slate-700"><FontAwesomeIcon icon={faFileExcel} className="text-emerald-600 w-4" /> Excel</button>
                    <button onClick={() => handleExportExcelCsv(true)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-emerald-50 text-slate-700"><FontAwesomeIcon icon={faFileCsv} className="text-emerald-600 w-4" /> CSV</button>
                    <button onClick={() => handleExportMedia(true)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-red-50 text-slate-700"><FontAwesomeIcon icon={faFilePdf} className="text-red-600 w-4" /> PDF</button>
                    <button onClick={() => handleExportMedia(false)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-blue-50 text-slate-700"><FontAwesomeIcon icon={faFileImage} className="text-blue-600 w-4" /> Image</button>
                  </div>
                )}
              </div>

              <button onClick={() => navigate("/Addclients")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
                <FontAwesomeIcon icon={faPlus} /> Add Client
              </button>
            </div>
          </div>

        {/* <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"> */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mt-3">
            <select value={selectedArea} onChange={(e) => { setSelectedArea(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="ALL">All Areas</option>
              {[...new Set(clients.map((c) => c.area).filter(Boolean))].sort().map((area) => (<option key={area} value={area}>{area}</option>))}
            </select>
            <select value={selectedEconomicZone} onChange={(e) => { setSelectedEconomicZone(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="ALL">All Economic Zones</option>
              {[...new Set(clients.map((c) => c.economic_zone).filter(Boolean))].sort().map((zone) => (<option key={zone} value={zone}>{zone}</option>))}
            </select>
            <select value={selectedIndustry} onChange={(e) => { setSelectedIndustry(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="ALL">All Industries</option>
              {[...new Set(clients.map((c) => c.industry).filter(Boolean))].sort().map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
            </select>
            <select value={selectedActive} onChange={(e) => { setSelectedActive(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="ALL">All Live Status</option><option value="Y">Active</option><option value="N">Inactive</option>
            </select>
            <select value={selectedAppType} onChange={(e) => { setSelectedAppType(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="ALL">All App Types</option><option value="FINANCIALS">Financials</option><option value="HR-PAY">HR-PAY</option><option value="REALTY">Realty</option><option value="WMS">WMS</option>
            </select>
            <select value={selectedSMA} onChange={(e) => { setSelectedSMA(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="ALL">All SMA Status</option><option value="Y">With SMA</option><option value="N">Without SMA</option>
            </select>
          </div>
        {/* </div> */}
        
        </div>
      </div>

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="w-72 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-12 w-12"><div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" /><div className="absolute inset-1 rounded-full bg-white" /></div>
              <div className="text-center"><p className="text-base font-semibold text-slate-800">Loading clients</p><p className="mt-1 text-sm text-slate-500">Please wait while records are being loaded.</p></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-3 py-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <FontAwesomeIcon icon={faFilter} className="text-slate-400" />
              <span>Showing <strong>{fullFlatList.length}</strong> filtered record{fullFlatList.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="rounded border border-slate-200 bg-white px-2 py-1 outline-none">
                  {[200, 250, 500, 1000].map(val => (<option key={val} value={val}>{val}</option>))}
                </select>
              </div>
              <div>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></div>
            </div>
          </div>

          <div className="max-h-[65vh] w-full overflow-auto rounded-b-2xl relative custom-scrollbar">
            <table className="min-w-max w-full border-collapse text-center text-[11px]">
              <thead>
                <tr className="select-none bg-blue-100 text-center text-gray-800" style={{ height: '40px' }}>
                  {visibleBasicColumns.map(({ key, label, width }) => (
                    <th key={key} rowSpan={2} onClick={() => requestSort(key)} style={{ top: `${HEADER_ROW_1_TOP}px`, left: getPinnedLeft(key) !== undefined ? `${getPinnedLeft(key)}px` : undefined, minWidth: width, maxWidth: width }} className={`cursor-pointer whitespace-nowrap border border-blue-200 px-2 py-1 align-middle ${getPinnedHeaderClass(key)}`}>
                      <div className="flex items-center justify-center gap-1">{label} <FontAwesomeIcon icon={getSortIcon(key)} className="text-[10px]" /></div>
                    </th>
                  ))}
                  {visibleAppGroups.map((group) => (
                    <th key={group.key} colSpan={group.columns.length} className="sticky z-[60] border border-blue-200 bg-blue-100 px-2 py-1 align-middle whitespace-nowrap uppercase" style={{ top: `${HEADER_ROW_1_TOP}px` }}>
                      {group.label}
                    </th>
                  ))}
                </tr>
                <tr className="select-none bg-blue-100 text-center text-gray-800" style={{ height: '40px' }}>
                  {visibleAppGroups.flatMap((group) =>
                    group.columns.map((col) => {
                      const sortKey = `${group.key}_${col}`;
                      return (
                        <th key={sortKey} onClick={() => requestSort(sortKey)} className="sticky z-[60] cursor-pointer border border-blue-200 bg-blue-100 px-2 py-1 align-middle whitespace-nowrap" style={{ top: `${HEADER_ROW_2_TOP}px` }}>
                          <div className="flex items-center justify-center gap-1">{columnLabels[col] || col} <FontAwesomeIcon icon={getSortIcon(sortKey)} className="text-[10px]" /></div>
                        </th>
                      );
                    })
                  )}
                </tr>
                <tr className="bg-slate-50" style={{ height: '36px' }}>
                  {visibleBasicColumns.map(({ key, width }) => (
                    <th key={key} style={{ top: `${FILTER_ROW_TOP}px`, left: getPinnedLeft(key) !== undefined ? `${getPinnedLeft(key)}px` : undefined, minWidth: width, maxWidth: width }} className={`border border-slate-200 px-1 py-1 ${getPinnedFilterClass(key)}`}>
                      <input type="text" value={searchFields[key]} onChange={(e) => handleSearchChange(e, key)} placeholder="Filter" className="w-full min-w-[70px] rounded border border-slate-300 px-1.5 py-1 text-[10px] font-normal outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                    </th>
                  ))}
                  {visibleAppGroups.flatMap((group) =>
                    group.columns.map((col) => {
                      const filterKey = `${group.key}_${col}`;
                      return (
                        <th key={filterKey} className="sticky z-[40] border border-slate-200 bg-slate-50 px-1 py-1" style={{ top: `${FILTER_ROW_TOP}px` }}>
                          <input type="text" value={searchFields[filterKey] || ""} onChange={(e) => handleSearchChange(e, filterKey)} placeholder="Filter" className="w-full min-w-[50px] rounded border border-slate-300 px-1.5 py-1 text-[10px] font-normal outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                        </th>
                      );
                    })
                  )}
                </tr>
              </thead>

              <tbody>
                {currentItems.map((client, index) => {
                  if (client.isGroup) {
                    const isExpanded = expandedGroups[getGroupNodeId(client)] || !expandedGroups.hasOwnProperty(getGroupNodeId(client));
                    return (
                      <tr key={`g-${getGroupNodeId(client)}`} className="bg-gray-100 cursor-pointer hover:bg-gray-200" onClick={(e) => toggleGroupExpand(client, e)}>
                        <td colSpan={totalVisibleColumnsCount} className="border border-slate-200 px-3 py-2 text-left font-semibold text-blue-900 sticky left-0 z-20 bg-gray-100 shadow-[2px_0_0_0_rgba(226,232,240,1)]">
                          <div className="flex items-center" style={{ paddingLeft: client.level * 20 }}>
                            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="mr-2 text-gray-500 w-3" />
                            <span className="mr-2 text-gray-600">{allAvailableColumns.find((c) => c.key === client.key)?.label}:</span>
                            <span className="mr-2 font-bold">{client.value}</span>
                            <span className="bg-blue-200 text-blue-800 text-[10px] px-2 rounded-full">{client.count}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={client.client_code || index} className="group cursor-pointer bg-white transition hover:bg-blue-50" onClick={() => navigate("/Addclients", { state: client })}>
                      {visibleBasicColumns.map(({ key, width }) => (
                        <td key={key} title={client[key]} style={{ left: getPinnedLeft(key) !== undefined ? `${getPinnedLeft(key)}px` : undefined, minWidth: width, maxWidth: width }} className={`border border-slate-200 px-2 py-1 text-left align-middle ${key === "client_code" ? "font-semibold text-slate-800" : "text-slate-700"} ${getPinnedColumnClass(key)}`}>
                          <div className={key === "main_address" || key === "client_name" ? "truncate" : "whitespace-normal"}>
                            {formatCellValue(key, client[key])}
                          </div>
                        </td>
                      ))}
                      {visibleAppGroups.flatMap((group) =>
                        group.columns.map((col) => {
                          const dataKey = `${group.key}_${col}`;
                          return (
                            <td key={dataKey} className="border border-slate-200 px-1 py-1 align-middle">
                              {renderStatusCell(client[dataKey], col === "cas" ? "cas" : "default", dataKey)}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })}

                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={totalVisibleColumnsCount} className="border border-slate-200 py-8 text-center text-slate-500">
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
            <span>Showing {fullFlatList.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, fullFlatList.length)} of {fullFlatList.length}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${currentPage === 1 ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}>Prev</button>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold">{currentPage} / {totalPages}</div>
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${currentPage === totalPages || totalPages === 0 ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden layout for PDF/Image capture */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px", opacity: 0 }}>
        <div ref={exportContainerRef} className="bg-white p-4">
          <h2 className="text-xl font-bold mb-4 text-center">Clients Information</h2>
          <table className="border-collapse text-[8px] w-full">
            <thead>
              <tr className="bg-blue-100">
                {visibleBasicColumns.map(({ label }) => (<th key={label} className="border border-gray-300 p-1 font-bold">{label}</th>))}
                {visibleAppGroups.flatMap((g) => g.columns.map(c => (<th key={`${g.key}_${c}`} className="border border-gray-300 p-1 font-bold">{g.label} {columnLabels[c] || c}</th>)))}
              </tr>
            </thead>
            <tbody>
              {fullFlatList.map((client, idx) => {
                if (client.isGroup) {
                  return (
                    <tr key={idx} className="bg-gray-100"><td colSpan={totalVisibleColumnsCount} className="border border-gray-300 p-1 font-bold">{allAvailableColumns.find(c => c.key === client.key)?.label}: {client.value} ({client.count})</td></tr>
                  );
                }
                return (
                  <tr key={idx}>
                    {visibleBasicColumns.map(({ key }) => (<td key={key} className="border border-gray-300 p-1">{formatCellValue(key, client[key])}</td>))}
                    {visibleAppGroups.flatMap((g) => g.columns.map(c => {
                      const val = client[`${g.key}_${c}`];
                      return <td key={`${g.key}_${c}`} className="border border-gray-300 p-1">{val}</td>;
                    }))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsInformation;