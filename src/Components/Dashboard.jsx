import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import ClientLookupModal from "./ClientLookupModal"; // Import the new modal component
import { PostAPI  } from "../api";
import StatCard from "./StatCard";
import MiniTable from "./MiniTable";
import DashboardClientList from "./DashboardClientList";

import {

  PieChart,Pie,
  BarChart,Bar,
  LineChart,Line,
  AreaChart, Area,
  ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart,Scatter,

  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F", "#FF69B4", "#8B0000"];

const COLORS = ["#8884d8", "#64b5f6", "#ffc658", "#ff8042", "#00C49F", "#FF69B4", "#8B0000"];
// const COLORS = ['#1976d2', '#1e88e5', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'];


const CustomXAxisTick = ({ x, y, payload, data, dataKey }) => {
  const item = data.find(d => d[dataKey] === payload.value);
  const count = item ? item.client_count : '';

  return (
    <g transform={`translate(${x},${y + 10})`}>
      <text
        x={0}
        y={0}
        dy={0}
        textAnchor="middle"
        fill="#666"
        fontSize={14}
      >
        {payload.value}
      </text>
      <text
        x={0}
        y={15}
        dy={0}
        textAnchor="middle"
        fill="#333"
        fontSize={12}
        fontWeight="bold"
      >
        {count}
      </text>
    </g>
  );
};

const SystemsBarChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Top Applications</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ bottom: 40 }}>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis
            dataKey="system_code"
            interval={0}
            tick={<CustomXAxisTick data={safeData} dataKey="system_code" />}
            height={60}
          />
          {/* <YAxis allowDecimals={false} /> */}
          <Tooltip formatter={(value) => [value, "Clients"]} />
          <Bar dataKey="client_count" name="">
            {safeData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


const SMAApplicationBarChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Applications with SMA</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ bottom: 40 }}>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis
            dataKey="system_code"
            interval={0}
            tick={<CustomXAxisTick data={safeData} dataKey="system_code" />}
            height={60}
          />
          {/* <YAxis allowDecimals={false} /> */}
          <Tooltip formatter={(value) => [value, "Clients"]} />
          <Bar dataKey="client_count" name="">
            {safeData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


// const SMABarChart = ({ data }) => {
//   const safeData = Array.isArray(data) ? data : [];

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
//       <h4 className="text-md font-bold mb-4">SMA Count (Bar Chart)</h4>
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart data={safeData} margin={{ bottom: 40 }}>
//           {/* <CartesianGrid strokeDasharray="3 3" /> */}
//           <XAxis
//             dataKey="sma_type"
//             interval={0}
//             tick={<CustomXAxisTick data={safeData} dataKey="sma_type" />}
//             height={60}
//           />
//           {/* <YAxis allowDecimals={false} /> */}
//           <Tooltip formatter={(value) => [value, "count"]} />
//           <Bar dataKey="client_count" name="">
//             {safeData.map((_, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };


const SystemsPieChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.map(d => ({ ...d, client_count: +d.client_count }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Top Applications (Pie Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip formatter={(value) => [value, "Clients"]} />
          <Pie
            data={safeData}
            dataKey="client_count"
            nameKey="system_code"
            outerRadius={80}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {safeData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};


// const SMAPieChart = ({ data }) => {
//   const safeData = Array.isArray(data)
//     ? data.map(d => ({ ...d, client_count: +d.client_count }))
//     : [];

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md w-full h-90">
//       <h4 className="text-md font-bold mb-4">SMA Count (Pie Chart)</h4>
//       <ResponsiveContainer width="100%" height="80%">
//         <PieChart>
//           <Tooltip formatter={(value) => [value, "Clients"]} />
//           <Pie
//             data={safeData}
//             dataKey="client_count"
//             nameKey="sma_type"
//             outerRadius={80}
//             label={({ name, value, percent }) =>
//               `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
//             }
//           >
//             {safeData.map((_, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//               />
//             ))}
//           </Pie>
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };


const SystemsLineChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Top Applications (Line Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData} margin={{ bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="system_code"
            interval={0}
            tick={<CustomXAxisTick data={safeData} dataKey="system_code" />}
            height={60}
            width={100}
          />
          {/* <YAxis allowDecimals={false} /> */}
          <Tooltip formatter={(value) => [value, "count"]} />
          <Line
            type="monotone"
            dataKey="client_count"
            stroke="#8884d8"
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// const SMALineChart = ({ data }) => {
//   const safeData = Array.isArray(data)
//     ? data.map(d => ({ ...d, client_count: +d.client_count }))
//     : [];

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md w-full h-90">
//       <h4 className="text-md font-bold mb-4">SMA Count (Line Chart)</h4>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={safeData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="sma_type" />
//           <YAxis />
//           <Tooltip formatter={(value) => [value, "Clients"]} />
//           <Line
//             type="monotone"
//             dataKey="client_count"
//             stroke={COLORS[0]}
//             activeDot={{ r: 8 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };



const SystemsAreaChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-md h-96">
      <h4 className="text-md font-bold mb-4">Top Applications (Area Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={safeData} margin={{ bottom: 40 }}>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          {/* <CartesianGrid stroke="#ccc" /> */}
          <XAxis
            dataKey="system_code"
            interval={0}
            tick={<CustomXAxisTick data={safeData} dataKey="system_code" />}
            height={60}
          />
          {/* <YAxis allowDecimals={false} /> */}
          <Tooltip formatter={(value) => [value, "count"]} />
          <Area
            type="monotone"
            dataKey="client_count"
            stroke={COLORS[0]}
            fill={COLORS[0]}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


// const SMAAreaChart = ({ data }) => {
//   const safeData = Array.isArray(data)
//     ? data.map(d => ({ ...d, client_count: +d.client_count }))
//     : [];

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-md w-full h-90">
//       <h4 className="text-md font-bold mb-4">SMA Count (Area Chart)</h4>
//       <ResponsiveContainer width="100%" height={300}>
//         <AreaChart data={safeData}>
//           <CartesianGrid stroke="#ccc" />
//           <XAxis dataKey="sma_type" />
//           <YAxis />
//           <Tooltip formatter={(value) => [value, "Clients"]} />
//           <Area
//             type="monotone"
//             dataKey="client_count"
//             stroke={COLORS[0]}
//             fill={COLORS[0]}
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };


const SystemsComposedChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Top Applications (Composed Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={safeData} margin={{ bottom: 40 }}>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis
            dataKey="system_code"
            interval={0}
            tick={<CustomXAxisTick data={safeData} dataKey="system_code" />}
            height={60}
          />
          {/* <YAxis allowDecimals={false} /> */}
          <Tooltip formatter={(value) => [value, "count"]} />
          <Bar dataKey="client_count">
            {safeData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="client_count" stroke="#ff7300" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const SystemsRadarChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Top Applications (Radar Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={safeData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="system_code" />
          <PolarRadiusAxis />
          <Radar
            dataKey="client_count"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SystemsScatterChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.map((d, i) => ({ ...d, index: i })) // Add index for X-axis
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Top Applications (Scatter Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ bottom: 40 }}>
          <CartesianGrid />
          <XAxis dataKey="index" name="Application Index" />
          <YAxis dataKey="client_count" name="Client Count" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => [value, "count"]} />
          <Scatter name="Applications" data={safeData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};


// const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  // const renderCustomizedLabel = ({ name, value, percent, x, y }) => {
  //   return (
  //     <text x={x} y={y} fill="#000" fontSize="1rem" textAnchor="middle" dominantBaseline="central">
  //       {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
  //     </text>
  //   );
  // };

const IndustryPieChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.map(d => ({ ...d, count: +d.count }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Client Industry</h4>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Tooltip formatter={(value) => [value, 'Clients']} />
          <Pie
            data={safeData}
            dataKey="count"
            nameKey="industry"
            outerRadius={100}
            label={({ name, value, percent }) => `${name}: (${(percent * 100).toFixed(0)}%)` }
            // label={renderCustomizedLabel}
          >
            {safeData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndustryBarChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.map(d => ({ ...d, count: +d.count }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Industry Count (Bar Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ bottom: 40 }}>
          <XAxis dataKey="industry" interval={0} height={60} />
          <Tooltip formatter={(value) => [value, 'Count']} />
          <Bar dataKey="count" name="">
            {safeData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndustryLineChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.map(d => ({ ...d, count: +d.count }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Industry Count (Line Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData}>
          <XAxis dataKey="industry" />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Count']} />
          <Line type="monotone" dataKey="count" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndustryAreaChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.map(d => ({ ...d, count: +d.count }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Industry Count (Area Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={safeData}>
          <XAxis dataKey="industry" />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Count']} />
          <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndustryComposedChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.map(d => ({ ...d, count: +d.count }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Industry Count (Composed Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={safeData}>
          <XAxis dataKey="industry" />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Count']} />
          <Bar dataKey="count" barSize={20} fill="#8884d8" />
          <Line type="monotone" dataKey="count" stroke="#ff7300" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndustryRadarChart = ({ data }) => {
  const radarData = Array.isArray(data)
    ? data.map(d => ({ subject: d.industry, A: +d.count, fullMark: 10 }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Industry Count (Radar Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const IndustryScatterChart = ({ data }) => {
  const scatterData = Array.isArray(data)
    ? data.map((d, i) => ({ x: i, y: +d.count, industry: d.industry }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">Industry Count (Scatter Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis dataKey="x" name="Industry" tickFormatter={(i) => data[i]?.industry} />
          <YAxis dataKey="y" name="Count" />
          <Tooltip formatter={(value) => [value, 'Count']} />
          <Scatter data={scatterData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};



const SMAPieChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.map(d => ({ ...d, client_count: +d.client_count }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-90">
      <h4 className="text-md font-bold mb-2">SMA Count</h4>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Tooltip formatter={(value) => [value, "Clients"]} />
          <Pie
            data={safeData}
            dataKey="client_count"
            nameKey="sma_type"
            outerRadius={100}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {safeData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const SMABarChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, d) => sum + d.client_count, 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">SMA Count (Bar Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ bottom: 40 }}>
          <XAxis dataKey="sma_type" interval={0} height={60} />
          <Tooltip formatter={(value) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Clients']} />
          <Bar
            dataKey="client_count"
            label={({ value }) => `${value}`}
          >
            {safeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SMALineChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">SMA Count (Line Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData}>
          <XAxis dataKey="sma_type" />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Clients']} />
          <Line type="monotone" dataKey="client_count" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const SMAAreaChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">SMA Count (Area Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={safeData}>
          <XAxis dataKey="sma_type" />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Clients']} />
          <Area type="monotone" dataKey="client_count" stroke="#82ca9d" fill="#82ca9d" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const SMAComposedChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, d) => sum + d.client_count, 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">SMA Count (Composed Chart)</h4>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={safeData}>
          <XAxis dataKey="sma_type" />
          {/* <YAxis /> */}
          <Tooltip formatter={(value) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Clients']} />
          <Bar
            dataKey="client_count"
            barSize={100}
            fill="#8884d8"
            // label={({ value }) => `${value}`}
            // label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          />
          <Line 
            type="monotone" 
            dataKey="client_count" 
            stroke="#ff7300" 
            // label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const SMARadarChart = ({ data }) => {
  const radarData = Array.isArray(data)
    ? data.map(d => ({ subject: d.sma_type, A: +d.client_count, fullMark: 100 }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">SMA Count (Radar Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SMAScatterChart = ({ data }) => {
  const scatterData = Array.isArray(data)
    ? data.map((d, i) => ({ x: i, y: +d.client_count, sma: d.sma_type }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-96">
      <h4 className="text-md font-bold mb-4">SMA Count (Scatter Chart)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis dataKey="x" name="SMA" tickFormatter={(i) => data[i]?.sma_type} />
          <YAxis dataKey="y" name="Clients" />
          <Tooltip formatter={(value) => [value, 'Clients']} />
          <Scatter data={scatterData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};




const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

const [dashboard1, setDashboard1] = useState([]);
const [dashboard2, setDashboard2] = useState([]);

const fetchDashboardData = async () => {
  try {
    const response = await PostAPI(`getClientsdashboard?user=${user.id}&mode=Top10`);
    console.log("Dashboard API response:", response);

    if (response?.data?.success) {
      const clientsData = response.data.dashboard1 || [];
      setDashboard1(clientsData);
      setDashboard2(response.data.dashboard2 || []);
      setClients(clientsData); // <-- Important fix
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};


useEffect(() => {
  if (user?.id) {
    fetchDashboardData();
  }
}, [user]);


  const handleLogout = () => {
    logout();
    navigate("/");
  };


  const fetchDataByMode = async (mode) => {
  try {
    const res = await PostAPI(`getClientsdashboard?user=${user.id}&mode=${mode}`);
    return res.data;
  } catch (e) {
    console.error(`Error fetching ${mode}`, e);
    return null;
  }
};

const [contractsSummary, setContractsSummary] = useState([]);
const [smaSummary, setSmaSummary] = useState([]);
const [activeClients, setActiveClients] = useState([]);
const [systemUsage, setSystemUsage] = useState([]);
const [topClients, setTopClients] = useState([]);
const [ExpiredSMA, setExpiredSMA] = useState([]);
const [upcomingExpirations, setUpcomingExpirations] = useState([]);
const [SMADashboard, setSMADashboard] = useState([]);
const [Industry, setIndustry] = useState([]);
const [SMAApplication, setSMAApplication] = useState([]);

useEffect(() => {
  if (!user?.id) return;

  const loadDashboard = async () => {
    const [
      contractsSummary,
      smaSummary,
      activeClients,
      systemUsage,
      topClients,
      ExpiredSMA,
      expirations,
      SMADashboard,
      Industry,
      SMAApplication,
    ] = await Promise.all([
      fetchDataByMode("ContractsSummary"),
      fetchDataByMode("ClientsWithSMA"),
      fetchDataByMode("ActiveClients"),
      fetchDataByMode("SystemUsage"),
      fetchDataByMode("TopActiveClients"),
      fetchDataByMode("ExpiredSMA"),
      fetchDataByMode("UpcomingExpirations"),
      fetchDataByMode("SMADashboard"),
      fetchDataByMode("Industry"),
      fetchDataByMode("SMAApplication"),
    ]);

    console.log("ContractsSummary:", contractsSummary);
    console.log("ClientsWithSMA:", smaSummary);
    console.log("ActiveClients:", activeClients);
    console.log("SystemUsage:", systemUsage);
    console.log("TopActiveClients:", topClients);
    console.log("UpcomingExpirations:", expirations);
    console.log("ExpiredSMA:", ExpiredSMA);
    console.log("SMADashboard:", SMADashboard);
    console.log("Industry:", SMADashboard);
    console.log("SMAApplication:", SMAApplication);

    setContractsSummary(contractsSummary?.dashboard1 || []);
    setSmaSummary(smaSummary?.dashboard1 || []);
    setActiveClients(activeClients?.dashboard1 || []);
    setSystemUsage(systemUsage?.dashboard1 || []);
    setTopClients(topClients?.dashboard1 || []);
    setExpiredSMA(ExpiredSMA?.dashboard1 || []);
    setUpcomingExpirations(expirations?.dashboard1 || []);
    setSMADashboard(SMADashboard?.dashboard1 || []);
    setIndustry(Industry?.dashboard1 || []);
    setSMAApplication(SMAApplication?.dashboard1 || []);
  };

  loadDashboard();
}, [user]);


  return (
    
<div className="flex h-screen font-poppins">

      <main className="flex-1 p-4 bg-white">
        <div className="relative flex-1 p-2">
          {/* Top Right Icons */}
          <div className="absolute top-0 right-0 flex items-center space-x-4">
            <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-gray-500 cursor-pointer" />
            <div className="relative">
              <img
                src="3135715.png"
                alt="Profile"
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <ul className="py-2 text-gray-700">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                      <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Welcome Message */}
          <h2 className="text-3xl font-bold mt-10 mb-4">Welcome, {user ? user.username : "Guest"}!</h2>
        </div>

        {/* My Clients Section */}
        {/* <div className="bg-white p-6 w-[450px] rounded-lg shadow-md relative">
          <h3 className="text-lg font-bold mb-4">My Clients</h3>
          {clients.length === 0 ? (
            <p className="text-gray-500">Loading clients...</p>
          ) : (
            <>
              <ul className="space-y-2 text-md text-sm">
                {clients.map((client, index) => (
                  <li key={index} className="text-gray-900">{client.client_name}</li>
                ))}
              </ul>
              <hr className="mt-3 mb-2"/>
              <button
                // onClick={() => setIsModalOpen(true)}
                onClick={() => navigate('/clients')}
                className="absolute bottom-2 right-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All <span className="ml-1">→</span>
              </button>
            </>
          )}
        </div> */}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

  <SystemsBarChart data={systemUsage || []} />
  {/* <SystemsPieChart data={systemUsage || []} /> */}
  {/* <SystemsAreaChart data={systemUsage || []} /> */}
  {/* <SystemsComposedChart data={systemUsage || []} /> */}
  {/* <SystemsRadarChart  data={systemUsage || []} /> */}
  {/* <SystemsScatterChart  data={systemUsage || []} /> */}
  {/* <SystemsLineChart  data={systemUsage || []} /> */}

  {/* <SMABarChart data={SMADashboard || []} /> */}
  <SMAPieChart data={SMADashboard || []} />
  {/* <SMAAreaChart data={SMADashboard || []} /> */}
  {/* <SMALineChart data={SMADashboard || []} /> */}
  {/* <SMAComposedChart data={SMADashboard || []} /> */}
  {/* <SMARadarChart data={SMADashboard || []} /> */}
  {/* <SMAScatterChart data={SMADashboard || []} /> */}



  {/* <IndustryBarChart data={Industry || []} /> */}
  <IndustryPieChart data={Industry || []} />
  {/* <IndustryAreaChart data={Industry || []} /> */}
  {/* <IndustryLineChart data={Industry || []} /> */}
  {/* <IndustryComposedChart data={Industry || []} /> */}
  {/* <IndustryRadarChart data={Industry || []} /> */}
  {/* <IndustryScatterChart data={Industry || []} /> */}

  <SMAApplicationBarChart data={SMAApplication || []} />
</div>

{/* Dashboard Summary Section */}
<div className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
  <StatCard 
    title="Active Clients" 
    value={Number(activeClients?.[0]?.total_active_clients) || 0}  
  />
  <StatCard 
    title="Clients with SMA" 
    value={Number(smaSummary?.[0]?.with_sma) || 0} 
    color="blue" 
  />
  <StatCard 
    title="Expiring SMA" 
    value={Number(smaSummary?.[0]?.expiring_soon) || 0} 
    color="yellow" 
  />
</div>



<div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 shadow-xl pb-2">
  {/* <DashboardClientList title="Top Active Clients" data={topClients || []} /> */}
  <MiniTable title="Expired SMA of Active Clients (as of Today)" data={ExpiredSMA || []} />
  <MiniTable title="Upcoming SMA Expirations of Active Clients (within 60 Days)" data={upcomingExpirations || []} />
  {/* <SystemsBarChart data={systemUsage || []} /> */}

</div>





        {/* Client Lookup Modal */}
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