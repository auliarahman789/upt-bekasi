import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface PrintableAnomalyReportProps {
  selectedLocation: string;
  selectedAnomaly: string;
  pieData: any[];
  barChartData: any[];
  bekasiStatusBarData: any[];
  cikarangStatusBarData: any[];
  filteredData: any[];
  transformedData: any[];
}

const PrintableAnomalyReport = React.forwardRef<
  HTMLDivElement,
  PrintableAnomalyReportProps
>(
  (
    {
      selectedLocation,
      selectedAnomaly,
      pieData,
      barChartData,
      bekasiStatusBarData,
      cikarangStatusBarData,
      filteredData,
      transformedData,
    },
    ref
  ) => {
    // Calculate statistics
    const totalAnomalies = filteredData.length;
    const openCount = filteredData.filter(
      (item) => item.status === "OPEN"
    ).length;
    const progressCount = filteredData.filter(
      (item) => item.status === "PROGRESS"
    ).length;
    const closeCount = filteredData.filter(
      (item) => item.status === "CLOSE"
    ).length;

    const bekasiCount = transformedData.filter((item) =>
      item.ultg?.toUpperCase().includes("BEKASI")
    ).length;
    const cikarangCount = transformedData.filter((item) =>
      item.ultg?.toUpperCase().includes("CIKARANG")
    ).length;

    return (
      <div ref={ref} className="print-container">
        {/* Page 1: Header & Overview */}
        <div className="print-page">
          <div className="print-header">
            <h1 className="text-4xl font-bold text-[#145C72] text-center mb-6">
              REKAP ANOMALI INTERNAL UPT
            </h1>
            <div className="text-center mb-4">
              <span className="text-2xl font-semibold text-gray-700">
                {selectedLocation}
              </span>
            </div>
            {selectedAnomaly !== "ALL" && (
              <div className="text-center mb-6">
                <span className="text-xl text-gray-600">
                  Jenis Anomali: {selectedAnomaly}
                </span>
              </div>
            )}
          </div>

          <div className="print-card">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-[#145C72] font-bold text-xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">
                RINGKASAN DATA ANOMALI
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Total Anomali
                  </div>
                  <div className="text-4xl font-bold text-[#145C72]">
                    {totalAnomalies}
                  </div>
                </div>
                <div className="bg-red-100 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Open
                  </div>
                  <div className="text-4xl font-bold text-red-700">
                    {openCount}
                  </div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Progress
                  </div>
                  <div className="text-4xl font-bold text-yellow-700">
                    {progressCount}
                  </div>
                </div>
                <div className="bg-green-100 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Closed
                  </div>
                  <div className="text-4xl font-bold text-green-700">
                    {closeCount}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#145C72] rounded-lg p-6 text-center text-white">
                  <div className="text-sm mb-2 font-medium">ULTG Bekasi</div>
                  <div className="text-4xl font-bold">{bekasiCount}</div>
                </div>
                <div className="bg-[#179FB7] rounded-lg p-6 text-center text-white">
                  <div className="text-sm mb-2 font-medium">ULTG Cikarang</div>
                  <div className="text-4xl font-bold">{cikarangCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: Pie Chart Distribution */}
        {selectedAnomaly === "ALL" && pieData.length > 0 && (
          <div className="print-page">
            <div className="print-card">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#145C72] font-bold text-xl">🥧</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  DISTRIBUSI JENIS ANOMALI
                </h3>
              </div>

              <div className="flex items-center justify-between gap-8">
                <div className="flex-shrink-0">
                  <ResponsiveContainer width={500} height={500}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={180}
                        dataKey="value"
                        label={({ name, value, payload }: any) =>
                          `${name}: ${value}% (${payload.count})`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className="flex-shrink-0 space-y-3"
                  style={{ minWidth: "350px" }}
                >
                  {pieData.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: entry.color + "20" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-semibold text-[#145C72]">
                          {entry.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#145C72]">
                          {entry.value}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {entry.count} anomali
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 3: Bar Chart Comparison */}
        {selectedAnomaly === "ALL" && barChartData.length > 0 && (
          <div className="print-page">
            <div className="print-card">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#145C72] font-bold text-xl">📊</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  PERBANDINGAN ANOMALI PER ULTG
                </h3>
              </div>

              <ResponsiveContainer width={800} height={400}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 14 }}
                    angle={-20}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 14 }} />
                  <Tooltip
                    formatter={(value, name) => [`${value} Anomali`, name]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #ccc",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <Bar dataKey="BEKASI" fill="#145C72" />
                  <Bar dataKey="CIKARANG" fill="#179FB7" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mb-6 flex gap-6 justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#145C72]"></div>
                  <span className="text-lg font-medium">ULTG Bekasi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#179FB7]"></div>
                  <span className="text-lg font-medium">ULTG Cikarang</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 4: ULTG Bekasi Status */}
        {bekasiStatusBarData.length > 0 && (
          <div className="print-page">
            <div className="print-card">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#145C72] font-bold text-xl">🏢</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  STATUS ANOMALI - ULTG BEKASI
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-base py-3 px-4 bg-[#E4FBFF] font-bold text-[#145C72] rounded-lg">
                  <div>Type Anomali</div>
                  <div className="text-center">Closed (%)</div>
                  <div className="text-center">Progress Bar</div>
                  <div className="text-center">Open</div>
                </div>
                {bekasiStatusBarData.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-base font-semibold text-[#145C72]">
                      {item.name}
                    </div>
                    <div className="text-center">
                      <span className="inline-block px-4 py-2 bg-[#79FF90] text-[#1B8A2E] rounded-full font-bold text-lg">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-[#145C72] min-w-[30px]">
                        {item.closed}
                      </span>
                      <div className="flex-1 h-8 bg-gray-200 rounded-lg flex overflow-hidden">
                        <div
                          className="bg-[#1B8A2E]"
                          style={{
                            width: `${
                              item.closed > 0
                                ? (item.closed / item.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-[#FFA500]"
                          style={{
                            width: `${
                              item.progress > 0
                                ? (item.progress / item.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-[#DC2626]"
                          style={{
                            width: `${
                              item.open > 0 ? (item.open / item.total) * 100 : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-base font-bold text-[#145C72] min-w-[30px]">
                        {item.open + item.progress}
                      </span>
                    </div>
                    <div className="text-center text-base font-semibold text-gray-600">
                      Total: {item.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Page 5: ULTG Cikarang Status */}
        {cikarangStatusBarData.length > 0 && (
          <div className="print-page">
            <div className="print-card">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#145C72] font-bold text-xl">🏢</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  STATUS ANOMALI - ULTG CIKARANG
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-base py-3 px-4 bg-[#E4FBFF] font-bold text-[#145C72] rounded-lg">
                  <div>Type Anomali</div>
                  <div className="text-center">Closed (%)</div>
                  <div className="text-center">Progress Bar</div>
                  <div className="text-center">Open</div>
                </div>
                {cikarangStatusBarData.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-base font-semibold text-[#145C72]">
                      {item.name}
                    </div>
                    <div className="text-center">
                      <span className="inline-block px-4 py-2 bg-[#79FF90] text-[#1B8A2E] rounded-full font-bold text-lg">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-[#145C72] min-w-[30px]">
                        {item.closed}
                      </span>
                      <div className="flex-1 h-8 bg-gray-200 rounded-lg flex overflow-hidden">
                        <div
                          className="bg-[#1B8A2E]"
                          style={{
                            width: `${
                              item.closed > 0
                                ? (item.closed / item.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-[#FFA500]"
                          style={{
                            width: `${
                              item.progress > 0
                                ? (item.progress / item.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-[#DC2626]"
                          style={{
                            width: `${
                              item.open > 0 ? (item.open / item.total) * 100 : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-base font-bold text-[#145C72] min-w-[30px]">
                        {item.open + item.progress}
                      </span>
                    </div>
                    <div className="text-center text-base font-semibold text-gray-600">
                      Total: {item.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Page 6: Data Table */}
        <div className="print-page">
          <div className="print-card">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-[#145C72] font-bold text-xl">📋</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">
                DETAIL ANOMALI{" "}
                {selectedAnomaly !== "ALL" ? selectedAnomaly : selectedLocation}
              </h3>
            </div>

            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="text-[#145C72] bg-[#E4FBFF]">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-bold">
                      No
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-bold">
                      ULTG
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-bold">
                      Lokasi
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-bold">
                      Kondisi
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-bold">
                      Temuan
                    </th>
                    <th className="px-3 py-3 text-left text-sm font-bold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                  {filteredData.slice(0, 15).map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-[#F8FFFE]" : "bg-white"}
                    >
                      <td className="px-3 py-2 text-sm">{index + 1}</td>
                      <td className="px-3 py-2 text-sm">{item.ultg}</td>
                      <td className="px-3 py-2 text-sm max-w-[200px] truncate">
                        {item.location}
                      </td>
                      <td className="px-3 py-2 text-sm">{item.kondisi}</td>
                      <td className="px-3 py-2 text-sm">
                        {item.temuan_anomali || item.year}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.status === "OPEN"
                              ? "bg-red-100 text-red-800"
                              : item.status === "PROGRESS"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 15 && (
                <div className="text-center py-4 text-gray-600 text-sm">
                  Menampilkan 15 dari {filteredData.length} data anomali
                </div>
              )}
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
            margin-bottom: 30px;
          }

          .print-card {
            width: 100%;
            max-width: 1400px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
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
  }
);

PrintableAnomalyReport.displayName = "PrintableAnomalyReport";

export default PrintableAnomalyReport;
