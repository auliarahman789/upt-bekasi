import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, TrendingUp, LayoutList } from "lucide-react";
import DefaultLayout from "../../../layout/DefaultLayout";
import axios from "axios";

interface CriteriaData {
  no: string;
  name: string;
  bobot: string;
  nilaiSelf: number;
  nilaiAkhir: number;
}

interface SubCriteriaData {
  no: string;
  kriterian: string;
  bobot: string;
  nilaiSelf: number;
  nilaiAkhir: number;
}

interface ApiCriteriaItem {
  no: string;
  kriterian: string;
  bobot: string;
  nilai_self: string;
  nilai_akhir: string;
  children: ApiCriteriaItem[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: ApiCriteriaItem[];
}

const SustainabilityPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<CriteriaData[]>([]);
  const [detailData, setDetailData] = useState<{
    [key: string]: SubCriteriaData[];
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [totalScore, setTotalScore] = useState<{
    nilaiSelf: number;
    nilaiAkhir: number;
  }>({ nilaiSelf: 0, nilaiAkhir: 0 });

  // Fetch API data
  useEffect(() => {
    fetchSustainabilityData();
  }, []);

  const parseNumberValue = (value: string): number => {
    if (!value || value === "#N/A" || value.trim() === "") return 0;

    // Remove percentage sign if present
    const cleanValue = value.replace("%", "");
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchSustainabilityData = async () => {
    setLoading(true);
    setError(null);

    const url = `${
      import.meta.env.VITE_API_LINK_BE
    }/api/monitoring/hsse/maturing-level-sustainability`;

    try {
      const response = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });

      console.log("API Response:", response.data);

      if (response.data.status === "success") {
        parseApiData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error: any) {
      console.error("Error fetching sustainability data:", error);
      setError(
        error.response?.data?.message || error.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  const parseApiData = (data: ApiCriteriaItem[]) => {
    const summary: CriteriaData[] = [];
    const details: { [key: string]: SubCriteriaData[] } = {};
    let totalNilaiSelf = 0;
    let totalNilaiAkhir = 0;

    data.forEach((item) => {
      // Skip the TOTAL row for main criteria
      if (item.no === "-" || item.kriterian === "TOTAL") {
        // Extract total values if available
        const selfValue = parseNumberValue(item.nilai_self);
        const akhirValue = parseNumberValue(item.nilai_akhir);

        if (selfValue > 0 || akhirValue > 0) {
          setTotalScore({
            nilaiSelf: selfValue,
            nilaiAkhir: akhirValue,
          });
        }
        return;
      }

      // Parse main criteria
      const nilaiSelf = parseNumberValue(item.nilai_self);
      const nilaiAkhir = parseNumberValue(item.nilai_akhir);

      summary.push({
        no: item.no,
        name: item.kriterian,
        bobot: item.bobot,
        nilaiSelf: nilaiSelf,
        nilaiAkhir: nilaiAkhir,
      });

      // Parse sub-criteria if they exist
      if (item.children && item.children.length > 0) {
        const subCriteria: SubCriteriaData[] = item.children.map((child) => ({
          no: child.no,
          kriterian: child.kriterian,
          bobot: child.bobot,
          nilaiSelf: parseNumberValue(child.nilai_self),
          nilaiAkhir: parseNumberValue(child.nilai_akhir),
        }));

        details[item.no] = subCriteria;
      }

      // Add to totals (exclude invalid values)
      if (!isNaN(nilaiSelf) && nilaiSelf > 0) {
        totalNilaiSelf += nilaiSelf;
      }
      if (!isNaN(nilaiAkhir) && nilaiAkhir > 0) {
        totalNilaiAkhir += nilaiAkhir;
      }
    });

    setSummaryData(summary);
    setDetailData(details);

    // If no total was found in TOTAL row, calculate from sum
    if (totalScore.nilaiSelf === 0 && totalScore.nilaiAkhir === 0) {
      setTotalScore({
        nilaiSelf: totalNilaiSelf,
        nilaiAkhir: totalNilaiAkhir,
      });
    }
  };

  const toggleExpanded = (criteriaNo: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(criteriaNo)) {
      newExpanded.delete(criteriaNo);
    } else {
      newExpanded.add(criteriaNo);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="p-8 flex items-center justify-center min-h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
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
              onClick={fetchSustainabilityData}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Nilai Self Card */}
          <div className="bg-[#CDE9ED] p-6 px-10 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div>
              <p className="text-xl font-bold mb-4 text-[#145C72]">
                Nilai Self Assessment
              </p>
              <div className="flex justify-center items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-white">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Score
                    </p>
                    <p className="text-3xl font-semibold text-[#145C72]">
                      {totalScore.nilaiSelf.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nilai Akhir Card */}
          <div className="bg-[#CDE9ED] p-6 px-10 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div>
              <p className="text-xl font-bold mb-4 text-[#145C72]">
                Nilai Akhir
              </p>
              <div className="flex justify-center items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-white">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Final Score
                    </p>
                    <p className="text-3xl font-semibold text-[#145C72]">
                      {totalScore.nilaiAkhir.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-[#145C72] flex gap-1 items-center">
              <LayoutList size={16} />
              Sustainability Criteria
            </h2>
            <p className="text-sm text-[#145C72]">
              Click on a row to view detailed sub-criteria
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-[#145C72]">
              <thead className="bg-gray-50 font-bold">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs uppercase">
                    Criteria
                  </th>
                  <th className="px-6 py-3 text-center text-xs uppercase">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-center text-xs uppercase">
                    Self Assessment
                  </th>
                  <th className="px-6 py-3 text-center text-xs uppercase">
                    Final Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                {summaryData.map((item, index) => (
                  <React.Fragment key={item.no}>
                    <tr
                      className={`${
                        index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                      } hover:bg-blue-50 cursor-pointer`}
                      onClick={() => toggleExpanded(item.no)}
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {item.no}
                      </td>
                      <td className="px-6 py-4 text-sm">{item.name}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        {item.bobot}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {item.nilaiSelf.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {item.nilaiAkhir.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center justify-center gap-2 text-xs text-gray-500 flex">
                        {detailData[item.no]?.length || 0} items
                        {detailData[item.no] &&
                          (expandedRows.has(item.no) ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          ))}
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedRows.has(item.no) && detailData[item.no] && (
                      <tr className="border-1 border-[#145C72]">
                        <td colSpan={6} className="px-0 py-0">
                          <table className="min-w-full divide-y divide-gray-200 text-[#145C72]">
                            <thead className="bg-gray-50 font-bold">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs uppercase">
                                  Sub No
                                </th>
                                <th className="px-6 py-3 text-left text-xs uppercase">
                                  Sub Criteria
                                </th>
                                <th className="px-6 py-3 text-center text-xs uppercase">
                                  Weight
                                </th>
                                <th className="px-6 py-3 text-center text-xs uppercase">
                                  Self Assessment
                                </th>
                                <th className="px-6 py-3 text-center text-xs uppercase">
                                  Final Score
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                              {detailData[item.no].map(
                                (detail, detailIndex) => (
                                  <tr
                                    key={detail.no}
                                    className={`${
                                      detailIndex % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                    } hover:bg-blue-50`}
                                  >
                                    <td className="px-6 py-4 text-sm font-medium">
                                      {detail.no}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                      {detail.kriterian}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm">
                                      {detail.bobot}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                        {detail.nilaiSelf.toFixed(2)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                        {detail.nilaiAkhir.toFixed(2)}
                                      </span>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Data */}
        {summaryData.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No data available</p>
            <p className="text-sm text-gray-500 mt-2">
              Please check if the API is working correctly
            </p>
            <button
              onClick={fetchSustainabilityData}
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

export default SustainabilityPage;
