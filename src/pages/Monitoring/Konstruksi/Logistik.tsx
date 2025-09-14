import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList, // Add this import for individual bar colors
} from "recharts";
import { Chart } from "react-google-charts";
import DefaultLayout from "../../../layout/DefaultLayout";

// Mock data for warehouse overview
const mockWarehouseData = [
  {
    id: 1,
    name: "GUDANG PONCOL BARU",
    location: "Poncol Baru",
    totalItems: 1250,
    availableSpace: 75,
    status: "active",
    luasTerpakai: 47.4,
    luasTersedia: 52.6,
    detailOpen: {
      terbuka: 64.5,
      tertutup: 35.5,
    },
    detailClosed: {
      terbuka: 54.5,
      tertutup: 45.5,
    },
  },
  {
    id: 2,
    name: "GUDANG CIBATU",
    location: "Cibatu",
    totalItems: 890,
    availableSpace: 60,
    status: "active",
    luasTerpakai: 55.2,
    luasTersedia: 44.8,
    detailOpen: {
      terbuka: 60.3,
      tertutup: 39.7,
    },
    detailClosed: {
      terbuka: 48.9,
      tertutup: 51.1,
    },
  },
];

// Updated mock data for inventory pie chart to match the image
const mockInventoryData = [
  ["Kategori", "Jumlah"],
  ["Material Normal", 850], // Dark teal
  ["Material Bursa", 320], // Orange
  ["Material Cadang", 180], // Light purple
  ["Material Bongkaran", 95], // Magenta/Pink
  ["Material Sisa Pekerjaan", 65], // Dark teal (different shade)
  ["Limbah Non B3", 40], // Dark blue
  ["Material Non SAP", 25], // Light orange
];

// Mock data for monthly bar chart (Saldo)
const mockSaldoData = [
  { month: "Jan", rencana: 100, realisasi: 85 },
  { month: "Feb", rencana: 105, realisasi: 95 },
  { month: "Mar", rencana: 108, realisasi: 100 },
  { month: "Apr", rencana: 105, realisasi: 85 },
  { month: "May", rencana: 105, realisasi: 90 },
  { month: "Jun", rencana: 105, realisasi: 95 },
  { month: "Jul", rencana: 105, realisasi: 90 },
  { month: "Aug", rencana: 105, realisasi: 95 },
  { month: "Sep", rencana: 105, realisasi: 100 },
  { month: "Oct", rencana: 105, realisasi: 95 },
  { month: "Nov", rencana: 105, realisasi: 90 },
  { month: "Dec", rencana: 105, realisasi: 85 },
];

// Mock data for monthly pie charts (MATLEV) - 12 months
const mockMonthlyInventory = {
  Januari: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 105],
      ["MANAJEMEN TENAGA KERJA", 105],
      ["SARANA DAN PRASARANA", 105],
      ["KEAMANAN DAN KESELAMATAN", 105],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 105],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 105, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 105, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 105, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 105, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 105,
        color: "#b19cd9",
      },
    ],
  },
  Februari: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 98],
      ["MANAJEMEN TENAGA KERJA", 102],
      ["SARANA DAN PRASARANA", 108],
      ["KEAMANAN DAN KESELAMATAN", 95],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 110],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 98, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 102, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 108, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 95, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 110,
        color: "#b19cd9",
      },
    ],
  },
  Maret: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 112],
      ["MANAJEMEN TENAGA KERJA", 98],
      ["SARANA DAN PRASARANA", 105],
      ["KEAMANAN DAN KESELAMATAN", 101],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 107],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 112, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 98, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 105, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 101, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 107,
        color: "#b19cd9",
      },
    ],
  },
  April: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 110],
      ["MANAJEMEN TENAGA KERJA", 100],
      ["SARANA DAN PRASARANA", 115],
      ["KEAMANAN DAN KESELAMATAN", 97],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 108],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 110, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 100, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 115, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 97, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 108,
        color: "#b19cd9",
      },
    ],
  },
  Mei: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 120],
      ["MANAJEMEN TENAGA KERJA", 95],
      ["SARANA DAN PRASARANA", 100],
      ["KEAMANAN DAN KESELAMATAN", 105],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 112],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 120, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 95, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 100, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 105, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 112,
        color: "#b19cd9",
      },
    ],
  },
  Juni: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 115],
      ["MANAJEMEN TENAGA KERJA", 108],
      ["SARANA DAN PRASARANA", 102],
      ["KEAMANAN DAN KESELAMATAN", 99],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 111],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 115, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 108, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 102, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 99, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 111,
        color: "#b19cd9",
      },
    ],
  },
  Juli: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 118],
      ["MANAJEMEN TENAGA KERJA", 103],
      ["SARANA DAN PRASARANA", 109],
      ["KEAMANAN DAN KESELAMATAN", 100],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 115],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 118, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 103, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 109, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 100, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 115,
        color: "#b19cd9",
      },
    ],
  },
  Agustus: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 105],
      ["MANAJEMEN TENAGA KERJA", 107],
      ["SARANA DAN PRASARANA", 110],
      ["KEAMANAN DAN KESELAMATAN", 102],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 114],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 105, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 107, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 110, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 102, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 114,
        color: "#b19cd9",
      },
    ],
  },
  September: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 113],
      ["MANAJEMEN TENAGA KERJA", 99],
      ["SARANA DAN PRASARANA", 106],
      ["KEAMANAN DAN KESELAMATAN", 104],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 109],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 113, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 99, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 106, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 104, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 109,
        color: "#b19cd9",
      },
    ],
  },
  Oktober: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 111],
      ["MANAJEMEN TENAGA KERJA", 105],
      ["SARANA DAN PRASARANA", 103],
      ["KEAMANAN DAN KESELAMATAN", 106],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 116],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 111, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 105, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 103, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 106, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 116,
        color: "#b19cd9",
      },
    ],
  },
  November: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 109],
      ["MANAJEMEN TENAGA KERJA", 110],
      ["SARANA DAN PRASARANA", 107],
      ["KEAMANAN DAN KESELAMATAN", 103],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 112],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 109, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 110, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 107, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 103, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 112,
        color: "#b19cd9",
      },
    ],
  },
  Desember: {
    data: [
      ["Kategori", "Jumlah"],
      ["TATA KELOLA GUDANG", 114],
      ["MANAJEMEN TENAGA KERJA", 101],
      ["SARANA DAN PRASARANA", 104],
      ["KEAMANAN DAN KESELAMATAN", 107],
      ["TEKNOLOGI DAN SISTEM INFORMASI", 118],
    ],
    barData: [
      { category: "TATA KELOLA\nGUDANG", value: 114, color: "#e91e63" },
      { category: "MANAJEMEN\nTENAGA KERJA", value: 101, color: "#1f5f5f" },
      { category: "SARANA DAN\nPRASARANA", value: 104, color: "#26a69a" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 107, color: "#ff9500" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 118,
        color: "#b19cd9",
      },
    ],
  },
};

// Mock data for heavy equipment (Alat Berat)
const mockAlatBeratData = [
  {
    id: 1,
    name: "CRANE",
    kondisi: "BAIK",
    icon: "/crane-icon.svg",
    color: "#FF6B6B",
    details: {
      total: 5,
      aktif: 4,
      maintenance: 1,
      rusak: 0,
    },
  },
  {
    id: 2,
    name: "FORKLIFT",
    kondisi: "BAIK",
    icon: "/forklift-icon.svg",
    color: "#4ECDC4",
    details: {
      total: 8,
      aktif: 6,
      maintenance: 2,
      rusak: 0,
    },
  },
];

const Logistik: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showWarehousePopup, setShowWarehousePopup] = useState<boolean>(false);
  const [showMatlevPopup, setShowMatlevPopup] = useState<boolean>(false);
  const [showAlatBeratPopup, setShowAlatBeratPopup] = useState<boolean>(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Updated colors to match the image
  const pieOptions = {
    title: "",
    is3D: true,
    backgroundColor: "transparent",
    colors: [
      "#1f5f5f", // Dark teal for Material Normal
      "#ff9500", // Orange for Material Bursa
      "#b19cd9", // Light purple for Material Cadang
      "#e91e63", // Magenta/Pink for Material Bongkaran
      "#26a69a", // Teal for Material Sisa Pekerjaan
      "#1a237e", // Dark blue for Limbah Non B3
      "#ffb74d", // Light orange for Material Non SAP
    ],
    titleTextStyle: {
      color: "#145C72",
      fontSize: 14,
      bold: true,
    },
    legend: {
      position: "none",
    },
    pieSliceTextStyle: {
      color: "white",
      fontSize: 10,
    },
  };

  // FIXED: Small pie chart options - disable animation to prevent flickering
  const smallPieOptions = {
    ...pieOptions,
    width: isMobile ? 150 : 180,
    height: isMobile ? 150 : 180,
    chartArea: { width: "85%", height: "80%" },
    legend: {
      position: "none",
    },
    colors: [
      "#e91e63", // Magenta for TATA KELOLA GUDANG
      "#1f5f5f", // Dark teal for MANAJEMEN TENAGA KERJA
      "#26a69a", // Teal for SARANA DAN PRASARANA
      "#ff9500", // Orange for KEAMANAN DAN KESELAMATAN
      "#b19cd9", // Light purple for TEKNOLOGI DAN SISTEM INFORMASI
    ],
    pieSliceTextStyle: {
      color: "white",
      fontSize: 9,
      fontName: "Arial",
    },
    // FIXED: Disable animations to prevent flickering
    animation: {
      startup: false,
      duration: 0,
    },
    // Disable hover effects that cause flickering
    tooltip: { trigger: "none" },
    enableInteractivity: false,
  };

  // 3D Pie chart options for popup
  const popup3DPieOptions = {
    title: "",
    is3D: true,
    backgroundColor: "transparent",
    colors: [
      "#e91e63", // Magenta for TATA KELOLA GUDANG
      "#1f5f5f", // Dark teal for MANAJEMEN TENAGA KERJA
      "#26a69a", // Teal for SARANA DAN PRASARANA
      "#ff9500", // Orange for KEAMANAN DAN KESELAMATAN
      "#b19cd9", // Light purple for TEKNOLOGI DAN SISTEM INFORMASI
    ],
    legend: {
      position: "none",
    },
    pieSliceTextStyle: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
    width: 400,
    height: 400,
  };

  // Warehouse popup pie chart options
  const warehousePieOptions = {
    title: "",
    is3D: true, // Changed to 3D to match outer charts
    backgroundColor: "transparent",
    colors: ["#ff9500", "#26a69a"], // Orange and teal
    legend: {
      position: "bottom",
      alignment: "center",
      textStyle: {
        color: "#374151",
        fontSize: 12,
      },
    },
    pieSliceTextStyle: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
  };

  const handleWarehouseClick = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setShowWarehousePopup(true);
  };

  const handleMatlevClick = (month: string) => {
    setSelectedMonth(month);
    setShowMatlevPopup(true);
  };

  const handleAlatBeratClick = () => {
    setShowAlatBeratPopup(true);
  };

  // Simplified warehouse card to match the image (only this part changed)
  const WarehouseCard: React.FC<{ warehouse: any }> = ({ warehouse }) => (
    <div
      className="bg-[#D2F8FF] rounded-2xl p-4 md:p-6 shadow-lg border border-[#179FB7]/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => handleWarehouseClick(warehouse)}
    >
      <div className="flex items-center space-x-3">
        <span className="text-white text-xl">
          <img src="/Gudang.svg" alt="Icon" className="" />
        </span>

        <div>
          <h3 className="font-bold text-[#145C72] text-sm md:text-base">
            OVERVIEW {warehouse.name}
          </h3>
        </div>
      </div>
    </div>
  );

  // Warehouse Detail Popup (FIXED)
  const WarehousePopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#145C72]">Detail Gudang</h2>
            <button
              onClick={() => setShowWarehousePopup(false)}
              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left - Image placeholder */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#145C72] text-center">
                GAMBAR GUDANG
              </h3>
              <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                <span className="text-gray-500">Image Placeholder</span>
              </div>
              <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                <span className="text-gray-500">Image Placeholder</span>
              </div>
              <div className="flex justify-center space-x-2">
                <button className="w-10 h-10 bg-[#26a69a] text-white rounded-full">
                  ←
                </button>
                <button className="w-10 h-10 bg-[#26a69a] text-white rounded-full">
                  →
                </button>
              </div>
            </div>

            {/* Center - Warehouse Open Details */}
            <div className="text-center">
              <h3 className="font-bold text-[#145C72] mb-2">
                DETAIL GUDANG TERBUKA
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                PRESENTASE LUAS GUDANG
              </p>

              <div className="mb-4">
                <Chart
                  chartType="PieChart"
                  data={[
                    ["Status", "Persentase"],
                    ["Luas Terpakai", selectedWarehouse?.luasTerpakai || 47.4],
                    ["Luas Tersedia", selectedWarehouse?.luasTersedia || 52.6],
                  ]}
                  options={{
                    ...warehousePieOptions,
                    colors: ["#ff9500", "#26a69a"], // Orange for terpakai, teal for tersedia
                  }}
                  width="100%"
                  height="200px"
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-[#145C72] mb-2">
                  KOMPOSISI MATERIAL GUDANG TERPAKAI SEBELUM DISPOSAL (%)
                </h4>
                <Chart
                  chartType="PieChart"
                  data={[
                    ["Kategori", "Persentase"],
                    ["Persediaan", 20],
                    ["Cadang", 20],
                    ["Lainnya (limbah non B3)", 20],
                    ["ATTB", 20],
                    ["Pre Memory", 20],
                  ]}
                  options={{
                    ...warehousePieOptions,
                    colors: [
                      "#e91e63",
                      "#26a69a",
                      "#b19cd9",
                      "#1f5f5f",
                      "#ff9500",
                    ],
                  }}
                  width="100%"
                  height="200px"
                />
              </div>
            </div>
            {/* Terbuka/Tertutup Pie Chart */}
            <div className="mb-4 flex items-center justify-center">
              <Chart
                chartType="PieChart"
                data={[
                  ["Status", "Persentase"],
                  ["Terbuka", selectedWarehouse?.detailClosed.terbuka || 48.9],
                  [
                    "Tertutup",
                    selectedWarehouse?.detailClosed.tertutup || 51.1,
                  ],
                ]}
                options={{
                  ...warehousePieOptions,
                  colors: ["#26a69a", "#b19cd9"], // Teal for terbuka, purple for tertutup
                  legend: {
                    position: "bottom",
                    alignment: "center",
                    textStyle: {
                      color: "#374151",
                      fontSize: 12,
                    },
                  },
                }}
                width="100%"
                height="200px"
              />
            </div>
            {/* Right - Warehouse Closed Details */}
            <div className="text-center">
              <h3 className="font-bold text-[#145C72] mb-2">
                DETAIL GUDANG TERTUTUP
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                PRESENTASE LUAS GUDANG
              </p>

              <div className="mb-4">
                <Chart
                  chartType="PieChart"
                  data={[
                    ["Status", "Persentase"],
                    [
                      "Luas Terpakai",
                      selectedWarehouse?.detailClosed.terbuka || 54.5,
                    ],
                    [
                      "Luas Tersedia",
                      selectedWarehouse?.detailClosed.tertutup || 45.5,
                    ],
                  ]}
                  options={{
                    ...warehousePieOptions,
                    colors: ["#ff9500", "#26a69a"], // Orange for terpakai, teal for tersedia
                  }}
                  width="100%"
                  height="200px"
                />
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-[#145C72] mb-2">
                  KOMPOSISI MATERIAL GUDANG TERPAKAI SEBELUM DISPOSAL (%)
                </h4>
                <Chart
                  chartType="PieChart"
                  data={[
                    ["Kategori", "Persentase"],
                    ["Persediaan", 20],
                    ["Cadang", 20],
                    ["Lainnya (limbah non B3)", 20],
                    ["ATTB", 20],
                    ["Pre Memory", 20],
                  ]}
                  options={{
                    ...warehousePieOptions,
                    colors: [
                      "#e91e63",
                      "#26a69a",
                      "#b19cd9",
                      "#1f5f5f",
                      "#ff9500",
                    ],
                  }}
                  width="100%"
                  height="200px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // FIXED: MATLEV Detail Popup - Fixed bar chart colors and structure
  const MatlevPopup = () => {
    const monthData =
      mockMonthlyInventory[
        selectedMonth as keyof typeof mockMonthlyInventory
      ] || mockMonthlyInventory.Januari;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#145C72]">
                MATLEV {selectedMonth?.toUpperCase()}
              </h2>
              <button
                onClick={() => setShowMatlevPopup(false)}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left - 3D Pie Chart */}
              <div className="flex justify-center items-center">
                <Chart
                  chartType="PieChart"
                  data={monthData.data}
                  options={popup3DPieOptions}
                  width="400px"
                  height="400px"
                />
              </div>

              {/* Right - FIXED Bar Chart with individual colors */}
              <div className="flex justify-center items-center">
                <div className="w-full">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthData.barData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="category"
                          tick={{ fontSize: 10, fill: "#374151" }}
                          tickLine={{ stroke: "#9CA3AF" }}
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis
                          domain={[0, 120]}
                          tick={{ fontSize: 12, fill: "#374151" }}
                          tickLine={{ stroke: "#9CA3AF" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          labelStyle={{ color: "#374151" }}
                          formatter={(value) => [value, "Jumlah"]}
                        />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          {monthData.barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                          <LabelList
                            dataKey="value"
                            position="top"
                            style={{
                              fill: "#145C72",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Alat Berat Popup
  const AlatBeratPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#145C72]">
              DAFTAR ALAT BERAT
            </h2>
            <button
              onClick={() => setShowAlatBeratPopup(false)}
              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockAlatBeratData.map((equipment) => (
              <div
                key={equipment.id}
                className="rounded-2xl p-6 shadow-lg border border-gray-200"
                style={{ backgroundColor: `${equipment.color}20` }}
              >
                <div className="flex items-center space-x-4 ">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: equipment.color }}
                  >
                    {equipment.name === "CRANE" ? (
                      <img src="/crane.svg" alt="Icon" className="" />
                    ) : (
                      <img src="/alatberat.svg" alt="Icon" className="" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#145C72] text-xl">
                      {equipment.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      KONDISI: {equipment.kondisi}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-2 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-[32px] text-center font-bold text-[#155C72] mb-6">
            LOGISTIK
          </h1>
        </div>

        {/* Warehouse Overview Cards - Only this section was simplified */}
        <div className="mb-8 rounded-2xl shadow-md p-3 ">
          <div className="flex items-center mb-4">
            <span className="text-lg font-bold text-[#145C72]  px-3 py-1 rounded-2xl  flex items-center">
              ℹ️ DAFTAR GUDANG
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ">
            {mockWarehouseData.map((warehouse) => (
              <WarehouseCard key={warehouse.id} warehouse={warehouse} />
            ))}
            {/* Updated Alat Berat card with click handler */}
            <div
              className="text-lg font-bold text-[#145C72] bg-[#FFF8D2] px-3 py-1 rounded-2xl shadow-md flex items-center cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={handleAlatBeratClick}
            >
              <img src="/alatberat.svg" alt="Icon" className="mr-2" />
              DAFTAR ALAT BERAT
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Left Column - Overall Inventory Pie Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <span className="text-sm md:text-base font-bold text-[#145C72]  px-3 py-1 rounded-full flex items-center">
                  📊 GRAFIK PERSEDIAAN
                </span>
              </div>

              {/* Main pie chart */}
              <div className="mb-4">
                <Chart
                  chartType="PieChart"
                  data={mockInventoryData}
                  options={pieOptions}
                  width="100%"
                  height="300px"
                />
              </div>

              <div className="space-y-4">
                <div className="bg-white text-[#145C72] p-3 rounded-lg">
                  <p className="text-[16px] mb-2">DETAIL</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#1f5f5f] rounded"></div>
                      <span className="text-[#969696]">MATERIAL NORMAL</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#ff9500] rounded"></div>
                      <span className="text-[#969696]">MATERIAL BURSA</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#b19cd9] rounded"></div>
                      <span className="text-[#969696]">MATERIAL CADANG</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#e91e63] rounded"></div>
                      <span className="text-[#969696]">MATERIAL BONGKARAN</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#26a69a] rounded"></div>
                      <span className="text-[#969696]">
                        MATERIAL SISA PEKERJAAN
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#1a237e] rounded"></div>
                      <span className="text-[#969696]">LIMBAH NON B3</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#ffb74d] rounded"></div>
                      <span className="text-[#969696]">MATERIAL NON SAP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Monthly Pie Charts */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <span className="text-sm md:text-base font-bold text-[#145C72]  px-3 py-1 rounded-full flex items-center">
                  📈 GRAFIK MATLEV
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {Object.entries(mockMonthlyInventory).map(
                  ([month, monthData]) => (
                    <div
                      key={month}
                      className="text-center cursor-pointer"
                      onClick={() => handleMatlevClick(month)}
                    >
                      <Chart
                        chartType="PieChart"
                        data={monthData.data}
                        options={smallPieOptions}
                        width="80%"
                        height={isMobile ? "140px" : "160px"}
                      />
                      <p className="text-xs font-medium text-[#145C72] mt-2">
                        {month}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart - Saldo */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <span className="text-sm md:text-base font-bold text-[#145C72]  px-3 py-1 rounded-full flex items-center">
                📊 GRAFIK SALDO
              </span>
            </div>

            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockSaldoData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#374151" }}
                    tickLine={{ stroke: "#9CA3AF" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#374151" }}
                    tickLine={{ stroke: "#9CA3AF" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />

                  {/* Rencana Bar */}
                  <Bar
                    dataKey="rencana"
                    fill="#FF6B6B"
                    name="RENCANA"
                    radius={[2, 2, 0, 0]}
                  >
                    <LabelList
                      dataKey="rencana"
                      position="top"
                      style={{
                        fill: "#145C72",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    />
                  </Bar>

                  {/* Realisasi Bar */}
                  <Bar
                    dataKey="realisasi"
                    fill="#145C72"
                    name="REALISASI"
                    radius={[2, 2, 0, 0]}
                  >
                    <LabelList
                      dataKey="realisasi"
                      position="top"
                      style={{
                        fill: "#145C72",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* All Popups */}
        {showWarehousePopup && <WarehousePopup />}
        {showMatlevPopup && <MatlevPopup />}
        {showAlatBeratPopup && <AlatBeratPopup />}
      </div>
    </DefaultLayout>
  );
};

export default Logistik;
