import React, { useState, useEffect } from "react";
import { TrendingUp, LayoutList } from "lucide-react";
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

// interface MonthlyRecap {
//   month: string;
//   monthName: string;
//   totalTrue: number;
//   totalFalse: number;
//   percentage: number;
// }

// interface PointRecap {
//   point: string;
//   totalTrue: number;
//   totalFalse: number;
//   percentage: number;
// }

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
  // const [monthlyRecap, setMonthlyRecap] = useState<MonthlyRecap[]>([]);
  // const [pointRecap, setPointRecap] = useState<PointRecap[]>([]);

  // Month names for display
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

  // const calculateRecaps = (sustainability: SustainabilityData[]) => {
  //   // Calculate monthly recap
  //   // const monthlyData: MonthlyRecap[] = months.map((month, index) => {
  //   //   let totalTrue = 0;
  //   //   let totalFalse = 0;

  //   //   sustainability.forEach((item) => {
  //   //     const value = item[month as keyof SustainabilityData] as string;
  //   //     if (value === "TRUE") totalTrue++;
  //   //     else if (value === "FALSE") totalFalse++;
  //   //   });

  //   //   const total = totalTrue + totalFalse;
  //   //   const percentage = total > 0 ? (totalTrue / total) * 100 : 0;

  //   //   return {
  //   //     month,
  //   //     monthName: monthNames[index],
  //   //     totalTrue,
  //   //     totalFalse,
  //   //     percentage,
  //   //   };
  //   // });

  //   // Calculate point recap
  //   // const pointData: PointRecap[] = sustainability.map((item) => {
  //   //   let totalTrue = 0;
  //   //   let totalFalse = 0;

  //   //   months.forEach((month) => {
  //   //     const value = item[month as keyof SustainabilityData] as string;
  //   //     if (value === "TRUE") totalTrue++;
  //   //     else if (value === "FALSE") totalFalse++;
  //   //   });

  //   //   const total = totalTrue + totalFalse;
  //   //   const percentage = total > 0 ? (totalTrue / total) * 100 : 0;

  //   //   return {
  //   //     point: item.point,
  //   //     totalTrue,
  //   //     totalFalse,
  //   //     percentage,
  //   //   };
  //   // });

  //   // setMonthlyRecap(monthlyData);
  //   // setPointRecap(pointData);
  // };

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

    // Calculate totals
    let totalTarget = 0;
    let totalPencapaian = 0;

    lingkungan.forEach((item) => {
      totalTarget += parseNumberValue(item.target);
      totalPencapaian += parseNumberValue(item.pencapaian);
    });

    setTotalScore({
      target: totalTarget,
      pencapaian: totalPencapaian,
    });

    // Calculate recaps
    // calculateRecaps(sustainability);
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

          {/* Monthly Average */}
          {/* <div className="bg-[#CDE9ED] p-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-purple-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600">Monthly Avg</p>
                <p className="text-base md:text-lg font-semibold text-[#145C72]">
                  {monthlyRecap.length > 0
                    ? (
                        monthlyRecap.reduce((sum, m) => sum + m.percentage, 0) /
                        monthlyRecap.length
                      ).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div> */}

          {/* Point Average */}
          {/* <div className="bg-[#CDE9ED] p-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-orange-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600">Point Avg</p>
                <p className="text-base md:text-lg font-semibold text-[#145C72]">
                  {pointRecap.length > 0
                    ? (
                        pointRecap.reduce((sum, p) => sum + p.percentage, 0) /
                        pointRecap.length
                      ).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Monthly Recap Section - Compact
        <div className="bg-white rounded-lg shadow-sm border mb-3">
          <div className="px-3 py-2 border-b">
            <h2 className="text-sm md:text-base font-semibold text-[#145C72] flex gap-1 items-center">
              <Calendar size={14} />
              Monthly Recap
            </h2>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
              {monthlyRecap.map((month) => (
                <div
                  key={month.month}
                  className="bg-gray-50 p-1.5 rounded border text-center"
                >
                  <h3 className="font-medium text-[#145C72] text-xs mb-0.5">
                    {month.monthName}
                  </h3>
                  <div
                    className={`text-sm font-bold ${
                      month.percentage >= 80
                        ? "text-green-600"
                        : month.percentage >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {month.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Point Recap Section - Compact */}
        {/* <div className="bg-white rounded-lg shadow-sm border mb-3">
          <div className="px-3 py-2 border-b">
            <h2 className="text-sm md:text-base font-semibold text-[#145C72] flex gap-1 items-center">
              <Target size={14} />
              Point Recap
            </h2>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-6 md:grid-cols-11 gap-1.5">
              {pointRecap.map((point) => (
                <div
                  key={point.point}
                  className="bg-gray-50 p-1.5 rounded border text-center"
                >
                  <h3 className="font-medium text-[#145C72] text-xs mb-0.5">
                    {point.point}
                  </h3>
                  <div
                    className={`text-sm font-bold ${
                      point.percentage >= 80
                        ? "text-green-600"
                        : point.percentage >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {point.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Lingkungan Assessment Table - Compact */}
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                {lingkunganData.map((item, index) => (
                  <tr
                    key={item.poin}
                    className={`${
                      index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                    }`}
                  >
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm font-medium">
                      {item.poin}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-xs md:text-sm">
                      {item.unsur_penilaian}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-center text-xs md:text-sm">
                      {item.target}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-center">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                        {item.pencapaian}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
