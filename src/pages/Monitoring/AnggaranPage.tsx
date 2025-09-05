import React, { useState, useMemo } from "react";
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

interface RawData {
  date: string; // format: YYYY-MM-DD
  percentage: number;
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
  color: string;
}

interface InvestasiData {
  month: string;
  "SKKI TERBIT": number;
  "AKI TERKONTRAK": number;
  "AKI TERBAYAR": number;
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

// mock raw data with random percentages
const generateMockRawData = (): RawData[] => {
  const data: RawData[] = [];
  for (let m = 1; m <= 12; m++) {
    const entries = Math.floor(Math.random() * 3) + 1; // 1-3 entries per month
    for (let e = 0; e < entries; e++) {
      const day = Math.floor(Math.random() * 28) + 1;
      data.push({
        date: `2025-${String(m).padStart(2, "0")}-${String(day).padStart(
          2,
          "0"
        )}`,
        percentage: Math.floor(Math.random() * 100),
      });
    }
  }
  return data;
};

const anggaranOperasiData: CategoryData[] = [
  {
    id: "kepegawaian",
    title: "POS KEPEGAWAIAN",
    number: "1",
    skkoNumber: "00000000",
    rawData: generateMockRawData(),
  },
  {
    id: "pemeliharaan",
    title: "POS PEMELIHARAAN",
    number: "2",
    skkoNumber: "00000000",
    rawData: generateMockRawData(),
  },
  {
    id: "administrasi",
    title: "POS ADMINISTRASI UMUM",
    number: "3",
    skkoNumber: "00000000",
    rawData: generateMockRawData(),
  },
];

const investasiData: InvestasiData[] = monthNames.map((m) => ({
  month: m,
  "SKKI TERBIT": 100,
  "AKI TERBAYAR": 50,
  "AKI TERKONTRAK": 75,
}));

const AnggaranPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("anggaran-operasi");
  const [fromMonth, setFromMonth] = useState<string>("");
  const [toMonth, setToMonth] = useState<string>("");

  const filterByMonthRange = (data: RawData[]): RawData[] => {
    if (!fromMonth || !toMonth) return data;
    const startIndex = monthNames.indexOf(fromMonth);
    const endIndex = monthNames.indexOf(toMonth);
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex)
      return data;

    return data.filter((d) => {
      const monthIdx = parseInt(d.date.split("-")[1], 10) - 1;
      return monthIdx >= startIndex && monthIdx <= endIndex;
    });
  };

  const aggregateMonthlyData = (raw: RawData[]): MonthlyData[] => {
    const grouped: Record<string, number[]> = {};
    raw.forEach((d) => {
      const monthIdx = parseInt(d.date.split("-")[1], 10) - 1;
      const shortMonth = [
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
      ][monthIdx];
      if (!grouped[shortMonth]) grouped[shortMonth] = [];
      grouped[shortMonth].push(d.percentage);
    });

    return Object.entries(grouped).map(([month, arr]) => ({
      month,
      percentage: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
      color: monthColors[month],
    }));
  };

  const filteredData = useMemo(() => {
    return anggaranOperasiData.map((cat) => ({
      ...cat,
      data: aggregateMonthlyData(filterByMonthRange(cat.rawData)),
    }));
  }, [fromMonth, toMonth]);

  const CustomLegend = () => {
    const orderedPayload = [
      { value: "SKKI TERBIT", color: "#B40404" },
      { value: "AKI TERBAYAR", color: "#E78700" },
      { value: "AKI TERKONTRAK", color: "#179FB7" },
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

  return (
    <DefaultLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-full">
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

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#145C72] text-center uppercase">
              {activeTab === "anggaran-operasi"
                ? "ANGGARAN OPERASI 2025"
                : "INVESTASI"}
            </h1>
          </div>

          {activeTab === "anggaran-operasi" && (
            <div>
              <div className="flex items-center justify-between mb-3 rounded-2xl shadow-2xl p-2 bg-white">
                <div className="flex items-center gap-4 ">
                  <span className="text-sm text-gray-600">Dari</span>
                  <select
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                    className="px-4 py-2 border rounded-full text-sm"
                  >
                    <option value="">Pilih Bulan</option>
                    {[
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
                    ].map((m) => (
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
                    {[
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
                    ].map((m) => (
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

              <div className="grid grid-cols-3 gap-6">
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
                          <Tooltip />
                          <Bar dataKey="percentage">
                            <LabelList
                              dataKey="percentage"
                              position="right"
                              formatter={(label: any) => `${label}%`}
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
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                <p className="font-medium text-gray-800 text-sm mb-2">
                                  {label}
                                </p>
                                {payload.map((entry: any, index: number) => (
                                  <p
                                    key={index}
                                    className="text-sm flex items-center justify-between"
                                    style={{ color: entry.color }}
                                  >
                                    <span>{entry.dataKey}:</span>
                                    <span className="ml-2 font-medium">
                                      {entry.value}%
                                    </span>
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="SKKI TERBIT" fill="#B40404" barSize={20} />
                      <Bar dataKey="AKI TERBAYAR" fill="#E78700" barSize={20} />
                      <Bar
                        dataKey="AKI TERKONTRAK"
                        fill="#179FB7"
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <CustomLegend />
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AnggaranPage;
