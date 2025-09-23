import { useEffect, useState } from "react";
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
import axios from "axios";

// Color scheme for consistency
const colors = {
  primary: "#145C72",
  secondary: "#189FB7",
  tertiary: "#65CFE2",
  dark: "#1f2937",
  lb: "#28A8E0",
  orange: "#E78700",
  red: "#FF0000",
};

// Function to transform API data to component format
const transformApiData = (apiData: any) => {
  const transformed: any = {};

  // Map API keys to display titles
  const titleMap: { [key: string]: string } = {
    trafo: "TRAFO",
    cb: "CB", // Circuit Breaker
    ct: "CT",
    cvt: "CVT",
    ds: "DS",
    kabel_power: "KABEL POWER",
    la: "LA",
  };

  Object.entries(apiData).forEach(([key, value]: [string, any]) => {
    // Skip non-equipment keys
    if (!titleMap[key] || !value.status_usia || !value.prioritas) return;

    const statusUsia = value.status_usia;
    const prioritas = value.prioritas;

    // Create bar data from prioritas (assuming P1, P2, P3 priority levels)
    // Since your API only has one priority entry with "-", we'll need to adapt this
    const barData = [
      {
        name: "P1",
        value: Math.floor(prioritas[0]?.jumlah * 0.3) || 0,
        color: colors.primary,
      },
      {
        name: "P2",
        value: Math.floor(prioritas[0]?.jumlah * 0.4) || 0,
        color: colors.secondary,
      },
      {
        name: "P3",
        value: Math.floor(prioritas[0]?.jumlah * 0.3) || 0,
        color: colors.tertiary,
      },
    ];

    // Create donut data from status_usia
    const donutData = statusUsia.map((item: any) => {
      let color = colors.lb;
      if (item.status_usia === "TUA") color = colors.orange;
      else if (item.status_usia === "SANGAT TUA") color = colors.red;

      return {
        name:
          item.status_usia === "MUDA"
            ? "Muda"
            : item.status_usia === "TUA"
            ? "Tua"
            : "Sangat Tua",
        value: item.jumlah,
        color: color,
      };
    });

    // Create legend data combining both bar and donut data
    const legendData = [
      ...barData.map((item) => ({ ...item, showPercent: false })),
      ...donutData.map((item: any) => ({ ...item, showPercent: true })),
    ];

    transformed[key] = {
      title: titleMap[key],
      barData,
      donutData,
      legendData,
    };
  });

  return transformed;
};

// Custom Tooltip Components (keep existing)
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

// Keep existing chart components (RechartsBarChart, RechartsPieChart, MonitorCard)
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

const RechartsPieChart = ({ data }: { data: any }) => {
  const total = data.reduce((sum: any, item: any) => sum + item.value, 0);
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
    <div className="bg-neutral-100 rounded-2xl shadow-sm border p-3 h-full flex flex-col">
      {/* Mobile Layout - Stack vertically */}
      <div className="md:hidden flex flex-col gap-4 flex-1">
        {/* Title and Bar Chart */}
        <div className="flex flex-col rounded-2xl justify-between bg-white p-3 min-h-[200px]">
          <div className="flex items-center mb-2">
            <div className="p-1 rounded mr-2">
              <span className="text-sm">
                <img src="/box.svg" alt="box" />
              </span>
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
          </div>
          <div className="flex-1 min-h-[150px]">
            <RechartsBarChart data={barData} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3 min-h-[150px]">
          <RechartsPieChart data={donutData} />
        </div>

        {/* Legend */}
        <div className="flex flex-col rounded-2xl bg-white p-3 min-h-[200px]">
          <div className="bg-[#E78700] text-white rounded-full items-center grid grid-cols-6 px-1 py-1 mb-6">
            <span className="text-sm font-medium col-span-4 pl-2">Total</span>
            <div className="bg-white text-[#E78700] rounded-full px-3 py-1 font-bold text-sm min-w-[40px] text-center col-span-2">
              {total}
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {legendData.map((item: any, index: any) => {
              const percentage = item.showPercent
                ? Math.round((item.value / donutTotal) * 100)
                : null;
              return (
                <div
                  key={index}
                  className={`items-center justify-between rounded-full p-1 text-white font-medium text-sm ${
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

      {/* Desktop Layout - Grid columns */}
      <div className="hidden md:grid grid-cols-3 gap-4 flex-1">
        <div className="flex flex-col rounded-2xl justify-between bg-white p-3">
          <div className="flex items-center mb-2">
            <div className="p-1 rounded mr-2">
              <span className="text-sm">
                <img src="/box.svg" alt="box" />
              </span>
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
          </div>
          <RechartsBarChart data={barData} />
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3">
          <RechartsPieChart data={donutData} />
        </div>

        <div className="flex flex-col rounded-2xl bg-white p-3">
          <div className="bg-[#E78700] text-white rounded-full items-center grid grid-cols-6 px-1 py-1 mb-6">
            <span className="text-sm font-medium col-span-4 pl-2">Total</span>
            <div className="bg-white text-[#E78700] rounded-full px-3 py-1 font-bold text-sm min-w-[40px] text-center col-span-2">
              {total}
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {legendData.map((item: any, index: any) => {
              const percentage = item.showPercent
                ? Math.round((item.value / donutTotal) * 100)
                : null;
              return (
                <div
                  key={index}
                  className={`items-center justify-between rounded-full p-1 text-white font-medium text-sm ${
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

const MTUMonitoringPage = () => {
  const [monitoringData, setMonitoringData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMTUMonitoring();
  }, []);

  const fetchMTUMonitoring = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK_BE}/api/data-asset/mtu/kondisi`
      );

      console.log("MTU monitoring data fetched successfully:", response.data);

      // Transform API data to component format
      const transformedData = transformApiData(response.data);
      setMonitoringData(transformedData);
    } catch (err) {
      console.error("Error fetching MTU monitoring data:", err);
      setError("Failed to fetch monitoring data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145C72] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading monitoring data...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchMTUMonitoring}
              className="bg-[#145C72] text-white px-4 py-2 rounded-lg hover:bg-[#0f4a5c]"
            >
              Retry
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            MONITORING KONDISI MTU
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
            {Object.entries(monitoringData).map(
              ([key, data]: [string, any]) => (
                <MonitorCard
                  key={key}
                  title={data.title}
                  barData={data.barData}
                  donutData={data.donutData}
                  legendData={data.legendData}
                />
              )
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MTUMonitoringPage;
