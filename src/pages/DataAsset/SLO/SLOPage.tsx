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
  Cell,
  LabelList,
} from "recharts";
import DefaultLayout from "../../../layout/DefaultLayout";

interface KelengkapanDataSLO {
  bay_jaringan: string;
  kelengkapan: string;
  realisasi: string;
  target: string;
}

interface SLOData {
  ultg: string;
  total: number;
}

interface SLOGIData {
  ultg: string;
  data: Array<{
    gi: string;
    jumlah: number;
    justifikasi: string;
    ultg: string;
  }>;
}

interface SLOJaringanData {
  ultg: string;
  data: Array<{
    jaringan: string;
    jumlah: number;
    justifikasi: string;
    ultg: string;
  }>;
}

interface ApiResponse {
  status: string;
  message: string;
  kelengkapan_data_slo: KelengkapanDataSLO[];
  re_slo_tahun_depan: SLOData[];
  re_slo_tahun_ini: SLOData[];
  slo_baru: SLOData[];
  slo_gi: SLOGIData[];
  slo_jaringan: SLOJaringanData[];
}

const SLOPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  // Color palette for different bars
  const colorPalette = [
    "#20B2AA",
    "#FF8C00",
    "#FF6B6B",
    "#9370DB",
    "#32CD32",
    "#FF4500",
    "#1E90FF",
    "#FFD700",
    "#FF69B4",
    "#00CED1",
    "#DC143C",
    "#228B22",
    "#4169E1",
    "#FF1493",
    "#00FF7F",
  ];

  useEffect(() => {
    fetchSLOData();
  }, []);

  const fetchSLOData = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK_BE}/api/data-asset/slo`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });
      console.log("slo", res.data);
      setApiData(res.data);
    } catch (error: any) {
      console.log(error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Custom label component for values on top of bars
  const CustomLabel = (props: any) => {
    const { x, y, width, value } = props;

    // Place label inside the bar if it's near the top to avoid cropping
    const shouldPlaceInside = y < 25;
    const labelY = shouldPlaceInside ? y + 20 : y - 8;
    const textColor = shouldPlaceInside ? "#fff" : "#145C72";

    return (
      <text
        x={x + width / 2}
        y={labelY}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fontWeight="bold"
        style={{
          textShadow: shouldPlaceInside
            ? "1px 1px 1px rgba(0,0,0,0.5)"
            : "none",
        }}
      >
        {value}
      </text>
    );
  };

  // Process data for charts
  const processKelengkapanData = () => {
    if (!apiData?.kelengkapan_data_slo) return [];

    return apiData.kelengkapan_data_slo.map((item, index) => ({
      name: item.bay_jaringan,
      percentage:
        item.kelengkapan === "#DIV/0!"
          ? 0
          : parseFloat(item.kelengkapan.replace("%", "")),
      fill: colorPalette[index % colorPalette.length],
    }));
  };

  // Update the processing functions to group by ULTG instead of justifikasi
  const processMonitoringGIData = () => {
    if (!apiData?.slo_gi) return [];

    const bekasiData = apiData.slo_gi.find((item) => item.ultg === "BEKASI");
    const cikarangData = apiData.slo_gi.find(
      (item) => item.ultg === "CIKARANG"
    );

    // Group data by justifikasi for BEKASI
    const bekasiGrouped: { [key: string]: number } = {};
    if (bekasiData) {
      bekasiData.data.forEach((item) => {
        const key = item.justifikasi;
        bekasiGrouped[key] = (bekasiGrouped[key] || 0) + item.jumlah;
      });
    }

    // Group data by justifikasi for CIKARANG
    const cikarangGrouped: { [key: string]: number } = {};
    if (cikarangData) {
      cikarangData.data.forEach((item) => {
        const key = item.justifikasi;
        cikarangGrouped[key] = (cikarangGrouped[key] || 0) + item.jumlah;
      });
    }

    return [
      {
        name: "ULTG BEKASI",
        BARU: bekasiGrouped["SLO BARU"] || 0,
        "TARGET RE-SLO": bekasiGrouped["RE-SLO"] || 0,
        EXPIRED: bekasiGrouped["Habis Masa Berlaku Tahun Depan"] || 0,
      },
      {
        name: "ULTG CIKARANG",
        BARU: cikarangGrouped["SLO BARU"] || 0,
        "TARGET RE-SLO": cikarangGrouped["RE-SLO"] || 0,
        EXPIRED: cikarangGrouped["Habis Masa Berlaku Tahun Depan"] || 0,
      },
    ];
  };

  const processMonitoringJaringanData = () => {
    if (!apiData?.slo_jaringan) return [];

    const bekasiData = apiData.slo_jaringan.find(
      (item) => item.ultg === "BEKASI"
    );
    const cikarangData = apiData.slo_jaringan.find(
      (item) => item.ultg === "CIKARANG"
    );

    // Group data by justifikasi for BEKASI
    const bekasiGrouped: { [key: string]: number } = {};
    if (bekasiData) {
      bekasiData.data.forEach((item) => {
        const key = item.justifikasi;
        bekasiGrouped[key] = (bekasiGrouped[key] || 0) + item.jumlah;
      });
    }

    // Group data by justifikasi for CIKARANG
    const cikarangGrouped: { [key: string]: number } = {};
    if (cikarangData) {
      cikarangData.data.forEach((item) => {
        const key = item.justifikasi;
        cikarangGrouped[key] = (cikarangGrouped[key] || 0) + item.jumlah;
      });
    }

    return [
      {
        name: "ULTG BEKASI",
        BARU: bekasiGrouped["SLO BARU"] || 0,
        "TARGET RE-SLO": bekasiGrouped["RE-SLO"] || 0,
        EXPIRED: bekasiGrouped["Habis Masa Berlaku Tahun Depan"] || 0,
      },
      {
        name: "ULTG CIKARANG",
        BARU: cikarangGrouped["SLO BARU"] || 0,
        "TARGET RE-SLO": cikarangGrouped["RE-SLO"] || 0,
        EXPIRED: cikarangGrouped["Habis Masa Berlaku Tahun Depan"] || 0,
      },
    ];
  };
  const processTargetSLOData = () => {
    if (!apiData?.kelengkapan_data_slo) return [];

    return apiData.kelengkapan_data_slo.slice(1).map((item, index) => ({
      name: item.bay_jaringan,
      value: parseInt(item.target),
      fill: colorPalette[(index + 3) % colorPalette.length],
    }));
  };

  const processReSLOData = () => {
    if (!apiData) return [];

    return [
      {
        name: "ULTG BEKASI",
        tahunDepan:
          apiData.re_slo_tahun_depan.find((item) => item.ultg === "BEKASI")
            ?.total || 0,
        tahunIni:
          apiData.re_slo_tahun_ini.find((item) => item.ultg === "BEKASI")
            ?.total || 0,
        fillTahunDepan: colorPalette[0],
        fillTahunIni: colorPalette[1],
      },
      {
        name: "ULTG CIKARANG",
        tahunDepan:
          apiData.re_slo_tahun_depan.find((item) => item.ultg === "CIKARANG")
            ?.total || 0,
        tahunIni:
          apiData.re_slo_tahun_ini.find((item) => item.ultg === "CIKARANG")
            ?.total || 0,
        fillTahunDepan: colorPalette[2],
        fillTahunIni: colorPalette[3],
      },
    ];
  };

  const processSLOBaruData = () => {
    if (!apiData?.slo_baru) return [];

    return apiData.slo_baru.map((item, index) => ({
      name: `ULTG ${item.ultg}`,
      value: item.total,
      fill: colorPalette[(index + 5) % colorPalette.length],
    }));
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

  const kelengkapanData = processKelengkapanData();
  const monitoringGIData = processMonitoringGIData();
  const monitoringJaringanData = processMonitoringJaringanData();
  const targetSLOData = processTargetSLOData();
  const reSLOData = processReSLOData();
  const sloBaruData = processSLOBaruData();

  return (
    <DefaultLayout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            SLO
          </h1>
        </div>

        {/* First Row - Desktop: 3 columns, Mobile: 1 column */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Kelengkapan Data SLO */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 lg:col-span-2">
            <h2 className="text-sm md:text-lg font-bold text-[#145C72] mb-3 md:mb-4">
              KELENGKAPAN DATA SLO
            </h2>
            <ResponsiveContainer
              width="100%"
              height={280}
              className="md:!h-[330px]"
            >
              <BarChart
                data={kelengkapanData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                  className="md:text-xs"
                />
                <YAxis fontSize={10} className="md:text-xs" />
                <Tooltip formatter={(value) => [`${value}%`, "Kelengkapan"]} />
                <Bar dataKey="percentage">
                  <LabelList content={CustomLabel} />
                  {kelengkapanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monitoring SLO Gardu Induk */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <h2 className="text-sm md:text-lg font-bold text-[#145C72] mb-3 md:mb-4">
              MONITORING SLO GARDU INDUK
            </h2>
            <ResponsiveContainer
              width="100%"
              height={280}
              className="md:!h-[330px]"
            >
              <BarChart
                data={monitoringGIData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} className="md:text-xs" />
                <YAxis fontSize={10} className="md:text-xs" />
                <Tooltip />
                <Bar dataKey="BARU" fill="#20B2AA">
                  <LabelList content={CustomLabel} />
                </Bar>
                <Bar dataKey="TARGET RE-SLO" fill="#FF8C00">
                  <LabelList content={CustomLabel} />
                </Bar>
                <Bar dataKey="EXPIRED" fill="#FF6B6B">
                  <LabelList content={CustomLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex justify-center mt-2 md:mt-4 space-x-2 md:space-x-4 flex-wrap">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-[#20B2AA] mr-1 md:mr-2"></div>
                <span className="text-xs">BARU</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-[#FF8C00] mr-1 md:mr-2"></div>
                <span className="text-xs">TARGET RE-SLO</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-[#FF6B6B] mr-1 md:mr-2"></div>
                <span className="text-xs">EXPIRED</span>
              </div>
            </div>
          </div>

          {/* Monitoring SLO Jaringan */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <h2 className="text-sm md:text-lg font-bold text-[#145C72] mb-3 md:mb-4">
              MONITORING SLO JARINGAN
            </h2>
            <ResponsiveContainer
              width="100%"
              height={280}
              className="md:!h-[330px]"
            >
              <BarChart
                data={monitoringJaringanData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} className="md:text-xs" />
                <YAxis fontSize={10} className="md:text-xs" />
                <Tooltip />
                <Bar dataKey="BARU" fill="#20B2AA">
                  <LabelList content={CustomLabel} />
                </Bar>
                <Bar dataKey="TARGET RE-SLO" fill="#FF8C00">
                  <LabelList content={CustomLabel} />
                </Bar>
                <Bar dataKey="EXPIRED" fill="#FF6B6B">
                  <LabelList content={CustomLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex justify-center mt-2 md:mt-4 space-x-2 md:space-x-4 flex-wrap">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-[#20B2AA] mr-1 md:mr-2"></div>
                <span className="text-xs">BARU</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-[#FF8C00] mr-1 md:mr-2"></div>
                <span className="text-xs">TARGET RE-SLO</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-[#FF6B6B] mr-1 md:mr-2"></div>
                <span className="text-xs">EXPIRED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row Charts - Desktop: 4 columns, Mobile: 1 column */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Target SLO */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 lg:col-span-2">
            <h2 className="text-sm md:text-lg font-bold text-[#145C72] mb-3 md:mb-4">
              TARGET SLO
            </h2>
            <ResponsiveContainer
              width="100%"
              height={230}
              className="md:!h-[280px]"
            >
              <BarChart
                data={targetSLOData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={8}
                  className="md:text-xs"
                />
                <YAxis fontSize={8} className="md:text-xs" />
                <Tooltip />
                <Bar dataKey="value">
                  <LabelList content={CustomLabel} />
                  {targetSLOData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* RE-SLO Tahun Depan */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <h2 className="text-sm md:text-lg font-bold text-[#145C72] mb-3 md:mb-4">
              RE-SLO TAHUN DEPAN
            </h2>
            <ResponsiveContainer
              width="100%"
              height={230}
              className="md:!h-[280px]"
            >
              <BarChart
                data={reSLOData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  fontSize={8}
                  className="md:text-xs"
                />
                <YAxis fontSize={8} className="md:text-xs" />
                <Tooltip />
                <Bar dataKey="tahunDepan">
                  <LabelList content={CustomLabel} />
                  {reSLOData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillTahunDepan} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* RE-SLO Tahun Ini */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <h2 className="text-sm md:text-lg font-bold text-[#145C72] mb-3 md:mb-4">
              RE-SLO TAHUN INI
            </h2>
            <ResponsiveContainer
              width="100%"
              height={230}
              className="md:!h-[280px]"
            >
              <BarChart
                data={reSLOData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  fontSize={8}
                  className="md:text-xs"
                />
                <YAxis fontSize={8} className="md:text-xs" />
                <Tooltip />
                <Bar dataKey="tahunIni">
                  <LabelList content={CustomLabel} />
                  {reSLOData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillTahunIni} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SLO Baru */}
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <h2 className="text-sm md:text-lg font-bold text-[#145C72] mb-3 md:mb-4">
              SLO BARU
            </h2>
            <ResponsiveContainer
              width="100%"
              height={230}
              className="md:!h-[280px]"
            >
              <BarChart
                data={sloBaruData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  fontSize={8}
                  className="md:text-xs"
                />
                <YAxis fontSize={8} className="md:text-xs" />
                <Tooltip />
                <Bar dataKey="value">
                  <LabelList content={CustomLabel} />
                  {sloBaruData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SLOPage;
