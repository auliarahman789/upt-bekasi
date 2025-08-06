import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DefaultLayout from "../../../layout/DefaultLayout";

// Mock data for the monitoring cards
const mockData = {
  trafo: {
    title: "TRAFO",
    barData: [
      { name: "P1", value: 16, color: "#145C72" },
      { name: "P2", value: 33, color: "#189FB7" },
      { name: "P3", value: 26, color: "#65CFE2" },
    ],
    donutData: [
      { name: "Muda", value: 75, color: "#1f2937" },
      { name: "Tua", value: 15, color: "#145C72" },
      { name: "Sangat Tua", value: 16, color: "#189FB7" },
    ],
    legendData: [
      { name: "P1", value: 16, color: "#145C72", showPercent: false },
      { name: "P2", value: 33, color: "#189FB7", showPercent: false },
      { name: "P3", value: 26, color: "#65CFE2", showPercent: false },
      { name: "Muda", value: 75, color: "#1f2937", showPercent: true },
      { name: "Tua", value: 15, color: "#145C72", showPercent: true },
      { name: "Sangat Tua", value: 16, color: "#189FB7", showPercent: true },
    ],
  },
  city: {
    title: "CITY",
    barData: [
      { name: "P1", value: 18, color: "#145C72" },
      { name: "P2", value: 28, color: "#189FB7" },
      { name: "P3", value: 22, color: "#65CFE2" },
    ],
    donutData: [
      { name: "Muda", value: 65, color: "#1f2937" },
      { name: "Tua", value: 12, color: "#145C72" },
      { name: "Sangat Tua", value: 8, color: "#189FB7" },
    ],
    legendData: [
      { name: "P1", value: 18, color: "#145C72", showPercent: false },
      { name: "P2", value: 28, color: "#189FB7", showPercent: false },
      { name: "P3", value: 22, color: "#65CFE2", showPercent: false },
      { name: "Muda", value: 65, color: "#1f2937", showPercent: true },
      { name: "Tua", value: 12, color: "#145C72", showPercent: true },
      { name: "Sangat Tua", value: 8, color: "#189FB7", showPercent: true },
    ],
  },
  pms: {
    title: "PMS",
    barData: [
      { name: "P1", value: 20, color: "#145C72" },
      { name: "P2", value: 25, color: "#189FB7" },
      { name: "P3", value: 18, color: "#65CFE2" },
    ],
    donutData: [
      { name: "Muda", value: 70, color: "#1f2937" },
      { name: "Tua", value: 10, color: "#145C72" },
      { name: "Sangat Tua", value: 12, color: "#189FB7" },
    ],
    legendData: [
      { name: "P1", value: 20, color: "#145C72", showPercent: false },
      { name: "P2", value: 25, color: "#189FB7", showPercent: false },
      { name: "P3", value: 18, color: "#65CFE2", showPercent: false },
      { name: "Muda", value: 70, color: "#1f2937", showPercent: true },
      { name: "Tua", value: 10, color: "#145C72", showPercent: true },
      { name: "Sangat Tua", value: 12, color: "#189FB7", showPercent: true },
    ],
  },
  pmt: {
    title: "PMT",
    barData: [
      { name: "P1", value: 22, color: "#145C72" },
      { name: "P2", value: 30, color: "#189FB7" },
      { name: "P3", value: 25, color: "#65CFE2" },
    ],
    donutData: [
      { name: "Muda", value: 68, color: "#1f2937" },
      { name: "Tua", value: 14, color: "#145C72" },
      { name: "Sangat Tua", value: 11, color: "#189FB7" },
    ],
    legendData: [
      { name: "P1", value: 22, color: "#145C72", showPercent: false },
      { name: "P2", value: 30, color: "#189FB7", showPercent: false },
      { name: "P3", value: 25, color: "#65CFE2", showPercent: false },
      { name: "Muda", value: 68, color: "#1f2937", showPercent: true },
      { name: "Tua", value: 14, color: "#145C72", showPercent: true },
      { name: "Sangat Tua", value: 11, color: "#189FB7", showPercent: true },
    ],
  },
  la: {
    title: "LA",
    barData: [
      { name: "P1", value: 15, color: "#145C72" },
      { name: "P2", value: 24, color: "#189FB7" },
      { name: "P3", value: 19, color: "#65CFE2" },
    ],
    donutData: [
      { name: "Muda", value: 72, color: "#1f2937" },
      { name: "Tua", value: 8, color: "#145C72" },
      { name: "Sangat Tua", value: 6, color: "#189FB7" },
    ],
    legendData: [
      { name: "P1", value: 15, color: "#145C72", showPercent: false },
      { name: "P2", value: 24, color: "#189FB7", showPercent: false },
      { name: "P3", value: 19, color: "#65CFE2", showPercent: false },
      { name: "Muda", value: 72, color: "#1f2937", showPercent: true },
      { name: "Tua", value: 8, color: "#145C72", showPercent: true },
      { name: "Sangat Tua", value: 6, color: "#189FB7", showPercent: true },
    ],
  },
  ct: {
    title: "CT",
    barData: [
      { name: "P1", value: 12, color: "#145C72" },
      { name: "P2", value: 20, color: "#189FB7" },
      { name: "P3", value: 16, color: "#65CFE2" },
    ],
    donutData: [
      { name: "Muda", value: 74, color: "#1f2937" },
      { name: "Tua", value: 9, color: "#145C72" },
      { name: "Sangat Tua", value: 5, color: "#189FB7" },
    ],
    legendData: [
      { name: "P1", value: 12, color: "#145C72", showPercent: false },
      { name: "P2", value: 20, color: "#189FB7", showPercent: false },
      { name: "P3", value: 16, color: "#65CFE2", showPercent: false },
      { name: "Muda", value: 74, color: "#1f2937", showPercent: true },
      { name: "Tua", value: 9, color: "#145C72", showPercent: true },
      { name: "Sangat Tua", value: 5, color: "#189FB7", showPercent: true },
    ],
  },
  flabelpower: {
    title: "KABEL POWER",
    barData: [
      { name: "P1", value: 14, color: "#145C72" },
      { name: "P2", value: 26, color: "#189FB7" },
      { name: "P3", value: 18, color: "#65CFE2" },
    ],
    donutData: [
      { name: "Muda", value: 69, color: "#1f2937" },
      { name: "Tua", value: 11, color: "#145C72" },
      { name: "Sangat Tua", value: 7, color: "#189FB7" },
    ],
    legendData: [
      { name: "P1", value: 14, color: "#145C72", showPercent: false },
      { name: "P2", value: 26, color: "#189FB7", showPercent: false },
      { name: "P3", value: 18, color: "#65CFE2", showPercent: false },
      { name: "Muda", value: 69, color: "#1f2937", showPercent: true },
      { name: "Tua", value: 11, color: "#145C72", showPercent: true },
      { name: "Sangat Tua", value: 7, color: "#189FB7", showPercent: true },
    ],
  },
};

// Custom Tooltip Components
const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / data.payload.totalValue) * 100).toFixed(
      1
    );
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-medium">{`${data.name}: ${data.value} (${percentage}%)`}</p>
      </div>
    );
  }
  return null;
};

// Recharts Bar Chart Component with custom colors
const RechartsBarChart = ({ data }: { data: any }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#6B7280" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#6B7280" }}
        />
        <Tooltip content={<BarTooltip />} />
        <Bar dataKey="value" radius={[0, 0, 0, 0]}>
          {data.map((entry: any, index: any) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Recharts Pie Chart Component
const RechartsPieChart = ({ data }: { data: any }) => {
  const total = data.reduce((sum: any, item: any) => sum + item.value, 0);

  // Add total to each data point for percentage calculation in tooltip
  const dataWithTotal = data.map((item: any) => ({
    ...item,
    totalValue: total,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          paddingAngle={1}
          dataKey="value"
        >
          {dataWithTotal.map((entry: any, index: any) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Monitor Card Component with 3-section layout
const MonitorCard = ({
  title,
  barData,
  donutData,
  legendData,
}: {
  title: any;
  barData: any;
  donutData: any;
  legendData: any;
}) => {
  const total = legendData.reduce((sum: any, item: any) => sum + item.value, 0);
  const donutTotal = donutData.reduce(
    (sum: any, item: any) => sum + item.value,
    0
  );

  return (
    <div className="bg-neutral-100 rounded-2xl shadow-sm border p-3">
      {/* 3-section layout: Bar Chart | Pie Chart | Legend */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left section - Bar Chart */}
        <div className="flex flex-col rounded-2xl justify-between bg-white p-3">
          <div className="flex items-center mb-2">
            <div className="p-1 rounded mr-2">
              <span className="text-sm">
                <img src="/box.svg"></img>
              </span>
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
          </div>
          <RechartsBarChart data={barData} />
        </div>

        {/* Middle section - Pie Chart */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3">
          <RechartsPieChart data={donutData} />
        </div>

        {/* Right section - Total and Legend */}
        <div className="flex flex-col rounded-2xl bg-white p-3">
          {/* Total badge at top */}
          <div className="bg-[#145C72] text-white rounded-full  items-center grid grid-cols-6 px-1 py-1 mb-6">
            <span className="text-sm font-medium col-span-4 pl-2">Total</span>
            <div className="bg-white text-gray-800 rounded-full px-3 py-1 font-bold text-sm min-w-[40px] text-center col-span-2">
              {total}
            </div>
          </div>

          {/* Legend items with new design */}
          <div className="space-y-2 flex-1">
            {legendData.map((item: any, index: any) => {
              const percentage = item.showPercent
                ? Math.round((item.value / donutTotal) * 100)
                : null;
              return (
                <div
                  key={index}
                  className={` items-center justify-between rounded-full p-1 text-white font-medium text-sm ${
                    index === 3 ? "mt-6" : ""
                  }`}
                  style={{ backgroundColor: item.color }}
                >
                  <div className="grid grid-cols-6 items-center">
                    <span className="bg-white text-gray-800 text-center rounded-full px-2 py-1 font-bold text-xs mr-2 col-span-2">
                      {percentage !== null ? `${percentage}%` : item.value}
                    </span>
                    <span className="text-white col-span-4">{item.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
interface LocationFilters {
  [key: string]: boolean;
}

interface StatusFilters {
  [key: string]: boolean;
}

interface FilterProps {
  locationFilters: LocationFilters;
  statusFilters: StatusFilters;
  onLocationChange: (key: string) => void;
  onStatusChange: (key: string) => void;
}

// Filter Dropdown Component
interface FilterProps {
  isOpen: boolean;
  onClose: () => void;
  locationFilters: LocationFilters;
  statusFilters: StatusFilters;
  onLocationChange: (key: string) => void;
  onStatusChange: (key: string) => void;
  onApplyFilter: () => void;
}

const FilterModal: React.FC<FilterProps> = ({
  isOpen,
  locationFilters,
  statusFilters,
  onLocationChange,
  onStatusChange,
  onApplyFilter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-4xl border p-4 w-64 z-50">
      {/* Location Filter */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Lokasi ULTG</h4>
        <div className="space-y-2">
          {Object.entries(locationFilters).map(
            ([key, checked]: [string, boolean]) => (
              <label key={key} className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onLocationChange(key)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      checked
                        ? "bg-[#179FB7] border-[#179FB7]"
                        : "bg-white border-gray-300 hover:border-[#179FB7]"
                    } transition-colors duration-200`}
                  >
                    {checked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-[#179FB7] font-medium">
                  {key === "bekasi" ? "ULTG Bekasi" : "ULTG Cikarang"}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
        <div className="space-y-2">
          {Object.entries(statusFilters).map(
            ([key, checked]: [string, boolean]) => (
              <label key={key} className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onStatusChange(key)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      checked
                        ? "bg-[#179FB7] border-[#179FB7]"
                        : "bg-white border-gray-300 hover:border-[#179FB7]"
                    } transition-colors duration-200`}
                  >
                    {checked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-[#179FB7] font-medium capitalize">
                  {key}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Apply Filter Button */}
      <button
        onClick={onApplyFilter}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-2xl transition-colors text-sm"
      >
        TERAPKAN FILTER
      </button>
    </div>
  );
};

const MTUMonitoringPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationFilters, setLocationFilters] = useState({
    bekasi: true,
    cikarang: true,
  });
  const [statusFilters, setStatusFilters] = useState({
    open: true,
    progress: true,
    closed: true,
  });

  const handleLocationChange = (location: string) => {
    setLocationFilters((prev) => ({
      ...prev,
      [location]: !prev[location as keyof typeof prev],
    }));
  };

  const handleStatusChange = (status: string) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status as keyof typeof prev],
    }));
  };

  const handleApplyFilter = () => {
    console.log("Applied filters:", { locationFilters, statusFilters });
    setIsFilterOpen(false);
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {/* Global Filter Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center text-[16px] font-bold bg-white justify-between border-[1px] border-zinc-300 hover:bg-gray-200 px-4 py-2 rounded-full text-[#145C72] transition-colors shadow-2xl"
              >
                <div>FILTER</div>
                <div className="ml-6">
                  <img src="/filter.svg" />
                </div>
              </button>

              {/* Filter Dropdown */}
              <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                locationFilters={locationFilters}
                statusFilters={statusFilters}
                onLocationChange={handleLocationChange}
                onStatusChange={handleStatusChange}
                onApplyFilter={handleApplyFilter}
              />
            </div>
          </div>

          {/* Grid of monitoring cards - 2 per row on desktop, 1 on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(mockData).map(([key, data]) => (
              <MonitorCard
                key={key}
                title={data.title}
                barData={data.barData}
                donutData={data.donutData}
                legendData={data.legendData}
              />
            ))}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MTUMonitoringPage;
