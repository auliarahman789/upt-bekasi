// AnggaranPage.tsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  LabelList,
} from "recharts";
import DefaultLayout from "../../layout/DefaultLayout";

// Type definitions
interface AnggaranOperasiData {
  name: string;
  PAGU: number;
  REALISASI: number;
}

interface InvestasiData {
  month: string;
  "SKKI TERBIT": number;
  "AKI TERKONTRAK": number;
  "AKI TERBAYAR": number;
}

interface TabButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

type TabType = "anggaran-operasi" | "investasi";

const AnggaranPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("anggaran-operasi");

  // Mock data for Anggaran Operasi
  const anggaranOperasiSemester1: AnggaranOperasiData[] = [
    { name: "POS 5.2", PAGU: 100, REALISASI: 50 },
    { name: "POS 5.3", PAGU: 100, REALISASI: 50 },
    { name: "POS 5.4", PAGU: 100, REALISASI: 50 },
  ];

  const anggaranOperasiSemester2: AnggaranOperasiData[] = [
    { name: "POS 5.2", PAGU: 80, REALISASI: 65 },
    { name: "POS 5.3", PAGU: 90, REALISASI: 70 },
    { name: "POS 5.4", PAGU: 85, REALISASI: 60 },
  ];

  // Mock data for Investasi
  const investasiData: InvestasiData[] = [
    {
      month: "JANUARI",
      "SKKI TERBIT": 100,
      "AKI TERKONTRAK": 75,
      "AKI TERBAYAR": 50,
    },
    {
      month: "FEBRUARI",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "MARET",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "APRIL",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "MEI",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "JUNI",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "JULI",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "AGUSTUS",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "SEPTEMBER",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "OKTOBER",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "NOVEMBER",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
    {
      month: "DESEMBER",
      "SKKI TERBIT": 100,
      "AKI TERBAYAR": 50,
      "AKI TERKONTRAK": 75,
    },
  ];

  const TabButton: React.FC<TabButtonProps> = ({
    id,
    label,
    isActive,
    onClick,
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
        isActive
          ? "bg-[#145C72] text-white"
          : "bg-white border-1 border-[#179FB7] text-[#179FB7] hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide flex gap-2">
          <img src="/TowerAdkon.svg"></img> {title}
        </h3>
      </div>
      <div className="h-96">{children}</div>
    </div>
  );

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label component for bars
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#374151"
        textAnchor="middle"
        fontSize="12"
        fontWeight="500"
      >
        {`${value}%`}
      </text>
    );
  };

  const formatYAxisTick = (value: number): string => `${value}%`;

  const handleTabChange = (tabId: string): void => {
    setActiveTab(tabId as TabType);
  };
  // Add this custom legend component before your main component
  const CustomLegend = ({}: any) => {
    const orderedPayload = [
      { value: "SKKI TERBIT", color: "#B40404" },
      { value: "AKI TERBAYAR", color: "#E78700" },
      { value: "AKI TERKONTRAK", color: "#179FB7" },
    ];

    return (
      <div className="flex justify-start items-center gap-6 mt-5">
        {orderedPayload.map((entry, index) => (
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
        <div className="mx-auto">
          {/* Header */}

          {/* Tab Navigation */}
          <div className="flex gap-1 ">
            <TabButton
              id="anggaran-operasi"
              label="ANGGARAN OPERASI"
              isActive={activeTab === "anggaran-operasi"}
              onClick={handleTabChange}
            />
            <TabButton
              id="investasi"
              label="INVESTASI"
              isActive={activeTab === "investasi"}
              onClick={handleTabChange}
            />
          </div>
          <div className="mb-8">
            {activeTab === "anggaran-operasi" ? (
              <h1 className="text-3xl font-bold text-[#155C72] mb-2 uppercase text-center">
                ANGGARAN OPERASI
              </h1>
            ) : (
              <h1 className="text-3xl font-bold text-[#155C72] mb-2 uppercase text-center">
                INVESTASI
              </h1>
            )}
          </div>
          {/* Tab Content */}
          {activeTab === "anggaran-operasi" && (
            <div className="grid grid-cols-1">
              <ChartCard title="GRAFIK REALISASI ANGGARAN OPERASI" icon="1">
                <div className="flex gap-8 h-full">
                  {/* Semester 1 Chart */}
                  <div className="flex flex-col w-[48%]">
                    <h4 className="text-sm font-medium text-[#145C72] mb-4 text-center">
                      SEMESTER 1 (Januari ~ Juni 2025)
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={anggaranOperasiSemester1}
                        margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
                        barCategoryGap="25%"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 12,
                            fill: "#6b7280",
                            fontWeight: 500,
                          }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          ticks={[0, 20, 40, 60, 80, 100]}
                          tickFormatter={formatYAxisTick}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        <Bar
                          dataKey="PAGU"
                          fill="#374151"
                          radius={[0, 0, 0, 0]}
                          barSize={30}
                        >
                          <LabelList
                            dataKey="PAGU"
                            content={renderCustomizedLabel}
                          />
                        </Bar>
                        <Bar
                          dataKey="REALISASI"
                          fill="#0891b2"
                          radius={[0, 0, 0, 0]}
                          barSize={30}
                        >
                          <LabelList
                            dataKey="REALISASI"
                            content={renderCustomizedLabel}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-[#145C72] rounded-xs"></div>
                      <p>PAGU</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-[#179FB7] rounded-xs"></div>
                      <p>REALISASI</p>
                    </div>
                  </div>
                  {/* Semester 2 Chart */}
                  <div className="flex flex-col w-[48%]">
                    <h4 className="text-sm font-medium text-[#145C72] mb-4 text-center">
                      SEMESTER 2 (Januari ~ Desember)
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={anggaranOperasiSemester2}
                        margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
                        barCategoryGap="25%"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 12,
                            fill: "#6b7280",
                            fontWeight: 500,
                          }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          ticks={[0, 20, 40, 60, 80, 100]}
                          tickFormatter={formatYAxisTick}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        <Bar
                          dataKey="PAGU"
                          fill="#374151"
                          radius={[0, 0, 0, 0]}
                          barSize={30}
                        >
                          <LabelList
                            dataKey="PAGU"
                            content={renderCustomizedLabel}
                          />
                        </Bar>
                        <Bar
                          dataKey="REALISASI"
                          fill="#0891b2"
                          radius={[0, 0, 0, 0]}
                          barSize={30}
                        >
                          <LabelList
                            dataKey="REALISASI"
                            content={renderCustomizedLabel}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ChartCard>
            </div>
          )}

          {activeTab === "investasi" && (
            <div className="grid grid-cols-1 gap-8">
              <ChartCard title="GRAFIK INVESTASI" icon="3">
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
                      tick={{ fontSize: 10, fill: "#6b7280", fontWeight: 500 }}
                      angle={0}
                      textAnchor="middle"
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tickFormatter={formatYAxisTick}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      content={<CustomLegend />}
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Bar
                      dataKey="SKKI TERBIT"
                      fill="#B40404"
                      radius={[0, 0, 0, 0]}
                      barSize={20}
                    >
                      <LabelList
                        dataKey="SKKI TERBIT"
                        content={renderCustomizedLabel}
                      />
                    </Bar>
                    <Bar
                      dataKey="AKI TERBAYAR"
                      fill="#E78700"
                      radius={[0, 0, 0, 0]}
                      barSize={20}
                    >
                      <LabelList
                        dataKey="AKI TERBAYAR"
                        content={renderCustomizedLabel}
                      />
                    </Bar>
                    <Bar
                      dataKey="AKI TERKONTRAK"
                      fill="#179FB7"
                      radius={[0, 0, 0, 0]}
                      barSize={20}
                    >
                      <LabelList
                        dataKey="AKI TERKONTRAK"
                        content={renderCustomizedLabel}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AnggaranPage;
