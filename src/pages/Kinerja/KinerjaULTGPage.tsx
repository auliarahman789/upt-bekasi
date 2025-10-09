import React, { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";

interface IndicatorData {
  indikator: string;
  bobot: string;
  target: string;
  realisasi: string;
  persentase: string;
  nilai: string;
}

interface KeyPerformanceData {
  emergency_respon_time: IndicatorData;
  penyelesaian_reconductoring: IndicatorData;
  tlod: IndicatorData;
  tlof: IndicatorData;
  trod: IndicatorData;
  trof: IndicatorData;
  verifikasi_kkp: IndicatorData;
}

interface PerformanceIndicatorData {
  abof: IndicatorData;
  anti_blackout: IndicatorData;
  bisnis_ekselen?: IndicatorData;
  digitalisasi_aplikasi: IndicatorData;
  dokumen_legal_aset_tanah: IndicatorData;
  faktor_ketersediaan_trafo: IndicatorData;
  faktor_ketersediaan_transmisi: IndicatorData;
  hcr_ocr?: IndicatorData;
  komunikasi_tjsl?: IndicatorData;
  maturity_level_sustainability?: IndicatorData;
  maturity_level_transmisi?: IndicatorData;
  pengendalian_penggunaan_anggaran?: IndicatorData;
  pengendalian_proteksi_security: IndicatorData;
  produktifitas_unit?: IndicatorData;
  roadmap_pergudangan?: IndicatorData;
  usulan_penghapusan_atb: IndicatorData | null;
  pendukung_manajemen_sdm?: IndicatorData;
}

interface ULTGData {
  key_performance: KeyPerformanceData;
  key_performance_indicators: IndicatorData;
  performance_indicator: PerformanceIndicatorData;
  performance_indicators: IndicatorData;
  total_nilai: IndicatorData;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    ultg_bekasi: ULTGData;
    ultg_cikarang: ULTGData;
  };
}

type ULTGType = "ultg_bekasi" | "ultg_cikarang";

const HorizontalBarCard: React.FC<{
  title: string;
  subtitle?: string;
  value: number;
  target: number;
  nilai: string;
  icon?: React.ReactNode;
  showNilai?: boolean;
}> = ({ title, subtitle, value, target, nilai, icon, showNilai = true }) => {
  const percentage = target > 0 ? (value / target) * 100 : 0;
  const displayPercentage = Math.min(percentage, 100);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1 sm:gap-0">
          <div>
            <h3 className="text-xs font-bold text-[#179FB7] uppercase">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-gray-500">{subtitle}</p>
            )}
          </div>
          {showNilai && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600">Nilai</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs">
                {nilai}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${displayPercentage}%` }}
            >
              {displayPercentage > 20 && (
                <span className="text-white text-[10px] font-bold">
                  {value.toFixed(4)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center min-w-full sm:min-w-[80px]">
            <span className="text-[9px] text-gray-500">
              Target: {target.toFixed(4)}
            </span>
            <span className="text-xs font-bold text-gray-700">
              Realisasi {value.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CombinedFactorCard: React.FC<{
  trafoData: IndicatorData;
  transmisiData: IndicatorData;
}> = ({ trafoData, transmisiData }) => {
  const trafoRealisasi = parseFloat(trafoData.realisasi);
  const trafoTarget = parseFloat(trafoData.target);
  const trafoPersentase = parseFloat(trafoData.persentase);

  const transmisiRealisasi = parseFloat(transmisiData.realisasi);
  const transmisiTarget = parseFloat(transmisiData.target);
  const transmisiPersentase = parseFloat(transmisiData.persentase);

  const calculateAngle = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    return Math.min((percentage / 100) * 180, 180);
  };

  const trafoAngle = calculateAngle(trafoRealisasi, trafoTarget);
  const transmisiAngle = calculateAngle(transmisiRealisasi, transmisiTarget);

  const createNeedlePath = (angle: number) => {
    const centerX = 100;
    const centerY = 100;
    const needleLength = 70;
    const needleWidth = 3;

    const angleInRadians = ((180 - angle) * Math.PI) / 180;

    const tipX = centerX + needleLength * Math.cos(angleInRadians);
    const tipY = centerY - needleLength * Math.sin(angleInRadians);

    const baseX1 = centerX + needleWidth * Math.sin(angleInRadians);
    const baseY1 = centerY + needleWidth * Math.cos(angleInRadians);
    const baseX2 = centerX - needleWidth * Math.sin(angleInRadians);
    const baseY2 = centerY - needleWidth * Math.cos(angleInRadians);

    return `M ${baseX1} ${baseY1} L ${tipX} ${tipY} L ${baseX2} ${baseY2} Z`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex-shrink-0">
          <img
            src="/IconKinerja/6&7.svg"
            alt=""
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-[10px] sm:text-xs font-bold text-[#179FB7] uppercase">
            FAKTOR KETERSEDIAAN TRAFO DAN TRANSMISI
          </h3>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* TRAFO */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700">TRAFO</h4>
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-gray-600">Nilai</span>
              <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs">
                {trafoData.nilai}
              </span>
            </div>
          </div>

          <div className="text-center mb-2">
            <span className="text-base sm:text-lg font-bold text-gray-700">
              {trafoPersentase.toFixed(2)}%
            </span>
          </div>

          <div className="relative flex justify-center items-center h-24 sm:h-32">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 120"
              className="overflow-visible max-w-[200px]"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#EF4444"
                strokeWidth="20"
                strokeLinecap="round"
              />

              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#10B981"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${(trafoAngle / 180) * 251.2} 251.2`}
              />

              <path
                d={createNeedlePath(trafoAngle)}
                fill="#333"
                stroke="#333"
                strokeWidth="1"
              />

              <circle cx="100" cy="100" r="5" fill="#333" />

              <text
                x="100"
                y="90"
                textAnchor="middle"
                className="text-xl sm:text-2xl font-bold"
                fill="#333"
              >
                {trafoRealisasi.toFixed(2)}
              </text>

              <text
                x="100"
                y="110"
                textAnchor="middle"
                className="text-[10px] sm:text-xs"
                fill="#666"
              >
                Target: {trafoTarget.toFixed(2)}
              </text>
            </svg>
          </div>
        </div>

        {/* TRANSMISI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700">TRANSMISI</h4>
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-gray-600">Nilai</span>
              <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium text-xs">
                {transmisiData.nilai}
              </span>
            </div>
          </div>

          <div className="text-center mb-2">
            <span className="text-base sm:text-lg font-bold text-gray-700">
              {transmisiPersentase.toFixed(2)}%
            </span>
          </div>

          <div className="relative flex justify-center items-center h-24 sm:h-32">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 120"
              className="overflow-visible max-w-[200px]"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#EF4444"
                strokeWidth="20"
                strokeLinecap="round"
              />

              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#10B981"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${(transmisiAngle / 180) * 251.2} 251.2`}
              />

              <path
                d={createNeedlePath(transmisiAngle)}
                fill="#333"
                stroke="#333"
                strokeWidth="1"
              />

              <circle cx="100" cy="100" r="5" fill="#333" />

              <text
                x="100"
                y="90"
                textAnchor="middle"
                className="text-xl sm:text-2xl font-bold"
                fill="#333"
              >
                {transmisiRealisasi.toFixed(2)}
              </text>

              <text
                x="100"
                y="110"
                textAnchor="middle"
                className="text-[10px] sm:text-xs"
                fill="#666"
              >
                Target: {transmisiTarget.toFixed(2)}
              </text>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 sm:h-3 sm:w-3 bg-[#10b981] rounded-sm"></div>
          <span className="text-[10px] sm:text-xs text-gray-600">
            Realisasi
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 sm:h-3 sm:w-3 bg-[#EF4444] rounded-sm"></div>
          <span className="text-[10px] sm:text-xs text-gray-600">Target</span>
        </div>
      </div>
    </div>
  );
};

const PerformanceIndicatorItem: React.FC<{
  data: IndicatorData;
  icon?: string;
}> = ({ data, icon }) => {
  const nilaiNum = parseFloat(data.nilai);
  const isGood = nilaiNum >= 6.0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b border-gray-100 last:border-0">
      {icon && (
        <div className="flex-shrink-0">
          <img src={icon} alt="" className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] sm:text-xs font-medium text-gray-700 truncate">
          {data.indikator}
        </h4>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
          <span className="text-[9px] sm:text-[10px] text-gray-500">
            Target: {data.target}
          </span>
          <span className="text-[9px] sm:text-[10px] text-gray-500">
            Realisasi: {data.realisasi}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[9px] sm:text-[10px] text-gray-600">Nilai</span>
        <span
          className={`px-2 sm:px-3 py-1 rounded-full font-medium text-[10px] sm:text-xs ${
            isGood
              ? "bg-green-100 text-green-700"
              : nilaiNum === 0
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {data.nilai}
        </span>
      </div>
    </div>
  );
};

const KinerjaULTGPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [selectedTab, setSelectedTab] = useState<ULTGType>("ultg_bekasi");

  useEffect(() => {
    fetchKinerjaULTGData();
  }, []);

  const fetchKinerjaULTGData = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK_BE}/api/kinerja/ultg`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });
      console.log("API Response:", res.data);
      setApiData(res.data);
    } catch (error: any) {
      console.log(error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl font-semibold text-gray-600">Loading...</div>
        </div>
      </DefaultLayout>
    );
  }

  if (!apiData?.data) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl font-semibold text-red-600">
            Failed to load data
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const data = apiData.data[selectedTab];

  const getMainTitle = (indicator: string) => {
    return indicator.replace(/^[a-z]\.\s*/i, "");
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="mb-4 sm:mb-8 px-4">
          <h1 className="text-xl sm:text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            KINERJA ULTG
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-4">
            <button
              onClick={() => setSelectedTab("ultg_bekasi")}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${
                selectedTab === "ultg_bekasi"
                  ? "bg-[#145C72] text-white"
                  : "bg-white border border-[#179FB7] text-[#179FB7] hover:bg-gray-100"
              }`}
            >
              ULTG Bekasi
            </button>
            <button
              onClick={() => setSelectedTab("ultg_cikarang")}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${
                selectedTab === "ultg_cikarang"
                  ? "bg-[#145C72] text-white"
                  : "bg-white border border-[#179FB7] text-[#179FB7] hover:bg-gray-100"
              }`}
            >
              ULTG Cikarang
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Sidebar - Summary Cards */}
            <div className="lg:col-span-2 grid grid-cols-3 lg:grid-cols-1 gap-4">
              {/* Total Nilai */}
              <div className="gap-4 flex lg:flex-col">
                <div className="bg-[#155C72] text-white rounded-xl p-4 sm:p-6 text-center">
                  <p className="text-[10px] sm:text-sm font-medium mb-1 sm:mb-2">
                    TOTAL NILAI
                  </p>
                  <p className="text-2xl sm:text-4xl font-bold">
                    {parseFloat(data.total_nilai.nilai).toFixed(1)}
                  </p>
                </div>

                {/* Key Performance Indicator */}
                <div className="bg-[#D2F8FF] text-black rounded-xl p-4 sm:p-6 text-center">
                  <h3 className="text-[9px] sm:text-xs font-medium mb-1 sm:mb-2">
                    KEY PERFORMANCE INDICATOR
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {parseFloat(data.key_performance_indicators.nilai).toFixed(
                      2
                    )}
                  </p>
                </div>

                {/* Performance Indicator */}
                <div className="bg-white text-black rounded-xl shadow-sm border p-4 sm:p-6 text-center">
                  <h3 className="text-[9px] sm:text-xs font-medium mb-1 sm:mb-2">
                    PERFORMANCE INDICATOR
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {parseFloat(data.performance_indicators.nilai).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-10 space-y-4 sm:space-y-6">
              {/* Key Performance Indicators Section */}
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-[#179FB7] mb-4 sm:mb-6 text-center">
                  KEY PERFORMANCE INDICATOR
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8">
                  {/* Left Column */}
                  <div>
                    <HorizontalBarCard
                      title={getMainTitle(data.key_performance.tlod.indikator)}
                      subtitle="(JAM / KMS)"
                      value={parseFloat(data.key_performance.tlod.realisasi)}
                      target={parseFloat(data.key_performance.tlod.target)}
                      nilai={data.key_performance.tlod.nilai}
                      icon={
                        <img
                          src="/IconKinerja/1.svg"
                          alt=""
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      }
                    />

                    <HorizontalBarCard
                      title={getMainTitle(data.key_performance.trod.indikator)}
                      subtitle="(JAM / UNIT)"
                      value={parseFloat(data.key_performance.trod.realisasi)}
                      target={parseFloat(data.key_performance.trod.target)}
                      nilai={data.key_performance.trod.nilai}
                      icon={
                        <img
                          src="/IconKinerja/2.svg"
                          alt=""
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      }
                    />

                    <HorizontalBarCard
                      title={getMainTitle(data.key_performance.tlof.indikator)}
                      subtitle="(JAM / KMS)"
                      value={parseFloat(data.key_performance.tlof.realisasi)}
                      target={parseFloat(data.key_performance.tlof.target)}
                      nilai={data.key_performance.tlof.nilai}
                      icon={
                        <img
                          src="/IconKinerja/1.svg"
                          alt=""
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      }
                    />

                    <HorizontalBarCard
                      title={getMainTitle(
                        data.key_performance.penyelesaian_reconductoring
                          .indikator
                      )}
                      subtitle="(% SELESAI)"
                      value={parseFloat(
                        data.key_performance.penyelesaian_reconductoring
                          .realisasi
                      )}
                      target={parseFloat(
                        data.key_performance.penyelesaian_reconductoring.target
                      )}
                      nilai={
                        data.key_performance.penyelesaian_reconductoring.nilai
                      }
                      icon={
                        <img
                          src="/IconKinerja/5.svg"
                          alt=""
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      }
                    />
                  </div>

                  {/* Right Column */}
                  <div>
                    <HorizontalBarCard
                      title={getMainTitle(data.key_performance.trof.indikator)}
                      subtitle="(JAM / UNIT)"
                      value={parseFloat(data.key_performance.trof.realisasi)}
                      target={parseFloat(data.key_performance.trof.target)}
                      nilai={data.key_performance.trof.nilai}
                      icon={
                        <img
                          src="/IconKinerja/2.svg"
                          alt=""
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      }
                    />

                    <HorizontalBarCard
                      title={getMainTitle(
                        data.key_performance.emergency_respon_time.indikator
                      )}
                      subtitle="(JAM)"
                      value={parseFloat(
                        data.key_performance.emergency_respon_time.realisasi
                      )}
                      target={parseFloat(
                        data.key_performance.emergency_respon_time.target
                      )}
                      nilai={data.key_performance.emergency_respon_time.nilai}
                      icon={
                        <img
                          src="/IconKinerja/5.svg"
                          alt=""
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      }
                    />

                    {data.key_performance.verifikasi_kkp && (
                      <HorizontalBarCard
                        title={getMainTitle(
                          data.key_performance.verifikasi_kkp.indikator
                        )}
                        subtitle="(%)"
                        value={parseFloat(
                          data.key_performance.verifikasi_kkp.realisasi
                        )}
                        target={parseFloat(
                          data.key_performance.verifikasi_kkp.target
                        )}
                        nilai={data.key_performance.verifikasi_kkp.nilai}
                        icon={
                          <img
                            src="/IconKinerja/5.svg"
                            alt=""
                            className="w-6 h-6 sm:w-8 sm:h-8"
                          />
                        }
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Indicators Section */}
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-[#179FB7] mb-4 sm:mb-6 text-center">
                  PERFORMANCE INDICATOR
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Combined Factor Card */}
                  <div className="order-1">
                    <CombinedFactorCard
                      trafoData={
                        data.performance_indicator.faktor_ketersediaan_trafo
                      }
                      transmisiData={
                        data.performance_indicator.faktor_ketersediaan_transmisi
                      }
                    />
                  </div>

                  {/* List Items */}
                  <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 order-3 lg:order-2">
                    <PerformanceIndicatorItem
                      data={data.performance_indicator.abof}
                      icon="/IconKinerja/abof.svg"
                    />

                    <PerformanceIndicatorItem
                      data={data.performance_indicator.anti_blackout}
                      icon="/IconKinerja/anti_blackout.svg"
                    />

                    {data.performance_indicator.bisnis_ekselen && (
                      <PerformanceIndicatorItem
                        data={data.performance_indicator.bisnis_ekselen}
                        icon="/IconKinerja/12.svg"
                      />
                    )}

                    {data.performance_indicator
                      .maturity_level_sustainability && (
                      <PerformanceIndicatorItem
                        data={
                          data.performance_indicator
                            .maturity_level_sustainability
                        }
                        icon="/IconKinerja/sustainability.svg"
                      />
                    )}

                    {data.performance_indicator.hcr_ocr && (
                      <PerformanceIndicatorItem
                        data={data.performance_indicator.hcr_ocr}
                        icon="/IconKinerja/hcr.svg"
                      />
                    )}

                    {data.performance_indicator.produktifitas_unit && (
                      <PerformanceIndicatorItem
                        data={data.performance_indicator.produktifitas_unit}
                        icon="/IconKinerja/produktivitas.svg"
                      />
                    )}

                    {data.performance_indicator.komunikasi_tjsl && (
                      <PerformanceIndicatorItem
                        data={data.performance_indicator.komunikasi_tjsl}
                        icon="/IconKinerja/komunikasi.svg"
                      />
                    )}

                    {data.performance_indicator
                      .pengendalian_penggunaan_anggaran && (
                      <PerformanceIndicatorItem
                        data={
                          data.performance_indicator
                            .pengendalian_penggunaan_anggaran
                        }
                        icon="/IconKinerja/10.svg"
                      />
                    )}

                    <PerformanceIndicatorItem
                      data={
                        data.performance_indicator
                          .pengendalian_proteksi_security
                      }
                      icon="/IconKinerja/8.svg"
                    />

                    <PerformanceIndicatorItem
                      data={data.performance_indicator.digitalisasi_aplikasi}
                      icon="/IconKinerja/15.svg"
                    />

                    {data.performance_indicator.roadmap_pergudangan && (
                      <PerformanceIndicatorItem
                        data={data.performance_indicator.roadmap_pergudangan}
                        icon="/IconKinerja/16.svg"
                      />
                    )}

                    {data.performance_indicator.usulan_penghapusan_atb && (
                      <PerformanceIndicatorItem
                        data={data.performance_indicator.usulan_penghapusan_atb}
                        icon="/IconKinerja/atb.svg"
                      />
                    )}
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4 order-2 lg:order-3">
                    {/* Pengendalian Proteksi Security */}
                    <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
                      <HorizontalBarCard
                        title={getMainTitle(
                          data.performance_indicator
                            .pengendalian_proteksi_security.indikator
                        )}
                        value={parseFloat(
                          data.performance_indicator
                            .pengendalian_proteksi_security.realisasi
                        )}
                        target={parseFloat(
                          data.performance_indicator
                            .pengendalian_proteksi_security.target
                        )}
                        nilai={
                          data.performance_indicator
                            .pengendalian_proteksi_security.nilai
                        }
                        icon={
                          <img
                            src="/IconKinerja/8.svg"
                            alt=""
                            className="w-6 h-6 sm:w-8 sm:h-8"
                          />
                        }
                      />
                    </div>

                    {/* Dokumen Legal Aset Tanah */}
                    <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
                      <HorizontalBarCard
                        title={getMainTitle(
                          data.performance_indicator.dokumen_legal_aset_tanah
                            .indikator
                        )}
                        subtitle="(PERSIL)"
                        value={parseFloat(
                          data.performance_indicator.dokumen_legal_aset_tanah
                            .realisasi
                        )}
                        target={parseFloat(
                          data.performance_indicator.dokumen_legal_aset_tanah
                            .target
                        )}
                        nilai={
                          data.performance_indicator.dokumen_legal_aset_tanah
                            .nilai
                        }
                        icon={
                          <img
                            src="/IconKinerja/14.svg"
                            alt=""
                            className="w-6 h-6 sm:w-8 sm:h-8"
                          />
                        }
                      />
                    </div>

                    {/* Maturity Level Transmisi */}
                    {data.performance_indicator.maturity_level_transmisi && (
                      <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
                        <HorizontalBarCard
                          title={getMainTitle(
                            data.performance_indicator.maturity_level_transmisi
                              .indikator
                          )}
                          value={parseFloat(
                            data.performance_indicator.maturity_level_transmisi
                              .realisasi
                          )}
                          target={parseFloat(
                            data.performance_indicator.maturity_level_transmisi
                              .target
                          )}
                          nilai={
                            data.performance_indicator.maturity_level_transmisi
                              .nilai
                          }
                          icon={
                            <img
                              src="/IconKinerja/11.svg"
                              alt=""
                              className="w-6 h-6 sm:w-8 sm:h-8"
                            />
                          }
                        />
                      </div>
                    )}

                    {/* Pendukung Manajemen SDM */}
                    {data.performance_indicator.pendukung_manajemen_sdm && (
                      <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
                        <HorizontalBarCard
                          title={getMainTitle(
                            data.performance_indicator.pendukung_manajemen_sdm
                              .indikator
                          )}
                          value={parseFloat(
                            data.performance_indicator.pendukung_manajemen_sdm
                              .realisasi
                          )}
                          target={parseFloat(
                            data.performance_indicator.pendukung_manajemen_sdm
                              .target
                          )}
                          nilai={
                            data.performance_indicator.pendukung_manajemen_sdm
                              .nilai
                          }
                          icon={
                            <img
                              src="/IconKinerja/hcr.svg"
                              alt=""
                              className="w-6 h-6 sm:w-8 sm:h-8"
                            />
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KinerjaULTGPage;
