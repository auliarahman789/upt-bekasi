import React, { useState, useEffect } from "react";
import { TrendingUp, LayoutList, ChevronDown, ChevronUp } from "lucide-react";
import DefaultLayout from "../../../layout/DefaultLayout";
import axios from "axios";

interface LingkunganData {
  poin: string;
  unsur_penilaian: string;
  target: string;
  pencapaian: string;
}

interface SustainabilityData {
  point: string;
  transaksi_laporan: string;
  januari: string;
  februari: string;
  maret: string;
  april: string;
  mei: string;
  juni: string;
  juli: string;
  agustus: string;
  september: string;
  oktober: string;
  november: string;
  desember: string;
}

interface GroupedData {
  groupKey: string;
  groupData: LingkunganData; // Main group item
  items: LingkunganData[]; // Detail items (A1, A2, etc.)
}

interface ApiResponse {
  status: string;
  message: string;
  lingkungan: LingkunganData[];
  sustainability: SustainabilityData[];
}

const LevelLingkunganPage: React.FC = () => {
  const [lingkunganData, setLingkunganData] = useState<LingkunganData[]>([]);
  const [sustainabilityData, setSustainabilityData] = useState<
    SustainabilityData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<{
    target: number;
    pencapaian: number;
  }>({ target: 0, pencapaian: 0 });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Fetch API data
  useEffect(() => {
    fetchLingkunganData();
  }, []);

  const parseNumberValue = (value: string): number => {
    if (!value || value === "#N/A" || value.trim() === "") return 0;
    const cleanValue = value.replace("%", "");
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchLingkunganData = async () => {
    setLoading(true);
    setError(null);

    const url = `${
      import.meta.env.VITE_API_LINK_BE
    }/api/monitoring/hsse/maturing-level-lingkungan`;

    try {
      const response = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });

      if (response.data.status === "success") {
        parseApiData(response.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error: any) {
      console.error("Error fetching lingkungan data:", error);
      setError(
        error.response?.data?.message || error.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  const parseApiData = (data: ApiResponse) => {
    const { lingkungan, sustainability } = data;

    setLingkunganData(lingkungan);
    setSustainabilityData(sustainability);

    // Calculate totals - only from main items (A, B, C, D, etc.)
    let totalTarget = 0;
    let totalPencapaian = 0;

    lingkungan.forEach((item) => {
      // Only sum main items (single letter), not detail items (A1, A2, etc.)
      const isMainItem = /^[A-Z]$/.test(item.poin);
      if (isMainItem) {
        totalTarget += parseNumberValue(item.target);
        totalPencapaian += parseNumberValue(item.pencapaian);
      }
    });

    setTotalScore({
      target: totalTarget,
      pencapaian: totalPencapaian,
    });
  };

  // Group lingkungan data by main category (A, B, C, D, etc.)
  const groupLingkunganData = (): GroupedData[] => {
    const groups: { [key: string]: GroupedData } = {};
    const mainItems: { [key: string]: LingkunganData } = {};
    const detailItems: { [key: string]: LingkunganData[] } = {};

    // First pass: separate main items and detail items
    lingkunganData.forEach((item) => {
      const groupKey = item.poin.match(/^[A-Z]+/)?.[0] || item.poin;
      const isMainItem = /^[A-Z]$/.test(item.poin);

      if (isMainItem) {
        mainItems[groupKey] = item;
        if (!detailItems[groupKey]) {
          detailItems[groupKey] = [];
        }
      } else {
        if (!detailItems[groupKey]) {
          detailItems[groupKey] = [];
        }
        detailItems[groupKey].push(item);
      }
    });

    // Second pass: create grouped data
    Object.keys(mainItems).forEach((groupKey) => {
      groups[groupKey] = {
        groupKey,
        groupData: mainItems[groupKey],
        items: detailItems[groupKey] || [],
      };
    });

    return Object.values(groups);
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

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
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-red-800">
              Error loading data
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchLingkunganData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const groupedData = groupLingkunganData();

  return (
    <DefaultLayout>
      <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-lg md:text-xl lg:text-2xl text-center font-bold text-[#155C72]">
            Maturing Level Lingkungan
          </h1>
        </div>

        {/* Summary Cards - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mb-3">
          {/* Target Card */}
          <div className="bg-[#CDE9ED] p-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600">Target</p>
                <p className="text-base md:text-lg font-semibold text-[#145C72]">
                  {totalScore.target.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Pencapaian Card */}
          <div className="bg-[#CDE9ED] p-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600">Pencapaian</p>
                <p className="text-base md:text-lg font-semibold text-[#145C72]">
                  {totalScore.pencapaian.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lingkungan Assessment Table - Grouped with Expandable Details */}
        <div className="bg-white rounded-lg shadow-sm border mb-3">
          <div className="px-3 py-2 border-b">
            <h2 className="text-sm md:text-base font-semibold text-[#145C72] flex gap-1 items-center">
              <LayoutList size={14} />
              Lingkungan Assessment
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-[#145C72]">
              <thead className="bg-gray-50 font-bold">
                <tr>
                  <th className="px-2 md:px-4 py-2 text-left text-xs uppercase">
                    Poin
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left text-xs uppercase">
                    Unsur Penilaian
                  </th>
                  <th className="px-2 md:px-4 py-2 text-center text-xs uppercase">
                    Target
                  </th>
                  <th className="px-2 md:px-4 py-2 text-center text-xs uppercase">
                    Pencapaian
                  </th>
                  <th className="px-2 md:px-4 py-2 text-center text-xs uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                {groupedData.map((group, groupIndex) => (
                  <React.Fragment key={group.groupKey}>
                    {/* Main Group Row */}
                    <tr
                      className={`${
                        groupIndex % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                      } font-medium`}
                    >
                      <td className="px-2 md:px-4 py-2 text-xs md:text-sm">
                        {group.groupData.poin}
                      </td>
                      <td className="px-2 md:px-4 py-2 text-xs md:text-sm">
                        {group.groupData.unsur_penilaian}
                      </td>
                      <td className="px-2 md:px-4 py-2 text-center text-xs md:text-sm">
                        {group.groupData.target}
                      </td>
                      <td className="px-2 md:px-4 py-2 text-center">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          {group.groupData.pencapaian}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 text-center">
                        {group.items.length > 0 && (
                          <button
                            onClick={() => toggleGroup(group.groupKey)}
                            className="inline-flex items-center gap-1 text-[#145C72] hover:text-[#0d3d4d] transition-colors"
                          >
                            <span className="text-xs">
                              {group.items.length} items
                            </span>
                            {expandedGroups.has(group.groupKey) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Detail Rows (Expandable) */}
                    {expandedGroups.has(group.groupKey) &&
                      group.items.map((item, _) => (
                        <tr
                          key={item.poin}
                          className="bg-gray-50 border-l-4 border-[#145C72]"
                        >
                          <td className="px-2 md:px-4 py-2 pl-6 md:pl-8 text-xs md:text-sm">
                            {item.poin}
                          </td>
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm">
                            {item.unsur_penilaian}
                          </td>
                          <td className="px-2 md:px-4 py-2 text-center text-xs md:text-sm">
                            {item.target}
                          </td>
                          <td className="px-2 md:px-4 py-2 text-center">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                              {item.pencapaian}
                            </span>
                          </td>
                          <td className="px-2 md:px-4 py-2"></td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Data */}
        {(lingkunganData.length === 0 || sustainabilityData.length === 0) &&
          !loading && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No data available</p>
              <p className="text-sm text-gray-500 mt-2">
                Please check if the API is working correctly
              </p>
              <button
                onClick={fetchLingkunganData}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Reload Data
              </button>
            </div>
          )}
      </div>
    </DefaultLayout>
  );
};

export default LevelLingkunganPage;
