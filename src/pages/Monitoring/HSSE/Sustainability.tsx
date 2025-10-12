import React, { useState, useEffect } from "react";
import { LayoutList } from "lucide-react";
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

interface ApiResponse {
  status: string;
  message: string;
  lingkungan: LingkunganData[];
  sustainability: SustainabilityData[];
}
const SustainabilityPage: React.FC = () => {
  const [sustainabilityData, setSustainabilityData] = useState<
    SustainabilityData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const months = [
    "januari",
    "februari",
    "maret",
    "april",
    "mei",
    "juni",
    "juli",
    "agustus",
    "september",
    "oktober",
    "november",
    "desember",
  ];

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

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
  };

  const getCheckboxStatus = (value: string): boolean => {
    return value === "TRUE";
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

  return (
    <DefaultLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl md:text-[32px] text-center font-bold text-[#155C72] mb-6">
            Sustainability Maturity Level
          </h1>
        </div>

        {/* Sustainability Checklist Table - Compact with direct view */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-3 py-2 border-b">
            <h2 className="text-sm md:text-base font-semibold text-[#145C72] flex gap-1 items-center">
              <LayoutList size={14} />
              Sustainability Checklist
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-[#145C72]">
              <thead className="bg-gray-50 font-bold">
                <tr>
                  <th className="px-2 md:px-4 py-2 text-left text-xs uppercase">
                    Point
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left text-xs uppercase">
                    Transaksi
                  </th>
                  {monthNames.map((month) => (
                    <th
                      key={month}
                      className="px-1 md:px-2 py-2 text-center text-xs uppercase"
                    >
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                {sustainabilityData.map((item, index) => (
                  <tr
                    key={item.point}
                    className={`${
                      index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                    }`}
                  >
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm font-medium">
                      {item.point}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm">
                      {item.transaksi_laporan}
                    </td>
                    {months.map((month) => {
                      const isChecked = getCheckboxStatus(
                        item[month as keyof SustainabilityData] as string
                      );

                      return (
                        <td
                          key={month}
                          className="px-1 md:px-2 py-2 text-center"
                        >
                          <div className="flex justify-center">
                            <div
                              className={`w-3 h-3 md:w-4 md:h-4 rounded border-2 flex items-center justify-center ${
                                isChecked
                                  ? "bg-green-500 border-green-500"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              {isChecked && (
                                <svg
                                  className="w-2 h-2 md:w-2.5 md:h-2.5 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SustainabilityPage;
