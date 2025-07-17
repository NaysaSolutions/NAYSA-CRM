import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faSignOutAlt, faChartBar, faChartPie, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import ClientLookupModal from "./ClientLookupModal";
import { PostAPI } from "../api";
import StatCard from "./StatCard";
import TableIssuingBranch from "./TableIssuingBranch";
import TableRedeemingBranch from "./TableRedeemingBranch";
import DashboardClientList from "./DashboardClientList";

import {
  PieChart, Pie,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

// Constants
// const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];
// const COLORS = ["#000000", "#222222", "#444444", "#666666", "#888888", "#AAAAAA", "#FFFFFF"];
const COLORS = ["#000000", "#555555", "#AAAAAA", "#FFFFFF"];

const CHART_HEIGHT = 320;
const CHART_TYPES = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  AREA: 'area'
};

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Error Component
const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
    <p>Error: {message}</p>
  </div>
);

// Custom Hook for Dashboard Data
const useDashboardData = (userId) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDataByMode = useCallback(async (mode) => {
    try {
      const res = await PostAPI(`getClientsdashboard?user=${userId}&mode=${mode}`);
      return res.data;
    } catch (e) {
      console.error(`Error fetching ${mode}:`, e);
      throw e;
    }
  }, [userId]);

  const loadAllData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const modes = [
        "ContractsSummary", "VoucherStat", "ActiveClients", "TopIssuingBranch",
        "TopRedeemingBranch", "TopActiveClients", "TopIssuingBranchList",
        "TopRedeemingBranchList", "SMADashboard", "Industry", "SMAApplication"
      ];

      const results = await Promise.all(modes.map(fetchDataByMode));
      
      const dashboardData = modes.reduce((acc, mode, index) => {
        acc[mode] = results[index]?.dashboard1 || [];
        return acc;
      }, {});

      setData(dashboardData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchDataByMode]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return { data, loading, error, refetch: loadAllData };
};

// Enhanced Chart Components
const ChartContainer = ({ title, children, className = "w-full" }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <FontAwesomeIcon icon={faChartBar} className="text-blue-600" />
      {title}
    </h4>
    <div style={{ height: CHART_HEIGHT }}>
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-medium text-gray-800">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {formatter ? formatter(entry.value, entry.name) : `${entry.name}: ${entry.value}`}
        </p>
      ))}
    </div>
  );
};

const CustomXAxisTick = ({ x, y, payload, data, dataKey }) => {
  const item = data?.find(d => d[dataKey] === payload.value);
  const count = item ? item.client_count : '';

  return (
    <g transform={`translate(${x},${y + 10})`}>
      <text x={0} y={0} dy={0} textAnchor="middle" fill="#666" fontSize={12}>
        {payload.value}
      </text>
      <text x={0} y={15} dy={0} textAnchor="middle" fill="#333" fontSize={11} fontWeight="bold">
        {count}
      </text>
    </g>
  );
};

// Unified Chart Components
const UnifiedBarChart = ({ data, title, dataKey = "client_count", nameKey = "system_code" }) => {
  const safeData = Array.isArray(data) ? data : [];
  
  return (
    <ChartContainer title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ bottom: 50, top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={nameKey}
            tick={<CustomXAxisTick data={safeData} dataKey={nameKey} />}
            height={60}
            interval={0}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip formatter={(value) => [value, " Clients"]} />} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {safeData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const UnifiedPieChart = ({ data, title, dataKey = "client_count", nameKey = "system_code" }) => {
  const safeData = useMemo(() => 
    Array.isArray(data) ? data.map(d => ({ ...d, [dataKey]: +d[dataKey] })) : []
  , [data, dataKey]);

  return (
    <ChartContainer title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip formatter={(value) => [value, " Clients"]} />} />
          <Pie
            data={safeData}
            dataKey={dataKey}
            nameKey={nameKey}
            outerRadius={100}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            labelLine={false}
          >
            {safeData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Chart Type Selector Component
const ChartTypeSelector = ({ currentType, onTypeChange, types = Object.values(CHART_TYPES) }) => (
  <div className="flex gap-2 mb-4">
    {types.map(type => (
      <button
        key={type}
        onClick={() => onTypeChange(type)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentType === type
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <FontAwesomeIcon 
          icon={type === 'pie' ? faChartPie : type === 'line' ? faChartLine : faChartBar} 
          className="mr-1" 
        />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </button>
    ))}
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartTypes, setChartTypes] = useState({
    issuing: CHART_TYPES.BAR,
    redeeming: CHART_TYPES.BAR,
    services: CHART_TYPES.BAR
  });

  const { data, loading, error, refetch } = useDashboardData(user?.id);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleChartTypeChange = useCallback((chartName, type) => {
    setChartTypes(prev => ({ ...prev, [chartName]: type }));
  }, []);

  const renderChart = (type, data, title, dataKey, nameKey) => {
    switch (type) {
      case CHART_TYPES.PIE:
        return <UnifiedPieChart data={data} title={title} dataKey={dataKey} nameKey={nameKey} />;
      case CHART_TYPES.BAR:
      default:
        return <UnifiedBarChart data={data} title={title} dataKey={dataKey} nameKey={nameKey} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <main className="flex-1 p-6 bg-gray-50">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <main className="flex-1 p-6 bg-gray-50">
          <ErrorMessage message={error} />
          <button 
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-poppins bg-gray-50">
      <main className="flex-1 p-4 pt-20 overflow-auto">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome, {user?.username || "Guest"}!
          </h1>
          <p className="text-gray-600">Dashboard Overview</p>
        </div>

        {/* Main Charts Grid */}
        <div className="space-y-8">
          {/* Top Branch Charts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Branch Performance</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <ChartTypeSelector
                  currentType={chartTypes.issuing}
                  onTypeChange={(type) => handleChartTypeChange('issuing', type)}
                  types={[CHART_TYPES.BAR, CHART_TYPES.PIE]}
                />
                {renderChart(
                  chartTypes.issuing,
                  data.TopIssuingBranch,
                  "Top Issuing Branches",
                  "client_count",
                  "system_code"
                )}
              </div>
              
              <div>
                <ChartTypeSelector
                  currentType={chartTypes.redeeming}
                  onTypeChange={(type) => handleChartTypeChange('redeeming', type)}
                  types={[CHART_TYPES.BAR, CHART_TYPES.PIE]}
                />
                {renderChart(
                  chartTypes.redeeming,
                  data.TopRedeemingBranch,
                  "Top Redeeming Branches",
                  "client_count",
                  "system_code"
                )}
              </div>
            </div>
          </section>

          {/* Services Chart */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Services Overview</h2>
            <div className="mb-4">
              <ChartTypeSelector
                currentType={chartTypes.services}
                onTypeChange={(type) => handleChartTypeChange('services', type)}
                types={[CHART_TYPES.BAR, CHART_TYPES.PIE]}
              />
            </div>
            <div className="grid grid-cols-1">
              {renderChart(
                chartTypes.services,
                data.SMAApplication,
                "Top Services",
                "client_count",
                "system_code"
              )}
            </div>
          </section>

          {/* Statistics and Tables */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Statistics & Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stat Cards */}
              <div className="flex flex-col space-y-4">
                <StatCard 
                  title="Active Vouchers" 
                  value={Number(data.VoucherStat?.[0]?.active) || 0}
                  color="green"
                />
                <StatCard 
                  title="Redeemed Vouchers" 
                  value={Number(data.VoucherStat?.[0]?.redeemed) || 0} 
                  color="blue" 
                />
                <StatCard 
                  title="Cancelled Vouchers" 
                  value={Number(data.VoucherStat?.[0]?.cancelled) || 0} 
                  color="red" 
                />
              </div>

              {/* Tables */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <TableIssuingBranch 
                  title="Top 10 Issuing Branches" 
                  data={data.TopIssuingBranchList || []} 
                />
                <TableRedeemingBranch 
                  title="Top 10 Redeeming Branches" 
                  data={data.TopRedeemingBranchList || []} 
                />
              </div>
            </div>
          </section>
        </div>

        {/* Client Lookup Modal */}
        <ClientLookupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clients={data.TopActiveClients || []}
        />
      </main>
    </div>
  );
};

export default Dashboard;