import React, { useState, useEffect } from "react";
import axios from "axios";
import DefaultLayout from "../../../layout/DefaultLayout";

interface LocationData {
  standar_kebutuhan: string;
  jumlah_eksisting: string;
  selisih: string;
}

interface PeralatanItem {
  item: string;
  apbd: string;
  satuan: string;
  presentase_terpenuhi?: string;
  total: LocationData;
  upt_bekasi: LocationData;
  ultg_bekasi: LocationData;
  ultg_cikarang: LocationData;
  gi_cikarang: LocationData;
  gi_cikarang_lippo: LocationData;
  gi_cileungsi_2: LocationData;
  gi_fajar_sw: LocationData;
  gi_gandamekar: LocationData;
  gi_hankook: LocationData;
  gi_jababeka: LocationData;
  gi_juishin: LocationData;
  gi_margakarya: LocationData;
  gi_mekarsari: LocationData;
  gi_panayungan: LocationData;
  gi_poncol_baru: LocationData;
  gi_rajapaksi: LocationData;
  gi_suzuki: LocationData;
  gi_tagalherang: LocationData;
  gi_tambun: LocationData;
  gi_toyogiri: LocationData;
  gi_transheksa: LocationData;
  gis_poncol_baru: LocationData;
  gistet_new_tambun: LocationData;
  gitet_cibatu: LocationData;
  gitet_muara_tawar: LocationData;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    data: PeralatanItem[];
    metadata: {
      title: string;
      instruction: string;
      totalRecords: number;
      totalFields: number;
      generatedAt: string;
    };
  };
}

const PeralatanDanSaranaPage: React.FC = () => {
  const [data, setData] = useState<PeralatanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilter, setShowFilter] = useState<boolean>(false);

  // Get all location keys (excluding non-location fields)
  const locationKeys = [
    "upt_bekasi",
    "ultg_bekasi",
    "ultg_cikarang",
    "gi_cikarang",
    "gi_cikarang_lippo",
    "gi_cileungsi_2",
    "gi_fajar_sw",
    "gi_gandamekar",
    "gi_hankook",
    "gi_jababeka",
    "gi_juishin",
    "gi_margakarya",
    "gi_mekarsari",
    "gi_panayungan",
    "gi_poncol_baru",
    "gi_rajapaksi",
    "gi_suzuki",
    "gi_tagalherang",
    "gi_tambun",
    "gi_toyogiri",
    "gi_transheksa",
    "gis_poncol_baru",
    "gistet_new_tambun",
    "gitet_cibatu",
    "gitet_muara_tawar",
  ];

  // Get unique categories
  const getUniqueCategories = () => {
    const categories = new Set(data.map((item) => item.item));
    return Array.from(categories).filter(
      (cat) => cat && !cat.includes("*") && cat !== "Note"
    );
  };

  useEffect(() => {
    fetchPeralatanData();
  }, []);

  const fetchPeralatanData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `${import.meta.env.VITE_API_LINK_BE}/api/monitoring/hsse/peralatan`
      );

      const apiData = response.data.data.data;

      // Filter out invalid entries
      const validData = apiData.filter(
        (item: PeralatanItem) =>
          item &&
          item.item &&
          item.apbd &&
          item.item !== "Note" &&
          !item.item.includes("Belum ada di SPLN") &&
          item.apbd !== "-" &&
          item.apbd !== "tanya" &&
          item.apbd !== "grounding jaringan"
      );

      setData(validData);
      setError(null);
    } catch (err) {
      console.error("Error fetching peralatan data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatLocationName = (key: string) => {
    return key.replace(/_/g, " ").toUpperCase();
  };

  // Calculate data to display (either accumulated or specific location)
  const getDisplayData = () => {
    if (selectedLocation === "all") {
      // Show total/accumulated data
      return data.filter(
        (item) => selectedCategory === "all" || item.item === selectedCategory
      );
    } else {
      // Show specific location data
      return data
        .filter(
          (item) => selectedCategory === "all" || item.item === selectedCategory
        )
        .map((item) => ({
          ...item,
          // Replace total with selected location data
          total: item[selectedLocation as keyof PeralatanItem] as LocationData,
        }));
    }
  };

  const filteredData = getDisplayData();

  // Group data by category
  const groupedData = filteredData.reduce((acc, item) => {
    const category = item.item;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PeralatanItem[]>);

  const CombinedProgressBar: React.FC<{
    standar: number;
    existing: number;
    selisih: number;
    label: string;
  }> = ({ standar, existing, selisih, label }) => {
    // Calculate the total width needed
    const maxValue = Math.max(standar, existing + Math.abs(selisih)) || 100;

    // Calculate percentages for the bar
    const existingWidth = (existing / maxValue) * 100;
    const selisihWidth = (Math.abs(selisih) / maxValue) * 100;

    return (
      <div className="flex items-center py-1 px-4  hover:bg-gray-50">
        {/* Item Label */}
        <div className="flex-1 min-w-0 pr-4">
          <div
            title={`${label}`}
            className="text-[11px] font-light text-[#273B4A] truncate"
          >
            {label}
          </div>
        </div>

        {/* Standard Badge */}
        <div className="flex-shrink-0 mr-3">
          <div
            title={`${standar}`}
            className="bg-[#145C72] text-white px-3  rounded-full text-[11px] font-semibold min-w-[50px] text-center"
          >
            {standar}
          </div>
        </div>

        {/* Existing Value */}
        <div className="flex-shrink-0 mr-3">
          <div
            title={`${existing}`}
            className="text-green-600 text-[11px] font-semibold min-w-[30px] text-center"
          >
            {existing}
          </div>
        </div>

        {/* Combined Progress Bar */}
        <div className="flex-1 max-w-[200px] mr-4">
          <div className="flex h-[17px] bg-gray-200 rounded-full overflow-hidden">
            {/* Existing Section */}
            <div
              className="bg-green-500 flex items-center justify-center"
              style={{
                width: `${existingWidth}%`,
                minWidth: existing > 0 ? "20px" : "0px",
              }}
            />

            {/* Selisih Section */}
            <div
              className={`flex items-center justify-center ${
                selisih >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: `${selisihWidth}%`,
                minWidth: selisih !== 0 ? "20px" : "0px",
              }}
            />
          </div>
        </div>

        {/* Selisih Value */}
        <div className="flex-shrink-0">
          <span
            className={`text-[11px] font-semibold min-w-[30px] text-center inline-block ${
              selisih >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {selisih}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading peralatan data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-800">
            <h3 className="text-sm font-medium">Error</h3>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchPeralatanData}
              className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className=" pb-4 ">
          <div className="mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center flex-1">
                PERALATAN DAN SARANA
              </h1>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center text-[16px] mb-2 font-bold bg-white justify-between border-[1px] border-zinc-300 hover:bg-gray-200 px-4 py-2 rounded-full text-[#145C72] transition-colors shadow-2xl"
        >
          <div>FILTER</div>
          <div className="ml-6">
            <img src="/filter.svg" />
          </div>
        </button>
        {/* Filter Panel */}
        {showFilter && (
          <div className="relative">
            <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-4xl  border-2 border-[#179FB7] p-4 w-80 z-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Kategori</option>
                    {getUniqueCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Lokasi (Akumulasi)</option>
                    {locationKeys.map((location) => (
                      <option key={location} value={location}>
                        {formatLocationName(location)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLocation !== "all" && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">
                        Menampilkan data untuk:
                      </span>{" "}
                      {formatLocationName(selectedLocation)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mx-auto py-6 px-4 p-3 bg-gray-100 rounded-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(groupedData).map(([category, items]) => (
              <div
                key={category}
                className="bg-white rounded-2xl shadow-lg overflow-hidden py-2"
              >
                {/* Category Header */}
                <div className="bg-white p-4 ">
                  <div className="flex items-center space-x-1">
                    <div className="w-[17px] h-[17px]  rounded-lg flex items-center justify-center flex-shrink-0">
                      <img src="/HSSE/IconPeralatan.svg" alt="Icon Peralatan" />
                    </div>
                    <h2 className="text-lg font-bold text-[#273B4A] uppercase">
                      {category}
                    </h2>
                  </div>
                </div>

                {/* Header Row */}
                <div className=" px-4 py-1 ">
                  <div className="flex items-center text-[11px] font-semibold text-[#273B4A] uppercase tracking-wide">
                    <div className="flex-1 min-w-0 pr-8">ITEM</div>
                    <div className="flex-shrink-0 mr-3 text-center">
                      STANDAR
                    </div>
                    <div className="flex-shrink-0 mr-3 text-green-600 text-center">
                      EXISTING
                    </div>
                    <div className="flex-1 max-w-[200px]  text-center"></div>
                    <div className="flex-shrink-0 text-red-500 text-center">
                      SELISIH
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className=" ">
                  {items.map((item, index) => {
                    const standar =
                      parseInt(item.total?.standar_kebutuhan || "0") || 0;
                    const existing =
                      parseInt(item.total?.jumlah_eksisting || "0") || 0;
                    const selisih = parseInt(item.total?.selisih || "0") || 0;

                    return (
                      <CombinedProgressBar
                        key={index}
                        standar={standar}
                        existing={existing}
                        selisih={selisih}
                        label={item.apbd}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(groupedData).length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No data available</p>
                <p className="mt-1">
                  No peralatan dan sarana data found for the selected filters.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PeralatanDanSaranaPage;
