// AdkonPage.tsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import DefaultLayout from "../../../layout/DefaultLayout";

// Mock data
const contractPreviewData = [
  { name: "KONSTRUKSI", value: 45, color: "#0891b2" },
  { name: "MASA PEMELIHARAAN", value: 35, color: "#64748b" },
  { name: "SELESAI", value: 20, color: "#22c55e" },
];

const physicalProgressData = [
  { year: "2021", kontrak: 105, progress: 47, bayar: 69 },
  { year: "2022", kontrak: 105, progress: 47, bayar: 69 },
  { year: "2023", kontrak: 105, progress: 47, bayar: 69 },
];

const investmentData = [
  { name: "SKKI TERBIT", value: 75, color: "#145C72" },
  { name: "AKI TERBAYAR", value: 25, color: "#189FB7" },
];

const contractListData = [
  {
    id: 1,
    noKontrak: "001",
    namaKontrak: "CONZ-001",
    tanggalKontrak: "DD/MM/YYYY",
    akhirKontrak: "DD/MM/YYYY",
    fisik: 80,
    bayar: 80,
    status: "KONSTRUKSI",
  },
  {
    id: 2,
    noKontrak: "002",
    namaKontrak: "CONZ-001",
    tanggalKontrak: "DD/MM/YYYY",
    akhirKontrak: "DD/MM/YYYY",
    fisik: 80,
    bayar: 80,
    status: "MASA PEMELIHARAAN",
  },
  {
    id: 3,
    noKontrak: "003",
    namaKontrak: "CONZ-001",
    tanggalKontrak: "DD/MM/YYYY",
    akhirKontrak: "DD/MM/YYYY",
    fisik: 80,
    bayar: 80,
    status: "SELESAI",
  },
];

const AdkonPage: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "KONSTRUKSI":
        return "bg-cyan-500 text-white";
      case "MASA PEMELIHARAAN":
        return "bg-gray-500 text-white";
      case "SELESAI":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full bg-red-400 rounded-full h-3">
      <div
        className="bg-green-400 h-3 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            ADMINISTRASI KONTRAK
          </h1>
        </div>

        {/* Top Row Cards - Mobile Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Pratinjau Kontrak */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-3">
                <img src="/TowerAdkon.svg" className="text-white" alt="Icon" />
              </div>
              <h2 className="text-sm sm:text-lg font-semibold text-gray-700">
                PRATINJAU KONTRAK
              </h2>
            </div>
            <div className="flex justify-center">
              <ResponsiveContainer
                width="100%"
                height={150}
                className="sm:h-[200px]"
              >
                <PieChart>
                  <Pie
                    data={contractPreviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contractPreviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {contractPreviewData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress and Investment Section - Mobile Responsive */}
          <div className="col-span-1 lg:col-span-3 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Progress Fisik */}
              <div className="col-span-1 xl:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-3">
                    <img
                      src="/TowerAdkon.svg"
                      className="text-white"
                      alt="Icon"
                    />
                  </div>
                  <h2 className="text-sm sm:text-lg font-semibold text-gray-700">
                    PROGRESS FISIK
                  </h2>
                </div>

                {/* Legend - Mobile Responsive */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-600 mb-2 space-y-1 sm:space-y-0">
                    <span>
                      <span className="text-[#145C72]">■</span> KONTRAK UPT
                      BEKASI
                    </span>
                    <span>
                      <span className="text-[#179FB7]">■</span> PROGRESS %
                    </span>
                    <span>
                      <span className="text-[#28A8E0]">■</span> PROGRESS BAYAR %
                    </span>
                  </div>
                </div>

                <ResponsiveContainer
                  width="100%"
                  height={250}
                  className="sm:h-[300px]"
                >
                  <BarChart
                    data={physicalProgressData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="kontrak" fill="#145C72" />
                    <Bar dataKey="progress" fill="#179FB7" />
                    <Bar dataKey="bayar" fill="#28A8E0" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Anggaran Investasi - Mobile Responsive */}
              {/* Anggaran Investasi - Keeping Original Layout */}
              <div className="">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-3">
                    <img
                      src="/TowerAdkon.svg"
                      className="text-white"
                      alt="Icon"
                    />
                  </div>
                  <h2 className="text-sm sm:text-lg font-semibold text-gray-700">
                    ANGGARAN INVESTASI
                  </h2>
                </div>

                {/* Chart and Values Side by Side - Original Layout Preserved */}
                <div className="flex items-center justify-between mb-4">
                  {/* Pie Chart */}
                  <div className="w-32 h-24 sm:w-44 sm:h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={investmentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          className="sm:outerRadius-[60]"
                          dataKey="value"
                        >
                          {investmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Values - Original Layout */}
                  <div className="ml-2 sm:ml-4 space-y-2 sm:space-y-4">
                    <div>
                      <div className="text-xs sm:text-sm text-cyan-500 font-medium mb-1">
                        SKKI TERBIT (M)
                      </div>
                      <div className="bg-[#145C72] text-white px-2 py-1 sm:px-3 sm:py-2 rounded font-bold text-sm sm:text-lg">
                        813.4
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-cyan-500 font-medium mb-1">
                        AKI TERBAYAR (M)
                      </div>
                      <div className="bg-[#189FB7] text-white px-2 py-1 sm:px-3 sm:py-2 rounded font-bold text-sm sm:text-lg">
                        333.3
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend - Original Layout */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#145C72] rounded-xs mr-2" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      SKKI TERBIT
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#189FB7] rounded-xs mr-2" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      AKI TERBAYAR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract List Table - Mobile Responsive */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex items-center p-4 sm:p-6 border-b">
            <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-3">
              <img src="/RekapAnomali/ultgAnomali.svg" alt="Icon" />
            </div>
            <h2 className="text-sm sm:text-lg font-semibold text-gray-700">
              DAFTAR KONTRAK
            </h2>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {contractListData.map((contract) => (
              <div key={contract.id} className="p-4 border-b border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-500">
                        No. {contract.id}
                      </div>
                      <div className="text-sm font-medium text-[#145C72]">
                        {contract.noKontrak}
                      </div>
                      <div className="text-sm text-[#145C72]">
                        {contract.namaKontrak}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {contract.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Tgl Kontrak:</span>
                      <div className="text-[#145C72]">
                        {contract.tanggalKontrak}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Akhir Kontrak:</span>
                      <div className="text-[#145C72]">
                        {contract.akhirKontrak}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">% Fisik</span>
                        <span className="text-[#145C72]">
                          {contract.fisik}%
                        </span>
                      </div>
                      <ProgressBar value={contract.fisik} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">% Bayar</span>
                        <span className="text-[#145C72]">
                          {contract.bayar}%
                        </span>
                      </div>
                      <ProgressBar value={contract.bayar} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#E4FBFF]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    No Kontrak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    Nama Kontrak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    Tanggal Kontrak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    Akhir Kontrak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    %Fisik
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    %Bayar
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractListData.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {contract.id}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {contract.noKontrak}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {contract.namaKontrak}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {contract.tanggalKontrak}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      {contract.akhirKontrak}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      <div className="flex items-center space-x-2">
                        <ProgressBar value={contract.fisik} />
                        <span className="text-xs sm:text-sm">
                          {contract.fisik}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-[13px] text-[#145C72]">
                      <div className="flex items-center space-x-2">
                        <ProgressBar value={contract.bayar} />
                        <span className="text-xs sm:text-sm">
                          {contract.bayar}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          contract.status
                        )}`}
                      >
                        {contract.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdkonPage;
