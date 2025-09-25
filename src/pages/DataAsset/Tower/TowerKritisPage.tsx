import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import DefaultLayout from "../../../layout/DefaultLayout";

interface TowerData {
  tgl_temuan: string;
  ultg: string;
  no_tower: string;
  sts: string;
  nilai_justifikasi: string;
  lingkungan: string;
  pondasi: string;
  tower: string;
  progress: string;
  status: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: TowerData[];
}

interface ChartData {
  ultg: string;
  P0_count: number;
  P1_count: number;
  avg_progress: number;
  total_towers: number;
}

const TowerKritisPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterULTG, setFilterULTG] = useState("");
  const [filterSTS, setFilterSTS] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [hoveredStatus, setHoveredStatus] = useState<{
    index: number;
    text: string;
  } | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTowerKritisData();
  }, []);

  const fetchTowerKritisData = async () => {
    setLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK_BE
    }/api/data-asset/tower-kritis`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });
      console.log("kritis", res.data);
      setApiData(res.data);
    } catch (error: any) {
      console.log(error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Transform tower data for chart
  const getTowerChartData = (): ChartData[] => {
    if (!apiData?.data) return [];

    const ultgGroups: { [key: string]: TowerData[] } = {};

    apiData.data.forEach((item) => {
      if (!ultgGroups[item.ultg]) {
        ultgGroups[item.ultg] = [];
      }
      ultgGroups[item.ultg].push(item);
    });

    return Object.keys(ultgGroups).map((ultg) => {
      const towers = ultgGroups[ultg];
      const p0Count = towers.filter((t) => t.sts === "P0").length;
      const p1Count = towers.filter((t) => t.sts === "P1").length;

      // Calculate average progress
      const totalProgress = towers.reduce((sum, tower) => {
        const progressValue =
          parseInt(tower.progress.replace("%", ""), 10) || 0;
        return sum + progressValue;
      }, 0);

      const avgProgress =
        towers.length > 0 ? Math.round(totalProgress / towers.length) : 0;

      return {
        ultg,
        P0_count: p0Count,
        P1_count: p1Count,
        avg_progress: avgProgress,
        total_towers: towers.length,
      };
    });
  };

  // Get unique values for filters
  const getUniqueULTG = () => {
    if (!apiData?.data) return [];
    return [...new Set(apiData.data.map((item) => item.ultg))];
  };

  const getUniqueSTS = () => {
    if (!apiData?.data) return [];
    return [...new Set(apiData.data.map((item) => item.sts))];
  };

  const getUniqueYears = () => {
    if (!apiData?.data) return [];
    return [...new Set(apiData.data.map((item) => item.tgl_temuan))].sort();
  };

  // Filter and search logic
  const getFilteredData = () => {
    if (!apiData?.data) return [];

    return apiData.data.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesULTG = filterULTG === "" || item.ultg === filterULTG;
      const matchesSTS = filterSTS === "" || item.sts === filterSTS;
      const matchesYear = filterYear === "" || item.tgl_temuan === filterYear;

      return matchesSearch && matchesULTG && matchesSTS && matchesYear;
    });
  };

  // Function to truncate text and show full text on hover
  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Pagination logic
  const filteredData = getFilteredData();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterULTG, filterSTS, filterYear]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium text-gray-900">ULTG: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === "P0_count" && `P0 Count: ${entry.value}`}
              {entry.dataKey === "P1_count" && `P1 Count: ${entry.value}`}
              {entry.dataKey === "avg_progress" &&
                `Avg Progress: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show loading state
  if (loading) {
    return (
      <DefaultLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-[#145C72]"></div>
            <p className="mt-4 text-[#145C72] text-sm md:text-base">
              Loading data...
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            TOWER KRITIS
          </h1>
        </div>

        {/* Tower Statistics Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">📊</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#145C72]">
              STATISTIK TOWER PER ULTG
            </h2>
          </div>

          <div className="h-64 md:h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getTowerChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ultg" tick={{ fontSize: 12 }} interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />

                <Bar dataKey="P0_count" fill="#FF5050" name="P0 Count">
                  <LabelList dataKey="P0_count" position="top" fontSize={10} />
                </Bar>
                <Bar dataKey="P1_count" fill="#179FB7" name="P1 Count">
                  <LabelList dataKey="P1_count" position="top" fontSize={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div
                className="w-3 h-3 mr-2 rounded"
                style={{ backgroundColor: "#FF5050" }}
              ></div>
              <span className="text-gray-700">P0 Count</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-3 h-3 mr-2 rounded"
                style={{ backgroundColor: "#179FB7" }}
              ></div>
              <span className="text-gray-700">P1 Count</span>
            </div>
          </div>
        </div>

        {/* Table - Rest of the component remains the same */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* ... rest of your existing table code ... */}
          <div className="flex items-center p-4 md:p-6 border-b bg-white">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-white font-bold text-sm">📋</span>
            </div>
            <h2
              className="text-lg md:text-xl font-bold"
              style={{ color: "#145C72" }}
            >
              TOWER KRITIS UPT BEKASI
            </h2>
          </div>

          {/* Filters and Search */}
          <div className="p-4 md:p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              {/* ULTG Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ULTG
                </label>
                <select
                  value={filterULTG}
                  onChange={(e) => setFilterULTG(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="">All ULTG</option>
                  {getUniqueULTG().map((ultg) => (
                    <option key={ultg} value={ultg}>
                      {ultg}
                    </option>
                  ))}
                </select>
              </div>

              {/* STS Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  STS
                </label>
                <select
                  value={filterSTS}
                  onChange={(e) => setFilterSTS(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="">All STS</option>
                  {getUniqueSTS().map((sts) => (
                    <option key={sts} value={sts}>
                      {sts}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="">All Years</option>
                  {getUniqueYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {/* Clear Filters */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(searchTerm || filterULTG || filterSTS || filterYear) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterULTG("");
                      setFilterSTS("");
                      setFilterYear("");
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Table */}
          <div className="block md:hidden">
            {currentItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No data found matching your filters
              </div>
            ) : (
              currentItems.map((item, mobileIndex) => (
                <div
                  key={mobileIndex}
                  className={`p-4 border-b border-gray-200 ${
                    mobileIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">No:</span>
                      <span>{indexOfFirstItem + mobileIndex + 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Tanggal Temuan:
                      </span>
                      <span>{item.tgl_temuan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">ULTG:</span>
                      <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-sm">
                        {item.ultg}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        No.Tower:
                      </span>
                      <span>{item.no_tower}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">STS:</span>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          item.sts === "P1"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.sts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Nilai Justifikasi:
                      </span>
                      <span>{item.nilai_justifikasi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Lingkungan:
                      </span>
                      <span className="text-red-600 text-sm">
                        {item.lingkungan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Progress:
                      </span>
                      <span>{item.progress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <div className="relative">
                        <span
                          className="text-[#145C72] text-sm cursor-help"
                          onMouseEnter={() =>
                            setHoveredStatus({
                              index: indexOfFirstItem + mobileIndex,
                              text: item.status,
                            })
                          }
                          onMouseLeave={() => setHoveredStatus(null)}
                        >
                          {truncateText(item.status)}
                        </span>
                        {hoveredStatus &&
                          hoveredStatus.index ===
                            indexOfFirstItem + mobileIndex && (
                            <div className="absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg bottom-full mb-1 left-0 whitespace-nowrap max-w-xs">
                              {hoveredStatus.text}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table - Fixed whitespace issue */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    No
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    Tanggal Temuan
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    ULTG
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    No.Tower
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    STS
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    Nilai Justifikasi
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF0000" }}
                  >
                    Lingkungan
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF0000" }}
                  >
                    Pondasi
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF0000" }}
                  >
                    Tower
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    Progress
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-3 py-2 text-center text-gray-500"
                    >
                      No data found matching your filters
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, tableIndex) => (
                    <tr
                      key={tableIndex}
                      className={`hover:bg-gray-50 ${
                        tableIndex % 2 === 0 ? "bg-white" : ""
                      }`}
                      style={{
                        backgroundColor:
                          tableIndex % 2 === 0 ? "white" : "#CDE9ED",
                      }}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72] ">
                        {indexOfFirstItem + tableIndex + 1}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72] ">
                        {item.tgl_temuan}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap ">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                          {item.ultg}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72] ">
                        {item.no_tower}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap ">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.sts === "P1"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.sts}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72] ">
                        {item.nilai_justifikasi}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 ">
                        {item.lingkungan}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 ">
                        {item.pondasi}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 ">
                        {item.tower}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72]">
                        <div className="w-16 h-5 bg-red-200 rounded-full overflow-hidden flex items-center justify-center">
                          {(() => {
                            const progressValue = parseInt(
                              item.progress.replace("%", ""),
                              10
                            );

                            if (progressValue === 0) {
                              return (
                                <span className="text-xs font-medium text-red-600">
                                  {item.progress}
                                </span>
                              );
                            }

                            let barColor = "red";
                            if (progressValue < 34) barColor = "red";
                            else if (progressValue < 67) barColor = "orange";
                            else barColor = "green";

                            return (
                              <div
                                className="h-5 text-center text-xs font-medium flex items-center justify-center text-white transition-all duration-300"
                                style={{
                                  width: item.progress,
                                  backgroundColor: barColor,
                                }}
                              >
                                {item.progress}
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72] relative">
                        <div className="relative">
                          <span
                            className="cursor-help"
                            onMouseEnter={() =>
                              setHoveredStatus({
                                index: indexOfFirstItem + tableIndex,
                                text: item.status,
                              })
                            }
                            onMouseLeave={() => setHoveredStatus(null)}
                          >
                            {truncateText(item.status)}
                          </span>
                          {hoveredStatus &&
                            hoveredStatus.index ===
                              indexOfFirstItem + tableIndex && (
                              <div className="absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg bottom-full mb-1 right-0 whitespace-nowrap max-w-xs">
                                {hoveredStatus.text}
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 sm:px-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-[11px] text-gray-700 mb-4 sm:mb-0">
                  Rows per page:
                  <select
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={itemsPerPage}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 text-sm"
                  >
                    ❮
                  </button>

                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, pageIndex) => {
                      const pageNum = Math.max(1, currentPage - 2) + pageIndex;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded text-sm min-w-[40px] ${
                            currentPage === pageNum
                              ? "bg-[#145C72] text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-sm text-gray-600 px-2">
                    ... {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 text-sm"
                  >
                    ❯
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TowerKritisPage;
