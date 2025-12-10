import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
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
  LabelList,
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
  yellow: "#FFED29",
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

    // Create a map for quick lookup of priority data
    const priorityMap: { [key: string]: number } = {};
    prioritas.forEach((item: any) => {
      priorityMap[item.prioritas] = item.jumlah;
    });

    // Create bar data from prioritas with actual API values
    const barData = [
      {
        name: "P0",
        value: priorityMap["P0"] || 0,
        color: colors.red,
      },
      {
        name: "P1",
        value: priorityMap["P1"] || 0,
        color: colors.yellow,
      },
      {
        name: "P2",
        value: priorityMap["P2"] || 0,
        color: colors.lb,
      },
    ];

    // Calculate bar total for percentages
    const barTotal = barData.reduce((sum, item) => sum + item.value, 0);

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
      ...barData.map((item) => ({
        ...item,
        showPercent: true, // P0, P1, P2 show percentage
        total: barTotal,
      })),
      ...donutData.map((item: any) => ({
        ...item,
        showPercent: false, // Sangat Tua, Tua, Muda show value
      })),
    ];

    transformed[key] = {
      title: titleMap[key],
      barData,
      donutData,
      legendData,
      barTotal,
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

// Custom label for bar chart
const renderBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#374151"
      textAnchor="middle"
      fontSize={12}
      fontWeight="600"
    >
      {value}
    </text>
  );
};

// Custom label for pie chart - outside and black
const renderPieLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent } = props;
  const RADIAN = Math.PI / 180;
  // Calculate position outside the pie chart
  const radius = outerRadius + 20; // Move label outside by 20 pixels
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#000000" // Black color
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const RechartsBarChart = ({ data }: { data: any }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
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
          <LabelList dataKey="value" content={renderBarLabel} />
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
          label={renderPieLabel}
          labelLine={true}
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
  barTotal,
  chartType,
}: {
  title: any;
  barData: any;
  donutData: any;
  legendData: any;
  barTotal: any;
  chartType: "bar" | "pie";
}) => {
  const total = legendData.reduce((sum: any, item: any) => sum + item.value, 0);

  return (
    <div className="bg-neutral-100 rounded-2xl shadow-sm border p-3 h-full flex flex-col print-card-inner">
      {/* Mobile Layout - Stack vertically */}
      <div className="md:hidden print:!hidden flex flex-col gap-4 flex-1">
        {/* Title and Chart 1 (Priority) */}
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
            {chartType === "bar" ? (
              <RechartsBarChart data={barData} />
            ) : (
              <RechartsPieChart data={barData} />
            )}
          </div>
        </div>

        {/* Chart 2 (Age Status) */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3 min-h-[180px]">
          {chartType === "bar" ? (
            <RechartsBarChart data={donutData} />
          ) : (
            <RechartsPieChart data={donutData} />
          )}
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
              const displayValue = item.showPercent
                ? `${Math.round((item.value / barTotal) * 100)}%`
                : item.value;

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
                      {displayValue}
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
      <div className="hidden md:grid print:!grid grid-cols-3 gap-4 flex-1 print-chart-grid">
        {/* First Column - Title and Priority Chart */}
        <div className="flex flex-col rounded-2xl justify-between bg-white p-4 print-chart-container">
          <div className="flex items-center mb-4">
            <div className="p-1 rounded mr-2">
              <span className="text-sm">
                <img src="/box.svg" alt="box" />
              </span>
            </div>
            <h3 className="font-semibold text-gray-700 text-base">{title}</h3>
          </div>
          <div className="flex-1 print-chart-wrapper">
            {chartType === "bar" ? (
              <RechartsBarChart data={barData} />
            ) : (
              <RechartsPieChart data={barData} />
            )}
          </div>
        </div>

        {/* Second Column - Age Status Chart */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 print-chart-container">
          <div className="w-full h-full flex items-center justify-center print-chart-wrapper">
            {chartType === "bar" ? (
              <RechartsBarChart data={donutData} />
            ) : (
              <RechartsPieChart data={donutData} />
            )}
          </div>
        </div>

        {/* Third Column - Legend */}
        <div className="flex flex-col rounded-2xl bg-white p-4 justify-center">
          <div className="bg-[#E78700] text-white rounded-full items-center grid grid-cols-6 px-2 py-2 mb-8">
            <span className="text-base font-medium col-span-4 pl-2">Total</span>
            <div className="bg-white text-[#E78700] rounded-full px-4 py-2 font-bold text-base min-w-[50px] text-center col-span-2">
              {total}
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {legendData.map((item: any, index: any) => {
              const displayValue = item.showPercent
                ? `${Math.round((item.value / barTotal) * 100)}%`
                : item.value;

              return (
                <div
                  key={index}
                  className={`items-center justify-between rounded-full p-1.5 text-white font-medium text-base ${
                    index === 3 ? "mt-8" : ""
                  }`}
                  style={{ backgroundColor: item.color }}
                >
                  <div className="grid grid-cols-6 items-center">
                    <span className="bg-white text-gray-800 text-center rounded-full px-3 py-1.5 font-bold text-sm mr-2 col-span-2">
                      {displayValue}
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
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const contentRef = useRef<HTMLDivElement>(null);

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

      const transformedData = transformApiData(response.data);
      setMonitoringData(transformedData);
    } catch (err) {
      console.error("Error fetching MTU monitoring data:", err);
      setError("Failed to fetch monitoring data");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "MTU-Monitoring-Report",
    pageStyle: `
      @page {
        size: landscape;
        margin: 10mm;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .print-container {
          width: 100%;
          max-width: 100%;
        }
        
        /* Force page break after each card */
        .print-card {
          page-break-after: always;
          break-after: page;
          page-break-inside: avoid;
          break-inside: avoid;
          height: 100vh;
          display: flex !important;
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
          padding: 0 !important;
        }
        
        .print-card-inner {
          height: 550px !important;
          max-height: 550px !important;
          display: flex !important;
          flex-direction: column;
        }
        
        /* Grid layout for charts */
        .print-chart-grid {
          height: 550px !important;
        }
        
        .print-chart-container {
          height: 550px !important;
        }
        
        .print-chart-wrapper {
          height: 400px !important;
          min-height: 400px !important;
        }
        
        /* Remove page break from last card */
        .print-card:last-child {
          page-break-after: auto;
          break-after: auto;
        }
        
        /* Force show desktop grid layout */
        .print\\:\\!grid {
          display: grid !important;
        }
        
        /* Hide mobile layout */
        .print\\:\\!hidden {
          display: none !important;
        }
        
        /* Hide the grid layout on print, show cards as blocks */
        .print-grid-container {
          display: block !important;
        }
        
        /* Ensure grid layout is maintained within card */
        .grid-cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        
        svg {
          max-width: 100% !important;
          height: auto !important;
        }
      }
    `,
  });

  const toggleChartType = () => {
    setChartType((prev) => (prev === "bar" ? "pie" : "bar"));
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
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6 print:hidden">
            MONITORING KONDISI MTU
          </h1>
          {/* Action Buttons */}
          <div className="flex  gap-4 mb-4 print:hidden">
            <button
              onClick={toggleChartType}
              className="bg-[#145C72] text-white px-6 py-2 rounded-lg hover:bg-[#0f4a5c] transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              {chartType === "bar"
                ? "Switch to Pie Chart"
                : "Switch to Bar Chart"}
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#E78700] text-white px-6 py-2 rounded-lg hover:bg-[#d17a00] transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                  clipRule="evenodd"
                />
              </svg>
              Print
            </button>
          </div>

          {/* Content to Print */}
          <div ref={contentRef} className="print-container">
            {/* Title on screen view only */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr print-grid-container">
              {Object.entries(monitoringData).map(
                ([key, data]: [string, any]) => (
                  <div key={key} className="print-card">
                    <MonitorCard
                      title={data.title}
                      barData={data.barData}
                      donutData={data.donutData}
                      legendData={data.legendData}
                      barTotal={data.barTotal}
                      chartType={chartType}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MTUMonitoringPage;
