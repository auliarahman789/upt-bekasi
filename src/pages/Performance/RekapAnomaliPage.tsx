import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";

interface ApiResponse {
  status: string;
  message: string;
  anomali_gi: any[];
  anomali_jaringan: any[];
  anomali_proteksi: any[];
}

interface AnomalyItem {
  id: number;
  ultg: string;
  location: string;
  kondisi: string;
  year: string | number;
  type: string;
  tindakLanjut: string;
  status: string;
  kategori?: string;
  temuan_anomali?: string;
}

const RekapAnomaliPage = () => {
  const [selectedLocation, setSelectedLocation] = useState("JARINGAN");
  const [selectedAnomaly, setSelectedAnomaly] = useState("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // New filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ultgFilter, setUltgFilter] = useState("ALL");

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const fetchAnomalyData = async () => {
    setLoading(true);

    const url = `${
      import.meta.env.VITE_API_LINK_BE
    }/api/performance/rekap-anomali`;

    try {
      const response = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });

      console.log("API Response:", response.data);
      setApiData(response.data);
    } catch (error: any) {
      console.error("Error fetching sustainability data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map API categories to user-friendly types
  const mapCategoryToType = (kategori: string, location: string): string => {
    if (location === "JARINGAN") {
      const categoryMap: { [key: string]: string } = {
        bracing: "Besi Siku",
        isolator: "Isolator & Stringset",
        pondasi: "Pondasi",
        konduktor: "Konduktor",
        jointing: "Jointing",
        grounding: "Grounding",
        gsw: "GSW",
        span: "Konduktor",
      };
      return categoryMap[kategori?.toLowerCase()] || "Other";
    } else if (location === "GARDU INDUK") {
      const categoryMap: { [key: string]: string } = {
        rembesan_uit: "Oil Seepage UIT",
        kebocoran_sf6: "SF6 Gas Leakage",
        thermofisi: "Thermal Analysis",
        kebocoran_gas_sf6_uit: "SF6 Gas Leakage UIT",
        rembesan: "Oil Leakage",
        "oil leakage": "Oil Leakage",
      };
      return (
        categoryMap[kategori?.toLowerCase()] ||
        kategori?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
        "Other"
      );
    } else if (location === "PROTEKSI") {
      const categoryMap: { [key: string]: string } = {
        anounciator: "Annunciator",
        annunciator: "Annunciator",
        relay: "Relay",
        scada: "SCADA",
        matering: "Metering",
      };
      return categoryMap[kategori?.toLowerCase()] || "Other";
    }
    return kategori || "Other";
  };

  // Improved status mapping with more comprehensive logic
  const mapStatus = (apiStatus: string, tindakLanjut: string): string => {
    if (!apiStatus || apiStatus === "-") {
      // If no explicit status, infer from tindak lanjut
      if (tindakLanjut && tindakLanjut !== "-") {
        if (
          tindakLanjut.toLowerCase().includes("sudah") ||
          tindakLanjut.toLowerCase().includes("selesai") ||
          tindakLanjut.toLowerCase().includes("diperbaiki")
        ) {
          return "CLOSE";
        }
        return "PROGRESS";
      }
      return "OPEN";
    }

    const status = apiStatus.toUpperCase();
    if (status === "CLOSE" || status === "CLOSED") return "CLOSE";
    if (status === "PROGRESS" || status === "IN PROGRESS") return "PROGRESS";
    return "OPEN";
  };

  // Transform API data to match component structure
  const transformedData = useMemo((): AnomalyItem[] => {
    if (!apiData) return [];

    let rawData: any[] = [];

    switch (selectedLocation) {
      case "JARINGAN":
        rawData = apiData.anomali_jaringan || [];
        break;
      case "GARDU INDUK":
        rawData = apiData.anomali_gi || [];
        break;
      case "PROTEKSI":
        rawData = apiData.anomali_proteksi || [];
        break;
      default:
        rawData = [];
    }

    return rawData.map((item, index) => ({
      id: index + 1,
      ultg: item.ultg || "Unknown",
      location: item.lokasi || "Unknown Location",
      kondisi: item.kondisi || "Unknown",
      year: item.temuan_anomali || new Date().getFullYear(),
      type: mapCategoryToType(item.kategori, selectedLocation),
      tindakLanjut: item.tidak_lanjut || "No action specified",
      status: mapStatus(item.status, item.tidak_lanjut),
      kategori: item.kategori,
      temuan_anomali: item.temuan_anomali,
    }));
  }, [apiData, selectedLocation]);

  // Update anomaly types based on actual data from API
  const anomalyTypes = useMemo(() => {
    const baseTypes = [
      { key: "ALL", label: "ALL", icon: "/RekapAnomali/all.svg" },
    ];

    // Get unique types from transformed data
    const uniqueTypes = [...new Set(transformedData.map((item) => item.type))];

    const iconMap: { [key: string]: string } = {
      // JARINGAN icons
      Pondasi: "/RekapAnomali/Pondasi.svg",
      Konduktor: "/RekapAnomali/Konduktor.svg",
      "Isolator & Stringset": "/RekapAnomali/Isolasi.svg",
      "Besi Siku": "/RekapAnomali/BesiSiku.svg",
      Jointing: "/RekapAnomali/Jointing.svg",
      Grounding: "/RekapAnomali/Grounding.svg",
      GSW: "/RekapAnomali/GSW.svg",

      // GARDU INDUK icons - corrected to match the SVGs I provided
      "Oil Leakage": "/RekapAnomali/oil.svg",
      "Oil Seepage UIT": "/RekapAnomali/rembesan_uit.svg",
      "SF6 Gas Leakage": "/RekapAnomali/kebocoran_sf6.svg",
      "SF6 Gas Leakage UIT": "/RekapAnomali/kebocoran_gas_sf6_uit.svg",
      "Thermal Analysis": "/RekapAnomali/thermofisi.svg",

      // PROTEKSI icons
      Annunciator: "/RekapAnomali/annunciator.svg",
      Relay: "/RekapAnomali/relay.svg",
      SCADA: "/RekapAnomali/scada.svg",
      Metering: "/RekapAnomali/metering.svg",

      Other: "/RekapAnomali/other.svg", // Fallback icon
    };

    const dynamicTypes = uniqueTypes.map((type) => ({
      key: type,
      label: type,
      icon: iconMap[type] || "/RekapAnomali/other.svg",
    }));

    return [...baseTypes, ...dynamicTypes];
  }, [transformedData]);

  const locationTabs = ["JARINGAN", "GARDU INDUK", "PROTEKSI"];

  // Reset selected anomaly when location changes
  useEffect(() => {
    setSelectedAnomaly("ALL");
    setCurrentPage(1);
    setSearchTerm("");
    setStatusFilter("ALL");
    setUltgFilter("ALL");
  }, [selectedLocation]);

  // Reset pagination when anomaly selection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAnomaly, searchTerm, statusFilter, ultgFilter]);

  // Get unique ULTG values for filter dropdown
  const uniqueUltgs = useMemo(() => {
    const ultgs = [...new Set(transformedData.map((item) => item.ultg))];
    return ultgs.filter((ultg) => ultg && ultg !== "Unknown");
  }, [transformedData]);

  // Filter data based on all filters
  const filteredData = useMemo(() => {
    let filtered = transformedData;

    // Filter by anomaly type
    if (selectedAnomaly !== "ALL") {
      filtered = filtered.filter((item) => item.type === selectedAnomaly);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.ultg.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower) ||
          item.kondisi.toLowerCase().includes(searchLower) ||
          item.tindakLanjut.toLowerCase().includes(searchLower) ||
          item.type.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Filter by ULTG
    if (ultgFilter !== "ALL") {
      filtered = filtered.filter((item) => item.ultg === ultgFilter);
    }

    return filtered;
  }, [transformedData, selectedAnomaly, searchTerm, statusFilter, ultgFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  // Calculate pie chart data
  const pieData = useMemo(() => {
    const totalCount = filteredData.length;
    if (totalCount === 0) return [];

    const uniqueTypes = [...new Set(filteredData.map((item) => item.type))];
    const colors = [
      "#145C72",
      "#E78700",
      "#FF0000",
      "#0066FF",
      "#1B8B2E",
      "#179FB7",
      "#FF00CC",
    ];

    return uniqueTypes
      .map((type, index) => {
        const count = filteredData.filter((item) => item.type === type).length;
        const percentage =
          totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        return {
          name: type,
          value: percentage,
          color: colors[index % colors.length],
          count: count,
        };
      })
      .filter((item) => item.count > 0);
  }, [filteredData]);

  // Calculate bar chart data
  const barChartData = useMemo(() => {
    const uniqueTypes = [...new Set(filteredData.map((item) => item.type))];

    return uniqueTypes.map((type) => {
      const bekasi = filteredData.filter(
        (item) =>
          item.ultg?.toUpperCase().includes("BEKASI") && item.type === type
      ).length;
      const cikarang = filteredData.filter(
        (item) =>
          item.ultg?.toUpperCase().includes("CIKARANG") && item.type === type
      ).length;

      return {
        name: type.length > 12 ? type.substring(0, 12) + "..." : type,
        BEKASI: bekasi,
        CIKARANG: cikarang,
      };
    });
  }, [filteredData]);

  // Fixed BEKASI status calculation - group by actual categories present in data
  const bekasiStatusBarData = useMemo(() => {
    const bekasiData = transformedData.filter((item) =>
      item.ultg?.toUpperCase().includes("BEKASI")
    );

    // Get actual types present in BEKASI data
    const uniqueTypes = [...new Set(bekasiData.map((item) => item.type))];

    return uniqueTypes
      .map((type) => {
        const typeData = bekasiData.filter((item) => item.type === type);
        const total = typeData.length;
        const closed = typeData.filter(
          (item) => item.status === "CLOSE"
        ).length;
        const progress = typeData.filter(
          (item) => item.status === "PROGRESS"
        ).length;
        const open = typeData.filter((item) => item.status === "OPEN").length;

        const closedPercentage =
          total > 0 ? Math.round((closed / total) * 100) : 0;

        return {
          name: type,
          percentage: closedPercentage,
          closed: closed,
          progress: progress,
          open: open,
          total: total,
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total); // Sort by total count descending
  }, [transformedData]);

  // Fixed CIKARANG status calculation
  const cikarangStatusBarData = useMemo(() => {
    const cikarangData = transformedData.filter((item) =>
      item.ultg?.toUpperCase().includes("CIKARANG")
    );

    // Get actual types present in CIKARANG data
    const uniqueTypes = [...new Set(cikarangData.map((item) => item.type))];

    return uniqueTypes
      .map((type) => {
        const typeData = cikarangData.filter((item) => item.type === type);
        const total = typeData.length;
        const closed = typeData.filter(
          (item) => item.status === "CLOSE"
        ).length;
        const progress = typeData.filter(
          (item) => item.status === "PROGRESS"
        ).length;
        const open = typeData.filter((item) => item.status === "OPEN").length;

        const closedPercentage =
          total > 0 ? Math.round((closed / total) * 100) : 0;

        return {
          name: type,
          percentage: closedPercentage,
          closed: closed,
          progress: progress,
          open: open,
          total: total,
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total); // Sort by total count descending
  }, [transformedData]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#145C72]"></div>
            <p className="mt-4 text-[#145C72]">Loading anomaly data...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 sm:p-4">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold text-[#145C72] mb-2">
              REKAP ANOMALI UPT
            </h1>
          </div>

          {/* Header with Location Tabs - Mobile responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="flex flex-wrap gap-1 w-full sm:w-auto">
              {locationTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedLocation(tab)}
                  className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                    selectedLocation === tab
                      ? "bg-[#145C72] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            {/* Left Sidebar - Responsive */}
            <div className="w-full lg:w-56 bg-[#F4F4F4] rounded-lg shadow">
              <div className="mb-3">
                <h3 className="text-[#145C72] font-bold text-xs uppercase mb-2 px-3 pt-3">
                  JENIS ANOMALI
                </h3>
                <div className="space-y-1">
                  {anomalyTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setSelectedAnomaly(type.key)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors relative ${
                        selectedAnomaly === type.key
                          ? " text-[#145C72] font-bold "
                          : "text-[#145C72] hover:bg-gray-100"
                      }`}
                    >
                      {selectedAnomaly === type.key && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#179FB7] rounded-r"></div>
                      )}
                      <span className="flex items-center">
                        <img
                          src={type.icon}
                          className={`w-4 h-4 ${
                            selectedAnomaly === type.key
                              ? "filter-[#179FB7]"
                              : ""
                          }`}
                          style={
                            selectedAnomaly === type.key
                              ? {
                                  filter:
                                    "brightness(0) saturate(100%) invert(64%) sepia(71%) saturate(556%) hue-rotate(166deg) brightness(94%) contrast(88%)",
                                }
                              : {}
                          }
                        />
                      </span>
                      <span className="truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#F4F4F4] p-3 rounded-lg">
              {selectedAnomaly === "ALL" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
                  {/* Pie Chart - Responsive */}
                  <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                      <div className="w-full h-48 sm:h-48 justify-center items-center sm:col-span-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={60}
                              dataKey="value"
                              startAngle={90}
                              endAngle={450}
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, _, props) => [
                                `${value}% (${props.payload.count} Anomali)`,
                                props.payload.name,
                              ]}
                              labelStyle={{ color: "#145C72" }}
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend - Responsive */}
                      <div className="flex-1 space-y-1 sm:col-span-1">
                        {pieData.slice(0, 6).map((entry, index) => (
                          <div
                            key={index}
                            style={{ backgroundColor: entry.color }}
                            className="flex items-center w-full gap-2 rounded-full"
                          >
                            <div className="flex items-center gap-1 flex-1 px-2 py-1">
                              <span className="text-xs text-[#145C72] min-w-[30px] text-center bg-white rounded-full px-1">
                                {entry.value}%
                              </span>
                              <span className="text-xs text-white truncate">
                                {entry.name.length > 10
                                  ? entry.name.substring(0, 8) + "..."
                                  : entry.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart - Responsive */}
                  <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                    <div className="text-[#145C72] mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#145C72]"></div>
                          <span className="text-xs">ULTG Bekasi</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#179FB7]"></div>
                          <span className="text-xs">ULTG Cikarang</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-48 sm:h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 9 }}
                            angle={-15}
                            textAnchor="end"
                            height={50}
                            interval={0}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} Anomali`,
                              name,
                            ]}
                            labelFormatter={(label) => `Type: ${label}`}
                            labelStyle={{
                              color: "#145C72",
                              fontWeight: "bold",
                            }}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                          <Bar dataKey="BEKASI" fill="#145C72" />
                          <Bar dataKey="CIKARANG" fill="#179FB7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Bars Section - Responsive */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
                {/* ULTG BEKASI */}
                <div className="bg-white rounded-lg shadow">
                  <div className="text-[#145C72] mb-3 flex gap-2 p-3 items-center">
                    <div>
                      <img
                        src="/RekapAnomali/ultgAnomali.svg"
                        className="w-5 h-5"
                      />
                    </div>
                    <h3 className="font-bold text-sm">ULTG BEKASI</h3>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-4 text-xs py-1.5 px-2 bg-[#E4FBFF] font-medium text-[#145C72] mb-2 rounded">
                      <div className="flex justify-between">
                        <span>Type</span>
                        <span className="text-[#009A1A]">%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#009A1A] font-bold">Closed</span>
                        <span className="text-[#FF5050] font-bold">Open</span>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {bekasiStatusBarData.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2"
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-[#145C72] truncate flex-1 mr-2">
                              {item.name}
                            </div>
                            <div className="text-xs text-[#1B8A2E] w-8 bg-[#79FF90] items-center justify-center flex rounded-full">
                              {item.percentage}%
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-xs text-[#145C72] w-4 text-center">
                              {item.closed}
                            </div>
                            <div className="flex-1 h-3 bg-gray-200 rounded flex overflow-hidden">
                              <div
                                className="bg-[#1B8A2E] transition-all"
                                style={{
                                  width: `${
                                    item.closed > 0
                                      ? (item.closed / item.total) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                              <div
                                className="bg-[#FFA500] transition-all"
                                style={{
                                  width: `${
                                    item.progress > 0
                                      ? (item.progress / item.total) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                              <div
                                className="bg-[#DC2626] transition-all"
                                style={{
                                  width: `${
                                    item.open > 0
                                      ? (item.open / item.total) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-[#145C72] w-4 text-center">
                              {item.open + item.progress}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ULTG CIKARANG */}
                <div className="bg-white rounded-lg shadow">
                  <div className="text-[#145C72] mb-3 flex gap-2 p-3 items-center">
                    <div>
                      <img
                        src="/RekapAnomali/ultgAnomali.svg"
                        className="w-5 h-5"
                      />
                    </div>
                    <h3 className="font-bold text-sm">ULTG CIKARANG</h3>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-4 text-xs py-1.5 px-2 bg-[#E4FBFF] font-medium text-[#145C72] mb-2 rounded">
                      <div className="flex justify-between">
                        <span>Type</span>
                        <span className="text-[#009A1A]">%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#009A1A] font-bold">Closed</span>
                        <span className="text-[#FF5050] font-bold">Open</span>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cikarangStatusBarData.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2"
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-[#145C72] truncate flex-1 mr-2">
                              {item.name}
                            </div>
                            <div className="text-xs text-[#1B8A2E] w-8 bg-[#79FF90] items-center justify-center flex rounded-full">
                              {item.percentage}%
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-xs text-[#145C72] w-4 text-center">
                              {item.closed}
                            </div>
                            <div className="flex-1 h-3 bg-gray-200 rounded flex overflow-hidden">
                              <div
                                className="bg-[#1B8A2E] transition-all"
                                style={{
                                  width: `${
                                    item.closed > 0
                                      ? (item.closed / item.total) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                              <div
                                className="bg-[#FFA500] transition-all"
                                style={{
                                  width: `${
                                    item.progress > 0
                                      ? (item.progress / item.total) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                              <div
                                className="bg-[#DC2626] transition-all"
                                style={{
                                  width: `${
                                    item.open > 0
                                      ? (item.open / item.total) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-[#145C72] w-4 text-center">
                              {item.open + item.progress}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter Section - NEW */}
              <div className="bg-white rounded-lg shadow p-3 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search anomalies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#145C72] focus:border-transparent"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#145C72] focus:border-transparent"
                  >
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="PROGRESS">Progress</option>
                    <option value="CLOSE">Closed</option>
                  </select>

                  {/* ULTG Filter */}
                  <select
                    value={ultgFilter}
                    onChange={(e) => setUltgFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#145C72] focus:border-transparent"
                  >
                    <option value="ALL">All ULTG</option>
                    {uniqueUltgs.map((ultg) => (
                      <option key={ultg} value={ultg}>
                        {ultg}
                      </option>
                    ))}
                  </select>

                  {/* Clear Filters Button */}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("ALL");
                      setUltgFilter("ALL");
                      setSelectedAnomaly("ALL");
                    }}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>

                {/* Filter Summary */}
                {(searchTerm ||
                  statusFilter !== "ALL" ||
                  ultgFilter !== "ALL" ||
                  selectedAnomaly !== "ALL") && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-[#145C72] font-medium">
                        Active Filters:
                      </span>
                      {selectedAnomaly !== "ALL" && (
                        <span className="px-2 py-1 bg-[#145C72] text-white text-xs rounded-full">
                          Type: {selectedAnomaly}
                        </span>
                      )}
                      {searchTerm && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                          Search: "{searchTerm}"
                        </span>
                      )}
                      {statusFilter !== "ALL" && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                          Status: {statusFilter}
                        </span>
                      )}
                      {ultgFilter !== "ALL" && (
                        <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                          ULTG: {ultgFilter}
                        </span>
                      )}
                      <span className="text-sm text-gray-600">
                        ({filteredData.length} results)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Tables - Responsive with pagination */}
              <div className="space-y-4">
                {filteredData.length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="text-[#145C72] mb-3 flex gap-2 p-3 items-center">
                      <div>
                        <img
                          src="/RekapAnomali/ultgAnomali.svg"
                          alt="ULTG"
                          className="w-5 h-5"
                        />
                      </div>
                      <h3 className="font-bold text-sm">
                        ANOMALI{" "}
                        {selectedAnomaly === "ALL"
                          ? selectedLocation
                          : selectedAnomaly.toUpperCase()}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead className="text-[#145C72] bg-[#E4FBFF]">
                          <tr>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">
                              ULTG
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">
                              Temuan Anomali
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">
                              Tindak Lanjut
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                          {paginatedData.map((item, index) => (
                            <tr
                              key={item.id}
                              className={
                                index % 2 === 0 ? "bg-[#F8FFFE]" : "bg-white"
                              }
                            >
                              <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs">
                                {startIndex + index + 1}
                              </td>
                              <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs">
                                {item.ultg}
                              </td>
                              <td
                                className="px-2 sm:px-3 py-2 text-xs max-w-xs truncate"
                                title={item.location}
                              >
                                {item.location}
                              </td>
                              <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs">
                                {item.kondisi}
                              </td>
                              <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs">
                                {item.temuan_anomali || item.year}
                              </td>
                              <td
                                className="px-2 sm:px-3 py-2 text-xs max-w-xs truncate"
                                title={item.tindakLanjut}
                              >
                                {item.tindakLanjut}
                              </td>
                              <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-xs">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.status === "OPEN"
                                      ? "bg-red-100 text-red-800"
                                      : item.status === "PROGRESS"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > 0 && (
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
                                    ? "bg-[#145C72] text-white"
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
                              startPage = Math.max(
                                1,
                                endPage - maxVisiblePages + 1
                              );
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

                        {/* Results info */}
                        <div className="text-sm text-gray-700 text-center sm:text-right">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(endIndex, filteredData.length)} of{" "}
                          {filteredData.length} results
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* No data message */}
                {filteredData.length === 0 && (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-gray-500">
                      <p className="text-sm">
                        No anomaly data available for the selected filters.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RekapAnomaliPage;
