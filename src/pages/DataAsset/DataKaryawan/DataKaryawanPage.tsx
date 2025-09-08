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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
} from "recharts";

// Types for the API response
interface Employee {
  grade: string;
  jenis_kelamin: string;
  jenjang: string;
  masa_kerja: string;
  nama: string;
  nip: string;
  pendidikan_terakhir: string;
  tahun_pensiun: string;
  unit: string;
}

interface ApiResponse {
  data_karyawan: Employee[];
  ftk: Array<{
    unit: string;
    ftk: string;
    existing: string;
  }>;
  grade: Array<{
    grade: string;
    total: number;
  }>;
  grade_upt: Array<{
    grade: string;
    total: number;
  }>;
  grade_ultg_bekasi: Array<{
    grade: string;
    total: number;
  }>;
  grade_ultg_cikarang: Array<{
    grade: string;
    total: number;
  }>;
  jenis_kelamin: Array<{
    jenis_kelamin: string;
    total: number;
  }>;
  jenis_kelamin_upt: Array<{
    jenis_kelamin: string;
    total: number;
  }>;
  jenis_kelamin_ultg_bekasi: Array<{
    jenis_kelamin: string;
    total: number;
  }>;
  jenis_kelamin_ultg_cikarang: Array<{
    jenis_kelamin: string;
    total: number;
  }>;
  masa_kerja: Array<{
    range: string;
    total: number;
  }>;
  masa_kerja_upt: Array<{
    range: string;
    total: number;
  }>;
  masa_kerja_ultg_bekasi: Array<{
    range: string;
    total: number;
  }>;
  masa_kerja_ultg_cikarang: Array<{
    range: string;
    total: number;
  }>;
  pegawai_pensiun: Array<{
    tahun_pensiun: string;
    total: number;
  }>;
  pegawai_pensiun_upt: Array<{
    tahun_pensiun: string;
    total: number;
  }>;
  pegawai_pensiun_ultg_bekasi: Array<{
    tahun_pensiun: string;
    total: number;
  }>;
  pegawai_pensiun_ultg_cikarang: Array<{
    tahun_pensiun: string;
    total: number;
  }>;
  pegawai: number;
  pegawai_upt: number;
  pegawai_ultg_bekasi: number;
  pegawai_ultg_cikarang: number;
  tad: number;
  unit: Array<{
    unit: string;
    total: number;
  }>;
}

const DataKaryawanPage: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showRetirementDetail, setShowRetirementDetail] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK_BE}/api/data-asset/karyawan`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setData(res.data);
      console.log("Fetched employee data:", res.data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get filtered data based on active filter
  const getFilteredData = () => {
    if (!data) return null;

    switch (activeFilter) {
      case "UPT BEKASI":
        return {
          grade: data.grade_upt,
          jenis_kelamin: data.jenis_kelamin_upt,
          masa_kerja: data.masa_kerja_upt,
          pegawai_pensiun: data.pegawai_pensiun_upt,
          pegawai: data.pegawai_upt,
          data_karyawan: data.data_karyawan.filter(
            (emp) => emp.unit === "UPT BEKASI"
          ),
        };
      case "ULTG BEKASI":
        return {
          grade: data.grade_ultg_bekasi,
          jenis_kelamin: data.jenis_kelamin_ultg_bekasi,
          masa_kerja: data.masa_kerja_ultg_bekasi,
          pegawai_pensiun: data.pegawai_pensiun_ultg_bekasi,
          pegawai: data.pegawai_ultg_bekasi,
          data_karyawan: data.data_karyawan.filter(
            (emp) => emp.unit === "ULTG BEKASI"
          ),
        };
      case "ULTG CIKARANG":
        return {
          grade: data.grade_ultg_cikarang,
          jenis_kelamin: data.jenis_kelamin_ultg_cikarang,
          masa_kerja: data.masa_kerja_ultg_cikarang,
          pegawai_pensiun: data.pegawai_pensiun_ultg_cikarang,
          pegawai: data.pegawai_ultg_cikarang,
          data_karyawan: data.data_karyawan.filter(
            (emp) => emp.unit === "ULTG CIKARANG"
          ),
        };
      default:
        return {
          grade: data.grade,
          jenis_kelamin: data.jenis_kelamin,
          masa_kerja: data.masa_kerja,
          pegawai_pensiun: data.pegawai_pensiun,
          pegawai: data.pegawai,
          data_karyawan: data.data_karyawan,
        };
    }
  };

  if (loading || !data) {
    return (
      <DefaultLayout>
        <div className="min-h-screen p-4 flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </DefaultLayout>
    );
  }

  const filteredData = getFilteredData();
  if (!filteredData) return null;

  // Colors matching the image
  const COLORS = {
    lightGreen: "#E2F395",
    darkTeal: "#03585B",
    mediumTeal: "#10B981",
    pink: "#EC4899",
    gray: "#64748B",
    green: "#75D19E",
  };

  // Expanded color palette
  const PIE_COLORS = [
    "#E2F395", // light green
    "#03585B", // dark teal
    "#10B981", // medium teal
    "#EC4899", // pink
    "#6366F1", // indigo
    "#F59E0B", // amber
    "#84CC16", // lime
    "#14B8A6", // cyan
    "#F87171", // red
    "#A855F7", // purple
  ];

  // Prepare data for charts based on filter
  const employeeCountData =
    activeFilter === "ALL"
      ? data.unit.map((unit) => ({
          name: unit.unit
            .replace("UPT BEKASI", "UPT BEKASI")
            .replace("ULTG BEKASI", "ULTG BEKASI")
            .replace("ULTG CIKARANG", "ULTG CIKARANG"),
          value: unit.total,
        }))
      : [{ name: activeFilter, value: filteredData.pegawai }];

  const personnelComparisonData = [
    {
      category: "PEGAWAI",
      value: filteredData.pegawai,
      color: COLORS.lightGreen,
    },
    {
      category: "TAD",
      value: activeFilter === "ALL" ? data.tad : 0, // TAD might not be available per unit
      color: COLORS.darkTeal,
    },
  ];

  const compositionData =
    activeFilter === "ALL"
      ? data.ftk.map((item) => ({
          unit: item.unit
            .replace("UPT BEKASI", "UPT BEKASI")
            .replace("ULTG Bekasi", "ULTG BEKASI")
            .replace("ULTG Cikarang", "ULTG CIKARANG"),
          FTK: parseInt(item.ftk),
          EKSISTING: parseInt(item.existing),
        }))
      : data.ftk
          .filter((item) => item.unit.includes(activeFilter.split(" ")[0]))
          .map((item) => ({
            unit: item.unit
              .replace("UPT BEKASI", "UPT BEKASI")
              .replace("ULTG Bekasi", "ULTG BEKASI")
              .replace("ULTG Cikarang", "ULTG CIKARANG"),
            FTK: parseInt(item.ftk),
            EKSISTING: parseInt(item.existing),
          }));

  // Work period data with proper sorting and color mapping
  const workPeriodData = filteredData.masa_kerja
    .sort((a, b) => {
      const orderMap: { [key: string]: number } = {
        "0-5 tahun": 1,
        "6-10 tahun": 2,
        "11-15 tahun": 3,
        "16-20 tahun": 4,
        "26-30 tahun": 5,
        "31-35 tahun": 6,
        "36-40 tahun": 7,
      };
      return orderMap[a.range] - orderMap[b.range];
    })
    .map((item, index) => ({
      range: item.range,
      total: item.total,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));

  // Calculate gender totals
  const maleEmployees =
    filteredData.jenis_kelamin.find((g) => g.jenis_kelamin === "Male")?.total ||
    0;
  const femaleEmployees =
    filteredData.jenis_kelamin.find((g) => g.jenis_kelamin === "Female")
      ?.total || 0;

  // Calculate retirement totals
  const retirement2025 =
    filteredData.pegawai_pensiun.find((p) => p.tahun_pensiun === "2025")
      ?.total || 0;
  const retirement2026 =
    filteredData.pegawai_pensiun.find((p) => p.tahun_pensiun === "2026")
      ?.total || 0;

  // Pagination for employee table
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredData.data_karyawan.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(
    filteredData.data_karyawan.length / itemsPerPage
  );

  const CustomLegend = ({
    data,
    colors,
  }: {
    data: any[];
    colors: string[];
  }) => (
    <div className="flex flex-col space-y-1 ml-4">
      {data.map((entry, index) => (
        <div
          key={entry.name || entry.range || entry.grade}
          className="flex items-center text-xs"
        >
          <div
            className="w-3 h-3 rounded mr-2"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <span>
            {entry.name || entry.range || entry.grade}:{" "}
            {entry.value || entry.total}
          </span>
        </div>
      ))}
    </div>
  );

  if (activeTab === "DAFTAR PEGAWAI") {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          {/* Header */}
          <div className="mb-8 ">
            <h1 className="text-[32px] font-bold text-[#155C72] text-center mb-6">
              DATA KEPEGAWAIAN
            </h1>

            {/* Mobile-first responsive tabs and filters */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center bg-[#E2F395] rounded-2xl lg:rounded-full p-3 space-y-3 lg:space-y-0">
              {/* Tabs */}
              <div className="flex space-x-2 justify-center lg:justify-start">
                <button
                  onClick={() => setActiveTab("OVERVIEW")}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-300"
                >
                  OVERVIEW
                </button>
                <button
                  onClick={() => setActiveTab("DAFTAR PEGAWAI")}
                  className="px-4 py-2 bg-[#145C72] text-white rounded-full font-medium"
                >
                  DAFTAR PEGAWAI
                </button>
              </div>

              {/* Filters - Mobile responsive grid */}
              <div className="grid grid-cols-2 lg:flex lg:space-x-2 gap-2 lg:gap-0 text-center">
                {["ALL", "UPT BEKASI", "ULTG BEKASI", "ULTG CIKARANG"].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setCurrentPage(1); // Reset pagination when filter changes
                      }}
                      className={`flex items-center justify-center gap-1 px-2 lg:px-3 py-2 text-xs lg:text-[11px] rounded-full transition-colors relative ${
                        activeFilter === filter
                          ? "bg-[#145C72] text-white"
                          : "bg-white border border-[#179FB7] text-[#179FB7] hover:bg-gray-100"
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Daftar Pegawai {activeFilter !== "ALL" ? `- ${activeFilter}` : ""}
              ({filteredData.data_karyawan.length} pegawai)
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      NIP
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      Jenis Kelamin
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      Pendidikan
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      Masa Kerja
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                      Tahun Pensiun
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.map((employee, index) => (
                    <tr
                      key={employee.nip}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-[11px] text-gray-900">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-900">
                        {employee.nip}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-900 font-medium">
                        {employee.nama}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-900">
                        {employee.unit}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-900">
                        {employee.grade}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-900">
                        {employee.jenis_kelamin}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-900">
                        {employee.pendidikan_terakhir}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-900">
                        {employee.masa_kerja} tahun
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-900">
                        {employee.tahun_pensiun}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-[11px] text-gray-700">
                Menampilkan {indexOfFirstItem + 1} sampai{" "}
                {Math.min(indexOfLastItem, filteredData.data_karyawan.length)}{" "}
                dari {filteredData.data_karyawan.length} pegawai
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Previous
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNum = Math.max(1, currentPage - 2) + index;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded ${
                        currentPage === pageNum
                          ? "bg-teal-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-6 mb-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-700 text-center mb-6">
            DATA KEPEGAWAIAN
          </h1>

          {/* Mobile-first responsive tabs and filters */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center bg-[#E2F395] rounded-2xl lg:rounded-full p-3 space-y-3 lg:space-y-0">
            {/* Tabs */}
            <div className="flex space-x-2 justify-center lg:justify-start">
              <button
                onClick={() => setActiveTab("OVERVIEW")}
                className="px-4 py-2 bg-[#145C72] text-white rounded-full font-medium"
              >
                OVERVIEW
              </button>
              <button
                onClick={() => setActiveTab("DAFTAR PEGAWAI")}
                className="px-4 py-2 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-300"
              >
                DAFTAR PEGAWAI
              </button>
            </div>

            {/* Filters - Mobile responsive grid */}
            <div className="grid grid-cols-2 lg:flex lg:space-x-2 gap-2 lg:gap-0 text-center">
              {["ALL", "UPT BEKASI", "ULTG BEKASI", "ULTG CIKARANG"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                    }}
                    className={`flex items-center justify-center gap-1 px-2 lg:px-3 py-2 text-xs lg:text-[11px] rounded-full transition-colors relative ${
                      activeFilter === filter
                        ? "bg-[#145C72] text-white"
                        : "bg-white border border-[#179FB7] text-[#179FB7] hover:bg-gray-100"
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          {/* First Row - Equal Height Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[600px]">
            {/* Left Column - Employee Count Chart and Composition - 40% on desktop */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-lg p-6 flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-teal-600 font-bold">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    JUMLAH PEGAWAI{" "}
                    {activeFilter !== "ALL" && `- ${activeFilter}`}
                  </h3>
                </div>

                <div className="flex flex-1">
                  <ResponsiveContainer width="70%" height="100%">
                    <LineChart data={employeeCountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS.green}
                        strokeWidth={3}
                        dot={{ fill: COLORS.green, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Legend on the right */}
                  <div className="w-30% flex flex-col justify-center space-y-2 ml-4">
                    {/* Summary Cards */}
                    {activeFilter === "ALL" ? (
                      <div className="grid grid-cols-1 gap-2">
                        <div className="text-center">
                          <div className="text-[11px] text-gray-600">
                            UPT BEKASI
                          </div>
                          <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                            {data.pegawai_upt}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[11px] text-gray-600">
                            ULTG BEKASI
                          </div>
                          <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                            {data.pegawai_ultg_bekasi}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[11px] text-gray-600">
                            ULTG CIKARANG
                          </div>
                          <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                            {data.pegawai_ultg_cikarang}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="bg-lime-200 rounded-lg p-3 text-center">
                          <div className="text-[11px] text-gray-600">
                            {activeFilter}
                          </div>
                          <div className="text-xl font-bold text-gray-800">
                            {filteredData.pegawai}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Employee Composition - Takes remaining space */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-4 flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-teal-600 font-bold">📈</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    KOMPOSISI PEGAWAI
                  </h3>
                </div>

                <div className="flex flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={compositionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="FTK" fill={COLORS.green}>
                        {" "}
                        <LabelList
                          dataKey="FTK"
                          position="insideTop"
                          fill="#FFFFFF"
                          formatter={(label: any) => `${label}`}
                        />
                        <Cell />
                      </Bar>
                      <Bar dataKey="EKSISTING" fill={COLORS.pink}>
                        {" "}
                        <LabelList
                          dataKey="EKSISTING"
                          position="insideTop"
                          fill="#FFFFFF"
                          formatter={(label: any) => `${label}`}
                        />
                        <Cell />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <CustomLegend
                    data={[
                      { name: "FTK", value: "" },
                      { name: "EKSISTING", value: "" },
                    ]}
                    colors={[COLORS.green, COLORS.pink]}
                  />
                </div>
              </div>
            </div>

            {/* Middle Column - Personnel Comparison and Work Period - 30% on desktop */}
            <div className="lg:col-span-3 flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-lg p-6 flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-teal-600 font-bold">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    DATA PERSONIL
                  </h3>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={personnelComparisonData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.darkTeal}>
                      {personnelComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="insideTop"
                        fill="#FFFFFF"
                        formatter={(label: any) => `${label}`}
                      />
                      {personnelComparisonData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 mt-4 flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-teal-600 font-bold">⏰</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    MASA KERJA
                  </h3>
                </div>

                <div className="flex items-center flex-1">
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={workPeriodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="total"
                        nameKey="range"
                      >
                        {workPeriodData.map((entry, index) => (
                          <Cell
                            key={`cell-${index} ${entry}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Masa Kerja Legend */}
                  <div className="grid grid-cols-2 gap-2 text-xs flex-1 items-center">
                    {workPeriodData.map((item, index) => (
                      <div key={item.range} className="flex flex-col gap-1">
                        <span className="text-xs">{item.range}</span>
                        <div
                          className="flex items-center justify-between rounded p-2"
                          style={{
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                            color:
                              index === 1 || index === 3 ? "white" : "black",
                          }}
                        >
                          <span className="font-bold ml-2">{item.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Combined height for Gender, Grade, and Retirement - 35% on desktop */}
            <div className="lg:col-span-4 space-y-6">
              {/* Gender Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-teal-600 font-bold">👫</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    JENIS KELAMIN
                  </h3>
                </div>

                <div className="flex items-center mb-4">
                  {/* Pie Chart - Left Side */}
                  <div className="flex-shrink-0">
                    <ResponsiveContainer width={200} height={120}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "LAKI-LAKI", value: maleEmployees },
                            { name: "PEREMPUAN", value: femaleEmployees },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={50}
                          dataKey="value"
                        >
                          <Cell fill={COLORS.lightGreen} />
                          <Cell fill={COLORS.darkTeal} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Unit breakdown */}
                  {activeFilter === "ALL" ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Left Column - LAKI-LAKI */}
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-gray-700 font-medium text-[11px]">
                            LAKI-LAKI
                          </div>
                          <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                            {maleEmployees}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-700 font-medium text-[11px]">
                            UPT BEKASI
                          </div>
                          <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                            {data.jenis_kelamin_upt[1].total}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-700 font-medium text-[11px]">
                            ULTG BEKASI
                          </div>
                          <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                            {data.jenis_kelamin_ultg_bekasi[1].total}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-700 font-medium text-[11px]">
                            ULTG CIKARANG
                          </div>
                          <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                            {data.jenis_kelamin_ultg_cikarang[1].total}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - PEREMPUAN */}
                      <div className="space-y-2">
                        <div className=" text-center ">
                          <div className="text-gray-700 font-medium text-[11px]">
                            PEREMPUAN
                          </div>
                          <div
                            className="text-xl font-bold text-[#E2F395] p-3 rounded-lg"
                            style={{ backgroundColor: COLORS.darkTeal }}
                          >
                            {femaleEmployees}
                          </div>
                        </div>
                        <div className=" text-center ">
                          <div className="text-gray-700 font-medium text-[11px]">
                            UPT BEKASI
                          </div>
                          <div
                            className="text-xl font-bold text-[#E2F395] p-3 rounded-lg"
                            style={{ backgroundColor: COLORS.darkTeal }}
                          >
                            {data.jenis_kelamin_upt[0].total}
                          </div>
                        </div>
                        <div className=" text-center ">
                          <div className="text-gray-700 font-medium text-[11px]">
                            ULTG BEKASI
                          </div>
                          <div
                            className="text-xl font-bold text-[#E2F395] p-3 rounded-lg"
                            style={{ backgroundColor: COLORS.darkTeal }}
                          >
                            {data.jenis_kelamin_ultg_bekasi[0].total}
                          </div>
                        </div>
                        <div className=" text-center ">
                          <div className="text-gray-700 font-medium text-[11px]">
                            ULTG CIKARANG
                          </div>
                          <div
                            className="text-xl font-bold text-[#E2F395] p-3 rounded-lg"
                            style={{ backgroundColor: COLORS.darkTeal }}
                          >
                            {data.jenis_kelamin_ultg_cikarang[0].total}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                      <div className="bg-lime-200 rounded-lg p-3 text-center">
                        <div className="text-gray-700 font-medium">
                          LAKI-LAKI
                        </div>
                        <div className="text-xl font-bold p-3 text-gray-800">
                          {maleEmployees}
                        </div>
                      </div>
                      <div
                        className="rounded-lg p-3 text-center text-white"
                        style={{ backgroundColor: COLORS.darkTeal }}
                      >
                        <div className="font-medium">PEREMPUAN</div>
                        <div className="text-xl font-bold p-3">
                          {femaleEmployees}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Grade Distribution and Retirement in same row */}
              <div className="grid grid-cols-1  gap-4">
                {/* Grade Distribution */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-teal-600 font-bold">🎯</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      GRADE
                    </h3>
                  </div>

                  <div className="flex items-center">
                    <ResponsiveContainer width="40%" height={120}>
                      <PieChart>
                        <Pie
                          data={filteredData.grade}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={40}
                          dataKey="total"
                          nameKey="grade"
                        >
                          {filteredData.grade.map((entry, index) => (
                            <Cell
                              key={`cell-${index} ${entry}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Grade Legend */}
                    <div className="grid grid-cols-2 gap-1 text-xs flex-1">
                      {filteredData.grade.map((grade, index) => (
                        <div key={grade.grade} className="flex gap-1">
                          <span className="flex items-center justify-between p-2 rounded bg-teal-600 text-white">
                            {grade.grade}
                          </span>
                          <div
                            className="flex items-center w-full justify-between p-2 rounded"
                            style={{
                              backgroundColor:
                                PIE_COLORS[index % PIE_COLORS.length],
                              color:
                                index === 1 || index === 3 ? "white" : "black",
                            }}
                          >
                            <span className="font-bold">{grade.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Retirement Section */}
                <div className="bg-lime-100 p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-teal-600 font-bold">👴</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        PEGAWAI PENSIUN{" "}
                        {activeFilter !== "ALL" && `- ${activeFilter}`}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 space-x-8">
                    <div className="flex gap-3">
                      <div className="text-center">
                        <div className="text-[11px]  ">2025</div>
                        <div
                          className="text-3xl font-bold bg-teal-600 text-white px-2 py-1 rounded mb-2"
                          style={{ color: COLORS.green }}
                        >
                          {retirement2025}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[11px]  ">2026</div>

                        <div
                          className="text-3xl font-bold bg-teal-600 text-white px-2 py-1 rounded mb-2"
                          style={{ color: COLORS.green }}
                        >
                          {retirement2026}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRetirementDetail(true)}
                      className="bg-teal-600 text-white px-2 py-1 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                      DETAIL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Retirement Detail Popup */}
        {showRetirementDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Popup Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Detail Pegawai Pensiun{" "}
                  {activeFilter !== "ALL" && `- ${activeFilter}`}
                </h2>
                <button
                  onClick={() => setShowRetirementDetail(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Popup Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                          No
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                          Tahun Pensiun
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-700">
                          Jumlah Pegawai
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.pegawai_pensiun.map((retirement, index) => (
                        <tr
                          key={retirement.tahun_pensiun}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-[11px] text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-gray-900 font-medium">
                            {retirement.tahun_pensiun}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-gray-900">
                            {retirement.total} pegawai
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {filteredData.pegawai_pensiun
                        .slice(0, 5)
                        .reduce((sum, item) => sum + item.total, 0)}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      5 Tahun Ke Depan (2025-2029)
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {filteredData.pegawai_pensiun
                        .slice(0, 10)
                        .reduce((sum, item) => sum + item.total, 0)}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      10 Tahun Ke Depan (2025-2034)
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {filteredData.pegawai_pensiun.reduce(
                        (sum, item) => sum + item.total,
                        0
                      )}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      Total Keseluruhan
                    </div>
                  </div>
                </div>
              </div>

              {/* Popup Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRetirementDetail(false)}
                  className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default DataKaryawanPage;
