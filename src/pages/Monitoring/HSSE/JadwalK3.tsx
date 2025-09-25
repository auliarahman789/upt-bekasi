import React, { useState, useEffect, useRef, useMemo } from "react";
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
  LabelList,
} from "recharts";

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
  status_pekerjaan: string;
}

const JadwalK3: React.FC = () => {
  const [data, setData] = useState<K3Data[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState<boolean>(false);

  // Pagination - different items per page for mobile vs desktop
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const itemsPerPage = isMobile ? 5 : 10;

  // Filters - separate temp filters for form and applied filters
  const [tempDateStartFilter, setTempDateStartFilter] = useState<string>("");
  const [tempDateEndFilter, setTempDateEndFilter] = useState<string>("");
  const [tempSearchQuery, setTempSearchQuery] = useState<string>("");

  // Applied filters (used for actual filtering)
  const [dateStartFilter, setDateStartFilter] = useState<string>("");
  const [dateEndFilter, setDateEndFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Chart colors
  const CHART_COLORS = [
    "#145C72",
    "#179FB7",
    "#E2F395",
    "#B8E6B8",
    "#A8D8EA",
    "#B40404",
    "#E78700",
    "#4A90E2",
    "#50C878",
    "#FF6B6B",
    "#FFD93D",
    "#6BCF7F",
    "#4ECDC4",
    "#96CEB4",
    "#FFEAA7",
  ];

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
      console.log("API Response:", response.data);
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

  // Apply filters function
  const applyFilters = () => {
    setDateStartFilter(tempDateStartFilter);
    setDateEndFilter(tempDateEndFilter);
    setSearchQuery(tempSearchQuery);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  // Clear filters function
  const clearFilters = () => {
    setTempDateStartFilter("");
    setTempDateEndFilter("");
    setTempSearchQuery("");
    setDateStartFilter("");
    setDateEndFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Chart data processing
  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Add debugging
    console.log("Current year:", currentYear, "Current month:", currentMonth);
    console.log("Sample data item:", data[0]);

    // Helper function to parse date - try multiple formats
    const parseDate = (dateString: string): Date | null => {
      if (!dateString) return null;

      // Try different date formats
      const formats = [
        // DD/MM/YYYY
        () => {
          const [day, month, year] = dateString.split("/");
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        },
        // MM/DD/YYYY
        () => {
          const [month, day, year] = dateString.split("/");
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        },
        // YYYY-MM-DD
        () => new Date(dateString),
        // Try direct parsing
        () => new Date(dateString),
      ];

      for (const formatFn of formats) {
        try {
          const date = formatFn();
          if (date instanceof Date && !isNaN(date.getTime())) {
            return date;
          }
        } catch (e) {
          continue;
        }
      }
      return null;
    };

    // Helper function to check if date is in current month
    const isCurrentMonth = (dateString: string): boolean => {
      const date = parseDate(dateString);
      if (!date) return false;
      return (
        date.getFullYear() === currentYear &&
        date.getMonth() + 1 === currentMonth
      );
    };

    // Helper function to check if date is in current year
    const isCurrentYear = (dateString: string): boolean => {
      const date = parseDate(dateString);
      if (!date) return false;
      return date.getFullYear() === currentYear;
    };

    // Helper function to extract person names from tim_safety_advisor
    const extractPersonNames = (timSafetyString: string): string[] => {
      if (!timSafetyString) return [];

      const names = timSafetyString
        .split(",")
        .map((person) => {
          const trimmed = person.trim();
          const nameMatch = trimmed.match(/^([^(]+)/);
          const extractedName = nameMatch ? nameMatch[1].trim() : trimmed;
          return extractedName.toLowerCase();
        })
        .filter((name) => name.length > 0);

      return [...new Set(names)];
    };

    // 1. Chart Jumlah Pekerjaan dalam Bulan Berjalan
    const currentMonthData = data.filter((item) => {
      const isCurrentMonthItem = isCurrentMonth(item.rencana_mulai_tgl);
      console.log(`Checking ${item.rencana_mulai_tgl}: ${isCurrentMonthItem}`);
      return isCurrentMonthItem;
    });

    console.log("Current month data count:", currentMonthData.length);

    const pekerjaanBulanIni = currentMonthData.reduce((acc, item) => {
      const kategori = item.keterangan?.toUpperCase() || "TIDAK DIKETAHUI";
      const ultg = item.ultg?.toUpperCase() || "TIDAK DIKETAHUI";

      if (!acc[kategori]) acc[kategori] = {};
      if (!acc[kategori][ultg]) acc[kategori][ultg] = 0;
      acc[kategori][ultg]++;

      return acc;
    }, {} as Record<string, Record<string, number>>);

    const chartPekerjaanBulanIni = Object.entries(pekerjaanBulanIni).flatMap(
      ([kategori, ultgData]) =>
        Object.entries(ultgData).map(([ultg, jumlah], index) => ({
          name: `${kategori} - ${ultg}`,
          kategori,
          ultg,
          jumlah,
          color: CHART_COLORS[index % CHART_COLORS.length],
        }))
    );

    // 2. Chart Nama personil dengan pekerjaan yang terselesaikan
    const personilData: Record<string, number> = {};

    const allStatuses = [
      ...new Set(data.map((item) => item.status_pekerjaan?.toUpperCase())),
    ];
    const completedStatuses = allStatuses.filter(
      (status) =>
        status &&
        (status.includes("TERLAKS") ||
          status.includes("SELESAI") ||
          status.includes("COMPLETE") ||
          status.includes("DONE"))
    );

    console.log("All statuses found:", allStatuses);
    console.log("Identified completed statuses:", completedStatuses);

    data.forEach((item) => {
      const itemStatus = item.status_pekerjaan?.toUpperCase();
      if (itemStatus && completedStatuses.includes(itemStatus)) {
        const names = extractPersonNames(item.tim_safety_advisor);

        names.forEach((name) => {
          const properName = name.charAt(0).toUpperCase() + name.slice(1);
          personilData[properName] = (personilData[properName] || 0) + 1;
        });
      }
    });

    const chartPersonil = Object.entries(personilData)
      .map(([name, jumlah], index) => ({
        name,
        jumlah,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 10);

    // 3. Chart Total Pengawasan selama tahun berjalan
    const currentYearData = data.filter((item) => {
      const isCurrentYearItem = isCurrentYear(item.rencana_mulai_tgl);
      console.log(`Year check ${item.rencana_mulai_tgl}: ${isCurrentYearItem}`);
      return isCurrentYearItem;
    });

    console.log("Current year data count:", currentYearData.length);

    const statusCount: Record<string, number> = {};
    currentYearData.forEach((item) => {
      const status = item.status_pekerjaan || "TIDAK DIKETAHUI";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const chartPengawasan = Object.entries(statusCount).map(
      ([status, jumlah]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        jumlah,
      })
    );

    console.log("Chart pengawasan data:", chartPengawasan);

    return {
      pekerjaanBulanIni: chartPekerjaanBulanIni,
      personil: chartPersonil,
      pengawasan: chartPengawasan,
      currentYear,
    };
  }, [data]);

  // Helper function to format date for comparison (YYYY-MM-DD)
  const formatDateForComparison = (dateString: string) => {
    try {
      const [month, day, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } catch {
      return dateString;
    }
  };

  // Filter and search logic
  const filteredData = data.filter((item) => {
    const itemStartDate = formatDateForComparison(item.rencana_mulai_tgl);
    const itemEndDate = formatDateForComparison(item.rencana_selesai_tgl);

    const dateMatch =
      (!dateStartFilter || itemStartDate >= dateStartFilter) &&
      (!dateEndFilter || itemEndDate <= dateEndFilter);

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

  // Get status color
  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase();
    if (statusUpper?.includes("TERLAKS") || statusUpper?.includes("SELESAI")) {
      return "bg-green-100 text-green-800";
    } else if (
      statusUpper?.includes("BATAL") ||
      statusUpper?.includes("CANCEL")
    ) {
      return "bg-red-100 text-red-800";
    } else if (
      statusUpper?.includes("TANPA") ||
      statusUpper?.includes("WITHOUT")
    ) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };
  // Custom label component for values on top of bars
  const CustomLabel = (props: any) => {
    const { x, y, width, value } = props;

    // Place label inside the bar if it's near the top to avoid cropping
    const shouldPlaceInside = y < 25;
    const labelY = shouldPlaceInside ? y + 20 : y - 8;
    const textColor = shouldPlaceInside ? "#fff" : "#145C72";

    return (
      <text
        x={x + width / 2}
        y={labelY}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fontWeight="bold"
        style={{
          textShadow: shouldPlaceInside
            ? "1px 1px 1px rgba(0,0,0,0.5)"
            : "none",
        }}
      >
        {value}
      </text>
    );
  };
  // Chart Components
  const ChartSection = () => (
    <div className="mb-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pekerjaan Bulan Berjalan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
              📊 PEKERJAAN BULAN BERJALAN
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.pekerjaanBulanIni}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="font-medium text-gray-800 text-sm mb-2">
                            {label}
                          </p>
                          <p className="text-sm text-[#145C72]">
                            Jumlah: {payload[0].value} pekerjaan
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="jumlah">
                  <LabelList content={CustomLabel} />
                  {chartData.pekerjaanBulanIni.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Personil */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
              👷 TOP PERSONIL TERSELESAIKAN
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.personil}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="font-medium text-gray-800 text-sm mb-2">
                            {label}
                          </p>
                          <p className="text-sm text-[#179FB7]">
                            Pekerjaan Selesai: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="jumlah">
                  <LabelList content={CustomLabel} />
                  {chartData.personil.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Status Pengawasan - Full Width */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
              📋 STATUS PENGAWASAN {chartData.currentYear}
            </h3>
          </div>
          <div className="flex flex-col lg:flex-row items-center">
            <div className="h-80 w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pengawasan}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      if (
                        !props ||
                        typeof props.name === "undefined" ||
                        typeof props.value === "undefined"
                      ) {
                        return "";
                      }
                      const total = chartData.pengawasan.reduce(
                        (sum, item) => sum + item.jumlah,
                        0
                      );
                      const value =
                        typeof props.value === "number" ? props.value : 0;
                      const percent = ((value / total) * 100).toFixed(1);
                      return `${props.name}: ${percent}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="jumlah"
                  >
                    {chartData.pengawasan.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = chartData.pengawasan.reduce(
                          (sum, item) => sum + item.jumlah,
                          0
                        );
                        const value = payload[0].value as number;
                        const percent = ((value / total) * 100).toFixed(1);
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                            <p className="font-medium text-gray-800 text-sm mb-2">
                              {payload[0].name}
                            </p>
                            <p className="text-sm text-[#145C72]">
                              Total: {payload[0].value} pekerjaan ({percent}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
              <div className="space-y-3">
                {chartData.pengawasan.map((item, index) => {
                  const total = chartData.pengawasan.reduce(
                    (sum, entry) => sum + entry.jumlah,
                    0
                  );
                  const percent = ((item.jumlah / total) * 100).toFixed(1);
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        ></div>
                        <span className="text-sm font-medium text-gray-800">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#145C72] block">
                          {item.jumlah}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({percent}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Pagination components
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

  // Custom Date Input component
  const CustomDateInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }> = ({ label, value, onChange, placeholder = "dd/mm/yyyy" }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.showPicker?.();
      }
    };

    return (
      <div className="flex flex-col justify-between">
        <label className="block text-xs md:text-sm font-semibold text-[#145C72] mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onClick={handleClick}
            className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-[#179FB7]/30 rounded-xl text-xs md:text-sm bg-white shadow-sm transition-all duration-200 cursor-pointer
            focus:outline-none focus:border-[#145C72] focus:ring-2 focus:ring-[#145C72]/20
            hover:border-[#179FB7]/50
            date-input"
            placeholder={placeholder}
          />
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
            onClick={handleClick}
          >
            📅
          </div>
        </div>
      </div>
    );
  };

  // Filter Section Component
  const FilterSection = () => (
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
        <div className={`${showFilter ? "block" : "hidden"} lg:block w-full`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {/* Date Start Filter */}
            <div className="flex flex-col justify-between">
              <CustomDateInput
                label="📅 Tanggal Mulai"
                value={tempDateStartFilter}
                onChange={setTempDateStartFilter}
              />
            </div>

            {/* Date End Filter */}
            <div className="flex flex-col justify-between">
              <CustomDateInput
                label="📅 Tanggal Selesai"
                value={tempDateEndFilter}
                onChange={setTempDateEndFilter}
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
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-[#179FB7]/30 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#145C72] focus:ring-2 focus:ring-[#145C72]/20 bg-white shadow-sm transition-all duration-200 placeholder:text-gray-400"
              />
            </div>

            {/* Apply Filters Button */}
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-[#145C72] to-[#179FB7] text-white rounded-xl hover:from-[#0f4a5c] hover:to-[#147a94] text-xs md:text-sm font-medium shadow-md transition-all duration-200"
              >
                ✨ Tampilkan
              </button>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 text-xs md:text-sm font-medium shadow-md transition-all duration-200"
              >
                🗑️ Hapus Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
        </div>

        {/* Charts Section */}
        <ChartSection />

        {/* Filter Section - Moved here above the table */}
        <FilterSection />

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
                    Status Pekerjaan
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
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-medium ${getStatusColor(
                          item.status_pekerjaan
                        )}`}
                      >
                        {item.status_pekerjaan}
                      </span>
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

              {/* Status */}
              <div className="flex justify-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    item.status_pekerjaan
                  )}`}
                >
                  🚦 {item.status_pekerjaan}
                </span>
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
              onClick={clearFilters}
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
