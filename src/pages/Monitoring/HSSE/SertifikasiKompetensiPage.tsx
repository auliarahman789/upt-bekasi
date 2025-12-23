import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Award, Users, TrendingUp, FileText } from "lucide-react";
import DefaultLayout from "../../../layout/DefaultLayout";
import axios from "axios";

interface SertifikasiData {
  no: string;
  nip: string;
  nama: string;
  jenis: string;
  kualifikasi: string;
  no_sertifikat: string;
  no_registrasi: string;
  tgl_awal_berlaku: string;
  tgl_akhir_berlaku: string;
  pelaksana: string;
  keterangan: string;
  unit: string;
  berlaku: string;
}

interface JenisSertifikatData {
  no: string;
  jenis_sertifikat: string;
  persentase: string;
}

interface AnalisaKebutuhanData {
  judul_diklat: string;
  damkar_kelas_d: string;
  damkar_kelas_c: string;
  damkar_kelas_b: string;
  damkar_kelas_a: string;
  p3k: string;
  pengukuran: string;
  pengawasan_k3: string;
  ahli_k3_muda: string;
  ahli_k3_umum: string;
  auditor_smk3: string;
  ahli_k3_spesialis_listrik: string;
  gada_utama: string;
  auditor_smp: string;
}

const SertifikasiKompetensiPage: React.FC = () => {
  const [data, setData] = useState<SertifikasiData[]>([]);
  const [jenisSertifikat, setJenisSertifikat] = useState<JenisSertifikatData[]>(
    []
  );
  const [analisaKebutuhan, setAnalisaKebutuhan] = useState<
    AnalisaKebutuhanData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJenis, setSelectedJenis] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAllKebutuhan, setShowAllKebutuhan] = useState<boolean>(false);
  const COLORS = [
    "#145C72",
    "#1A7A8A",
    "#2E8B9B",
    "#4A9CAC",
    "#66ADBD",
    "#82BECE",
    "#9ECFDF",
    "#BAE0F0",
    "#CDE9ED",
    "#A5D8E0",
    "#7BC4D4",
    "#5AB5C8",
    "#3AA6BC",
  ];

  useEffect(() => {
    fetchSertifikasi();
  }, []);

  const fetchSertifikasi = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_LINK_BE
        }/api/monitoring/hsse/sertifikasi-kompetensi`
      );

      console.log("Sertifikasi Kompetensi Data:", response.data);

      if (response.data.status === "success") {
        setData(response.data.data_realisasi || []);
        setJenisSertifikat(response.data.data_jenis_sertifikat || []);
        setAnalisaKebutuhan(response.data.data_analisa_kebutuhan || []);
      }
    } catch (err) {
      console.error("Error fetching Sertifikasi Kompetensi data:", err);
      setError("Failed to fetch Sertifikasi Kompetensi");
    } finally {
      setLoading(false);
    }
  };

  // Get unique jenis for filter
  const uniqueJenis = ["All", ...new Set(data.map((item) => item.jenis))];

  // Filter data based on selected jenis and search term
  const filteredData = data.filter((item) => {
    const matchesJenis =
      selectedJenis === "All" || item.jenis === selectedJenis;
    const matchesSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kualifikasi.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesJenis && matchesSearch;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedJenis, searchTerm]);

  // Prepare chart data from jenis_sertifikat
  const chartData = jenisSertifikat.map((item) => ({
    name: item.jenis_sertifikat,
    persentase: parseFloat(item.persentase.replace("%", "")),
  }));

  // Prepare data for analisa kebutuhan table
  const kebutuhanTableData =
    analisaKebutuhan.length > 0
      ? [
          {
            category: "DAMKAR Kelas D",
            requirement: analisaKebutuhan[0].damkar_kelas_d,
          },
          {
            category: "DAMKAR Kelas C",
            requirement: analisaKebutuhan[0].damkar_kelas_c,
          },
          {
            category: "DAMKAR Kelas B",
            requirement: analisaKebutuhan[0].damkar_kelas_b,
          },
          {
            category: "DAMKAR Kelas A",
            requirement: analisaKebutuhan[0].damkar_kelas_a,
          },
          { category: "P3K", requirement: analisaKebutuhan[0].p3k },
          {
            category: "Pengukuran",
            requirement: analisaKebutuhan[0].pengukuran,
          },
          {
            category: "Pengawasan K3",
            requirement: analisaKebutuhan[0].pengawasan_k3,
          },
          {
            category: "Ahli K3 Muda",
            requirement: analisaKebutuhan[0].ahli_k3_muda,
          },
          {
            category: "Ahli K3 Umum",
            requirement: analisaKebutuhan[0].ahli_k3_umum,
          },
          {
            category: "Auditor SMK3",
            requirement: analisaKebutuhan[0].auditor_smk3,
          },
          {
            category: "Ahli K3 Spesialis Listrik",
            requirement: analisaKebutuhan[0].ahli_k3_spesialis_listrik,
          },
          {
            category: "Gada Utama",
            requirement: analisaKebutuhan[0].gada_utama,
          },
          {
            category: "Auditor SMP",
            requirement: analisaKebutuhan[0].auditor_smp,
          },
        ]
      : [];

  // Calculate statistics
  const totalSertifikasi = data.length;
  const berlakuCount = data.filter((item) => item.berlaku === "Berlaku").length;
  const uniquePersonnel = new Set(data.map((item) => item.nip)).size;

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

  if (error) {
    return (
      <DefaultLayout>
        <div className="p-4 md:p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
            <h3 className="text-sm font-medium text-red-800">
              Error loading data
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchSertifikasi}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
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
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#145C72] flex items-center gap-2">
            <Award className="w-6 h-6 md:w-8 md:h-8" />
            Sertifikasi Kompetensi
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            UPT Bekasi - Monitoring dan Realisasi Sertifikasi
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Total Sertifikasi
                </p>
                <p className="text-2xl md:text-3xl font-bold text-[#145C72] mt-1 md:mt-2">
                  {totalSertifikasi}
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-[#CDE9ED]">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-[#145C72]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Sertifikat Berlaku
                </p>
                <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1 md:mt-2">
                  {berlakuCount}
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Personel Tersertifikasi
                </p>
                <p className="text-2xl md:text-3xl font-bold text-[#145C72] mt-1 md:mt-2">
                  {uniquePersonnel}
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-[#CDE9ED]">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-[#145C72]" />
              </div>
            </div>
          </div>
        </div>

        {kebutuhanTableData.length > 0 && (
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold text-[#145C72] mb-2 md:mb-3">
              Analisa Kebutuhan Sertifikasi
            </h2>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2 md:gap-3">
                {(showAllKebutuhan
                  ? kebutuhanTableData
                  : kebutuhanTableData.slice(0, 7)
                ).map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-2 md:p-3 hover:shadow-md transition-shadow bg-gray-50"
                  >
                    <h3 className="text-xs md:text-sm font-semibold text-[#145C72] mb-1 md:mb-2">
                      {item.category}
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                      {item.requirement}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expand/Collapse Button */}
            {kebutuhanTableData.length > 7 && (
              <div className="mt-3 md:mt-4 flex justify-center">
                <button
                  onClick={() => setShowAllKebutuhan(!showAllKebutuhan)}
                  className="px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-medium bg-[#145C72] text-white rounded-lg hover:bg-[#1A7A8A] transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  {showAllKebutuhan ? (
                    <>
                      <span>Show Less</span>
                      <svg
                        className="w-4 h-4 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Show All ({kebutuhanTableData.length} items)</span>
                      <svg
                        className="w-4 h-4 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Persentase Pencapaian Chart - Full Width */}
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-4 md:mb-6">
          <h2 className="text-base md:text-lg font-semibold text-[#145C72] mb-2 md:mb-3">
            Persentase Pencapaian Sertifikasi
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 9 }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: "11px" }}
                formatter={(value: any) => `${value}%`}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="persentase" fill="#145C72" name="Persentase (%)">
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-200 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[#145C72] mb-1.5">
                Filter by Jenis
              </label>
              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145C72] focus:border-transparent"
              >
                {uniqueJenis.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[#145C72] mb-1.5">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by nama, NIP, or kualifikasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145C72] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-3 md:px-4 py-2 md:py-3 border-b">
            <h2 className="text-base md:text-lg font-semibold text-[#145C72]">
              Data Realisasi Sertifikasi
            </h2>
            <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">
              Showing {filteredData.length} of {totalSertifikasi} records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#CDE9ED]">
                <tr>
                  <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-bold text-[#145C72] uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-bold text-[#145C72] uppercase tracking-wider">
                    NIP
                  </th>
                  <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-bold text-[#145C72] uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-bold text-[#145C72] uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-bold text-[#145C72] uppercase tracking-wider">
                    Kualifikasi
                  </th>
                  <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-bold text-[#145C72] uppercase tracking-wider">
                    No Sertifikat
                  </th>
                  <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-bold text-[#145C72] uppercase tracking-wider">
                    Berlaku S/D
                  </th>
                  <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-[10px] md:text-xs font-bold text-[#145C72] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((item, index) => (
                  <tr
                    key={item.no}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-2 md:px-3 py-2 md:py-2.5 whitespace-nowrap text-[10px] md:text-xs font-medium text-[#145C72]">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-2 md:px-3 py-2 md:py-2.5 whitespace-nowrap text-[10px] md:text-xs text-[#145C72]">
                      {item.nip}
                    </td>
                    <td className="px-2 md:px-3 py-2 md:py-2.5 whitespace-nowrap text-[10px] md:text-xs text-[#145C72]">
                      {item.nama}
                    </td>
                    <td className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs text-[#145C72]">
                      {item.jenis}
                    </td>
                    <td className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs text-[#145C72]">
                      {item.kualifikasi}
                    </td>
                    <td className="px-2 md:px-3 py-2 md:py-2.5 whitespace-nowrap text-[10px] md:text-xs text-[#145C72]">
                      {item.no_sertifikat}
                    </td>
                    <td className="px-2 md:px-3 py-2 md:py-2.5 whitespace-nowrap text-[10px] md:text-xs text-[#145C72]">
                      {item.tgl_akhir_berlaku}
                    </td>
                    <td className="px-2 md:px-3 py-2 md:py-2.5 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] md:text-[10px] font-medium rounded-full ${
                          item.berlaku === "Berlaku"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.berlaku}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-6 md:py-8">
              <p className="text-sm md:text-base text-gray-600">
                No data found
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try adjusting your filters or search term
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-3 md:px-4 py-2 md:py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-[10px] md:text-xs text-gray-700 text-center sm:text-left">
                  Menampilkan {indexOfFirstItem + 1} sampai{" "}
                  {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
                  {filteredData.length} data
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 md:px-2.5 py-1 text-[10px] md:text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
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
                        className={`px-2 md:px-2.5 py-1 text-[10px] md:text-xs rounded transition-colors ${
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
                    className="px-2 md:px-2.5 py-1 text-[10px] md:text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
                  >
                    Next
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

export default SertifikasiKompetensiPage;
