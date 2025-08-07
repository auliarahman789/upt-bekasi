import React, { useState } from "react";
import ReactSpeedometer from "react-d3-speedometer";
import { Transition } from "react-d3-speedometer";
import DefaultLayout from "../../layout/DefaultLayout";

interface FilterProps {
  isOpen: boolean;
  locationFilters: { [key: string]: boolean };
  statusFilters: { [key: string]: boolean };
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
    <div className="absolute top-[12%] right-0 mt-2 bg-white rounded-2xl shadow-4xl border p-4 w-64 z-50">
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

const PerformanceCard: React.FC<{
  title: string;
  subtitle?: string;
  value: number;
  target?: number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  index?: number; // Add index prop
}> = ({
  title,
  subtitle,
  value,
  target = 80,
  icon,
  color = "#179FB7",
  index,
}) => {
  // Determine background color based on index
  const backgroundColor =
    index !== undefined && index >= 0 && index <= 3 ? "#D2F8FF" : "white";

  return (
    <div
      className="rounded-xl shadow-sm border max-w-[267.8px] max-h-[212px] p-4"
      style={{ backgroundColor }}
    >
      <div className="flex items-start ">
        {icon && (
          <div
            className={`p-2 rounded-lg`}
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center ">
        <div className="flex-1">
          <div className="flex flex-col items-center">
            <ReactSpeedometer
              value={value}
              minValue={0}
              maxValue={100}
              segments={3}
              segmentColors={["#ef4444", "#f59e0b", "#10b981"]}
              needleColor="#333333"
              textColor="#333333"
              currentValueText="-"
              width={150}
              height={90}
              ringWidth={30}
              needleTransitionDuration={1000}
              needleTransition={Transition.easeElastic}
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center w-full justify-between px-10 gap-2 text-xs">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
            Target {target}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
            Nilai {value}
          </span>
        </div>
      </div>
    </div>
  );
};

// Combined TRAFO and TRANSMISI card
const CombinedFactorCard: React.FC<{
  trafoValue: number;
  transmisiValue: number;
  trafoTarget?: number;
  transmisiTarget?: number;
}> = ({ trafoValue, transmisiValue, trafoTarget = 80 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border max-h-[212px] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-blue-100">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            FAKTOR KECEPATAN TRAFO DAN TRANSMISI
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 items-center justify-center">
        <div className="flex flex-col justify-center items-center ">
          <h4 className="text-xs font-medium text-gray-600  ">TRAFO</h4>
          <ReactSpeedometer
            value={trafoValue}
            minValue={0}
            maxValue={100}
            segments={3}
            segmentColors={["#ef4444", "#f59e0b", "#10b981"]}
            needleColor="#333333"
            textColor="#333333"
            currentValueText="-"
            width={150}
            height={90}
            ringWidth={30}
            needleTransitionDuration={1000}
            needleTransition={Transition.easeElastic}
          />
        </div>

        <div className="flex flex-col justify-center items-center">
          <h4 className="text-xs font-medium text-gray-600  ">TRANSMISI</h4>
          <ReactSpeedometer
            value={transmisiValue}
            minValue={0}
            maxValue={100}
            segments={3}
            segmentColors={["#ef4444", "#f59e0b", "#10b981"]}
            needleColor="#333333"
            textColor="#333333"
            currentValueText="-"
            width={150}
            height={90}
            ringWidth={30}
            needleTransitionDuration={1000}
            needleTransition={Transition.easeElastic}
          />
        </div>
      </div>
      <div className="flex justify-between px-4">
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium text-xs">
          Target {trafoTarget}
        </span>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium text-xs">
          Nilai {transmisiValue}
        </span>
      </div>
    </div>
  );
};

const KinerjaUptPage: React.FC = () => {
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

  const handleLocationChange = (key: string) => {
    setLocationFilters((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStatusChange = (key: string) => {
    setStatusFilters((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
    // Apply filter logic here
  };

  const performanceData = [
    {
      title: "TRANSMISSION LINE OUTAGE",
      subtitle: "DURATION ( JAM / MNT)",
      value: 11.0,
      target: 15.0,
      color: "#10b981",
    },
    {
      title: "TRANSFORMATOR OUTAGE",
      subtitle: "DURATION ( JAM / MNT)",
      value: 11.0,
      target: 15.0,
      color: "#10b981",
    },
    {
      title: "TRANSMISSION LINE OUTAGE",
      subtitle: "FREQUENCY ( JAM / MNT)",
      value: 11.0,
      target: 15.0,
      color: "#10b981",
    },
    {
      title: "TRANSFORMATOR OUTAGE",
      subtitle: "FREQUENCY ( JAM / MNT)",
      value: 11.0,
      target: 15.0,
      color: "#10b981",
    },
    {
      title: "EMERGENCY RESPONSE TIME",
      subtitle: "(JAM)",
      value: 8.5,
      target: 10.0,
      color: "#10b981",
    },
    {
      title: "PENGENDALIAN PROTEKSI",
      subtitle: "SECURITY",
      value: 65.0,
      target: 80.0,
      color: "#f59e0b",
    },
  ];

  const additionalMetrics = [
    {
      title: "PENCAPAIAN BEYOND RKAP 2025",
      subtitle: "TRAFO (%)",
      value: 11.0,
      target: 80.0,
      color: "#10b981",
    },
    {
      title: "PENYELESAIAN KAJIAN KELAYAKAN",
      subtitle: "PROYEK (%)",
      value: 64.0,
      target: 80.0,
      color: "#f59e0b",
    },
    {
      title: "PENGENDALIAN SALDO MATERIAL",
      subtitle: "Op. JAM",
      value: 41.0,
      target: 80.0,
      color: "#f59e0b",
    },
    {
      title: "IMPLEMENTASI PLN BISNIS",
      subtitle: "EKSELEN (%)",
      value: 45.0,
      target: 80.0,
      color: "#f59e0b",
    },
    {
      title: "MANAJEMEN SDM, KOMUNIKASI,",
      subtitle: "T3R (%)",
      value: 50.5,
      target: 80.0,
      color: "#f59e0b",
    },
    {
      title: "DOKUMEN LEGAL ASET TANAH",
      subtitle: "(PERSIL)",
      value: 0.0,
      target: 80.0,
      color: "#ef4444",
    },
    {
      title: "DIGITALISASI APLIKASI KORPORAT",
      subtitle: "(%)",
      value: 41.0,
      target: 80.0,
      color: "#f59e0b",
    },
    {
      title: "PENERAPAN MANAJEMEN RISIKO",
      subtitle: "(%)",
      value: 43.0,
      target: 80.0,
      color: "#f59e0b",
    },
  ];

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="">
          <div className=" px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-3 ">
              <div></div>
              <h1 className="text-2xl font-bold text-gray-900 justify-center flex">
                KINERJA UPT
              </h1>

              {/* Filter Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center text-[16px] font-bold bg-white justify-between border-[1px] border-zinc-300 hover:bg-gray-200 px-4 py-2 rounded-full text-[#145C72] transition-colors shadow-2xl"
                >
                  <div>FILTER</div>
                  <div className="ml-6">
                    <img src="/filter.svg" />
                  </div>
                </button>

                <FilterModal
                  isOpen={isFilterOpen}
                  locationFilters={locationFilters}
                  statusFilters={statusFilters}
                  onLocationChange={handleLocationChange}
                  onStatusChange={handleStatusChange}
                  onApplyFilter={handleApplyFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* First Section with Summary Cards and Performance Cards */}
          <div className="grid grid-cols-5 gap-6 mb-8">
            <div className=" row-span-2 justify-between flex flex-col">
              <div className="flex flex-col bg-[#155C72]  text-white rounded-xl p-4 justify-between items-center">
                <p className="text-[16px] font-medium ">TOTAL NILAI</p>
                <p className="text-[32px] font-medium p-2">102.7</p>
              </div>

              <div className="bg-[#D2F8FF] flex flex-col text-black rounded-xl  shadow-sm border p-4 justify-between items-center">
                <h3 className="text-[16px] font-medium">
                  KEY PERFORMANCE INDICATOR
                </h3>
                <p className="text-[32px] font-medium p-2">44.00</p>
              </div>

              <div className="bg-white flex flex-col text-black rounded-xl shadow-sm border p-4 justify-between items-center">
                <h3 className="text-[16px] font-medium">
                  PERFORMANCE INDICATOR
                </h3>
                <p className="text-[32px] font-medium p-2">58.70</p>
              </div>
            </div>

            {/* First Row Performance Cards - Takes up 4 columns */}
            <div className="col-span-4 grid grid-cols-4 gap-4">
              {performanceData.slice(0, 4).map((item, index) => (
                <PerformanceCard
                  key={index}
                  index={index}
                  title={item.title}
                  subtitle={item.subtitle}
                  value={item.value}
                  target={item.target}
                  color={item.color}
                />
              ))}
            </div>

            {/* Second Row Performance Cards */}
            <div className="col-span-4 grid grid-cols-4 gap-4">
              {/* Emergency Response Time */}
              <PerformanceCard
                title={performanceData[4].title}
                subtitle={performanceData[4].subtitle}
                value={performanceData[4].value}
                target={performanceData[4].target}
                color={performanceData[4].color}
              />

              <div className="col-span-2">
                {/* Combined TRAFO and TRANSMISI Card */}
                <CombinedFactorCard
                  trafoValue={85}
                  transmisiValue={88}
                  trafoTarget={90}
                  transmisiTarget={85}
                />
              </div>
              {/* Security Card */}
              <PerformanceCard
                title={performanceData[5].title}
                subtitle={performanceData[5].subtitle}
                value={performanceData[5].value}
                target={performanceData[5].target}
                color={performanceData[5].color}
              />
            </div>
          </div>

          {/* Additional Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {additionalMetrics.map((item, index) => (
              <PerformanceCard
                key={index}
                title={item.title}
                subtitle={item.subtitle}
                value={item.value}
                target={item.target}
                color={item.color}
              />
            ))}
            {/* Compliance Section */}
            <div className="bg-white rounded-xl shadow-sm border col-span-2 p-4 grid grid-cols-3">
              <div className="grid mb-4">
                <h2 className="text-lg font-semibold text-[#145C72] flex items-start gap-2">
                  <div className="flex gap-3 items-center">
                    <span className="text-blue-600">
                      <img
                        src="/shield.svg"
                        alt=""
                        className="w-[20px] h-[20px]"
                      />
                    </span>
                    <p>KEPATUHAN</p>
                  </div>
                </h2>
                <div className="ml-4">
                  <span className="text-[14px] font-semibold text-[#145C72]">
                    NILAI
                  </span>
                  <p className="text-[32px] text-[#009A1A]">0.00</p>
                </div>
              </div>

              <div className="space-y-2 text-sm col-span-2">
                <div className="flex items-start gap-2 mt-5">
                  <span className="font-medium text-black">A.</span>
                  <span className="text-black">
                    Penyelesaian K3, Keamanan, Lingkungan Hidup
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700">B.</span>
                  <span className="text-gray-600">
                    Maturity Level Kepatuhan
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700">C.</span>
                  <span className="text-gray-600">
                    Kelengkapan Penyampaian Pelaporan dan Akurasi Data Kinerja
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700">D.</span>
                  <span className="text-gray-600">Pemenuhan DU Lain: RBL</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700">E.</span>
                  <span className="text-gray-600">
                    Tindak Lanjut Temuan Auditor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KinerjaUptPage;
