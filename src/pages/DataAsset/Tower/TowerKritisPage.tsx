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

interface TrendData {
  gi_gis: string;
  bay: string;
  trafo: string;
  value: number;
}

interface TrendMonth {
  bulan: string;
  data: TrendData[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: TowerData[];
  data_trend_beban_trafo: TrendMonth[];
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

  // Color mapping for different transformer types based on gi_gis and bay
  const colorMap: { [key: string]: string } = {
    "GI 150KV JABABEKA TRF#3 150/20kV": "#145C72",
    "GIS 150KV PONCOL BARU II TRF#1 150/22kV": "#179FB7",
    "GIS 150KV PONCOL BARU II TRF#2 150/22kV": "#28A8E0",
    "GI 150KV JUISHIN TRF#1 150/20kV": "#009A1A",
    "GI 150KV MEKARSARI TRF#3 150/20kV": "#FF5050",
    "GI 150KV MEKARSARI TRF#4 150/20kV": "#FFD05B",
    "GI 150KV TAMAN MEKAR TRF#1 150/22kV": "#FF53DD",
    "GI 150KV TEGALHERANG TRF#3 150/20kV": "#800000",
  };

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

  // Transform trend data for chart
  const getChartData = () => {
    if (!apiData?.data_trend_beban_trafo) return [];
    const monthMap: { [key: string]: string } = {
      feb: "FEBRUARI",
      mar: "MARET",
      apr: "APRIL",
      mei: "MEI",
    };

    return apiData.data_trend_beban_trafo.map((month) => {
      const chartData: any = {
        month: monthMap[month.bulan] || month.bulan.toUpperCase(),
      };

      month.data.forEach((item) => {
        chartData[item.trafo] = item.value;
      });

      return chartData;
    });
  };

  // Get all unique transformer types for legend
  const getTransformerTypes = () => {
    if (!apiData?.data_trend_beban_trafo) return [];

    const types = new Set<string>();
    apiData.data_trend_beban_trafo.forEach((month) => {
      month.data.forEach((item) => {
        types.add(item.trafo);
      });
    });

    return Array.from(types);
  };

  // Get legend items from transformer data
  const getLegendItems = () => {
    if (!apiData?.data_trend_beban_trafo) return [];

    const legendItems: {
      [key: string]: { gi_gis: string; bay: string; trafo: string };
    } = {};

    apiData.data_trend_beban_trafo.forEach((month) => {
      month.data.forEach((item) => {
        if (!legendItems[item.trafo]) {
          legendItems[item.trafo] = {
            gi_gis: item.gi_gis,
            bay: item.bay,
            trafo: item.trafo,
          };
        }
      });
    });

    return Object.values(legendItems);
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
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey.split(" ")[2]} ${
                entry.dataKey.split(" ")[3]
              }: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

  return (
    <DefaultLayout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            TOWER KRITIS
          </h1>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8  rounded-full flex items-center justify-center ">
              <span className="text-white font-bold text-sm">📊</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#145C72]">
              TREND BEBAN TRAFO
            </h2>
          </div>

          <div className="h-64 md:h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />

                {getTransformerTypes().map((trafo) => (
                  <Bar
                    key={trafo}
                    dataKey={trafo}
                    fill={
                      colorMap[trafo] ||
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`
                    }
                  >
                    <LabelList dataKey={trafo} position="top" fontSize={10} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {getLegendItems().map((item) => (
              <div key={item.trafo} className="flex items-center">
                <div
                  className="w-3 h-3 mr-2 rounded"
                  style={{ backgroundColor: colorMap[item.trafo] }}
                ></div>
                <span className="text-gray-700 truncate">
                  {item.gi_gis} {item.bay}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center p-4 md:p-6 border-b bg-white">
            <div className="w-8 h-8  flex items-center justify-center ">
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
