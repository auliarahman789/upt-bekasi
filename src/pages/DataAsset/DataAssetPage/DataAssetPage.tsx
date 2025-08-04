import React from "react";
import DefaultLayout from "../../../layout/DefaultLayout";

// Mock data - replace with your spreadsheet data later
const mockData = {
  gitet: {
    jumlahGitet: 3,
    jumlahGarduInduk: 23,
    levelTegangan: [
      { level: "500 KV", jumlah: 1 },
      { level: "150 KV", jumlah: 21 },
      { level: "70 KV", jumlah: 2 },
    ],
    transformer: [
      { tegangan: "500/150 KV", jumlahUnit: 24, totalKapasitas: "7400 MVA" },
      { tegangan: "150/20/22 KV", jumlahUnit: 24, totalKapasitas: "3300 MVA" },
      { tegangan: "150/70 KV", jumlahUnit: 24, totalKapasitas: "100 MVA" },
    ],
    tower: {
      jumlahTower: 762,
      totalKms: "469.147 KMS",
      levelTegangan: [
        { level: "500 KV", jumlah: 1188, totalKms: "101.778 KMS" },
        { level: "150 KV", jumlah: 612, totalKms: "362.872 KMS" },
        { level: "70 KV", jumlah: 31, totalKms: "4.5 KMS" },
        { level: "SKTT 150 KV", jumlah: "", totalKms: "26.48 KMS" },
      ],
    },
  },
  petaTower: {
    dataRelay: [
      { name: "Line Current Differential", jumlah: 21 },
      { name: "Distance", jumlah: 21 },
      { name: "Differential Trafo", jumlah: 2 },
      { name: "Overcurrent", jumlah: 2 },
      { name: "SREF", jumlah: 2 },
      { name: "Busbar Protection", jumlah: 2 },
      { name: "CB/LCP", jumlah: 2 },
      { name: "CCF", jumlah: 2 },
      { name: "Auto Recloser", jumlah: 2 },
      { name: "AVR", jumlah: 2 },
      { name: "Under/Over Voltage", jumlah: 3 },
      { name: "HVDS", jumlah: 2 },
      { name: "SEF", jumlah: 2 },
    ],
    dataAsset: [
      { name: "DFR Qualitrol", jumlah: 21 },
      { name: "DFR Ametek", jumlah: 21 },
      { name: "DFR Siemens", jumlah: 2 },
      { name: "DFR Iris", jumlah: 2 },
      { name: "Fault Locator Qualitrol", jumlah: 2 },
      { name: "PQM", jumlah: 2 },
      { name: "DC Clip", jumlah: 2 },
    ],
  },
  petaGarduInduk: {
    ultgSekasi: 2,
    ultgCikarang: 2,
    jumlahTower: 2,
    totalKmsTower: "246.15 KMS",
    levelTegangan: [
      { level: "500 KV", jumlah: 10 },
      { level: "150 KV", jumlah: 2 },
      { level: "70 KV", jumlah: 2 },
    ],
    personalData: [
      { position: "Manager ULTG", jumlah: 10 },
      { position: "Team Leader", jumlah: 2 },
      { position: "SO/Asisten", jumlah: 2 },
      { position: "Staff Har GI", jumlah: 10 },
      { position: "Staff Har Pro", jumlah: 10 },
      { position: "Staff Har Jar", jumlah: 10 },
      { position: "PLTA", jumlah: 10 },
    ],
  },
  totalAsset: "Rp 6.560.000.003.000",
};

const DataAssetPage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Tabs */}
        <div className="flex mb-6 space-x-2 text-sm">
          <button
            style={{
              background: "linear-gradient(to bottom, #15677B, #179FB7)",
            }}
            className="bg-teal-600 text-white  py-2 px-4 rounded-full font-semibold"
          >
            DATA ASSET
          </button>
          <button className="bg-gray-300 text-gray-700  py-2 px-4 rounded-full font-semibold">
            PETA TOWER
          </button>
          <button className="bg-gray-300 text-gray-700  py-2 px-4 rounded-full font-semibold">
            PETA GARDU INDUK
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - GITET Section */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-gray-300 shadow-2xl">
              <div
                className=" text-white px-3 py-2 rounded mb-4 text-[12px] font-medium"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                Jumlah GITET
              </div>
              <div className="text-center">
                <div className="text-[16px] font-bold text-gray-800 mb-2">
                  {mockData.gitet.jumlahGitet}
                </div>
              </div>

              <div
                className=" text-white px-3 py-2 rounded mb-4 text-[12px] font-medium"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                Jumlah Gardu Induk
              </div>
              <div className="text-center">
                <div className="text-[16px] font-bold text-gray-800 mb-2">
                  {mockData.gitet.jumlahGarduInduk}
                </div>
              </div>

              <div
                className=" text-white px-3 py-2 rounded mb-4 text-[12px] font-medium"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                Level Tegangan Gardu Induk
              </div>
              <div className="text-xs text-gray-600 mb-2">Jumlah Unit</div>
              {mockData.gitet.levelTegangan.map((item, index) => (
                <div
                  key={index}
                  className=" text-white px-3 py-2 rounded mb-2 flex justify-between items-center"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <span className="text-[12px]">{item.level}</span>
                  <span className="font-bold">{item.jumlah}</span>
                </div>
              ))}

              <div
                className=" text-white px-3 py-2 rounded mb-4 text-[12px] font-medium"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                Jumlah Transformer
              </div>
              <div className="text-center mb-4">
                <div className="text-[16px] font-bold text-gray-800">
                  {mockData.gitet.transformer.reduce(
                    (acc, curr) => acc + curr.jumlahUnit,
                    0
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Level Tegangan Trafo
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                <div>Total Unit</div>
                <div>Total Kapasitas</div>
              </div>
              {mockData.gitet.transformer.map((item, index) => (
                <div
                  key={index}
                  className=" text-white px-3 py-2 rounded mb-2"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <div className="text-[12px] mb-1">{item.tegangan}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>{item.jumlahUnit} Unit</div>
                    <div>{item.totalKapasitas}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-gray-300 shadow-2xl">
              <div
                className=" text-white px-3 py-2 rounded mb-4 text-[12px] font-medium"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                Jumlah Tower
              </div>
              <div className="text-center mb-4">
                <div className="text-[16px] font-bold text-gray-800">
                  {mockData.gitet.tower.jumlahTower}
                </div>
              </div>

              <div
                className=" text-white px-3 py-2 rounded mb-4 text-[12px] font-medium"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                Total KMS Tower
              </div>
              <div className="text-center mb-4">
                <div className="text-xl font-bold text-gray-800">
                  {mockData.gitet.tower.totalKms}
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Level Tegangan Tower
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                <div>Jumlah (Unit)</div>
                <div>Total KMS</div>
              </div>
              {mockData.gitet.tower.levelTegangan.map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                  <div
                    className=" text-white px-2 py-1 rounded text-[12px]"
                    style={{
                      background:
                        "linear-gradient(to bottom, #15677B, #179FB7)",
                    }}
                  >
                    {item.level}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="bg-gray-200 px-2 py-1 rounded text-center">
                      {item.jumlah}
                    </div>
                    <div className="bg-gray-200 px-2 py-1 rounded text-center">
                      {item.totalKms}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column - PETA TOWER Section */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-gray-300 shadow-2xl">
              <div className="bg-gray-400 text-white px-3 py-2 rounded mb-4 text-[12px] font-medium">
                Data Relay Proteksi
              </div>
              <div className="text-xs text-gray-600 mb-2">Jumlah Unit</div>
              {mockData.petaTower.dataRelay.map((item, index) => (
                <div
                  key={index}
                  className=" text-white px-3 py-2 rounded mb-2 flex justify-between items-center"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <span className="text-[12px]">{item.name}</span>
                  <span className="font-bold">{item.jumlah}</span>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-gray-300 shadow-2xl">
              <div className="bg-gray-400 text-white px-3 py-2 rounded mb-4 text-[12px] font-medium">
                Data Aset Peralatan
              </div>
              <div className="text-xs text-gray-600 mb-2">Jumlah Unit</div>
              {mockData.petaTower.dataAsset.map((item, index) => (
                <div
                  key={index}
                  className=" text-white px-3 py-2 rounded mb-2 flex justify-between items-center"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <span className="text-[12px]">{item.name}</span>
                  <span className="font-bold">{item.jumlah}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - PETA GARDU INDUK Section */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-gray-300 shadow-2xl">
              <div className="bg-gray-400 text-white px-3 py-2 rounded mb-4 text-[12px] font-medium">
                Detail Aset Per ULTG
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div
                  className=" text-white px-3 py-2 rounded text-center"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <div className="text-xs mb-1">ULTG SEKASI</div>
                </div>
                <div className="bg-gray-300 text-gray-700 px-3 py-2 rounded text-center">
                  <div className="text-xs mb-1">ULTG CIKARANG</div>
                </div>
              </div>

              <div
                className=" text-white px-3 py-2 rounded mb-4 text-[12px] font-medium"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                Jumlah Tower
              </div>
              <div className="text-center">
                <div className="text-[16px] font-bold text-gray-800 mb-2">
                  {mockData.petaGarduInduk.jumlahTower}
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
                className="bg-teal-600 text-white px-3 py-2 rounded mb-4 text-[12px] font-medium"
              >
                Total KMS Tower
              </div>
              <div className="text-center mb-4">
                <div className="text-xl font-bold text-gray-800">
                  {mockData.petaGarduInduk.totalKmsTower}
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Level Tegangan GI
              </div>
              <div className="text-xs text-gray-600 mb-2 text-right">
                Jumlah GI
              </div>
              {mockData.petaGarduInduk.levelTegangan.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                  className="bg-teal-600 text-white px-3 py-2 rounded mb-2 flex justify-between items-center"
                >
                  <span className="text-[12px]">{item.level}</span>
                  <span className="font-bold">{item.jumlah}</span>
                </div>
              ))}

              <div className="bg-gray-400 text-white px-3 py-2 rounded mb-4 text-[12px] font-medium">
                ITK Pegawai
              </div>
              <div className="text-xs text-gray-600 mb-2 text-right">
                Jumlah Pegawai
              </div>
              {mockData.petaGarduInduk.personalData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                  className="bg-teal-600 text-white px-3 py-2 rounded mb-2 flex justify-between items-center"
                >
                  <span className="text-[12px]">{item.position}</span>
                  <span className="font-bold">{item.jumlah}</span>
                </div>
              ))}
            </div>

            {/* Total Asset */}
            <div
              style={{
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
              }}
              className="bg-teal-600 text-white p-6 rounded-lg"
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-teal-600 font-bold text-lg">₹</span>
                </div>
                <span className="text-[12px] font-medium">
                  TOTAL ASET KESELURUHAN
                </span>
              </div>
              <div className="text-2xl font-bold">{mockData.totalAsset}</div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DataAssetPage;
