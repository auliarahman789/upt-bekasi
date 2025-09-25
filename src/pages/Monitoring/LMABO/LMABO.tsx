// L.tsx
import React, { useEffect, useState, useMemo } from "react";
import DefaultLayout from "../../../layout/DefaultLayout";
import axios from "axios";

// Interfaces
interface WorkItem {
  bidang: string;
  program: string;
  uraian_pekerjaan: string;
  target: string;
  realisasi: string;
  persen_realisasi: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: WorkItem[];
}

const LMABOPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState("Jaringan");

  useEffect(() => {
    fetchLMABO();
  }, []);

  const fetchLMABO = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK_BE}/api/monitoring/lm-abo`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });
      console.log("LM ABO", res.data);
      setApiData(res.data);
    } catch (error: any) {
      console.log(error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Process data to group by program for the selected bidang
  const processedData = useMemo(() => {
    if (!apiData?.data) return {};

    // Filter out the header row (index 41) and filter by selected bidang
    const filteredData = apiData.data.filter(
      (workItem, index) => index !== 41 && workItem.bidang === activeTab
    );

    const grouped: { [program: string]: WorkItem[] } = {};

    filteredData.forEach((workItem) => {
      let program = workItem.program;

      // Map programs to display names
      if (program === "LM") program = "LEAD MEASURE";
      else if (program === "ABO") program = "ANTI-BLACKOUT";
      else if (program === "-") program = "LAINNYA";

      if (!grouped[program]) {
        grouped[program] = [];
      }

      grouped[program].push(workItem);
    });

    return grouped;
  }, [apiData, activeTab]);

  // Get available tabs from the data
  const availableTabs = useMemo(() => {
    if (!apiData?.data) return [];

    // Get unique bidang values and filter out the header row
    const uniqueBidang = [
      ...new Set(
        apiData.data
          .filter((_, index) => index !== 41)
          .map((dataItem) => dataItem.bidang)
      ),
    ];

    return uniqueBidang;
  }, [apiData]);

  const programCategories = ["LEAD MEASURE", "ANTI-BLACKOUT", "LAINNYA"];

  // Progress Bar Component
  const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    const numericPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
      <div className="flex-1 bg-red-400 rounded-full h-4 mr-4">
        <div
          className="bg-green-400 h-4 rounded-full transition-all duration-300"
          style={{ width: `${numericPercentage}%` }}
        />
      </div>
    );
  };

  // Work Item Component
  const WorkItemRow: React.FC<{ item: WorkItem }> = ({ item }) => {
    const percentage = parseFloat(item.persen_realisasi.replace("%", "")) || 0;
    const target = parseInt(item.target) || 0;
    const realisasi = parseInt(item.realisasi) || 0;

    return (
      <div className="mb-4">
        {/* Title */}
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {item.uraian_pekerjaan}
        </h4>

        {/* Progress bar with badges */}
        <div className="flex items-center">
          <ProgressBar percentage={percentage} />
          <div className="flex gap-2">
            <span className="text-xs bg-[#5DADE2] text-white px-2 py-1 rounded font-medium">
              {item.persen_realisasi}
            </span>
            <span className="text-xs bg-[#85C1E9] text-white px-2 py-1 rounded font-medium">
              {realisasi}/{target}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Program Column Component
  const ProgramColumn: React.FC<{
    title: string;
    items: WorkItem[];
    icon: string;
  }> = ({ title, items, icon }) => (
    <div className="bg-gray-100 rounded-lg p-4 flex-1">
      {/* Column Header */}
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 bg-gray-100 rounded mr-2 flex items-center justify-center">
          <span className="text-white text-xs">{icon}</span>
        </div>
        <h3 className="font-bold text-[#155C72] text-sm">{title}</h3>
      </div>

      {/* Items List */}
      <div>
        {items && items.length > 0 ? (
          items.map((workItem, itemIndex) => (
            <WorkItemRow key={`${title}-${itemIndex}`} item={workItem} />
          ))
        ) : (
          <div className="text-gray-500 text-sm">No items available</div>
        )}
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

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-[32px] text-center font-bold text-[#155C72] mb-6">
            LEAD MEASURE & ANTI BLACKOUT
          </h1>
        </div>

        {/* Main Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${
                activeTab === tab
                  ? "bg-[#145C72] text-white"
                  : "bg-white border border-[#179FB7] text-[#179FB7] hover:bg-gray-100"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto">
          {programCategories.map((program) => {
            const items = processedData[program] || [];
            const icons = {
              "LEAD MEASURE": "📊",
              "ANTI-BLACKOUT": "⚡",
              LAINNYA: "📋",
            };

            return (
              <ProgramColumn
                key={program}
                title={program}
                items={items}
                icon={icons[program as keyof typeof icons]}
              />
            );
          })}
        </div>

        {/* Empty state */}
        {Object.keys(processedData).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500">
              There are no work items available for {activeTab}.
            </p>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default LMABOPage;
