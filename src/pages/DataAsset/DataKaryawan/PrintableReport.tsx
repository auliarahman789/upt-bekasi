import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
} from "recharts";

interface Employee {
  grade: string;
  jenis_kelamin: string;
  jenjang: string;
  masa_kerja: string;
  nama: string;
  nip: string;
  pendidikan_terakhir: string;
  tahun_pensiun: string;
  unit: string;
}

interface ApiResponse {
  data_karyawan: Employee[];
  ftk: Array<{
    unit: string;
    ftk: string;
    existing: string;
  }>;
  grade: Array<{
    grade: string;
    total: number;
  }>;
  grade_upt: Array<{
    grade: string;
    total: number;
  }>;
  grade_ultg_bekasi: Array<{
    grade: string;
    total: number;
  }>;
  grade_ultg_cikarang: Array<{
    grade: string;
    total: number;
  }>;
  jenis_kelamin: Array<{
    jenis_kelamin: string;
    total: number;
  }>;
  jenis_kelamin_upt: Array<{
    jenis_kelamin: string;
    total: number;
  }>;
  jenis_kelamin_ultg_bekasi: Array<{
    jenis_kelamin: string;
    total: number;
  }>;
  jenis_kelamin_ultg_cikarang: Array<{
    jenis_kelamin: string;
    total: number;
  }>;
  masa_kerja: Array<{
    range: string;
    total: number;
  }>;
  masa_kerja_upt: Array<{
    range: string;
    total: number;
  }>;
  masa_kerja_ultg_bekasi: Array<{
    range: string;
    total: number;
  }>;
  masa_kerja_ultg_cikarang: Array<{
    range: string;
    total: number;
  }>;
  pegawai_pensiun: Array<{
    tahun_pensiun: string;
    total: number;
  }>;
  pegawai_pensiun_upt: Array<{
    tahun_pensiun: string;
    total: number;
  }>;
  pegawai_pensiun_ultg_bekasi: Array<{
    tahun_pensiun: string;
    total: number;
  }>;
  pegawai_pensiun_ultg_cikarang: Array<{
    tahun_pensiun: string;
    total: number;
  }>;
  pegawai: number;
  pegawai_upt: number;
  pegawai_ultg_bekasi: number;
  pegawai_ultg_cikarang: number;
  tad: number;
  unit: Array<{
    unit: string;
    total: number;
  }>;
}

interface PrintableReportProps {
  data: ApiResponse;
  activeFilter: string;
  filteredData: any;
  employeeCountData: any[];
  personnelComparisonData: any[];
  compositionData: any[];
  workPeriodData: any[];
  maleEmployees: number;
  femaleEmployees: number;
  retirement2025: number;
  retirement2026: number;
  COLORS: any;
  PIE_COLORS: string[];
  onPrint?: () => void;
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  (
    {
      data,
      activeFilter,
      filteredData,
      employeeCountData,
      personnelComparisonData,
      compositionData,
      workPeriodData,
      maleEmployees,
      femaleEmployees,
      retirement2025,
      retirement2026,
      COLORS,
      PIE_COLORS,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="print-container">
        {/* Page 1: Header & Employee Count */}
        <div className="print-page">
          <div className="print-header">
            <h1 className="text-3xl font-bold text-teal-700 text-center mb-4">
              DATA KEPEGAWAIAN
            </h1>
            <div className="text-center mb-6">
              <span className="text-lg font-semibold">
                Filter: {activeFilter}
              </span>
            </div>
          </div>

          <div className="print-card">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-teal-600 font-bold">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                JUMLAH PEGAWAI {activeFilter !== "ALL" && `- ${activeFilter}`}
              </h3>
            </div>

            <div className="flex items-start justify-between gap-6">
              <div className="flex-shrink-0">
                <LineChart data={employeeCountData} width={550} height={350}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.green}
                    strokeWidth={3}
                    dot={{ fill: COLORS.green, r: 8 }}
                  />
                </LineChart>
              </div>

              <div className="flex-shrink-0" style={{ minWidth: "280px" }}>
                {activeFilter === "ALL" ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2 font-medium">
                        UPT BEKASI
                      </div>
                      <div className="text-3xl font-bold text-gray-800 bg-lime-200 rounded-lg p-4">
                        {data.pegawai_upt}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2 font-medium">
                        ULTG BEKASI
                      </div>
                      <div className="text-3xl font-bold text-gray-800 bg-lime-200 rounded-lg p-4">
                        {data.pegawai_ultg_bekasi}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2 font-medium">
                        ULTG CIKARANG
                      </div>
                      <div className="text-3xl font-bold text-gray-800 bg-lime-200 rounded-lg p-4">
                        {data.pegawai_ultg_cikarang}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center mt-8">
                    <div className="bg-lime-200 rounded-lg p-6">
                      <div className="text-sm text-gray-600 mb-2 font-medium">
                        {activeFilter}
                      </div>
                      <div className="text-4xl font-bold text-gray-800">
                        {filteredData.pegawai}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: Employee Composition */}
        <div className="print-page">
          <div className="print-card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-teal-600 font-bold">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                KOMPOSISI PEGAWAI
              </h3>
            </div>

            <div className="flex items-center justify-between gap-6">
              <div className="flex-shrink-0">
                <BarChart data={compositionData} width={700} height={400}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="unit" tick={{ fontSize: 14 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="FTK" fill={COLORS.green}>
                    <LabelList
                      dataKey="FTK"
                      position="top"
                      fill="#000000"
                      fontSize={16}
                      fontWeight="bold"
                    />
                  </Bar>
                  <Bar dataKey="EKSISTING" fill={COLORS.pink}>
                    <LabelList
                      dataKey="EKSISTING"
                      position="top"
                      fill="#000000"
                      fontSize={16}
                      fontWeight="bold"
                    />
                  </Bar>
                </BarChart>
              </div>

              <div
                className="flex-shrink-0 space-y-4"
                style={{ minWidth: "150px" }}
              >
                <div className="flex items-center text-lg">
                  <div
                    className="w-8 h-8 rounded mr-3"
                    style={{ backgroundColor: COLORS.green }}
                  />
                  <span className="font-semibold">FTK</span>
                </div>
                <div className="flex items-center text-lg">
                  <div
                    className="w-8 h-8 rounded mr-3"
                    style={{ backgroundColor: COLORS.pink }}
                  />
                  <span className="font-semibold">EKSISTING</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 3: Personnel Data */}
        <div className="print-page">
          <div className="print-card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-teal-600 font-bold">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                DATA PERSONIL
              </h3>
            </div>

            <div className="flex justify-center">
              <BarChart data={personnelComparisonData} width={600} height={450}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 16 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS.darkTeal}>
                  {personnelComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    fill="#000000"
                    fontSize={18}
                    fontWeight="bold"
                  />
                </Bar>
              </BarChart>
            </div>
          </div>
        </div>

        {/* Page 4: Work Period */}
        <div className="print-page">
          <div className="print-card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-teal-600 font-bold">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                MASA KERJA
              </h3>
            </div>

            <div className="flex items-center justify-between gap-8">
              <div className="flex-shrink-0">
                <PieChart width={300} height={400}>
                  <Pie
                    data={workPeriodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="total"
                    nameKey="range"
                    label={(entry: any) => `${entry.range}: ${entry.total}`}
                  >
                    {workPeriodData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>

              <div
                className="flex-shrink-0 grid grid-cols-2 gap-4"
                style={{ minWidth: "450px" }}
              >
                {workPeriodData.map((item, index) => (
                  <div key={item.range} className="text-center">
                    <div className="text-sm mb-2 font-medium">{item.range}</div>
                    <div
                      className="text-2xl font-bold rounded-lg p-4"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                        color: index === 1 || index === 3 ? "white" : "black",
                      }}
                    >
                      {item.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page 5: Gender Distribution */}
        <div className="print-page">
          <div className="print-card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-teal-600 font-bold">👫</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                JENIS KELAMIN
              </h3>
            </div>

            <div className="flex items-start justify-between gap-8">
              <div className="flex-shrink-0">
                <PieChart width={250} height={350}>
                  <Pie
                    data={[
                      { name: "LAKI-LAKI", value: maleEmployees },
                      { name: "PEREMPUAN", value: femaleEmployees },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill={COLORS.lightGreen} />
                    <Cell fill={COLORS.darkTeal} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>

              <div className="flex-shrink-0" style={{ minWidth: "500px" }}>
                {activeFilter === "ALL" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-gray-700 font-medium mb-2 text-sm">
                          LAKI-LAKI
                        </div>
                        <div className="text-2xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                          {maleEmployees}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 font-medium mb-2 text-xs">
                          UPT BEKASI
                        </div>
                        <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                          {data.jenis_kelamin_upt[1].total}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 font-medium mb-2 text-xs">
                          ULTG BEKASI
                        </div>
                        <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                          {data.jenis_kelamin_ultg_bekasi[1].total}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 font-medium mb-2 text-xs">
                          ULTG CIKARANG
                        </div>
                        <div className="text-xl font-bold text-gray-800 bg-lime-200 rounded-lg p-3">
                          {data.jenis_kelamin_ultg_cikarang[1].total}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-gray-700 font-medium mb-2 text-sm">
                          PEREMPUAN
                        </div>
                        <div
                          className="text-2xl font-bold text-[#E2F395] p-3 rounded-lg"
                          style={{ backgroundColor: COLORS.darkTeal }}
                        >
                          {femaleEmployees}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 font-medium mb-2 text-xs">
                          UPT BEKASI
                        </div>
                        <div
                          className="text-xl font-bold text-[#E2F395] p-3 rounded-lg"
                          style={{ backgroundColor: COLORS.darkTeal }}
                        >
                          {data.jenis_kelamin_upt[0].total}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 font-medium mb-2 text-xs">
                          ULTG BEKASI
                        </div>
                        <div
                          className="text-xl font-bold text-[#E2F395] p-3 rounded-lg"
                          style={{ backgroundColor: COLORS.darkTeal }}
                        >
                          {data.jenis_kelamin_ultg_bekasi[0].total}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-700 font-medium mb-2 text-xs">
                          ULTG CIKARANG
                        </div>
                        <div
                          className="text-xl font-bold text-[#E2F395] p-3 rounded-lg"
                          style={{ backgroundColor: COLORS.darkTeal }}
                        >
                          {data.jenis_kelamin_ultg_cikarang[0].total}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="bg-lime-200 rounded-lg p-6 text-center">
                      <div className="text-gray-700 font-medium mb-2">
                        LAKI-LAKI
                      </div>
                      <div className="text-3xl font-bold text-gray-800">
                        {maleEmployees}
                      </div>
                    </div>
                    <div
                      className="rounded-lg p-6 text-center text-white"
                      style={{ backgroundColor: COLORS.darkTeal }}
                    >
                      <div className="font-medium mb-2">PEREMPUAN</div>
                      <div className="text-3xl font-bold">
                        {femaleEmployees}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page 6: Grade Distribution */}
        <div className="print-page">
          <div className="print-card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-teal-600 font-bold">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">GRADE</h3>
            </div>

            <div className="flex items-center justify-between gap-8">
              <div className="flex-shrink-0">
                <PieChart width={300} height={380}>
                  <Pie
                    data={filteredData.grade}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="total"
                    nameKey="grade"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {filteredData.grade.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>

              <div
                className="flex-shrink-0 grid grid-cols-2 gap-3"
                style={{ minWidth: "400px" }}
              >
                {filteredData.grade.map((grade: any, index: number) => (
                  <div key={grade.grade} className="flex gap-2 items-center">
                    <span className="flex items-center justify-center p-3 rounded bg-teal-600 text-white font-bold text-lg min-w-[60px]">
                      {grade.grade}
                    </span>
                    <div
                      className="flex items-center justify-center p-3 rounded flex-1 min-w-[80px]"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                        color: index === 1 || index === 3 ? "white" : "black",
                      }}
                    >
                      <span className="font-bold text-xl">{grade.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page 7: Retirement */}
        <div className="print-page">
          <div className="print-card">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-[#D2F8FF] rounded-full flex items-center justify-center mr-3">
                <span className="text-teal-600 font-bold">👴</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                PEGAWAI PENSIUN {activeFilter !== "ALL" && `- ${activeFilter}`}
              </h3>
            </div>

            <div className="text-center">
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-lg font-semibold mb-3">2025</div>
                  <div className="text-6xl font-bold bg-teal-600 text-white px-8 py-6 rounded-lg">
                    {retirement2025}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-3">2026</div>
                  <div className="text-6xl font-bold bg-teal-600 text-white px-8 py-6 rounded-lg">
                    {retirement2026}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Detail Per Tahun</h4>
                <div className="grid grid-cols-5 gap-3">
                  {filteredData.pegawai_pensiun
                    .slice(0, 10)
                    .map((item: any) => (
                      <div
                        key={item.tahun_pensiun}
                        className="bg-gray-100 rounded-lg p-3 text-center"
                      >
                        <div className="text-sm text-gray-600 mb-1 font-medium">
                          {item.tahun_pensiun}
                        </div>
                        <div className="text-xl font-bold text-gray-800">
                          {item.total}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
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
            padding: 30px 40px;
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
            max-width: 1200px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 35px;
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

PrintableReport.displayName = "PrintableReport";

export default PrintableReport;
