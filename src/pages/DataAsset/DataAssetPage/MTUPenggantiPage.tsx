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
import { ChevronDown } from "lucide-react";
import DefaultLayout from "../../../layout/DefaultLayout";
import axios from "axios";

// TypeScript Interfaces (keep all existing interfaces as they are)
interface MTUDataItem {
  bay: string;
  fase: string;
  mtu: string;
  no: string;
  onsite_mtu: string;
  realisasi_pasang: string;
  rencana_pasang: string;
  ultg: string;
  usulan_relokasi: string;
}

interface LocationData {
  kontrak: string;
  onsite: string;
  periksa: string;
  pasang: string;
}

interface DashboardDataItem {
  bekasi?: LocationData;
  cikarang?: LocationData;
  total: LocationData;
  uraian: string;
}

interface APIResponse {
  data: {
    metadata: any;
    data: MTUDataItem[];
  };
  data_dashboard: {
    metadata: any;
    data: DashboardDataItem[];
  };
  message: string;
  status: string;
}

interface TransformedTableItem {
  id: number;
  location: string;
  ultg: string;
  bay: string;
  mtu: string;
  fase: string;
  onsite_mtu: string;
  rencana_pasang: string;
  realisasi_pasang: string;
  usulan_relokasi: string;
}

interface ChartDataItem {
  name: string;
  Terkontrak: number;
  Onsite: number;
  Pariksa: number;
  Terpasang: number;
}

interface ProgressDataItem {
  name: string;
  value: number;
  color: string;
}

interface PopulationDataItem {
  name: string;
  value: number;
  color: string;
}

const MTUPenggantiPage = () => {
  // State variables (keep all existing state variables)
  const [apiData, setApiData] = useState<MTUDataItem[]>([]);
  const [apiDashboardData, setApiDashboardData] = useState<DashboardDataItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeLocation, setActiveLocation] = useState<string>("bekasi");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Add new state for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Keep all existing custom tooltip components and functions...
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg max-w-xs">
          <p className="text-sm font-semibold text-[#145C72]">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];

      const totalItem = apiDashboardData.find(
        (item) => item.uraian.toLowerCase() === "total"
      );

      let actualCount = 0;
      if (totalItem) {
        const locationData = totalItem[
          activeLocation as keyof DashboardDataItem
        ] as LocationData;
        if (locationData) {
          switch (data.name) {
            case "Terkontrak":
              actualCount = parseInt(locationData.kontrak || "0");
              break;
            case "Onsite":
              actualCount = parseInt(locationData.onsite || "0");
              break;
            case "Periksa":
              actualCount = parseInt(locationData.periksa || "0");
              break;
            case "Terpasang":
              actualCount = parseInt(locationData.pasang || "0");
              break;
          }
        }
      }

      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg max-w-xs">
          <p className="text-sm font-semibold text-[#145C72]">
            {`${data.name}`}
          </p>
          <p className="text-xs text-gray-600">{`Count: ${actualCount}`}</p>
          <p className="text-xs text-gray-600">
            {`Percentage: ${data.value}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Keep all existing useMemo calculations and functions...
  const locations = useMemo(() => {
    const uniqueLocations = [
      ...new Set(apiData?.map((item) => item.ultg.toLowerCase())),
    ];
    return uniqueLocations.filter(Boolean).map((location) => ({
      key: location,
      display: location.toUpperCase(),
      label: `UPT ${location.toUpperCase()}`,
    }));
  }, [apiData]);

  const generateColors = (count: number): string[] => {
    const colors = [
      "#145C72",
      "#0CA2BA",
      "#E78700",
      "#1B8A2E",
      "#0066FF",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#54A0FF",
      "#5F27CD",
      "#00D2D3",
      "#FF9F43",
      "#6C5CE7",
      "#A29BFE",
      "#FD79A8",
      "#E17055",
      "#00B894",
    ];
    return colors.slice(0, count);
  };

  // Keep all existing transform functions...
  const transformedChartData = useMemo((): ChartDataItem[] => {
    const filteredDashboardData = apiDashboardData.filter(
      (item) => item.uraian.toLowerCase() !== "total"
    );

    return filteredDashboardData.map((item) => {
      const locationData = item[
        activeLocation as keyof DashboardDataItem
      ] as LocationData;
      return {
        name: item.uraian,
        Terkontrak: parseInt(locationData?.kontrak || "0"),
        Onsite: parseInt(locationData?.onsite || "0"),
        Pariksa: parseInt(locationData?.periksa || "0"),
        Terpasang: parseInt(locationData?.pasang || "0"),
      };
    });
  }, [apiDashboardData, activeLocation]);

  const transformedTableData = useMemo((): TransformedTableItem[] => {
    return apiData?.map((item, index) => ({
      id: index + 1,
      location: item.ultg,
      ultg: item.ultg,
      bay: item.bay,
      mtu: item.mtu,
      fase: item.fase,
      onsite_mtu: item.onsite_mtu,
      rencana_pasang: item.rencana_pasang,
      realisasi_pasang: item.realisasi_pasang,
      usulan_relokasi: item.usulan_relokasi,
    }));
  }, [apiData]);

  const filteredData = useMemo(() => {
    return transformedTableData.filter(
      (item) => item.location.toLowerCase() === activeLocation.toLowerCase()
    );
  }, [transformedTableData, activeLocation]);

  const populationData = useMemo((): PopulationDataItem[] => {
    const filteredDashboardData = apiDashboardData.filter(
      (item) => item.uraian.toLowerCase() !== "total"
    );

    const mtuTypeData = filteredDashboardData
      .map((item) => {
        const locationData = item[
          activeLocation as keyof DashboardDataItem
        ] as LocationData;
        const total =
          parseInt(locationData?.kontrak || "0") +
          parseInt(locationData?.onsite || "0") +
          parseInt(locationData?.periksa || "0") +
          parseInt(locationData?.pasang || "0");
        return {
          name: item.uraian,
          value: total,
        };
      })
      .filter((item) => item.value > 0);

    const colors = generateColors(mtuTypeData.length);

    return mtuTypeData.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: colors[index] || "#145C72",
    }));
  }, [apiDashboardData, activeLocation]);

  const progressData = useMemo((): ProgressDataItem[] => {
    const totalItem = apiDashboardData.find(
      (item) => item.uraian.toLowerCase() === "total"
    );

    if (!totalItem) {
      return [
        { name: "Terkontrak", value: 0, color: "#0CA2BA" },
        { name: "Onsite", value: 0, color: "#E78700" },
        { name: "Periksa", value: 0, color: "#1B8A2E" },
        { name: "Terpasang", value: 0, color: "#0066FF" },
      ];
    }

    const locationData = totalItem[
      activeLocation as keyof DashboardDataItem
    ] as LocationData;

    if (!locationData) {
      return [
        { name: "Terkontrak", value: 0, color: "#0CA2BA" },
        { name: "Onsite", value: 0, color: "#E78700" },
        { name: "Periksa", value: 0, color: "#1B8A2E" },
        { name: "Terpasang", value: 0, color: "#0066FF" },
      ];
    }

    const terkontrak = parseInt(locationData.kontrak || "0");
    const onsite = parseInt(locationData.onsite || "0");
    const periksa = parseInt(locationData.periksa || "0");
    const terpasang = parseInt(locationData.pasang || "0");

    const totalTarget = terkontrak + onsite + periksa + terpasang;

    if (totalTarget === 0) {
      return [
        { name: "Terkontrak", value: 0, color: "#0CA2BA" },
        { name: "Onsite", value: 0, color: "#E78700" },
        { name: "Periksa", value: 0, color: "#1B8A2E" },
        { name: "Terpasang", value: 0, color: "#0066FF" },
      ];
    }

    const terkontrakPercentage = Math.round((terkontrak / totalTarget) * 100);
    const onsitePercentage = Math.round((onsite / totalTarget) * 100);
    const periksaPercentage = Math.round((periksa / totalTarget) * 100);
    const terpasangPercentage = Math.round((terpasang / totalTarget) * 100);

    return [
      { name: "Terkontrak", value: terkontrakPercentage, color: "#0CA2BA" },
      { name: "Onsite", value: onsitePercentage, color: "#E78700" },
      { name: "Periksa", value: periksaPercentage, color: "#1B8A2E" },
      { name: "Terpasang", value: terpasangPercentage, color: "#0066FF" },
    ].filter((item) => item.value > 0);
  }, [apiDashboardData, activeLocation]);

  const locationTotal = useMemo((): number => {
    return filteredData.length;
  }, [filteredData]);

  const populationTotal = useMemo((): number => {
    return populationData.reduce((sum, item) => sum + item.value, 0);
  }, [populationData]);

  const progressTotal = useMemo((): number => {
    const totalItem = apiDashboardData.find(
      (item) => item.uraian.toLowerCase() === "total"
    );
    if (totalItem) {
      const locationData = totalItem[
        activeLocation as keyof DashboardDataItem
      ] as LocationData;
      if (locationData) {
        const total =
          parseInt(locationData.kontrak || "0") +
          parseInt(locationData.onsite || "0") +
          parseInt(locationData.periksa || "0") +
          parseInt(locationData.pasang || "0");
        return total;
      }
    }
    return 0;
  }, [apiDashboardData, activeLocation]);

  // Keep all existing pagination and handler functions...
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number): void => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const handleLocationChange = (locationKey: string): void => {
    setActiveLocation(locationKey);
    setCurrentPage(1);
    setIsMobileMenuOpen(false); // Close mobile menu when location changes
  };

  // Keep existing fetch function...
  const fetchMTUPenggantian = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.get<APIResponse>(
        `${import.meta.env.VITE_API_LINK_BE}/api/data-asset/mtu/penggantian`
      );

      if (response.data.status === "success") {
        setApiData(response.data.data?.data || []);
        setApiDashboardData(response.data.data_dashboard?.data || []);
        console.log(
          "MTU penggantian data fetched successfully:",
          response.data
        );
      }
    } catch (err) {
      console.error("Error fetching MTU penggantian data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMTUPenggantian();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      const currentLocationExists = locations.some(
        (loc) => loc.key === activeLocation
      );
      if (!currentLocationExists) {
        setActiveLocation(locations[0].key);
      }
    }
  }, [locations, activeLocation]);

  const currentLocationDisplay = useMemo(() => {
    const location = locations.find((loc) => loc.key === activeLocation);
    return location ? location.display : activeLocation.toUpperCase();
  }, [locations, activeLocation]);

  useEffect(() => {
    console.log("filteredData:", filteredData);
    console.log("populationData:", populationData);
    console.log("progressData:", progressData);
    console.log("locationTotal:", locationTotal);
    console.log("populationTotal:", populationTotal);
    console.log("progressTotal:", progressTotal);
  }, [
    filteredData,
    populationData,
    progressData,
    locationTotal,
    populationTotal,
    progressTotal,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-[#145C72]"></div>
            <p className="mt-4 text-[#145C72] text-sm md:text-base">
              Loading MTU data...
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-3 md:p-6">
          {/* Header with Location Tabs - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
            {/* Desktop Location Tabs */}
            <div className="hidden sm:flex space-x-1">
              {locations.map((location) => (
                <button
                  key={location.key}
                  onClick={() => handleLocationChange(location.key)}
                  className={`px-3 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                    activeLocation === location.key
                      ? "bg-[#145C72] text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {location.label}
                </button>
              ))}
            </div>

            {/* Mobile Location Dropdown */}
            <div className="sm:hidden w-full">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
              >
                <span className="text-sm font-medium text-gray-900">
                  {locations.find((loc) => loc.key === activeLocation)?.label ||
                    "Select Location"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isMobileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMobileMenuOpen && (
                <div className="absolute z-10 mt-1 w-[calc(100%-1.5rem)] bg-white border border-gray-300 rounded-lg shadow-lg">
                  {locations.map((location) => (
                    <button
                      key={location.key}
                      onClick={() => handleLocationChange(location.key)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                        activeLocation === location.key
                          ? "bg-[#145C72] text-white"
                          : "text-gray-700"
                      } first:rounded-t-lg last:rounded-b-lg`}
                    >
                      {location.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Charts Section - Mobile Responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Bar Chart */}
            <div className="xl:col-span-2 bg-white rounded-lg p-3 md:p-6 shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="text-[#145C72] p-2 md:p-4 flex gap-2 md:gap-3">
                  <div className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] bg-[#145C72] animate-pulse"></div>
                  <h3 className="font-bold text-sm md:text-base">
                    TARGET PENGGANTIAN MTU - {currentLocationDisplay}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:space-x-4 mb-4 text-xs md:text-sm ml-4 md:ml-10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#0CA2BA]"></div>
                  <span>Terkontrak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#E78700]"></div>
                  <span>Onsite</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#1B8A2E]"></div>
                  <span>Pariksa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#0066FF]"></div>
                  <span>Terpasang</span>
                </div>
              </div>

              <div className="h-[300px] md:h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transformedChartData} key={activeLocation}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      className="md:text-xs"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} className="md:text-xs" />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="Terkontrak" fill="#0CA2BA" />
                    <Bar dataKey="Onsite" fill="#E78700" />
                    <Bar dataKey="Pariksa" fill="#1B8A2E" />
                    <Bar dataKey="Terpasang" fill="#0066FF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Charts - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
              <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg transition-all duration-300">
                <div className="text-[#145C72] p-2 md:p-4 flex gap-2 md:gap-3">
                  <div className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] bg-[#145C72]"></div>
                  <h3 className="font-bold text-sm md:text-base">POPULASI</h3>
                </div>
                <div className="h-32 md:h-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      key={`populasi-${activeLocation}-${populationData.length}`}
                    >
                      <Pie
                        data={populationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={50}
                        dataKey="value"
                      >
                        {populationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Total</div>
                      <div className="text-sm md:text-lg font-bold text-[#145C72]">
                        {populationTotal}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Legend for population */}
                <div className="grid grid-cols-3 gap-1 text-xs mt-2">
                  {populationData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div
                        className="w-2 h-2"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="truncate">
                        {entry.name}: {entry.value} %
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg transition-all duration-300">
                <div className="text-[#145C72] p-2 md:p-4 flex gap-2 md:gap-3">
                  <div className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] bg-[#145C72]"></div>
                  <h3 className="font-bold text-sm md:text-base">PROGRESS</h3>
                </div>
                <div className="h-32 md:h-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      key={`progress-${activeLocation}-${progressData.length}`}
                    >
                      <Pie
                        data={progressData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={50}
                        dataKey="value"
                      >
                        {progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Total</div>
                      <div className="text-sm md:text-lg font-bold text-[#145C72]">
                        {progressTotal}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Legend for progress */}
                <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                  {progressData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div
                        className="w-2 h-2"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="truncate">
                        {entry.name}: {entry.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Table - Mobile Responsive */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-2 md:p-3 transition-all duration-300">
            <div className="text-[#145C72] p-2 md:p-4 flex gap-2 md:gap-3">
              <div className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] bg-[#145C72]"></div>
              <h3 className="font-bold text-sm md:text-base">
                KETERANGAN - {currentLocationDisplay}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="text-[#145C72]">
                  <tr>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      ULTG
                    </th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      BAY
                    </th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      MTU
                    </th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Fase
                    </th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Onsite MTU
                    </th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Rencana Pasang
                    </th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Realisasi Pasang
                    </th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Usulan Relokasi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                  {paginatedData.map((item, index) => (
                    <tr
                      key={`${item.id}-${activeLocation}`}
                      className={`transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                      } hover:bg-opacity-80`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {item.ultg}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {item.bay}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {item.mtu}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {item.fase}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {item.onsite_mtu}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {item.rencana_pasang}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {item.realisasi_pasang}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {item.usulan_relokasi}
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
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MTUPenggantiPage;
