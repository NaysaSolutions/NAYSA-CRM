import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faSignOutAlt,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import ClientLookupModal from "./ClientLookupModal";
import { PostAPI } from "../api";
import StatCard from "./StatCard";
import MiniTable from "./MiniTable";
import MiniTableTraining from "./MiniTableTraining";
import MiniTableCAS from "./MiniTableCAS";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LabelList,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#4A90E2",
  "#7B68EE",
  "#4CAF50",
  "#FFC107",
  "#FF5722",
  "#00BCD4",
  "#9C27B0",
  "#E91E63",
  "#3F51B5",
  "#009688",
];

const DASHBOARD_MODES = [
  "SystemUsage",
  "SMADashboard",
  "Industry",
  "Area",
  "SMAApplication",
  "ActiveClients",
  "ClientsWithSMA",
  "ExpiredSMA",
  "UpcomingExpirations",
  "ClientsForInstallation",
  "ClientsTrainingStatus",
  "ClientsCASStatus",
];

const EmptyArray = [];

// --- Chart Type Selector Helper ---
const ChartTypeSelector = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-[11px] font-medium text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 cursor-pointer transition-all duration-150 hover:border-blue-300 hover:text-blue-600 shadow-sm"
  >
    <option value="bar">Bar Chart</option>
    <option value="line">Line Chart</option>
    <option value="pie">Pie Chart</option>
  </select>
);

const SectionCard = ({ title, action, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col ${className}`}>
    <div className="px-5 pt-4 pb-3 border-b border-gray-50 flex items-center justify-between gap-2">
      <h4 className="text-sm md:text-[15px] font-semibold text-gray-700 tracking-tight">{title}</h4>
      {action && <div>{action}</div>}
    </div>
    <div className="p-4 flex-1">{children}</div>
  </div>
);

const SkeletonBox = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-xl bg-gray-100 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
  </div>
);

// --- Generic Chart Renderer ---
const GenericChart = ({
  data,
  type,
  xKey,
  yKey,
  tooltipPrefix,
  onDrilldown,
  xHeight = 60,
  xAngle = -25,
  totalText = null,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        No data available.
      </div>
    );
  }

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fontSize={11}
        fontWeight="600"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fill="#374151"
      >
        {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const handleLineClick = (e) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      onDrilldown(e.activePayload[0].payload[xKey]);
    }
  };

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            formatter={(value) => [`${value} Clients`, "Count"]}
            labelFormatter={() => tooltipPrefix}
          />
          <Pie
            data={data}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={92}
            innerRadius={totalText ? 56 : 0}
            paddingAngle={2}
            label={renderCustomLabel}
            onClick={(entry) => onDrilldown(entry[xKey])}
            style={{ cursor: "pointer" }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {totalText && (
            <>
              <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-500 text-sm font-medium">Total</text>
              <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-800 text-lg font-bold">{totalText}</text>
            </>
          )}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: xHeight - 25 }} onClick={handleLineClick}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey={xKey} angle={xAngle} textAnchor="end" height={xHeight} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} formatter={(value) => [`${value} Clients`, "Count"]} labelFormatter={(label) => `${tooltipPrefix}: ${label}`} />
          <Line type="monotone" dataKey={yKey} stroke="#4A90E2" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6, cursor: "pointer" }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Default: Bar Chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: xHeight - 25 }}>
        <XAxis dataKey={xKey} angle={xAngle} textAnchor="end" height={xHeight} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} formatter={(value) => [`${value} Clients`, "Count"]} labelFormatter={(label) => `${tooltipPrefix}: ${label}`} />
        <Bar dataKey={yKey} radius={[6, 6, 0, 0]} onClick={(entry) => onDrilldown(entry[xKey])} style={{ cursor: "pointer" }}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList dataKey={yKey} position="top" fontSize={11} fontWeight="600" fill="#4b5563" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading dashboard...");
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({});

  // Chart Type States
  const [chartTypes, setChartTypes] = useState({
    systemUsage: "bar",
    smaDashboard: "pie",
    smaApplication: "bar",
    industry: "bar",
    area: "bar",
  });

  const handleChartTypeChange = (chartId, type) => {
    setChartTypes((prev) => ({ ...prev, [chartId]: type }));
  };

  // --- Unified Drilldown Handler ---
  const handleDrilldown = (type, value) => {
    if (!value) return;
    const state = {};
    
    if (type === "industry") state.drilldownIndustry = value;
    if (type === "area") state.drilldownArea = value;
    
    // Top Applications (Filter by App Type)
    if (type === "app") {
      state.drilldownApp = value;
    }
    
    // Service Maintenance Agreements (Filter by SMA Status)
    if (type === "smaType") {
      const normalized = String(value).toLowerCase();
      if (normalized.includes("with sma")) state.drilldownSma = "Y";
      else if (normalized.includes("without") || normalized.includes("expired")) state.drilldownSma = "N";
      else state.drilldownSma = value;
    }

    // Applications with Active SMA (Filter by BOTH App Type AND SMA Status = "Y")
    if (type === "appActiveSma") {
      state.drilldownApp = value;
      state.drilldownSma = "Y";
    }

    navigate("/clients", { state });
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    setLoadingMessage("Loading dashboard...");

    try {
      const res = await PostAPI("getClientsdashboard", {
        modes: DASHBOARD_MODES,
      });

      const payload = res?.data?.data || {};
      setDashboardData(payload);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      setError(e?.response?.data?.error || "Failed to load dashboard.");
      setDashboardData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const systemUsage = useMemo(() => (dashboardData?.SystemUsage?.dashboard1 || EmptyArray).map((d) => ({ ...d, client_count: Number(d.client_count || 0) })), [dashboardData]);
  const SMADashboard = useMemo(() => (dashboardData?.SMADashboard?.dashboard1 || EmptyArray).map((d) => ({ ...d, client_count: Number(d.client_count || 0) })), [dashboardData]);
  const Industry = useMemo(() => (dashboardData?.Industry?.dashboard1 || EmptyArray).map((d) => ({ ...d, count: Number(d.count || 0) })), [dashboardData]);
  const Area = useMemo(() => (dashboardData?.Area?.dashboard1 || EmptyArray).map((d) => ({ ...d, count: Number(d.count || 0) })), [dashboardData]);
  const SMAApplication = useMemo(() => (dashboardData?.SMAApplication?.dashboard1 || EmptyArray).map((d) => ({ ...d, client_count: Number(d.client_count || 0) })), [dashboardData]);

  const activeClients = dashboardData?.ActiveClients?.dashboard1 || EmptyArray;
  const smaSummary = dashboardData?.ClientsWithSMA?.dashboard1 || EmptyArray;
  const ExpiredSMA = dashboardData?.ExpiredSMA?.dashboard1 || EmptyArray;
  const upcomingExpirations = dashboardData?.UpcomingExpirations?.dashboard1 || EmptyArray;
  const forInstallation = dashboardData?.ClientsForInstallation?.dashboard1 || EmptyArray;
  const forTraining = dashboardData?.ClientsTrainingStatus?.dashboard1 || EmptyArray;
  const CasStatus = dashboardData?.ClientsCASStatus?.dashboard1 || EmptyArray;

  const totalSMAClients = useMemo(() => SMADashboard.reduce((sum, d) => sum + Number(d.client_count || 0), 0), [SMADashboard]);

  const stats = useMemo(() => ({
    activeClients: Number(activeClients?.[0]?.total_active_clients || 0),
    withSma: Number(smaSummary?.[0]?.with_sma || 0),
    expiringSoon: Number(smaSummary?.[0]?.expiring_soon || 0),
  }), [activeClients, smaSummary]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen font-poppins bg-[#f8f9fb]">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <SkeletonBox className="h-8 w-56 mb-3" />
              <SkeletonBox className="h-4 w-80" />
            </div>
            <SkeletonBox className="h-10 w-10 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SkeletonBox className="h-28" />
            <SkeletonBox className="h-28" />
            <SkeletonBox className="h-28" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
            <SkeletonBox className="h-[360px]" />
            <SkeletonBox className="h-[360px]" />
            <SkeletonBox className="h-[360px]" />
          </div>
          <div className="mb-6">
            <SkeletonBox className="h-[380px]" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-poppins bg-[#f8f9fb]">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-[pageIn_0.3s_ease-out]">
        <style>{`@keyframes pageIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-5 py-4 text-white shadow-md shadow-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-0.5">Dashboard</p>
              <h2 className="text-2xl text-white font-bold leading-tight tracking-tight">
                Welcome, {user?.username || "NAYSA Admin"}!
              </h2>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center ring-2 ring-white/30 hover:ring-white/60 rounded-full transition-all duration-200"
                type="button"
              >
                <img src="3135715.png" alt="Profile" className="w-9 h-9 rounded-full border-2 border-white/50 shadow-sm" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl z-50 animate-[fadeIn_0.15s_ease-out]">
                  <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                  <ul className="py-2 text-gray-700 text-sm">
                    <li className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors duration-100"><FontAwesomeIcon icon={faUser} className="text-gray-400" /> Profile</li>
                    <li className="px-4 py-2 hover:bg-red-50 text-red-500 flex items-center gap-2 cursor-pointer transition-colors duration-100" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-red-600 text-sm flex items-center gap-2 backdrop-blur-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard title="Active Clients" value={stats.activeClients} icon="users" color="blue" />
          <StatCard title="Clients with SMA" value={stats.withSma} icon="file-contract" color="green" />
          <StatCard title="Expiring SMA" value={stats.expiringSoon} icon="calendar-times" color="yellow" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
          <SectionCard 
            title="Top Applications" 
            action={<ChartTypeSelector value={chartTypes.systemUsage} onChange={(t) => handleChartTypeChange("systemUsage", t)} />}
          >
            <div className="h-[300px]">
              <GenericChart
                data={systemUsage}
                type={chartTypes.systemUsage}
                xKey="system_code"
                yKey="client_count"
                tooltipPrefix="Application"
                onDrilldown={(val) => handleDrilldown("app", val)}
              />
            </div>
          </SectionCard>

          <SectionCard 
            title="Service Maintenance Agreements"
            action={<ChartTypeSelector value={chartTypes.smaDashboard} onChange={(t) => handleChartTypeChange("smaDashboard", t)} />}
          >
            <div className="h-[300px]">
              <GenericChart
                data={SMADashboard}
                type={chartTypes.smaDashboard}
                xKey="sma_type"
                yKey="client_count"
                tooltipPrefix="SMA Type"
                totalText={totalSMAClients}
                onDrilldown={(val) => handleDrilldown("smaType", val)}
              />
            </div>
          </SectionCard>

          <SectionCard 
            title="Applications with Active SMA"
            action={<ChartTypeSelector value={chartTypes.smaApplication} onChange={(t) => handleChartTypeChange("smaApplication", t)} />}
          >
            <div className="h-[300px]">
              <GenericChart
                data={SMAApplication}
                type={chartTypes.smaApplication}
                xKey="system_code"
                yKey="client_count"
                tooltipPrefix="Application"
                onDrilldown={(val) => handleDrilldown("appActiveSma", val)}
              />
            </div>
          </SectionCard>
        </div>

        <div className="mb-4">
          <SectionCard 
            title="Clients by Industry"
            action={<ChartTypeSelector value={chartTypes.industry} onChange={(t) => handleChartTypeChange("industry", t)} />}
          >
            <div className="h-[400px]">
              <GenericChart
                data={Industry}
                type={chartTypes.industry}
                xKey="industry"
                yKey="count"
                tooltipPrefix="Industry"
                xHeight={90}
                xAngle={-35}
                onDrilldown={(val) => handleDrilldown("industry", val)}
              />
            </div>
          </SectionCard>
        </div>

        <div className="mb-4">
          <SectionCard 
            title="Clients by Area"
            action={<ChartTypeSelector value={chartTypes.area} onChange={(t) => handleChartTypeChange("area", t)} />}
          >
            <div className="h-[400px]">
              <GenericChart
                data={Area}
                type={chartTypes.area}
                xKey="area"
                yKey="count"
                tooltipPrefix="Area"
                xHeight={90}
                xAngle={-35}
                onDrilldown={(val) => handleDrilldown("area", val)}
              />
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
          <SectionCard title="Expired SMA (as of Today)">
            <MiniTable title="" data={ExpiredSMA} />
          </SectionCard>
          <SectionCard title="Upcoming SMA Expirations (Next 60 Days)">
            <MiniTable title="" data={upcomingExpirations} />
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
          <SectionCard title="Clients For Installation">
            <MiniTableTraining title="" data={forInstallation} />
          </SectionCard>
          <SectionCard title="Clients For Training">
            <MiniTableTraining title="" data={forTraining} />
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
          <SectionCard title="CAS Clients Status">
            <MiniTableCAS title="" data={CasStatus} />
          </SectionCard>
        </div>

        <ClientLookupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clients={allClients} />
      </main>
    </div>
  );
};

export default Dashboard;