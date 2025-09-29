import { useState } from "react";

interface UsulanPenggantiDataItem {
  cb: string;
  ct: string;
  cvt: string;
  ds: string;
  dse: string;
  la: string;
  sumber_mtu: string;
  tegangan: string;
}

interface UsulanPenggantiTabProps {
  data: UsulanPenggantiDataItem[];
}

const UsulanPenggantiTab: React.FC<UsulanPenggantiTabProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const totalPages = Math.ceil((data?.length || 0) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data?.slice(startIndex, startIndex + rowsPerPage) || [];

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number): void => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  // Show a message if there's no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden p-2 md:p-3 transition-all duration-300">
        <div className="text-[#145C72] p-2 md:p-4 flex gap-2 md:gap-3">
          <div className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] bg-[#145C72]"></div>
          <h3 className="font-bold text-sm md:text-base">USULAN PENGGANTIAN</h3>
        </div>
        <div className="p-8 text-center text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden p-2 md:p-3 transition-all duration-300">
      <div className="text-[#145C72] p-2 md:p-4 flex gap-2 md:gap-3">
        <div className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] bg-[#145C72]"></div>
        <h3 className="font-bold text-sm md:text-base">USULAN PENGGANTIAN</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="text-[#145C72]">
            <tr>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                No
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                Sumber MTU
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                Tegangan
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                CB
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                CT
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                CVT
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                DS
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                DSE
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                LA
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
            {paginatedData.map((item, index) => (
              <tr
                key={`${startIndex + index}`}
                className={`transition-colors duration-150 ${
                  index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                } hover:bg-opacity-80`}
              >
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {item.sumber_mtu || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {item.tegangan || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {item.cb || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {item.ct || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {item.cvt || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {item.ds || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {item.dse || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs">
                  {item.la || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Rows per page */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <span className="text-sm text-gray-700 whitespace-nowrap">
            Rows per page:
          </span>
          <div className="flex space-x-1">
            {[10, 25, 50, 100].map((rows) => (
              <button
                key={rows}
                onClick={() => handleRowsPerPageChange(rows)}
                className={`px-2 sm:px-3 py-1 rounded text-sm transition-colors duration-150 ${
                  rowsPerPage === rows
                    ? "bg-[#145C72] text-[#FFF11E]"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {rows}
              </button>
            ))}
          </div>
        </div>

        {/* Page info and navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          <span className="text-sm text-gray-700 mr-2">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + rowsPerPage, data.length)} of {data.length}
          </span>

          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-1 rounded transition-colors duration-150 shrink-0 ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Prev
          </button>

          {/* Page Numbers */}
          {(() => {
            const pages = [];
            const maxVisiblePages = 5;
            let startPage = Math.max(
              1,
              currentPage - Math.floor(maxVisiblePages / 2)
            );
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage < maxVisiblePages - 1) {
              startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => handlePageChange(1)}
                  className="px-2 sm:px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-150 shrink-0"
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pages.push(
                  <span
                    key="start-ellipsis"
                    className="px-2 text-gray-500 shrink-0"
                  >
                    ...
                  </span>
                );
              }
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-2 sm:px-3 py-1 rounded transition-colors duration-150 shrink-0 ${
                    currentPage === i
                      ? "bg-[#145C72] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i}
                </button>
              );
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span
                    key="end-ellipsis"
                    className="px-2 text-gray-500 shrink-0"
                  >
                    ...
                  </span>
                );
              }
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="px-2 sm:px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-150 shrink-0"
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-1 rounded transition-colors duration-150 shrink-0 ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsulanPenggantiTab;
