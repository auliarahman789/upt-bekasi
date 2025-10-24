import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Add this import

interface RawData {
  date: string;
  percentage: number;
  realValue?: number; // Add real value field
}

interface CategoryData {
  id: string;
  title: string;
  number: string;
  skkoNumber: string;
  rawData: RawData[];
}

interface MonthlyData {
  month: string;
  percentage: number;
  realValue?: number; // Add real value field
  color: string;
}

interface InvestasiData {
  month: string;
  "SKKI TERBIT": number;
  RENCANA: number;
  REALISASI: number;
  "SKKI TERBIT_REAL"?: number; // Add real value fields
  RENCANA_REAL?: number;
  REALISASI_REAL?: number;
}

interface ApiResponseItem {
  bulan: string;
  sko_1_tahun: string;
  realisasi_akumulasi: string;
  presentase: string;
}

interface InvestasiApiResponse {
  realisasi: Record<string, string>;
  rencana: Record<string, string>;
  skki_terbit: Record<string, string>;
}

interface ApiResponse {
  status: string;
  message: string;
  pos_kepegawaian: ApiResponseItem[];
  pos_pemeliharaan: ApiResponseItem[];
  pos_administrasi_umum: ApiResponseItem[];
  investasi: InvestasiApiResponse[];
}

type TabType = "anggaran-operasi" | "investasi";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const monthColors: Record<string, string> = {
  Jan: "#EF4444",
  Feb: "#F97316",
  Mar: "#14B8A6",
  Apr: "#22C55E",
  Mei: "#EC4899",
  Jun: "#0891B2",
  Jul: "#EAB308",
  Ags: "#374151",
  Sep: "#9CA3AF",
  Okt: "#16A34A",
  Nov: "#84CC16",
  Des: "#C084FC",
};

const indonesianMonthMap: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

const convertApiDataToRawData = (apiData: ApiResponseItem[]): RawData[] => {
  return apiData.map((item, index) => {
    const percentageStr = item.presentase.replace("%", "").replace(",", ".");
    const percentage = parseFloat(percentageStr) || 0;

    // Parse real value from realisasi_akumulasi
    const realValueStr = item.realisasi_akumulasi
      .replace(/\./g, "")
      .replace(",", ".");
    const realValue = parseFloat(realValueStr) || 0;

    const monthIndex = index + 1;
    const date = `2025-${String(monthIndex).padStart(2, "0")}-15`;

    return {
      date,
      percentage,
      realValue, // Add real value
    };
  });
};

const convertInvestasiApiData = (
  apiData: InvestasiApiResponse
): InvestasiData[] => {
  const result: InvestasiData[] = [];

  const parseValue = (str: string): number => {
    const cleaned = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  };

  Object.entries(apiData.skki_terbit).forEach(([monthKey, skki_value]) => {
    const monthIndex = indonesianMonthMap[monthKey.toLowerCase()];
    if (monthIndex === undefined) return;

    const skki = parseValue(skki_value);
    const rencana = parseValue(apiData.rencana[monthKey] || "0");
    const realisasi = parseValue(apiData.realisasi[monthKey] || "0");

    const skki_percentage = 100;
    const rencana_percentage = skki > 0 ? (rencana / skki) * 100 : 0;
    const realisasi_percentage = skki > 0 ? (realisasi / skki) * 100 : 0;

    result[monthIndex] = {
      month: monthNames[monthIndex],
      "SKKI TERBIT": Math.round(skki_percentage * 100) / 100,
      RENCANA: Math.round(rencana_percentage * 100) / 100,
      REALISASI: Math.round(realisasi_percentage * 100) / 100,
      // Store real values
      "SKKI TERBIT_REAL": skki,
      RENCANA_REAL: rencana,
      REALISASI_REAL: realisasi,
    };
  });

  return result;
};

const AnggaranPage: React.FC = () => {
  const { user } = useAuth(); // Get user from auth context
  const [activeTab, setActiveTab] = useState<TabType>("anggaran-operasi");
  const [fromMonth, setFromMonth] = useState<string>("");
  const [toMonth, setToMonth] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [anggaranOperasiData, setAnggaranOperasiData] = useState<
    CategoryData[]
  >([]);
  const [investasiData, setInvestasiData] = useState<InvestasiData[]>([]);

  // Check if user can see real values
  const canSeeRealValues = useMemo(() => {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase();
    return role === "super admin" || role === "investasi";
  }, [user]);

  useEffect(() => {
    fetchAnggaranData();
  }, []);

  const fetchAnggaranData = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK_BE}/api/monitoring/anggaran`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });

      const convertedData: CategoryData[] = [
        {
          id: "kepegawaian",
          title: "POS KEPEGAWAIAN",
          number: "1",
          skkoNumber: "00000000",
          rawData: convertApiDataToRawData(res.data.pos_kepegawaian),
        },
        {
          id: "pemeliharaan",
          title: "POS PEMELIHARAAN",
          number: "2",
          skkoNumber: "00000000",
          rawData: convertApiDataToRawData(res.data.pos_pemeliharaan),
        },
        {
          id: "administrasi",
          title: "POS ADMINISTRASI UMUM",
          number: "3",
          skkoNumber: "00000000",
          rawData: convertApiDataToRawData(res.data.pos_administrasi_umum),
        },
      ];

      setAnggaranOperasiData(convertedData);

      if (res.data.investasi && res.data.investasi.length > 0) {
        const investasiConverted = convertInvestasiApiData(
          res.data.investasi[0]
        );
        setInvestasiData(investasiConverted);
      }
    } catch (error: any) {
      console.log(error);
      setAnggaranOperasiData([]);
      setInvestasiData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByMonthRange = (data: RawData[]): RawData[] => {
    if (!fromMonth || !toMonth) return data;

    const startIndex = shortMonthNames.indexOf(fromMonth);
    const endIndex = shortMonthNames.indexOf(toMonth);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      return data;
    }

    return data.filter((d) => {
      const monthIdx = parseInt(d.date.split("-")[1], 10) - 1;
      return monthIdx >= startIndex && monthIdx <= endIndex;
    });
  };

  const aggregateMonthlyData = (raw: RawData[]): MonthlyData[] => {
    const grouped: Record<
      string,
      { percentages: number[]; realValues: number[] }
    > = {};

    raw.forEach((d) => {
      const monthIdx = parseInt(d.date.split("-")[1], 10) - 1;
      const shortMonth = shortMonthNames[monthIdx];

      if (!grouped[shortMonth]) {
        grouped[shortMonth] = { percentages: [], realValues: [] };
      }
      grouped[shortMonth].percentages.push(d.percentage);
      if (d.realValue !== undefined) {
        grouped[shortMonth].realValues.push(d.realValue);
      }
    });

    return Object.entries(grouped).map(([month, data]) => ({
      month,
      percentage: Math.round(
        data.percentages.reduce((a, b) => a + b, 0) / data.percentages.length
      ),
      realValue:
        data.realValues.length > 0
          ? Math.round(
              data.realValues.reduce((a, b) => a + b, 0) /
                data.realValues.length
            )
          : undefined,
      color: monthColors[month],
    }));
  };

  const filteredData = useMemo(() => {
    return anggaranOperasiData.map((cat) => ({
      ...cat,
      data: aggregateMonthlyData(filterByMonthRange(cat.rawData)),
    }));
  }, [fromMonth, toMonth, anggaranOperasiData]);

  const CustomLegend = () => {
    const orderedPayload = [
      { value: "SKKI TERBIT", color: "#B40404" },
      { value: "RENCANA", color: "#179FB7" },
      { value: "REALISASI", color: "#E78700" },
    ];

    return (
      <div className="flex justify-start items-center gap-6 mt-5">
        {orderedPayload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

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
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-full">
          <div className="mb-8">
            <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
              {activeTab === "anggaran-operasi"
                ? "ANGGARAN OPERASI 2025"
                : "INVESTASI"}
            </h1>
          </div>
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab("anggaran-operasi")}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${
                activeTab === "anggaran-operasi"
                  ? "bg-[#145C72] text-white"
                  : "bg-white border border-[#179FB7] text-[#179FB7] hover:bg-gray-100"
              }`}
            >
              ANGGARAN OPERASI
            </button>
            <button
              onClick={() => setActiveTab("investasi")}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${
                activeTab === "investasi"
                  ? "bg-[#145C72] text-white"
                  : "bg-white border border-[#179FB7] text-[#179FB7] hover:bg-gray-100"
              }`}
            >
              INVESTASI
            </button>
          </div>

          {activeTab === "anggaran-operasi" && (
            <div>
              <div className="flex items-center justify-between  mb-3 rounded-2xl shadow-2xl p-2 bg-white">
                <div className="flex w-full flex-col md:flex-row  items-center justify-center gap-4 md:justify-normal">
                  <span className="text-sm text-gray-600">Dari</span>
                  <select
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                    className="px-4 py-2 border rounded-full text-sm"
                  >
                    <option value="">Pilih Bulan</option>
                    {shortMonthNames.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <span className="text-sm text-gray-600">Sampai</span>
                  <select
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value)}
                    className="px-4 py-2 border rounded-full text-sm"
                  >
                    <option value="">Pilih Bulan</option>
                    {shortMonthNames.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setFromMonth("");
                      setToMonth("");
                    }}
                    className="px-4 py-2 bg-[#145C72] text-white rounded-full hover:bg-[#134a5e] text-sm"
                  >
                    RESET FILTER
                  </button>
                </div>
              </div>

              {anggaranOperasiData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredData.map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl shadow-sm border p-4"
                    >
                      <h3 className="text-sm font-semibold text-[#145C72] uppercase mb-2">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        No. SKKO: {cat.skkoNumber}
                      </p>

                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={cat.data}
                            layout="vertical"
                            margin={{ top: 5, right: 60, left: 30, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis type="category" dataKey="month" width={30} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                      <p className="font-medium text-gray-800 text-sm mb-1">
                                        {data.month}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Percentage: {data.percentage}%
                                      </p>
                                      {canSeeRealValues &&
                                        data.realValue !== undefined && (
                                          <p className="text-sm text-gray-600">
                                            Value: Rp{" "}
                                            {formatNumber(data.realValue)}
                                          </p>
                                        )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="percentage">
                              <LabelList
                                dataKey={
                                  canSeeRealValues ? "realValue" : "percentage"
                                }
                                position="right"
                                formatter={(value: any) =>
                                  canSeeRealValues
                                    ? `Rp ${formatNumber(value)}`
                                    : `${value}%`
                                }
                                style={{ fontSize: "10px" }}
                              />
                              {cat.data.map((d, i) => (
                                <Cell key={i} fill={d.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "investasi" && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide flex gap-2">
                    <img src="/TowerAdkon.svg" alt="tower" /> GRAFIK INVESTASI
                  </h3>
                </div>
                {investasiData.length > 0 ? (
                  <>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={investasiData}
                          margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
                          barCategoryGap="5%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 10,
                              fill: "#6b7280",
                              fontWeight: 500,
                            }}
                            interval={0}
                          />
                          <YAxis
                            domain={[0, 100]}
                            ticks={[0, 20, 40, 60, 80, 100]}
                            tickFormatter={(value: number) => `${value}%`}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                    <p className="font-medium text-gray-800 text-sm mb-2">
                                      {label}
                                    </p>
                                    {payload.map(
                                      (entry: any, index: number) => {
                                        const realValueKey = `${entry.dataKey}_REAL`;
                                        const realValue = data[realValueKey];

                                        return (
                                          <div key={index} className="mb-1">
                                            <p
                                              className="text-sm flex items-center justify-between"
                                              style={{ color: entry.color }}
                                            >
                                              <span>{entry.dataKey}:</span>
                                              <span className="ml-2 font-medium">
                                                {entry.value.toFixed(2)}%
                                              </span>
                                            </p>
                                            {canSeeRealValues &&
                                              realValue !== undefined && (
                                                <p className="text-xs text-gray-600 ml-2">
                                                  Rp {formatNumber(realValue)}{" "}
                                                  JT
                                                </p>
                                              )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="SKKI TERBIT"
                            fill="#B40404"
                            barSize={20}
                          >
                            {canSeeRealValues && (
                              <LabelList
                                dataKey="SKKI TERBIT_REAL"
                                position="top"
                                formatter={(value: any) => {
                                  const numValue = Number(value);
                                  return isNaN(numValue)
                                    ? ""
                                    : `Rp ${formatNumber(numValue)} JT`;
                                }}
                                style={{ fontSize: "9px", fill: "#B40404" }}
                              />
                            )}
                          </Bar>
                          <Bar dataKey="REALISASI" fill="#E78700" barSize={20}>
                            {canSeeRealValues && (
                              <LabelList
                                dataKey="REALISASI_REAL"
                                position="top"
                                formatter={(value: any) => {
                                  const numValue = Number(value);
                                  return isNaN(numValue)
                                    ? ""
                                    : `Rp ${formatNumber(numValue)} JT`;
                                }}
                                style={{ fontSize: "9px", fill: "#E78700" }}
                              />
                            )}
                          </Bar>
                          <Bar dataKey="RENCANA" fill="#179FB7" barSize={20}>
                            {canSeeRealValues && (
                              <LabelList
                                dataKey="RENCANA_REAL"
                                position="top"
                                formatter={(value: any) => {
                                  const numValue = Number(value);
                                  return isNaN(numValue)
                                    ? ""
                                    : `Rp ${formatNumber(numValue)} JT`;
                                }}
                                style={{ fontSize: "9px", fill: "#179FB7" }}
                              />
                            )}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <CustomLegend />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No investment data available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AnggaranPage;
