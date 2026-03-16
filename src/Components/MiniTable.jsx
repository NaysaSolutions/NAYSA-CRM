import { useNavigate } from "react-router-dom";
import { ChevronRight, Table2 } from "lucide-react";

const MiniTable = ({ title, data, viewAllLink = "/clients" }) => {
  const navigate = useNavigate();
  const safeData = Array.isArray(data) ? data : [];
  const totalCount = safeData.length;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm md:text-base font-semibold text-slate-800">
            {title || "Client List"}
          </h4>
        </div>

        <div className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Total: {totalCount}
        </div>
      </div>

      {/* Table Section */}
      <div className="max-h-[320px] overflow-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
            <tr className="border-b border-slate-200 text-left">
              <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Client
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                App Type
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Expiry Date
              </th>
            </tr>
          </thead>

          <tbody>
            {totalCount > 0 ? (
              safeData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 text-[8px] sm:text-[11px] transition-colors duration-200 hover:bg-blue-50/70"
                >
                  <td className="py-[-2px] px-2 sm:px-3">
                    <div className="max-w-[300px] truncate font-medium text-slate-700">
                      {item.client_name || item.name || "-"}
                    </div>
                  </td>

                  <td className="px-2 sm:px-3 py-1">
                    <span className="block w-full rounded-lg bg-blue-100 px-2 py-1 text-[8px] sm:text-[11px] font-semibold text-blue-700 text-left leading-none">
                      {item.app_type || "-"}
                    </span>
                  </td>

                  <td className="py-[-2px] px-2 sm:px-3 text-slate-600">
                    {item.sma_date
                      ? new Date(item.sma_date).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
                      <Table2 size={20} />
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      No data available
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      There are no records to display right now.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-3">
        <p className="text-xs text-slate-500">
          {totalCount > 0
            ? `Showing ${totalCount} record${totalCount > 1 ? "s" : ""}`
            : "No records found"}
        </p>

        <button
          onClick={() => navigate(viewAllLink)}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
        >
          View All
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default MiniTable;