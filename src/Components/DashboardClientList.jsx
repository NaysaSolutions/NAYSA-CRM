const DashboardClientList = ({ title, data }) => {
  // Defensive: make sure data is an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h4 className="text-md font-bold mb-2">{title}</h4>
      <ul className="text-xs space-y-1">
        {safeData.map((item, idx) => (
          <li key={idx} className="border-b pb-1">
            {item.client_name || item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardClientList;