import React, { useState, useEffect } from "react";
import axios from "axios";
import DefaultLayout from "../../../layout/DefaultLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface TransmissionData {
  unit: string;
  ultg: string;
  gi: string;
  penghantar: string;
  tgl_input: string;
  jumlah: string;
  status: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: TransmissionData[];
  jumlah_data: number;
}

interface ChartData {
  ultg: string;
  NORMAL?: number;
  CRITICAL?: number;
  BAHAYA?: number;
  [key: string]: any;
}

const ROWKritisPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterULTG, setFilterULTG] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear().toString()
  );
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredCell, setHoveredCell] = useState<{
    index: number;
    field: string;
    text: string;
  } | null>(null);

  // Updated colors with more variations
  const statusColors = {
    NORMAL: "#10B981", // Green
    CRITICAL: "#EC4899", // Pink
    BAHAYA: "#3B82F6", // Blue
    BAHAYA_I: "#1E40AF", // Darker Blue
    BAHAYA_II: "#7C3AED", // Purple
    WARNING: "#F59E0B", // Amber
    ALERT: "#EF4444", // Red
    MAINTENANCE: "#6B7280", // Gray
    OPERATIONAL: "#059669", // Emerald
  };

  // Function to get color for any status (including dynamic ones)
  const getStatusColor = (status: string): string => {
    // First check if we have an exact match
    if (statusColors[status as keyof typeof statusColors]) {
      return statusColors[status as keyof typeof statusColors];
    }

    // Handle BAHAYA variations
    if (status.startsWith("BAHAYA")) {
      const variations = [
        "#3B82F6",
        "#1E40AF",
        "#7C3AED",
        "#4338CA",
        "#6366F1",
      ];
      const hash = status.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      return variations[Math.abs(hash) % variations.length];
    }

    // Handle CRITICAL variations
    if (status.startsWith("CRITICAL")) {
      const variations = [
        "#EC4899",
        "#BE185D",
        "#DB2777",
        "#E11D48",
        "#F43F5E",
      ];
      const hash = status.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      return variations[Math.abs(hash) % variations.length];
    }

    // Handle NORMAL variations
    if (status.startsWith("NORMAL")) {
      const variations = [
        "#10B981",
        "#059669",
        "#047857",
        "#065F46",
        "#34D399",
      ];
      const hash = status.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      return variations[Math.abs(hash) % variations.length];
    }

    // Default colors for unknown status types
    const defaultColors = [
      "#8B5CF6",
      "#F59E0B",
      "#EF4444",
      "#06B6D4",
      "#84CC16",
    ];
    const hash = status.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return defaultColors[Math.abs(hash) % defaultColors.length];
  };

  useEffect(() => {
    fetchTransmissionData();
  }, [filterYear]);

  const fetchTransmissionData = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK_BE}/api/data-asset/row-kritis`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        params: { tahun: filterYear },
        withCredentials: true,
      });
      console.log("transmission data", res.data);
      setApiData(res.data);
    } catch (error: any) {
      console.log(error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const getChartData = (): ChartData[] => {
    if (!apiData?.data) return [];

    const chartData: { [key: string]: ChartData } = {};

    apiData.data.forEach((item) => {
      const { ultg, status, jumlah } = item;
      const jumlahNum = parseInt(jumlah) || 0;

      if (!chartData[ultg]) {
        chartData[ultg] = { ultg };
      }

      if (!chartData[ultg][status]) {
        chartData[ultg][status] = 0;
      }

      chartData[ultg][status] += jumlahNum;
    });

    return Object.values(chartData);
  };

  // Prepare pie chart data
  const getPieChartData = () => {
    if (!apiData?.data) return [];

    const statusSummary: { [key: string]: number } = {};

    apiData.data.forEach((item) => {
      const { status, jumlah } = item;
      const jumlahNum = parseInt(jumlah) || 0;

      if (!statusSummary[status]) {
        statusSummary[status] = 0;
      }
      statusSummary[status] += jumlahNum;
    });

    return Object.entries(statusSummary).map(([status, value]) => ({
      name: status,
      value,
      color: getStatusColor(status),
    }));
  };

  // Custom label function for pie chart
  const renderPieLabel = (entry: any) => {
    const percent = entry.percent || 0;
    return `${entry.name} ${(percent * 100).toFixed(0)}%`;
  };

  // Get unique values for filters
  const getUniqueULTG = () => {
    if (!apiData?.data) return [];
    return [...new Set(apiData.data.map((item) => item.ultg))];
  };

  const getUniqueStatus = () => {
    if (!apiData?.data) return [];
    return [...new Set(apiData.data.map((item) => item.status))];
  };

  const getUniqueYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 1; year++) {
      years.push(year.toString());
    }
    return years;
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
      const matchesStatus = filterStatus === "" || item.status === filterStatus;

      return matchesSearch && matchesULTG && matchesStatus;
    });
  };

  // Function to truncate text and show full text on hover
  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Function to get status badge classes
  const getStatusBadgeStyle = (status: string) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: `${color}20`, // 20 for opacity (hex equivalent of 0.125)
      color: color,
    };
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
  }, [searchTerm, filterULTG, filterStatus]);

  const handleYearChange = (year: string) => {
    setFilterYear(year);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </DefaultLayout>
    );
  }

  const chartData = getChartData();
  const pieChartData = getPieChartData();
  const statuses = getUniqueStatus();

  return (
    <DefaultLayout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            DATA ROW KRITIS UPT BEKASI
          </h1>
        </div>

        {/* Combined Chart Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex items-center p-4 md:p-6 border-b bg-white">
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <TrendingUp className="text-[#145C72]" size={20} />
            </div>
            <h2
              className="text-lg md:text-xl font-bold"
              style={{ color: "#145C72" }}
            >
              Data Analysis - {filterYear}
            </h2>
          </div>

          <div className="p-4 md:p-6">
            {/* Charts Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#145C72] mb-4 text-center">
                  Status Distribution by ULTG
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="ultg"
                        tick={{ fontSize: 12, fill: "#374151" }}
                        angle={0}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#374151" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend />
                      {statuses.map((status) => (
                        <Bar
                          key={status}
                          dataKey={status}
                          fill={getStatusColor(status)}
                          name={status}
                          radius={[2, 2, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#145C72] mb-4 text-center">
                  Overall Status Distribution
                </h3>
                <div className="h-80 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderPieLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statuses.map((status) => {
                const total =
                  pieChartData.find((item) => item.name === status)?.value || 0;
                return (
                  <div
                    key={status}
                    className="bg-gray-50 p-4 rounded-lg border-l-4"
                    style={{
                      borderLeftColor: getStatusColor(status),
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {status}
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{
                            color: getStatusColor(status),
                          }}
                        >
                          {total}
                        </p>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(status),
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center p-4 md:p-6 border-b bg-white">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <h2
              className="text-lg md:text-xl font-bold"
              style={{ color: "#145C72" }}
            >
              ROW KRITIS UPT BEKASI
            </h2>
          </div>

          {/* Filters and Search */}
          <div className="p-4 md:p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div>
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

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="">All Status</option>
                  {getUniqueStatus().map((status) => (
                    <option key={status} value={status}>
                      {status}
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
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  {getUniqueYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                {(searchTerm || filterULTG || filterStatus) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterULTG("");
                      setFilterStatus("");
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 h-fit"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Data Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {currentItems.length} of {filteredData.length} entries
              {apiData && (
                <span className="ml-2">
                  (Total: {apiData.jumlah_data} records for {filterYear})
                </span>
              )}
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
                      <span className="font-medium text-gray-600">Unit:</span>
                      <span>{item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">ULTG:</span>
                      <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-sm">
                        {item.ultg}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">GI:</span>
                      <span className="text-right break-all">{item.gi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Penghantar:
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.penghantar}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Tanggal Input:
                      </span>
                      <span>{item.tgl_input}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Jumlah:</span>
                      <span className="font-semibold text-[#145C72]">
                        {item.jumlah}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span
                        className="px-2 py-1 rounded text-sm font-semibold"
                        style={getStatusBadgeStyle(item.status)}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
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
                    Unit
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
                    GI
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    Penghantar
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    Tanggal Input
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#145C72" }}
                  >
                    Jumlah
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
                      colSpan={8}
                      className="px-3 py-2 text-center text-gray-500"
                    >
                      No data found matching your filters
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, tableIndex) => (
                    <tr
                      key={tableIndex}
                      className={`hover:bg-gray-50`}
                      style={{
                        backgroundColor:
                          tableIndex % 2 === 0 ? "white" : "#CDE9ED",
                      }}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72]">
                        {indexOfFirstItem + tableIndex + 1}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72]">
                        {item.unit}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                          {item.ultg}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-[#145C72] max-w-xs">
                        <div className="relative">
                          <span
                            className="cursor-help"
                            onMouseEnter={() =>
                              setHoveredCell({
                                index: indexOfFirstItem + tableIndex,
                                field: "gi",
                                text: item.gi,
                              })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {truncateText(item.gi, 40)}
                          </span>
                          {hoveredCell &&
                            hoveredCell.index ===
                              indexOfFirstItem + tableIndex &&
                            hoveredCell.field === "gi" && (
                              <div className="absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg bottom-full mb-1 left-0 whitespace-normal max-w-xs break-words">
                                {hoveredCell.text}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                        {item.penghantar}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-[#145C72]">
                        {item.tgl_input}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-[#145C72]">
                        {item.jumlah}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={getStatusBadgeStyle(item.status)}
                        >
                          {item.status}
                        </span>
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
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
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

                  {totalPages > 5 && (
                    <span className="text-sm text-gray-600 px-2">
                      ... {totalPages}
                    </span>
                  )}

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

export default ROWKritisPage;
