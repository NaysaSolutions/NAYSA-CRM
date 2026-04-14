import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faSignOutAlt,
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
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";

const COLORS = [
  "#4A90E2",
  "#7B68EE",
  "#4CAF50",
  "#FFC107",
  "#FF5722",
  "#00BCD4",
  "#9C27B0",
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

const SectionCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    <div className="px-5 pt-5 pb-3 border-b border-gray-100">
      <h4 className="text-base md:text-lg font-semibold text-gray-800">{title}</h4>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const SkeletonBox = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
);

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

  const username =
    user?.username || user?.USER_NAME || user?.name || "Guest";

const handleIndustryDrilldown = (industry) => {
  if (!industry) return;

  navigate("/clients", {
    state: {
      drilldownIndustry: industry,
    },
  });
};

const handleAreaDrilldown = (area) => {
  if (!area) return;

  navigate("/clients", {
    state: {
      drilldownArea: area,
    },
  });
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
      console.error("Response:", e?.response?.data);
      setError(e?.response?.data?.error || "Failed to load dashboard.");
      setDashboardData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const systemUsage = useMemo(
    () =>
      (dashboardData?.SystemUsage?.dashboard1 || EmptyArray).map((d) => ({
        ...d,
        client_count: Number(d.client_count || 0),
      })),
    [dashboardData]
  );

  const SMADashboard = useMemo(
    () =>
      (dashboardData?.SMADashboard?.dashboard1 || EmptyArray).map((d) => ({
        ...d,
        client_count: Number(d.client_count || 0),
      })),
    [dashboardData]
  );

  const Industry = useMemo(
    () =>
      (dashboardData?.Industry?.dashboard1 || EmptyArray).map((d) => ({
        ...d,
        count: Number(d.count || 0),
      })),
    [dashboardData]
  );

  const Area = useMemo(
    () =>
      (dashboardData?.Area?.dashboard1 || EmptyArray).map((d) => ({
        ...d,
        count: Number(d.count || 0),
      })),
    [dashboardData]
  );

  const SMAApplication = useMemo(
    () =>
      (dashboardData?.SMAApplication?.dashboard1 || EmptyArray).map((d) => ({
        ...d,
        client_count: Number(d.client_count || 0),
      })),
    [dashboardData]
  );

  const activeClients =
    dashboardData?.ActiveClients?.dashboard1 || EmptyArray;
  const smaSummary =
    dashboardData?.ClientsWithSMA?.dashboard1 || EmptyArray;
  const ExpiredSMA =
    dashboardData?.ExpiredSMA?.dashboard1 || EmptyArray;
  const upcomingExpirations =
    dashboardData?.UpcomingExpirations?.dashboard1 || EmptyArray;
  const forInstallation =
    dashboardData?.ClientsForInstallation?.dashboard1 || EmptyArray;
  const forTraining =
    dashboardData?.ClientsTrainingStatus?.dashboard1 || EmptyArray;
  const CasStatus =
    dashboardData?.ClientsCASStatus?.dashboard1 || EmptyArray;

  const totalSMAClients = useMemo(
    () => SMADashboard.reduce((sum, d) => sum + Number(d.client_count || 0), 0),
    [SMADashboard]
  );

  const stats = useMemo(
    () => ({
      activeClients: Number(activeClients?.[0]?.total_active_clients || 0),
      withSma: Number(smaSummary?.[0]?.with_sma || 0),
      expiringSoon: Number(smaSummary?.[0]?.expiring_soon || 0),
    }),
    [activeClients, smaSummary]
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 18;
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

  if (loading) {
    return (
      <div className="flex h-screen font-poppins bg-gray-50">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SkeletonBox className="h-8 w-56 mb-3" />
                <SkeletonBox className="h-4 w-80" />
              </div>
              <SkeletonBox className="h-10 w-10 rounded-full" />
            </div>
            <p className="text-sm text-gray-500 mt-3">{loadingMessage}</p>
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
            <SkeletonBox className="h-[320px]" />
            <SkeletonBox className="h-[320px]" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <SkeletonBox className="h-[320px]" />
            <SkeletonBox className="h-[320px]" />
            <SkeletonBox className="h-[320px]" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-poppins bg-gray-50">
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-4 rounded-2xl bg-blue-700 px-4 py-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl text-blue-50 font-bold leading-none">
            Welcome, {user?.username || "Guest"}!
            </h2>
        
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center"
                type="button"
              >
                <img
                  src="3135715.png"
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-white/60 shadow-sm"
                />
              </button>
        
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg z-50">
                  <ul className="py-2 text-gray-700 text-sm">
                    <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                      <FontAwesomeIcon icon={faUser} /> Profile
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
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

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            icon="users"
            color="blue"
          />
          <StatCard
            title="Clients with SMA"
            value={stats.withSma}
            icon="file-contract"
            color="green"
          />
          <StatCard
            title="Expiring SMA"
            value={stats.expiringSoon}
            icon="calendar-times"
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
          <SectionCard title="Top Applications by Client Count">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={systemUsage}
                  margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="system_code"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    formatter={(value) => [`${value} Clients`, "Count"]}
                    labelFormatter={(label) => `Application: ${label}`}
                  />
                  <Bar dataKey="client_count" radius={[10, 10, 0, 0]}>
                    {systemUsage.map((_, index) => (
                      <Cell
                        key={`sys-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="client_count"
                      position="top"
                      fontSize={12}
                      fontWeight="600"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Service Maintenance Agreements">
            <div className="h-[300px]">
              {SMADashboard.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value) => [`${value} Clients`, "Count"]}
                      labelFormatter={(label) => `SMA Type: ${label}`}
                    />
                    <Pie
                      data={SMADashboard}
                      dataKey="client_count"
                      nameKey="sma_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={92}
                      innerRadius={56}
                      paddingAngle={4}
                      label={renderCustomLabel}
                    >
                      {SMADashboard.map((_, index) => (
                        <Cell
                          key={`sma-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <text
                      x="50%"
                      y="48%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-500 text-sm font-medium"
                    >
                      Total SMA
                    </text>
                    <text
                      x="50%"
                      y="56%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-800 text-lg font-bold"
                    >
                      {totalSMAClients}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  No SMA data available.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Applications with Active SMA">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={SMAApplication}
                  margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="system_code"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    formatter={(value) => [`${value} Clients`, "Count"]}
                    labelFormatter={(label) => `Application: ${label}`}
                  />
                  <Bar dataKey="client_count" radius={[10, 10, 0, 0]}>
                    {SMAApplication.map((_, index) => (
                      <Cell
                        key={`sma-app-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="client_count"
                      position="top"
                      fontSize={12}
                      fontWeight="600"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="mb-4">
          <SectionCard title="Clients by Industry">
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Industry}
                  margin={{ top: 20, right: 10, left: 0, bottom: 35 }}
                >
                  <XAxis
                    dataKey="industry"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={90}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    formatter={(value) => [`${value} Clients`, "Count"]}
                    labelFormatter={(label) => `Industry: ${label}`}
                  />
                  <Bar
                    dataKey="count"
                    radius={[10, 10, 0, 0]}
                    onClick={(data) => handleIndustryDrilldown(data?.industry)}
                    onDoubleClick={(data) => handleIndustryDrilldown(data?.industry)}
                    style={{ cursor: "pointer" }}
                  >
                    {Industry.map((entry, index) => (
                      <Cell
                        key={`industry-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleIndustryDrilldown(entry?.industry)}
                        onDoubleClick={() => handleIndustryDrilldown(entry?.industry)}
                      />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="top"
                      fontSize={12}
                      fontWeight="600"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="mb-4">
          <SectionCard title="Clients by Area">
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Area}
                  margin={{ top: 20, right: 10, left: 0, bottom: 35 }}
                >
                  <XAxis
                    dataKey="area"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={90}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    formatter={(value) => [`${value} Clients`, "Count"]}
                    labelFormatter={(label) => `Area: ${label}`}
                  />
                  <Bar
                    dataKey="count"
                    radius={[10, 10, 0, 0]}
                    onClick={(data) => handleAreaDrilldown(data?.area)}
                    onDoubleClick={(data) => handleAreaDrilldown(data?.area)}
                    style={{ cursor: "pointer" }}
                  >
                    {Area.map((entry, index) => (
                      <Cell
                        key={`area-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleAreaDrilldown(entry?.area)}
                        onDoubleClick={() => handleAreaDrilldown(entry?.area)}
                      />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="top"
                      fontSize={12}
                      fontWeight="600"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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

        <ClientLookupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clients={allClients}
        />
      </main>
    </div>
  );
};

export default Dashboard;