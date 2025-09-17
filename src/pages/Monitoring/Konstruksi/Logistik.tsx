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
  LabelList,
} from "recharts";
import { Chart } from "react-google-charts";
import DefaultLayout from "../../../layout/DefaultLayout";
import axios from "axios";

// Keep mock data for MATLEV (as requested)
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
      { category: "SARANA DAN\nPRASARANA", value: 105, color: "#ADD8E6" },
      { category: "KEAMANAN DAN\nKESELAMATAN", value: 105, color: "#2368CF" },
      {
        category: "TEKNOLOGI DAN\nSISTEM INFORMASI",
        value: 105,
        color: "#b19cd9",
      },
    ],
  },
};

// Interface definitions for API response
interface ApiResponse {
  status: string;
  message: string;
  data_gudang: WarehouseData[];
  persediaan: InventoryData;
  grafik_saldo: SaldoData;
  alat_berat: AlatBeratData;
}

interface WarehouseData {
  gudang: string;
  sub_gudang: string;
  luas_gudang: string;
  luas_gudang_terpakai: string;
  persediaan: string;
  cadang: string;
  attb: string;
  pre_memory: string;
  lainnya_limbah_non_b3: string;
  waktu_update: string;
}

interface InventoryData {
  normal: number;
  bursa: number;
  cadang: number;
  material_bongkaran: number;
  sisa_pekerjaan: number;
  non_b3: number;
  non_sap: number;
}

interface SaldoData {
  [key: string]: any;
  saldo_januari: { rencana: number; realisasi: number };
  saldo_februari: { rencana: number; realisasi: number };
  saldo_maret: { rencana: number; realisasi: number };
  saldo_april: { rencana: number; realisasi: number };
  saldo_mei: { rencana: number; realisasi: number };
  saldo_juni: { rencana: number; realisasi: number };
  saldo_juli: { rencana: number; realisasi: number };
  saldo_agustus: { rencana: number; realisasi: number };
  saldo_september: { rencana: number; realisasi: number };
  saldo_oktober: { rencana: number; realisasi: number };
  saldo_november: { rencana: number; realisasi: number };
  saldo_desember: { rencana: number; realisasi: number };
  januari?: MonthlyDetail[];
  februari?: MonthlyDetail[];
  maret?: MonthlyDetail[];
  april?: MonthlyDetail[];
  mei?: MonthlyDetail[];
  juni?: MonthlyDetail[];
  juli?: MonthlyDetail[];
  agustus?: MonthlyDetail[];
  september?: MonthlyDetail[];
  oktober?: MonthlyDetail[];
  november?: MonthlyDetail[];
  desember?: MonthlyDetail[];
}

interface MonthlyDetail {
  bulan: string;
  kontrak: string;
  nilai: string;
  no_kontrak: string;
  penerimaan: string;
  penerimaan_pengeluaran: string;
  pengeluaran: string;
  pragnosa_akhir_bulan: string;
  progres_realisasi: string;
  tahun: string;
}

interface AlatBeratData {
  crane: CraneData[];
  forklift: ForkliftData[];
}

interface CraneData {
  nama: string;
  jenis: string;
  model: string;
  pabrik_pembuat: string;
  negara_pembuat: string;
  tahun_pembuatan: string;
  no_seri: string;
  jenis_penggerak: string;
  kapasitas_angkat: string;
  tinggi_angkat: string;
}

interface ForkliftData {
  nama: string;
  jenis: string;
  model: string;
  pabrik_pembuat: string;
  negara_pembuat: string;
  tahun_pembuatan: string;
  no_seri: string;
  jenis_penggerak: string;
  kapasitas_angkat: string;
  tinggi_angkat: string;
}

const Logistik: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showWarehousePopup, setShowWarehousePopup] = useState<boolean>(false);
  const [showMatlevPopup, setShowMatlevPopup] = useState<boolean>(false);
  const [showAlatBeratPopup, setShowAlatBeratPopup] = useState<boolean>(false);
  const [showTransactionPopup, setShowTransactionPopup] =
    useState<boolean>(false);
  const [selectedTransactionData, setSelectedTransactionData] =
    useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  // New state for processed data
  const [warehouseData, setWarehouseData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [saldoData, setSaldoData] = useState<any[]>([]);
  const [alatBeratData, setAlatBeratData] = useState<any[]>([]);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    fetchSLOData();
  }, []);

  // Process API data
  useEffect(() => {
    if (apiData) {
      processWarehouseData();
      processInventoryData();
      processSaldoData();
      processAlatBeratData();
    }
  }, [apiData]);

  const processWarehouseData = () => {
    if (!apiData) return;

    // Group by main gudang
    const bekasi = apiData.data_gudang.filter(
      (item) => item.gudang === "BEKASI"
    );
    const cikarang = apiData.data_gudang.filter(
      (item) => item.gudang === "CIKARANG"
    );

    const warehouses = [
      {
        id: 1,
        name: "GUDANG PONCOL BARU",
        location: "Poncol Baru",
        apiName: "BEKASI",
        data: bekasi,
        subGudang: bekasi.map((item) => ({
          name: item.sub_gudang,
          luas_total: parseInt(item.luas_gudang.replace(/,/g, "")),
          luas_terpakai: parseInt(item.luas_gudang_terpakai.replace(/,/g, "")),
          composition: {
            persediaan: parseFloat(item.persediaan),
            cadang: parseFloat(item.cadang),
            attb: parseFloat(item.attb),
            pre_memory: parseFloat(item.pre_memory),
            limbah_non_b3: parseFloat(item.lainnya_limbah_non_b3),
          },
        })),
        status: "active",
      },
      {
        id: 2,
        name: "GUDANG CIBATU",
        location: "Cibatu",
        apiName: "CIKARANG",
        data: cikarang,
        subGudang: cikarang.map((item) => ({
          name: item.sub_gudang,
          luas_total: parseInt(item.luas_gudang.replace(/,/g, "")),
          luas_terpakai: parseInt(item.luas_gudang_terpakai.replace(/,/g, "")),
          composition: {
            persediaan: parseFloat(item.persediaan),
            cadang: parseFloat(item.cadang),
            attb: parseFloat(item.attb),
            pre_memory: parseFloat(item.pre_memory),
            limbah_non_b3: parseFloat(item.lainnya_limbah_non_b3),
          },
        })),
        status: "active",
      },
    ];

    setWarehouseData(warehouses);
  };

  const processInventoryData = () => {
    if (!apiData) return;

    const inventory = [
      ["Kategori", "Jumlah"],
      ["Material Normal", apiData.persediaan.normal],
      ["Material Bursa", apiData.persediaan.bursa],
      ["Material Cadang", apiData.persediaan.cadang],
      ["Material Bongkaran", apiData.persediaan.material_bongkaran],
      ["Material Sisa Pekerjaan", apiData.persediaan.sisa_pekerjaan],
      ["Limbah Non B3", apiData.persediaan.non_b3],
      ["Material Non SAP", apiData.persediaan.non_sap],
    ];

    setInventoryData(inventory);
  };

  const processSaldoData = () => {
    if (!apiData) return;

    const months = [
      "januari",
      "februari",
      "maret",
      "april",
      "mei",
      "juni",
      "juli",
      "agustus",
      "september",
      "oktober",
      "november",
      "desember",
    ];

    const processedSaldo = months.map((month) => {
      const saldoKey = `saldo_${month}`;
      const monthData = apiData.grafik_saldo[month] || [];

      // Use direct realisasi from saldo object, not calculated from array
      const saldoInfo = apiData.grafik_saldo[saldoKey] || {
        rencana: 0,
        realisasi: 0,
      };

      return {
        month: month.charAt(0).toUpperCase() + month.slice(1, 3),
        rencana: saldoInfo.rencana,
        realisasi: saldoInfo.realisasi,
        details: monthData,
        fullMonth: month, // Keep the full month name for matching
      };
    });

    setSaldoData(processedSaldo);
  };

  const processAlatBeratData = () => {
    if (!apiData) return;

    const equipmentData = [
      {
        id: 1,
        name: "CRANE",
        kondisi: "BAIK",
        icon: "/crane-icon.svg",
        color: "#FF6B6B",
        data: apiData.alat_berat.crane,
        details: {
          total: apiData.alat_berat.crane.length,
          aktif: apiData.alat_berat.crane.length,
          maintenance: 0,
          rusak: 0,
        },
      },
      {
        id: 2,
        name: "FORKLIFT",
        kondisi: "BAIK",
        icon: "/forklift-icon.svg",
        color: "#4ECDC4",
        data: apiData.alat_berat.forklift,
        details: {
          total: apiData.alat_berat.forklift.length,
          aktif: apiData.alat_berat.forklift.length,
          maintenance: 0,
          rusak: 0,
        },
      },
    ];

    setAlatBeratData(equipmentData);
  };

  const fetchSLOData = async () => {
    setLoading(true);
    const url = `${
      import.meta.env.VITE_API_LINK_BE
    }/api/monitoring/konstruksi/logistik/gudang`;

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

  // Small pie chart options - disable animation to prevent flickering
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
      "#ADD8E6", // Teal for SARANA DAN PRASARANA
      "#2368CF", // Orange for KEAMANAN DAN KESELAMATAN
      "#b19cd9", // Light purple for TEKNOLOGI DAN SISTEM INFORMASI
    ],
    pieSliceTextStyle: {
      color: "white",
      fontSize: 9,
      fontName: "Arial",
    },
    animation: {
      startup: false,
      duration: 0,
    },
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
      "#ADD8E6", // Teal for SARANA DAN PRASARANA
      "#2368CF", // Orange for KEAMANAN DAN KESELAMATAN
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

  // Fixed warehouse usage pie chart options
  const warehouseUsagePieOptions = {
    title: "",
    is3D: true,
    backgroundColor: "transparent",
    colors: ["#ff9500", "#26a69a"], // Orange and teal
    legend: {
      position: "bottom",
      alignment: "center",
      textStyle: {
        color: "#374151",
        fontSize: 10,
      },
    },
    pieSliceTextStyle: {
      color: "white",
      fontSize: 10,
      fontWeight: "bold",
    },
    chartArea: { width: "90%", height: "70%" },
  };

  // Fixed composition pie chart options with proper legend
  const compositionPieOptions = {
    title: "",
    is3D: false, // Disable 3D for better legend visibility
    backgroundColor: "transparent",
    colors: [
      "#e91e63", // Persediaan
      "#26a69a", // Cadang
      "#1f5f5f", // ATTB
      "#ff9500", // Pre Memory
      "#b19cd9", // Limbah Non B3
    ],
    legend: {
      position: "bottom",
      alignment: "start",
      textStyle: {
        color: "#374151",
        fontSize: 8,
      },
      maxLines: 5,
    },
    pieSliceTextStyle: {
      color: "white",
      fontSize: 8,
      fontWeight: "bold",
    },
    chartArea: { width: "90%", height: "60%" },
    pieSliceText: "percentage",
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

  const handleBarClick = (data: any) => {
    if (!data || !data.payload) return;

    const { payload } = data;
    const fullMonth = payload.fullMonth;

    const transactionDetails = apiData?.grafik_saldo[fullMonth] || [];

    setSelectedTransactionData({
      month: fullMonth,
      monthDisplay: payload.month,
      details: transactionDetails,
      rencana: payload.rencana,
      realisasi: payload.realisasi,
    });
    setShowTransactionPopup(true);
  };

  // Safe number formatting function
  const formatNumber = (value: any): string => {
    if (!value || value === 0) return "0";
    if (typeof value === "string") {
      // If it's already formatted (like "Rp106,954,605"), return as is
      if (value.includes("Rp") || value.includes(",")) return value;
      // Try to parse as number
      const num = parseFloat(value.replace(/[^\d.-]/g, ""));
      return isNaN(num) ? value : num.toLocaleString("id-ID");
    }
    if (typeof value === "number") {
      return value.toLocaleString("id-ID");
    }
    return value?.toString() || "0";
  };

  // Updated tooltip with safe number formatting
  const CustomSaldoTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-sm z-20">
          <p className="font-semibold text-gray-800 mb-2">{`${label}`}</p>
          <p className="text-blue-600">{`Rencana: ${formatNumber(
            data.rencana
          )}`}</p>
          <p className="text-green-600">{`Realisasi: ${formatNumber(
            data.realisasi
          )}`}</p>
          <p className="text-xs text-gray-500 mt-2">
            Klik Bar Atau Bulan Dibawah untuk melihat detail transaksi
          </p>
        </div>
      );
    }
    return null;
  };

  // Simplified warehouse card to match the image
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

  // Updated Warehouse Detail Popup with fixed pie charts
  const WarehousePopup: React.FC = () => {
    if (!selectedWarehouse) return null;

    const subGudangData = selectedWarehouse.subGudang || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#145C72]">
                Detail Gudang {selectedWarehouse.name}
              </h2>
              <button
                onClick={() => setShowWarehousePopup(false)}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Layout: left image, right gudang */}
            <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-6 mb-6">
              {/* Left - Image placeholder */}
              <div className="col-span-1 space-y-4">
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

              {/* Right - SubGudang cards */}
              <div className="col-span-1 md:col-span-4 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subGudangData.map((subGudang: any, index: any) => {
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 shadow"
                    >
                      <h3 className="font-bold text-[#145C72] mb-2 text-center">
                        {subGudang.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        Luas Total: {subGudang.luas_total.toLocaleString()} m²
                      </p>

                      {/* Usage pie chart */}
                      <div className="mb-4 flex justify-center">
                        <Chart
                          chartType="PieChart"
                          data={[
                            ["Status", "Luas (m²)"],
                            ["Luas Terpakai", subGudang.luas_terpakai],
                            [
                              "Luas Tersedia",
                              subGudang.luas_total - subGudang.luas_terpakai,
                            ],
                          ]}
                          options={warehouseUsagePieOptions}
                          width="100%"
                          height="180px"
                        />
                      </div>

                      {/* Composition pie chart */}
                      <div>
                        <h4 className="font-semibold text-[#145C72] mb-2 text-xs text-center">
                          KOMPOSISI MATERIAL (%)
                        </h4>
                        <Chart
                          chartType="PieChart"
                          data={[
                            ["Kategori", "Persentase"],
                            ["Persediaan", subGudang.composition.persediaan],
                            ["Cadang", subGudang.composition.cadang],
                            ["ATTB", subGudang.composition.attb],
                            ["Pre Memory", subGudang.composition.pre_memory],
                            [
                              "Limbah Non B3",
                              subGudang.composition.limbah_non_b3,
                            ],
                          ]}
                          options={compositionPieOptions}
                          width="100%"
                          height="180px"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // CORRECTED Transaction Details Popup
  const TransactionPopup = () => {
    if (!selectedTransactionData) return null;

    console.log("Selected transaction data:", selectedTransactionData);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#145C72]">
                Detail Transaksi - {selectedTransactionData.monthDisplay} (
                {selectedTransactionData.month})
              </h2>
              <button
                onClick={() => setShowTransactionPopup(false)}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700">Rencana</h3>
                <p className="text-xl font-bold text-blue-800">
                  {formatNumber(selectedTransactionData?.rencana)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700">Realisasi</h3>
                <p className="text-xl font-bold text-green-800">
                  {formatNumber(selectedTransactionData?.realisasi)}
                </p>
              </div>
            </div>

            {/* Transaction Details Table */}
            {selectedTransactionData.details &&
            Array.isArray(selectedTransactionData.details) &&
            selectedTransactionData.details.length > 0 ? (
              <div className="overflow-x-auto">
                <h3 className="font-semibold text-[#145C72] mb-4">
                  Detail Transaksi: ({selectedTransactionData.details.length}{" "}
                  transaksi)
                </h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-[#145C72] text-white">
                      <th className="border border-gray-300 p-2 text-sm">No</th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Kontrak
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        No. Kontrak
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Nilai
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Penerimaan
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Pengeluaran
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Tipe
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Progres
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Prognosa Akhir Bulan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransactionData.details.map(
                      (detail: MonthlyDetail, index: number) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <td className="border border-gray-300 p-2 text-sm text-center">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {detail?.kontrak || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {detail?.no_kontrak || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {detail?.nilai || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {detail?.penerimaan || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {detail?.pengeluaran || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {detail?.penerimaan_pengeluaran || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {detail?.progres_realisasi || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {detail?.pragnosa_akhir_bulan || "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>
                  Tidak ada detail transaksi untuk bulan{" "}
                  {selectedTransactionData.monthDisplay}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // MATLEV Detail Popup (unchanged - using mock data as requested)
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

              {/* Right - Bar Chart with individual colors */}
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

  // Updated Alat Berat Popup with detailed table
  const AlatBeratPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
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

          {/* CRANE Section */}
          {alatBeratData.find((equipment) => equipment.name === "CRANE") && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <img src="/crane.svg" alt="Crane" className="w-8 h-8 mr-3" />
                <h3 className="text-lg font-bold text-[#145C72]">CRANE</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-[#145C72] text-white">
                      <th className="border border-gray-300 p-2 text-sm">No</th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Nama
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Jenis
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Model
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Pabrik Pembuat
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Negara Pembuat
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Tahun Pembuatan
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        No. Seri
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Jenis Penggerak
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Kapasitas Angkat
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Tinggi Angkat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {alatBeratData
                      .find((equipment) => equipment.name === "CRANE")
                      ?.data.map((crane: CraneData, index: number) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <td className="border border-gray-300 p-2 text-sm text-center">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.nama}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.jenis}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.model}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.pabrik_pembuat}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.negara_pembuat}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.tahun_pembuatan}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.no_seri}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.jenis_penggerak}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.kapasitas_angkat}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {crane.tinggi_angkat}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FORKLIFT Section */}
          {alatBeratData.find((equipment) => equipment.name === "FORKLIFT") && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <img
                  src="/alatberat.svg"
                  alt="Forklift"
                  className="w-8 h-8 mr-3"
                />
                <h3 className="text-lg font-bold text-[#145C72]">FORKLIFT</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-[#145C72] text-white">
                      <th className="border border-gray-300 p-2 text-sm">No</th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Nama
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Jenis
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Model
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Pabrik Pembuat
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Negara Pembuat
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Tahun Pembuatan
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        No. Seri
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Jenis Penggerak
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Kapasitas Angkat
                      </th>
                      <th className="border border-gray-300 p-2 text-sm">
                        Tinggi Angkat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {alatBeratData
                      .find((equipment) => equipment.name === "FORKLIFT")
                      ?.data.map((forklift: ForkliftData, index: number) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <td className="border border-gray-300 p-2 text-sm text-center">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.nama}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.jenis}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.model}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.pabrik_pembuat}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.negara_pembuat}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.tahun_pembuatan}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.no_seri}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.jenis_penggerak}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.kapasitas_angkat}
                          </td>
                          <td className="border border-gray-300 p-2 text-sm">
                            {forklift.tinggi_angkat}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#145C72]"></div>
            <p className="mt-4 text-[#145C72] font-semibold">Loading...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-2 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-[32px] text-center font-bold text-[#155C72] mb-6">
            LOGISTIK
          </h1>
        </div>

        {/* Warehouse Overview Cards */}
        <div className="mb-8 rounded-2xl shadow-md p-3">
          <div className="flex items-center mb-4">
            <span className="text-lg font-bold text-[#145C72] px-3 py-1 rounded-2xl flex items-center">
              ℹ️ DAFTAR GUDANG
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {warehouseData.map((warehouse) => (
              <WarehouseCard key={warehouse.id} warehouse={warehouse} />
            ))}
            {/* Alat Berat card */}
            <div
              className="text-lg font-bold text-[#145C72] bg-[#FFF8D2] px-3 py-1 md:p-6 rounded-2xl shadow-md flex items-center cursor-pointer hover:shadow-xl transition-all duration-300"
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
                <span className="text-sm md:text-base font-bold text-[#145C72] px-3 py-1 rounded-full flex items-center">
                  📊 GRAFIK PERSEDIAAN
                </span>
              </div>

              {/* Main pie chart */}
              <div className="mb-4">
                <Chart
                  chartType="PieChart"
                  data={
                    inventoryData.length > 0
                      ? inventoryData
                      : [
                          ["Kategori", "Jumlah"],
                          ["No Data", 1],
                        ]
                  }
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

          {/* Right Column - Monthly Pie Charts (kept as mock data) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <span className="text-sm md:text-base font-bold text-[#145C72] px-3 py-1 rounded-full flex items-center">
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

        {/* Bar Chart - Saldo (Updated with API data) */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <span className="text-sm md:text-base font-bold text-[#145C72] px-3 py-1 rounded-full flex items-center">
                📊 GRAFIK SALDO
              </span>
            </div>

            <div className="h-64 md:h-80 ">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={saldoData}
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
                    tick={({ x, y, payload }) => (
                      <text
                        x={x}
                        y={y + 10}
                        textAnchor="middle"
                        fill="#374151"
                        fontSize={12}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const monthData = saldoData.find(
                            (d) => d.month === payload.value
                          );
                          if (monthData) handleBarClick({ payload: monthData });
                        }}
                      >
                        {payload.value}
                      </text>
                    )}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#374151" }}
                    tickLine={{ stroke: "#9CA3AF" }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(0)}M`
                    }
                  />
                  <Tooltip content={<CustomSaldoTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />

                  {/* Rencana Bar */}
                  <Bar
                    dataKey="rencana"
                    fill="#FF6B6B"
                    name="RENCANA"
                    radius={[2, 2, 0, 0]}
                  >
                    {saldoData.map((entry, index) => (
                      <Cell
                        key={`rencana-cell-${index}`}
                        fill="#FF6B6B"
                        onClick={() => handleBarClick({ payload: entry })}
                        cursor="pointer"
                      />
                    ))}
                    <LabelList
                      dataKey="rencana"
                      position="top"
                      style={{
                        fill: "#145C72",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                      formatter={(value: React.ReactNode) =>
                        typeof value === "number"
                          ? `${(value / 1000000).toFixed(0)}M`
                          : ""
                      }
                    />
                  </Bar>
                  <Bar
                    dataKey={() => 1} // force constant value, so bar always has height
                    fill="transparent"
                    onClick={(data) =>
                      handleBarClick({ payload: data.payload })
                    }
                    isAnimationActive={false}
                    style={{ cursor: "pointer" }}
                  />
                  {/* Realisasi Bar */}
                  <Bar
                    dataKey="realisasi"
                    fill="#145C72"
                    name="REALISASI"
                    radius={[2, 2, 0, 0]}
                  >
                    {saldoData.map((entry, index) => (
                      <Cell
                        key={`realisasi-cell-${index}`}
                        fill="#145C72"
                        onClick={() => handleBarClick({ payload: entry })}
                        cursor="pointer"
                      />
                    ))}
                    <LabelList
                      dataKey="realisasi"
                      position="top"
                      style={{
                        fill: "#145C72",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                      formatter={(value: React.ReactNode) =>
                        typeof value === "number"
                          ? `${(value / 1000000).toFixed(0)}JT`
                          : ""
                      }
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
        {showTransactionPopup && <TransactionPopup />}
      </div>
    </DefaultLayout>
  );
};

export default Logistik;
