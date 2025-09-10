import React, { useState, useEffect } from "react";
import axios from "axios";
import DefaultLayout from "../../../layout/DefaultLayout";

interface K3Data {
  no: string;
  ultg: string;
  gardu_induk: string;
  bay_lokasi_kerja: string;
  tegangan: string;
  uraian_pekerjaan: string;
  rencana_mulai_tgl: string;
  rencana_mulai_jam: string;
  rencana_selesai_tgl: string;
  rencana_selesai_jam: string;
  pelaksana: string;
  penanggung_jawab: string;
  tim_safety_advisor: string;
  keterangan: string;
}

const JadwalK3: React.FC = () => {
  const [data, setData] = useState<K3Data[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState<boolean>(false);

  // Pagination - different items per page for mobile vs desktop
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const itemsPerPage = isMobile ? 5 : 10; // Fewer items on mobile for better UX

  // Filters
  const [dateStartFilter, setDateStartFilter] = useState<string>("");
  const [dateEndFilter, setDateEndFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    fetchK3Data();
  }, []);

  const fetchK3Data = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK_BE}/api/monitoring/hsse/pekerjaanK3`
      );

      const apiData = response.data.data;
      setData(apiData);
      setError(null);
    } catch (err) {
      console.error("Error fetching K3 data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date for comparison (YYYY-MM-DD)
  const formatDateForComparison = (dateString: string) => {
    try {
      // Handle MM/DD/YYYY format from API
      const [month, day, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } catch {
      return dateString;
    }
  };

  // Filter and search logic
  const filteredData = data.filter((item) => {
    // Convert API date format to comparable format
    const itemStartDate = formatDateForComparison(item.rencana_mulai_tgl);
    const itemEndDate = formatDateForComparison(item.rencana_selesai_tgl);

    // Date filters
    const dateMatch =
      (!dateStartFilter || itemStartDate >= dateStartFilter) &&
      (!dateEndFilter || itemEndDate <= dateEndFilter);

    // Search filter (tim safety, penanggung jawab, pelaksana, gardu induk)
    const searchMatch =
      !searchQuery ||
      item.tim_safety_advisor
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.penanggung_jawab.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pelaksana.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.gardu_induk.toLowerCase().includes(searchQuery.toLowerCase());

    return dateMatch && searchMatch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateStartFilter, dateEndFilter, searchQuery]);

  // Pagination component for mobile
  const MobilePagination = () => (
    <div className="flex flex-col space-y-3">
      <div className="text-xs text-gray-600 text-center">
        Halaman {currentPage} dari {totalPages} ({filteredData.length} total)
      </div>
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          ⏮️
        </button>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          ⬅️
        </button>
        <span className="px-3 py-2 text-xs bg-[#145C72] text-white rounded font-medium">
          {currentPage}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          ➡️
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          ⏭️
        </button>
      </div>
    </div>
  );

  // Desktop pagination component
  const DesktopPagination = () => (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Menampilkan {indexOfFirstItem + 1} sampai{" "}
        {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
        {filteredData.length} pekerjaan
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  ? "bg-[#145C72] text-white"
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
  );

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145C72]"></div>
          <span className="ml-3 text-gray-600">Loading jadwal K3 data...</span>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold">Error</p>
            <p>{error}</p>
            <button
              onClick={fetchK3Data}
              className="mt-4 px-4 py-2 bg-[#145C72] text-white rounded hover:bg-[#0f4a5c]"
            >
              Try Again
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-2 md:p-6">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            JADWAL PEKERJAAN K3
          </h1>

          {/* Filter Section */}
          <div className="bg-gradient-to-r from-[#E2F395] via-[#B8E6B8] to-[#A8D8EA] rounded-2xl p-3 md:p-4 mb-4 md:mb-6 shadow-lg border border-[#179FB7]/20">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              {/* Toggle Filter Button (Mobile) */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="lg:hidden px-4 py-2 bg-gradient-to-r from-[#145C72] to-[#179FB7] text-white rounded-full font-medium shadow-md text-sm"
              >
                {showFilter ? "🔼 Sembunyikan Filter" : "🔽 Tampilkan Filter"}
              </button>

              {/* Filter Controls */}
              <div
                className={`${showFilter ? "block" : "hidden"} lg:block w-full`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {/* Date Start Filter */}
                  <div className="flex flex-col justify-between">
                    <label className="block text-xs md:text-sm font-semibold text-[#145C72] mb-2">
                      📅 Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={dateStartFilter}
                      onChange={(e) => setDateStartFilter(e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-[#179FB7]/30 rounded-xl text-xs md:text-sm bg-white shadow-sm transition-all duration-200 cursor-pointer
                        focus:outline-none focus:border-[#145C72] focus:ring-2 focus:ring-[#145C72]/20
                        hover:border-[#179FB7]/50"
                    />
                  </div>

                  {/* Date End Filter */}
                  <div className="flex flex-col justify-between">
                    <label className="block text-xs md:text-sm font-semibold text-[#145C72] mb-2">
                      📅 Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={dateEndFilter}
                      onChange={(e) => setDateEndFilter(e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-[#179FB7]/30 rounded-xl text-xs md:text-sm bg-white shadow-sm transition-all duration-200 cursor-pointer
                        focus:outline-none focus:border-[#145C72] focus:ring-2 focus:ring-[#145C72]/20
                        hover:border-[#179FB7]/50"
                    />
                  </div>

                  {/* Search Input */}
                  <div className="relative md:col-span-2 lg:col-span-1">
                    <label className="block text-xs md:text-sm font-semibold text-[#145C72] mb-2">
                      🔍 Pencarian
                    </label>
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-[#179FB7]/30 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#145C72] focus:ring-2 focus:ring-[#145C72]/20 bg-white shadow-sm transition-all duration-200 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setDateStartFilter("");
                        setDateEndFilter("");
                        setSearchQuery("");
                      }}
                      className="w-full px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 text-xs md:text-sm font-medium shadow-md"
                    >
                      🗑️ Hapus Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop View */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#145C72] flex items-center">
              📋 Jadwal Pekerjaan K3
              <span className="ml-2 px-3 py-1 bg-[#179FB7] text-white text-sm rounded-full">
                {filteredData.length} pekerjaan
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-[#145C72]">
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    No
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    ULTG
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Gardu Induk
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Tegangan (kV)
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Bay/Lokasi Kerja
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Uraian Pekerjaan
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Rencana Mulai
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Rencana Selesai
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Pelaksana
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Penanggung Jawab
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-white">
                    Tim Safety Advisor
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr
                    key={item.no}
                    className={`border-b border-gray-200 hover:bg-gradient-to-r hover:from-[#E2F395]/20 hover:to-[#A8D8EA]/20 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-4 text-[11px] text-gray-900 font-medium">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      <span className="px-2 py-1 bg-[#179FB7]/10 text-[#145C72] rounded-md font-medium">
                        {item.ultg}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900 font-medium">
                      {item.gardu_induk}
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
                        {item.tegangan} kV
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      {item.bay_lokasi_kerja}
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      <span className="px-2 py-1 bg-[#E2F395]/50 text-[#145C72] rounded-md">
                        {item.uraian_pekerjaan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.rencana_mulai_tgl}
                        </span>
                        <span className="text-[#179FB7]">
                          {item.rencana_mulai_jam}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.rencana_selesai_tgl}
                        </span>
                        <span className="text-[#179FB7]">
                          {item.rencana_selesai_jam}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-[10px]">
                        {item.pelaksana}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-[10px]">
                        {item.penanggung_jawab}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-gray-900">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-[10px] font-medium">
                        {item.tim_safety_advisor}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          <div className="mt-6">
            <DesktopPagination />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-bold text-[#145C72] flex items-center mb-4">
              📋 Jadwal Pekerjaan K3
              <span className="ml-2 px-2 py-1 bg-[#179FB7] text-white text-xs rounded-full">
                {filteredData.length}
              </span>
            </h2>
          </div>

          {currentItems.map((item, index) => (
            <div
              key={item.no}
              className="bg-white rounded-lg p-4 shadow-md border-l-4 border-[#145C72] space-y-3"
            >
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-[#145C72] text-white text-xs rounded font-bold">
                      #{indexOfFirstItem + index + 1}
                    </span>
                    <span className="px-2 py-1 bg-[#179FB7]/10 text-[#145C72] rounded text-xs font-medium">
                      {item.ultg}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">
                      {item.tegangan} kV
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    {item.gardu_induk}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    📍 {item.bay_lokasi_kerja}
                  </p>
                </div>
              </div>

              {/* Work Description */}
              <div className="bg-[#E2F395]/30 p-3 rounded-lg">
                <p className="text-xs font-medium text-[#145C72]">
                  📋 {item.uraian_pekerjaan}
                </p>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-2 rounded-lg">
                  <p className="text-xs text-green-700 font-semibold mb-1">
                    🚀 Mulai
                  </p>
                  <p className="text-xs text-gray-800 font-medium">
                    {item.rencana_mulai_tgl}
                  </p>
                  <p className="text-xs text-[#179FB7]">
                    {item.rencana_mulai_jam}
                  </p>
                </div>
                <div className="bg-red-50 p-2 rounded-lg">
                  <p className="text-xs text-red-700 font-semibold mb-1">
                    🏁 Selesai
                  </p>
                  <p className="text-xs text-gray-800 font-medium">
                    {item.rencana_selesai_tgl}
                  </p>
                  <p className="text-xs text-[#179FB7]">
                    {item.rencana_selesai_jam}
                  </p>
                </div>
              </div>

              {/* Team Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-16">
                    👷 Pelaksana:
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex-1">
                    {item.pelaksana}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-16">👨‍💼 PJ:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex-1">
                    {item.penanggung_jawab}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-16">🛡️ Safety:</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs flex-1 font-medium">
                    {item.tim_safety_advisor}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Pagination */}
          {filteredData.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-md">
              <MobilePagination />
            </div>
          )}
        </div>

        {/* No Data Message */}
        {filteredData.length === 0 && !loading && (
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <p className="text-gray-500 text-lg mb-2">📭</p>
            <p className="text-gray-600">
              Tidak ada data yang sesuai dengan filter
            </p>
            <button
              onClick={() => {
                setDateStartFilter("");
                setDateEndFilter("");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-[#145C72] text-white rounded-lg text-sm"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default JadwalK3;
