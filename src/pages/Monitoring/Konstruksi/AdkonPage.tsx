// AdkonPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import DefaultLayout from "../../../layout/DefaultLayout";
import axios from "axios";

// Interfaces
interface Contract {
  no_kontrak: string;
  nama_kontrak: string;
  nilai_terkontrak: number;
  sudah_bayar: number;
  tgl_kontrak: string;
  tgl_efektif_kontrak: string;
  akhir_kontrak: string;
  fisik: string;
  bayar: string;
  status: string;
}

interface ProgressData {
  tahun: number;
  total_kontrak: number;
  progress_fisik: number;
  progress_bayar: number;
  data: any[];
}

interface ApiResponse {
  status: string;
  message: string;
  data_kontrak: Contract[];
  anggaran_investasi: {
    aki_terbayar: number;
    skki_terbit: number;
  };
  grafik_progres_fisik: ProgressData[];
  pratinjau_kontrak: Array<{
    status: string;
    total: number;
  }>;
}

const AdkonPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  // Fetch API data
  useEffect(() => {
    fetchAdkonData();
  }, []);

  const fetchAdkonData = async () => {
    setLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK_BE
    }/api/monitoring/konstruksi/adkonDalkon`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });
      console.log("Adkon", res.data);
      setApiData(res.data);
    } catch (error: any) {
      console.log(error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Process contract preview data from API
  const contractPreviewData = useMemo(() => {
    if (!apiData?.data_kontrak) return [];

    const statusCount = apiData.data_kontrak.reduce((acc, contract) => {
      const status = contract.status === "-" ? "KONSTRUKSI" : contract.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, count], index) => ({
      name: status,
      value: count,
      color: index === 0 ? "#E78700" : index === 1 ? "#46C65C" : "#145C72",
    }));
  }, [apiData?.data_kontrak]);

  // Process physical progress data from API
  const physicalProgressData = useMemo(() => {
    if (!apiData?.grafik_progres_fisik) return [];

    return apiData.grafik_progres_fisik.map((item) => ({
      year: item.tahun.toString(),
      kontrak: item.total_kontrak,
      progress: item.progress_fisik,
      bayar: item.progress_bayar,
    }));
  }, [apiData?.grafik_progres_fisik]);

  // Process investment data from API
  const investmentData = useMemo(() => {
    if (!apiData?.anggaran_investasi) return [];

    const { aki_terbayar, skki_terbit } = apiData.anggaran_investasi;
    const total = aki_terbayar + skki_terbit;

    return [
      {
        name: "SKKI TERBIT",
        value: Math.round((skki_terbit / total) * 100),
        color: "#FF7C50",
        amount: skki_terbit,
      },
      {
        name: "AKI TERBAYAR",
        value: Math.round((aki_terbayar / total) * 100),
        color: "#90DFDF",
        amount: aki_terbayar,
      },
    ];
  }, [apiData?.anggaran_investasi]);

  // Filter and search contracts
  const filteredContracts = useMemo(() => {
    if (!apiData?.data_kontrak) return [];

    let filtered = apiData.data_kontrak;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (contract) =>
          contract.no_kontrak
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          contract.nama_kontrak.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((contract) => {
        const status = contract.status === "-" ? "KONSTRUKSI" : contract.status;
        return status === statusFilter;
      });
    }

    // Year filter
    if (yearFilter !== "ALL") {
      filtered = filtered.filter((contract) => {
        const year = contract.tgl_kontrak
          ? new Date(contract.tgl_kontrak).getFullYear().toString()
          : "N/A";
        return year === yearFilter;
      });
    }

    return filtered;
  }, [apiData?.data_kontrak, searchTerm, statusFilter, yearFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredContracts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, endIndex);

  // Get unique years for filter
  const availableYears = useMemo(() => {
    if (!apiData?.data_kontrak) return [];

    const years = apiData.data_kontrak
      .map((contract) => {
        if (!contract.tgl_kontrak || contract.tgl_kontrak === "-") return "N/A";
        return new Date(contract.tgl_kontrak).getFullYear().toString();
      })
      .filter((year, index, self) => self.indexOf(year) === index)
      .sort();

    return years;
  }, [apiData?.data_kontrak]);

  // Get unique statuses for filter
  const availableStatuses = useMemo(() => {
    if (!apiData?.data_kontrak) return [];

    const statuses = apiData.data_kontrak
      .map((contract) =>
        contract.status === "-" ? "KONSTRUKSI" : contract.status
      )
      .filter((status, index, self) => self.indexOf(status) === index);

    return statuses;
  }, [apiData?.data_kontrak]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("id-ID");
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status === "-" ? "KONSTRUKSI" : status;
    switch (normalizedStatus) {
      case "KONSTRUKSI":
        return "bg-cyan-500 text-white";
      case "MASA PEMELIHARAAN":
        return "bg-gray-500 text-white";
      case "SELESAI":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-16 sm:w-20 bg-red-400 rounded-full h-3 flex-shrink-0">
      <div
        className="bg-green-400 h-3 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#145C72]"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl md:text-[32px] text-center font-bold text-[#155C72] mb-6">
            ADMINISTRASI KONTRAK
          </h1>
        </div>

        {/* Top Row Cards - Mobile Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Pratinjau Kontrak */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-3">
                <img src="/TowerAdkon.svg" className="text-white" alt="Icon" />
              </div>
              <h2 className="text-sm sm:text-lg font-semibold text-gray-700">
                PRATINJAU KONTRAK
              </h2>
            </div>
            <div className="flex justify-center">
              <ResponsiveContainer
                width="100%"
                height={150}
                className="sm:h-[200px]"
              >
                <PieChart>
                  <Pie
                    data={contractPreviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contractPreviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {contractPreviewData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-800">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress and Investment Section - Mobile Responsive */}
          <div className="col-span-1 lg:col-span-3 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Progress Fisik */}
              <div className="col-span-1 xl:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-3">
                    <img
                      src="/TowerAdkon.svg"
                      className="text-white"
                      alt="Icon"
                    />
                  </div>
                  <h2 className="text-sm sm:text-lg font-semibold text-gray-700">
                    PROGRESS FISIK
                  </h2>
                </div>

                {/* Legend - Mobile Responsive */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-600 mb-2 space-y-1 sm:space-y-0">
                    <span>
                      <span className="text-[#6EF585]">■</span> KONTRAK UPT
                      BEKASI
                    </span>
                    <span>
                      <span className="text-[#189FB7]">■</span> PROGRESS %
                    </span>
                    <span>
                      <span className="text-[#FF5050]">■</span> PROGRESS BAYAR %
                    </span>
                  </div>
                </div>

                <ResponsiveContainer
                  width="100%"
                  height={250}
                  className="sm:h-[300px]"
                >
                  <BarChart
                    data={physicalProgressData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="kontrak" fill="#6EF585" />
                    <Bar dataKey="progress" fill="#189FB7" />
                    <Bar dataKey="bayar" fill="#FF5050" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Anggaran Investasi */}
              <div className="">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-3">
                    <img
                      src="/TowerAdkon.svg"
                      className="text-white"
                      alt="Icon"
                    />
                  </div>
                  <h2 className="text-sm sm:text-lg font-semibold text-gray-700">
                    ANGGARAN INVESTASI
                  </h2>
                </div>

                {/* Chart and Values Side by Side */}
                <div className="flex items-center justify-between mb-4">
                  {/* Pie Chart */}
                  <div className="w-32 h-24 sm:w-44 sm:h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={investmentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          className="sm:outerRadius-[60]"
                          dataKey="value"
                        >
                          {investmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Values */}
                  <div className="ml-2 sm:ml-4 space-y-2 sm:space-y-4">
                    {investmentData.map((item, index) => (
                      <div key={index}>
                        <div className="text-xs sm:text-sm text-cyan-500 font-medium mb-1">
                          {item.name} (M)
                        </div>
                        <div
                          className={`text-white px-2 py-1 sm:px-3 sm:py-2 rounded font-bold text-sm sm:text-lg`}
                          style={{ backgroundColor: item.color }}
                        >
                          {(item.amount / 1000000000).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col">
                  {investmentData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-xs mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract List Table with Search and Filter */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex items-center p-4 sm:p-6 border-b">
            <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-3">
              <img src="/RekapAnomali/ultgAnomali.svg" alt="Icon" />
            </div>
            <h2 className="text-sm sm:text-lg font-semibold text-gray-700">
              DAFTAR KONTRAK
            </h2>
          </div>

          {/* Search and Filter Section */}
          <div className="p-4 sm:p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search Contract
                </label>
                <input
                  type="text"
                  placeholder="Search by contract number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#145C72] focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#145C72] focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Year
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#145C72] focus:border-transparent"
                >
                  <option value="ALL">All Years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {currentContracts.length} of {filteredContracts.length}{" "}
              contracts
              {searchTerm && ` (filtered by "${searchTerm}")`}
              {statusFilter !== "ALL" && ` (status: ${statusFilter})`}
              {yearFilter !== "ALL" && ` (year: ${yearFilter})`}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {currentContracts.map((contract, index) => (
              <div
                key={contract.no_kontrak}
                className="p-4 border-b border-gray-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-500">
                        No. {startIndex + index + 1}
                      </div>
                      <div className="text-sm font-medium text-[#145C72]">
                        {contract.no_kontrak}
                      </div>
                      <div className="text-sm text-[#145C72]">
                        {contract.nama_kontrak}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {contract.status === "-" ? "KONSTRUKSI" : contract.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Tgl Kontrak:</span>
                      <div className="text-[#145C72]">
                        {formatDate(contract.tgl_kontrak)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Akhir Kontrak:</span>
                      <div className="text-[#145C72]">
                        {formatDate(contract.akhir_kontrak)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">% Fisik</span>
                        <span className="text-[#145C72]">{contract.fisik}</span>
                      </div>
                      <ProgressBar
                        value={parseInt(contract.fisik.replace("%", "")) || 0}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">% Bayar</span>
                        <span className="text-[#145C72]">{contract.bayar}</span>
                      </div>
                      <ProgressBar
                        value={parseInt(contract.bayar.replace("%", "")) || 0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#E4FBFF]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    No Kontrak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    Nama Kontrak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    Tanggal Kontrak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    Akhir Kontrak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    %Fisik
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    %Bayar
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentContracts.map((contract, index) => (
                  <tr key={contract.no_kontrak} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {contract.no_kontrak}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-[13px] text-[#145C72] max-w-xs">
                      <div className="truncate" title={contract.nama_kontrak}>
                        {contract.nama_kontrak}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {formatDate(contract.tgl_kontrak)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {formatDate(contract.akhir_kontrak)}
                    </td>

                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      <div className="flex items-center space-x-3">
                        <ProgressBar
                          value={parseInt(contract.fisik.replace("%", "")) || 0}
                        />
                        <span className="text-xs sm:text-sm min-w-[3rem]">
                          {contract.fisik}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      <div className="flex items-center space-x-3">
                        <ProgressBar
                          value={parseInt(contract.bayar.replace("%", "")) || 0}
                        />
                        <span className="text-xs sm:text-sm min-w-[3rem]">
                          {contract.bayar}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          contract.status
                        )}`}
                      >
                        {contract.status === "-"
                          ? "KONSTRUKSI"
                          : contract.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredContracts.length > 0 && (
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

              {/* Page navigation */}
              <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
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
                  let endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  );

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
          )}

          {/* No Data Message */}
          {filteredContracts.length === 0 && !loading && (
            <div className="p-8 text-center">
              <div className="text-gray-500 text-lg mb-2">
                No contracts found
              </div>
              <div className="text-gray-400 text-sm">
                {searchTerm || statusFilter !== "ALL" || yearFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "No contract data available"}
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdkonPage;
