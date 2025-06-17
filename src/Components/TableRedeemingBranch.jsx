import { useNavigate } from 'react-router-dom';

const TableRedeemingBranch = ({ title, data, viewAllLink = '/clients' }) => {
  const navigate = useNavigate();
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-blue-50 p-4 rounded-lg shadow-md relative pb-12"> {/* Added pb-12 for space */}
      <h4 className="text-md font-bold mb-2">{title}</h4>

      {/* Header Row */}
      <div className="text-sm font-semibold grid grid-cols-[2fr_1fr] gap-2 mb-1 pb-1 pt-2">
        <div>Issuing Branch</div>
        <div className="text-right">Vouchers Issued</div> {/* Right aligned */}
      </div>

      {/* Data Rows */}
      <ul className="text-xs space-y-1">
        {safeData.length > 0 ? (
          safeData.map((item, idx) => (
            <li key={idx} className="grid grid-cols-[2fr_1fr] gap-2 pb-1">
              <div className="truncate">{item.client_name || item.name}</div>
              <div className="truncate text-right">{item.voucher_count || item.name}</div> {/* Right aligned */}
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
        View All Vouchers <span className="ml-1">→</span>
      </button>
    </div>
  );
};

export default TableRedeemingBranch;
