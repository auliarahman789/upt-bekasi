import React from "react";

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
  bisnis_ekselen: IndicatorData;
  digitalisasi_aplikasi: IndicatorData;
  dokumen_legal_aset_tanah: IndicatorData;
  faktor_ketersediaan_trafo: IndicatorData;
  faktor_ketersediaan_transmisi: IndicatorData;
  hcr_ocr: IndicatorData;
  komunikasi_tjsl: IndicatorData;
  maturity_level_sustainability: IndicatorData;
  maturity_level_transmisi: IndicatorData;
  pengendalian_penggunaan_anggaran: IndicatorData;
  pengendalian_proteksi_security: IndicatorData;
  produktifitas_unit: IndicatorData;
  roadmap_pergudangan: IndicatorData;
  usulan_penghapusan_atb: IndicatorData;
}

interface PrintableKinerjaReportProps {
  data: {
    key_performance: KeyPerformanceData;
    key_performance_indicators: IndicatorData;
    performance_indicator: PerformanceIndicatorData;
    performance_indicators: IndicatorData;
    total_nilai: IndicatorData;
  };
}

const PrintableKinerjaReport = React.forwardRef<
  HTMLDivElement,
  PrintableKinerjaReportProps
>(({ data }, ref) => {
  const getMainTitle = (indicator: string) => {
    return indicator.replace(/^[a-z]\.\s*/i, "");
  };

  const calculateAngle = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    return Math.min((percentage / 100) * 180, 180);
  };

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

  const HorizontalBarPrint: React.FC<{
    title: string;
    subtitle?: string;
    value: number;
    target: number;
    nilai: string;
    icon?: string;
  }> = ({ title, subtitle, value, target, nilai, icon }) => {
    const percentage = target > 0 ? (value / target) * 100 : 0;
    const displayPercentage = Math.min(percentage, 100);

    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="flex-shrink-0">
              <img src={icon} alt="" className="w-10 h-10" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#179FB7] uppercase">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-gray-500">{subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Nilai</span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                  {nilai}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full flex items-center justify-end pr-3"
                  style={{ width: `${displayPercentage}%` }}
                >
                  {displayPercentage > 20 && (
                    <span className="text-white text-sm font-bold">
                      {value.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center min-w-[120px]">
                <div className="text-xs text-gray-500">
                  Target: {target.toFixed(4)}
                </div>
                <div className="text-sm font-bold text-gray-700">
                  Realisasi: {value.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PerformanceItemPrint: React.FC<{
    data: IndicatorData;
    icon?: string;
  }> = ({ data, icon }) => {
    const nilaiNum = parseFloat(data.nilai);
    const isGood = nilaiNum >= 6.0;

    return (
      <div className="flex items-center gap-3 py-3 border-b border-gray-200">
        {icon && (
          <div className="flex-shrink-0">
            <img src={icon} alt="" className="w-10 h-10" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700">
            {data.indikator}
          </h4>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-gray-500">Target: {data.target}</span>
            <span className="text-xs text-gray-500">
              Realisasi: {data.realisasi}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Nilai</span>
          <span
            className={`px-4 py-2 rounded-full font-bold text-sm ${
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

  const trafoRealisasi = parseFloat(
    data.performance_indicator.faktor_ketersediaan_trafo.realisasi
  );
  const trafoTarget = parseFloat(
    data.performance_indicator.faktor_ketersediaan_trafo.target
  );
  const trafoPersentase = parseFloat(
    data.performance_indicator.faktor_ketersediaan_trafo.persentase
  );
  const trafoAngle = calculateAngle(trafoRealisasi, trafoTarget);

  const transmisiRealisasi = parseFloat(
    data.performance_indicator.faktor_ketersediaan_transmisi.realisasi
  );
  const transmisiTarget = parseFloat(
    data.performance_indicator.faktor_ketersediaan_transmisi.target
  );
  const transmisiPersentase = parseFloat(
    data.performance_indicator.faktor_ketersediaan_transmisi.persentase
  );
  const transmisiAngle = calculateAngle(transmisiRealisasi, transmisiTarget);

  return (
    <div ref={ref} className="print-container">
      {/* Page 1: Overview & Summary */}
      <div className="print-page">
        <div className="print-header">
          <h1 className="text-4xl font-bold text-[#155C72] text-center mb-8">
            KINERJA UPT
          </h1>
          <div className="text-center mb-4">
            <span className="text-xl text-gray-600">
              Laporan Kinerja Unit Pelaksana Transmisi
            </span>
          </div>
        </div>

        <div className="print-card">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-4">
              <span className="text-[#155C72] font-bold text-2xl">📊</span>
            </div>
            <h3 className="text-3xl font-semibold text-gray-800">
              RINGKASAN NILAI KINERJA
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="bg-[#155C72] text-white rounded-2xl p-8 text-center">
              <p className="text-lg font-medium mb-4">TOTAL NILAI</p>
              <p className="text-6xl font-bold">
                {parseFloat(data.total_nilai.nilai).toFixed(1)}
              </p>
            </div>

            <div className="bg-[#D2F8FF] text-black rounded-2xl p-8 text-center">
              <h3 className="text-base font-medium mb-4">
                KEY PERFORMANCE INDICATOR
              </h3>
              <p className="text-6xl font-bold">
                {parseFloat(data.key_performance_indicators.nilai).toFixed(2)}
              </p>
            </div>

            <div className="bg-white border-4 border-[#155C72] text-black rounded-2xl p-8 text-center">
              <h3 className="text-base font-medium mb-4">
                PERFORMANCE INDICATOR
              </h3>
              <p className="text-6xl font-bold">
                {parseFloat(data.performance_indicators.nilai).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page 2: Key Performance Indicators Part 1 */}
      <div className="print-page">
        <div className="print-card">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-4">
              <span className="text-[#179FB7] font-bold text-2xl">🎯</span>
            </div>
            <h3 className="text-3xl font-semibold text-gray-800">
              KEY PERFORMANCE INDICATOR (Part 1)
            </h3>
          </div>

          <div className="space-y-6">
            <HorizontalBarPrint
              title={getMainTitle(data.key_performance.tlod.indikator)}
              subtitle="(JAM / KMS)"
              value={parseFloat(data.key_performance.tlod.realisasi)}
              target={parseFloat(data.key_performance.tlod.target)}
              nilai={data.key_performance.tlod.nilai}
              icon="/IconKinerja/1.svg"
            />

            <HorizontalBarPrint
              title={getMainTitle(data.key_performance.trod.indikator)}
              subtitle="(JAM / UNIT)"
              value={parseFloat(data.key_performance.trod.realisasi)}
              target={parseFloat(data.key_performance.trod.target)}
              nilai={data.key_performance.trod.nilai}
              icon="/IconKinerja/2.svg"
            />

            <HorizontalBarPrint
              title={getMainTitle(data.key_performance.tlof.indikator)}
              subtitle="(JAM / KMS)"
              value={parseFloat(data.key_performance.tlof.realisasi)}
              target={parseFloat(data.key_performance.tlof.target)}
              nilai={data.key_performance.tlof.nilai}
              icon="/IconKinerja/1.svg"
            />

            <HorizontalBarPrint
              title={getMainTitle(data.key_performance.trof.indikator)}
              subtitle="(JAM / UNIT)"
              value={parseFloat(data.key_performance.trof.realisasi)}
              target={parseFloat(data.key_performance.trof.target)}
              nilai={data.key_performance.trof.nilai}
              icon="/IconKinerja/2.svg"
            />
          </div>
        </div>
      </div>

      {/* Page 3: Key Performance Indicators Part 2 */}
      <div className="print-page">
        <div className="print-card">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-4">
              <span className="text-[#179FB7] font-bold text-2xl">🎯</span>
            </div>
            <h3 className="text-3xl font-semibold text-gray-800">
              KEY PERFORMANCE INDICATOR (Part 2)
            </h3>
          </div>

          <div className="space-y-6">
            <HorizontalBarPrint
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
              icon="/IconKinerja/5.svg"
            />

            <HorizontalBarPrint
              title={getMainTitle(
                data.key_performance.penyelesaian_reconductoring.indikator
              )}
              subtitle="(% SELESAI)"
              value={parseFloat(
                data.key_performance.penyelesaian_reconductoring.realisasi
              )}
              target={parseFloat(
                data.key_performance.penyelesaian_reconductoring.target
              )}
              nilai={data.key_performance.penyelesaian_reconductoring.nilai}
              icon="/IconKinerja/5.svg"
            />

            <HorizontalBarPrint
              title={getMainTitle(
                data.key_performance.verifikasi_kkp.indikator
              )}
              subtitle="(%)"
              value={parseFloat(data.key_performance.verifikasi_kkp.realisasi)}
              target={parseFloat(data.key_performance.verifikasi_kkp.target)}
              nilai={data.key_performance.verifikasi_kkp.nilai}
              icon="/IconKinerja/5.svg"
            />
          </div>
        </div>
      </div>

      {/* Page 4: Faktor Ketersediaan */}
      <div className="print-page">
        <div className="print-card">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-4">
              <span className="text-[#179FB7] font-bold text-2xl">⚡</span>
            </div>
            <h3 className="text-3xl font-semibold text-gray-800">
              FAKTOR KETERSEDIAAN TRAFO & TRANSMISI
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* TRAFO */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-2xl font-bold text-gray-700">TRAFO</h4>
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-gray-600">Nilai</span>
                  <span className="px-5 py-2 bg-green-100 text-green-700 rounded-full font-bold text-lg">
                    {data.performance_indicator.faktor_ketersediaan_trafo.nilai}
                  </span>
                </div>
              </div>

              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-700">
                  {trafoPersentase.toFixed(2)}%
                </span>
              </div>

              <div className="relative flex justify-center items-center h-64">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 200 120"
                  className="overflow-visible max-w-[300px]"
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
                    y="85"
                    textAnchor="middle"
                    className="text-3xl font-bold"
                    fill="#333"
                  >
                    {trafoRealisasi.toFixed(2)}
                  </text>

                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    className="text-sm"
                    fill="#666"
                  >
                    Target: {trafoTarget.toFixed(2)}
                  </text>
                </svg>
              </div>
            </div>

            {/* TRANSMISI */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-2xl font-bold text-gray-700">TRANSMISI</h4>
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-gray-600">Nilai</span>
                  <span className="px-5 py-2 bg-green-100 text-green-700 rounded-full font-bold text-lg">
                    {
                      data.performance_indicator.faktor_ketersediaan_transmisi
                        .nilai
                    }
                  </span>
                </div>
              </div>

              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-700">
                  {transmisiPersentase.toFixed(2)}%
                </span>
              </div>

              <div className="relative flex justify-center items-center h-64">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 200 120"
                  className="overflow-visible max-w-[300px]"
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
                    y="85"
                    textAnchor="middle"
                    className="text-3xl font-bold"
                    fill="#333"
                  >
                    {transmisiRealisasi.toFixed(2)}
                  </text>

                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    className="text-sm"
                    fill="#666"
                  >
                    Target: {transmisiTarget.toFixed(2)}
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8 justify-center">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-[#10b981] rounded"></div>
              <span className="text-lg text-gray-600">Realisasi</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-[#EF4444] rounded"></div>
              <span className="text-lg text-gray-600">Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page 5: Performance Indicators Part 1 */}
      <div className="print-page">
        <div className="print-card">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-4">
              <span className="text-[#179FB7] font-bold text-2xl">📈</span>
            </div>
            <h3 className="text-3xl font-semibold text-gray-800">
              PERFORMANCE INDICATOR (Part 1)
            </h3>
          </div>

          <div className="space-y-4">
            <PerformanceItemPrint
              data={data.performance_indicator.abof}
              icon="/IconKinerja/abof.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.anti_blackout}
              icon="/IconKinerja/anti_blackout.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.bisnis_ekselen}
              icon="/IconKinerja/12.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.maturity_level_sustainability}
              icon="/IconKinerja/sustainability.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.hcr_ocr}
              icon="/IconKinerja/hcr.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.produktifitas_unit}
              icon="/IconKinerja/produktivitas.svg"
            />
          </div>
        </div>
      </div>

      {/* Page 6: Performance Indicators Part 2 */}
      <div className="print-page">
        <div className="print-card">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-4">
              <span className="text-[#179FB7] font-bold text-2xl">📈</span>
            </div>
            <h3 className="text-3xl font-semibold text-gray-800">
              PERFORMANCE INDICATOR (Part 2)
            </h3>
          </div>

          <div className="space-y-4">
            <PerformanceItemPrint
              data={data.performance_indicator.komunikasi_tjsl}
              icon="/IconKinerja/komunikasi.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.pengendalian_penggunaan_anggaran}
              icon="/IconKinerja/10.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.digitalisasi_aplikasi}
              icon="/IconKinerja/15.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.roadmap_pergudangan}
              icon="/IconKinerja/16.svg"
            />

            <PerformanceItemPrint
              data={data.performance_indicator.usulan_penghapusan_atb}
              icon="/IconKinerja/atb.svg"
            />
          </div>
        </div>
      </div>

      {/* Page 7: Additional Performance Indicators */}
      <div className="print-page">
        <div className="print-card">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-4">
              <span className="text-[#179FB7] font-bold text-2xl">📊</span>
            </div>
            <h3 className="text-3xl font-semibold text-gray-800">
              INDIKATOR TAMBAHAN
            </h3>
          </div>

          <div className="space-y-6">
            <HorizontalBarPrint
              title={getMainTitle(
                data.performance_indicator.pengendalian_proteksi_security
                  .indikator
              )}
              value={parseFloat(
                data.performance_indicator.pengendalian_proteksi_security
                  .realisasi
              )}
              target={parseFloat(
                data.performance_indicator.pengendalian_proteksi_security.target
              )}
              nilai={
                data.performance_indicator.pengendalian_proteksi_security.nilai
              }
              icon="/IconKinerja/8.svg"
            />

            <HorizontalBarPrint
              title={getMainTitle(
                data.performance_indicator.dokumen_legal_aset_tanah.indikator
              )}
              subtitle="(PERSIL)"
              value={parseFloat(
                data.performance_indicator.dokumen_legal_aset_tanah.realisasi
              )}
              target={parseFloat(
                data.performance_indicator.dokumen_legal_aset_tanah.target
              )}
              nilai={data.performance_indicator.dokumen_legal_aset_tanah.nilai}
              icon="/IconKinerja/14.svg"
            />

            <HorizontalBarPrint
              title={getMainTitle(
                data.performance_indicator.maturity_level_transmisi.indikator
              )}
              value={parseFloat(
                data.performance_indicator.maturity_level_transmisi.realisasi
              )}
              target={parseFloat(
                data.performance_indicator.maturity_level_transmisi.target
              )}
              nilai={data.performance_indicator.maturity_level_transmisi.nilai}
              icon="/IconKinerja/11.svg"
            />
          </div>
        </div>
      </div>

      <style>
        {`
          .print-container {
            background: white;
          }

          .print-page {
            width: 100%;
            min-height: 100vh;
            max-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          .print-header {
            width: 100%;
            margin-bottom: 40px;
          }

          .print-card {
            width: 100%;
            max-width: 1400px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 50px;
          }

          @media print {
            .print-container {
              background: white;
            }

            .print-page {
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              height: 100vh;
              max-height: 100vh;
              overflow: hidden;
            }

            .print-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
print-color-adjust: exact !important;
color-adjust: exact !important;
} 
.print-card {
          box-shadow: none;
        }
      }

      @media screen {
        .print-page {
          border: 1px solid #e5e7eb;
          margin-bottom: 20px;
        }
      }
    `}
      </style>
    </div>
  );
});
PrintableKinerjaReport.displayName = "PrintableKinerjaReport";
export default PrintableKinerjaReport;
