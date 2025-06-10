import { useNavigate } from 'react-router-dom';

const MiniTable = ({ title, data, viewAllLink = '/clients' }) => {
  const navigate = useNavigate();
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-blue-50 p-4 rounded-lg shadow-md relative pb-12"> {/* Added pb-12 for space */}
      <h4 className="text-md font-bold mb-2">{title}</h4>

      {/* Header Row */}
      <div className="text-sm font-semibold grid grid-cols-[2fr_1fr_1fr] gap-2 mb-1 pb-1 pt-2">
        <div>Client</div>
        <div>App Type</div>
        <div>SMA Expiry Date</div>
      </div>

      {/* Data Rows */}
      <ul className="text-xs space-y-1">
        {safeData.length > 0 ? (
          safeData.map((item, idx) => (
            <li key={idx} className="grid grid-cols-[2fr_1fr_1fr] gap-2 pb-1">
              <div className="truncate">{item.client_name || item.name}</div>
              <div>{item.app_type || '-'}</div>
              <div>{item.sma_date ? new Date(item.sma_date).toLocaleDateString() : '-'}</div>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500 col-span-3 py-4">No data available</li>
        )}
      </ul>

      {/* Fixed View All Button */}
      <button
        onClick={() => navigate(viewAllLink)}
        className="absolute bottom-2 right-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
      >
        View All Clients <span className="ml-1">→</span>
      </button>
    </div>
  );
};

export default MiniTable;
