import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import DefaultLayout from "../../layout/DefaultLayout";

interface TrendData {
  gi_gis: string;
  bay: string;
  trafo: string;
  value: number;
}

interface TrendMonth {
  bulan: string;
  data: TrendData[];
}

interface ApiResponse {
  status: string;
  message: string;
  data_trend_beban_trafo: TrendMonth[];
}

const HealthIndexPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  // Color mapping for different transformer types
  const colorMap: { [key: string]: string } = {
    "GI 150KV JABABEKA TRF#3 150/20kV": "#145C72",
    "GIS 150KV PONCOL BARU II TRF#1 150/22kV": "#179FB7",
    "GIS 150KV PONCOL BARU II TRF#2 150/22kV": "#28A8E0",
    "GI 150KV JUISHIN TRF#1 150/20kV": "#009A1A",
    "GI 150KV MEKARSARI TRF#3 150/20kV": "#FF5050",
    "GI 150KV MEKARSARI TRF#4 150/20kV": "#FFD05B",
    "GI 150KV TAMAN MEKAR TRF#1 150/22kV": "#FF53DD",
    "GI 150KV TEGALHERANG TRF#3 150/20kV": "#800000",
  };

  useEffect(() => {
    fetchHealthIndexData();
  }, []);

  const fetchHealthIndexData = async () => {
    setLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK_BE
    }/api/data-asset/health-index`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });
      console.log("health index", res.data);
      setApiData(res.data);
    } catch (error: any) {
      console.log(error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Transform trend data for chart
  const getChartData = () => {
    if (!apiData?.data_trend_beban_trafo) return [];
    const monthMap: { [key: string]: string } = {
      feb: "FEBRUARI",
      mar: "MARET",
      apr: "APRIL",
      mei: "MEI",
    };

    return apiData.data_trend_beban_trafo.map((month) => {
      const chartData: any = {
        month: monthMap[month.bulan] || month.bulan.toUpperCase(),
      };

      month.data.forEach((item) => {
        chartData[item.trafo] = item.value;
      });

      return chartData;
    });
  };

  // Get all unique transformer types for legend
  const getTransformerTypes = () => {
    if (!apiData?.data_trend_beban_trafo) return [];

    const types = new Set<string>();
    apiData.data_trend_beban_trafo.forEach((month) => {
      month.data.forEach((item) => {
        types.add(item.trafo);
      });
    });

    return Array.from(types);
  };

  // Get legend items from transformer data
  const getLegendItems = () => {
    if (!apiData?.data_trend_beban_trafo) return [];

    const legendItems: {
      [key: string]: { gi_gis: string; bay: string; trafo: string };
    } = {};

    apiData.data_trend_beban_trafo.forEach((month) => {
      month.data.forEach((item) => {
        if (!legendItems[item.trafo]) {
          legendItems[item.trafo] = {
            gi_gis: item.gi_gis,
            bay: item.bay,
            trafo: item.trafo,
          };
        }
      });
    });

    return Object.values(legendItems);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey.split(" ")[2]} ${
                entry.dataKey.split(" ")[3]
              }: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

  return (
    <DefaultLayout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            HEALTH INDEX
          </h1>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">📊</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#145C72]">
              TREND HEALTH INDEX
            </h2>
          </div>

          <div className="h-64 md:h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />

                {getTransformerTypes().map((trafo) => (
                  <Bar
                    key={trafo}
                    dataKey={trafo}
                    fill={
                      colorMap[trafo] ||
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`
                    }
                  >
                    <LabelList dataKey={trafo} position="top" fontSize={10} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {getLegendItems().map((item) => (
              <div key={item.trafo} className="flex items-center">
                <div
                  className="w-3 h-3 mr-2 rounded"
                  style={{ backgroundColor: colorMap[item.trafo] }}
                ></div>
                <span className="text-gray-700 truncate">
                  {item.gi_gis} {item.bay}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HealthIndexPage;
