import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DefaultLayout from "../../layout/DefaultLayout";

// Mock data
const overviewData = [
  {
    name: "Jaringan",
    "ULTG CIKARANG": 111,
    "ULTG BEKASI": 228,
    "UPT BEKASI": 339,
  },
  {
    name: "Gardu Induk",
    "ULTG CIKARANG": 53,
    "ULTG BEKASI": 119,
    "UPT BEKASI": 172,
  },
  {
    name: "Proteksi",
    "ULTG CIKARANG": 15,
    "ULTG BEKASI": 18,
    "UPT BEKASI": 31,
  },
];

const pieData = {
  jaringan: { total: 339, normal: 288, anomali: 51 },
  garduInduk: { total: 172, normal: 130, anomali: 42 },
  proteksi: { total: 31, normal: 25, anomali: 6 },
};

const targetZeroData = {
  uptBekasi: { jaringan: 339, garduInduk: 172, proteksi: 31 },
  ultgBekasi: { jaringan: 228, garduInduk: 119, proteksi: 18 },
  ultgCikarang: { jaringan: 111, garduInduk: 53, proteksi: 15 },
};

const COLORS = {
  primary: "#145C72",
  secondary: "#189FB7",
  accent: "#0891b2",
  tertiary: "#65CFE2",
  light: "#e0f2fe",
};

const PersentasiAnomaliPage = () => {
  // Custom pie chart component
  const CustomPieChart = ({ data, title }: { title: any; data: any }) => {
    const pieChartData = [
      { name: "Normal", value: data.normal, color: COLORS.secondary },
      { name: "Anomali", value: data.anomali, color: COLORS.primary },
    ];

    return (
      <div
        className={`${
          title == "TARGET ZERO ANOMALI UPT BEKASI"
            ? " bg-[#EBFCFF]"
            : "bg-[#F4F4F4]"
        } p-3 sm:p-4 rounded-lg shadow-sm justify-between flex flex-col`}
      >
        <h3 className="text-xs sm:text-sm flex gap-1 items-center font-semibold text-gray-700 mb-3 sm:mb-4 leading-tight">
          <span className="flex-shrink-0">
            <img
              src="/RekapAnomali/ultgAnomali.svg"
              className="w-4 h-4 sm:w-auto sm:h-auto"
            ></img>
          </span>
          <span className="break-words">{title}</span>
        </h3>
        <div className="relative h-24 sm:h-32 mb-3 sm:mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={35}
                paddingAngle={2}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-xs bg-[#145C72] text-white px-1 py-1 rounded-full">
            <div className="px-1 sm:px-2 bg-white rounded-full text-[#145C72] flex-shrink-0">
              <span>{data.total}</span>
            </div>
            <span className="font-semibold truncate">Jaringan</span>
          </div>
          <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-xs bg-[#189FB7] text-white px-1 py-1 rounded-full">
            <div className="px-1 sm:px-2 bg-white rounded-full text-[#145C72] flex-shrink-0">
              <span>{data.normal}</span>
            </div>
            <span className="font-semibold truncate">Gardu Induk</span>
          </div>
          <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-xs bg-[#65CFE2] text-white px-1 py-1 rounded-full">
            <div className="px-1 sm:px-2 bg-white rounded-full text-[#145C72] flex-shrink-0">
              <span>{data.anomali}</span>
            </div>
            <span className="font-semibold truncate">Proteksi</span>
          </div>
        </div>
      </div>
    );
  };

  // Target Zero Anomali component
  const TargetZeroAnomali = ({ title, data }: { title: any; data: any }) => {
    const chartData = [
      { name: "ULTG BEKASI", value: data.jaringan, color: COLORS.secondary },
      { name: "ULTG CIKARANG", value: data.garduInduk, color: COLORS.primary },
    ];

    return (
      <div className="bg-[#F4F4F4] p-3 sm:p-4 rounded-lg shadow-sm justify-between flex flex-col">
        <h3 className="text-xs sm:text-sm flex gap-1 items-center font-semibold text-gray-700 mb-3 sm:mb-4 leading-tight">
          <span className="flex-shrink-0">
            <img
              src="/RekapAnomali/ultgAnomali.svg"
              className="w-4 h-4 sm:w-auto sm:h-auto"
            ></img>
          </span>
          <span className="break-words">{title}</span>
        </h3>
        <div className="relative h-20 sm:h-24 mb-3 sm:mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={30}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1">
          <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-xs bg-[#145C72] text-white px-1 py-1 rounded-full">
            <div className="px-1 sm:px-2 bg-white rounded-full text-[#145C72] flex-shrink-0">
              {data.jaringan}
            </div>
            <span className="truncate">ULTG BEKASI</span>
          </div>
          <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-xs bg-[#189FB7] text-white px-1 py-1 rounded-full">
            <div className="px-1 sm:px-2 bg-white rounded-full text-[#145C72] flex-shrink-0">
              {data.garduInduk}
            </div>
            <span className="truncate">ULTG CIKARANG</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-white p-2 sm:p-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
            PROSENTASE ANOMALI UPT
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button className="px-3 sm:px-4 py-2 bg-[#145C72] text-white rounded-full text-xs sm:text-sm font-medium shadow-2xl">
              OVERVIEW
            </button>
            <button className="px-3 sm:px-4 py-2 text-[#145C72] rounded-full text-xs sm:text-sm font-medium border border-[#145C72] shadow-2xl">
              COMMON ENEMY
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
          {/* Left Column - Bar Chart and Stats */}
          <div className="lg:col-span-3">
            {/* Bar Chart */}
            <div className="bg-[#F4F4F4] p-3 sm:p-4 rounded-lg shadow-sm mb-4">
              <h3 className="text-xs sm:text-sm flex gap-1 items-center font-semibold text-gray-700 mb-3 sm:mb-4">
                <span>
                  <img
                    src="/RekapAnomali/ultgAnomali.svg"
                    className="w-4 h-4 sm:w-auto sm:h-auto"
                  ></img>
                </span>
                GRAFIK KESELURUHAN
              </h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overviewData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <Legend
                      verticalAlign="top"
                      align="center"
                      wrapperStyle={{
                        fontSize: "8px",
                        paddingBottom: "15px",
                      }}
                      iconType="rect"
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 8 }}
                      angle={0}
                      textAnchor="middle"
                      height={40}
                    />
                    <YAxis tick={{ fontSize: 8 }} />
                    <Tooltip />

                    <Bar dataKey="UPT BEKASI" fill={COLORS.primary} />
                    <Bar dataKey="ULTG BEKASI" fill={COLORS.secondary} />
                    <Bar dataKey="ULTG CIKARANG" fill={COLORS.tertiary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-1 bg-[#F4F4F4] p-2 sm:p-1 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-[10px] sm:text-[11px] font-bold text-gray-800 mb-2 sm:mb-3 uppercase">
                  UPT BEKASI
                </div>
                <div className="space-y-1 sm:space-y-1">
                  <div className="bg-[#EBFCFF] py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Jaringan
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      339
                    </div>
                  </div>
                  <div className="bg-[#EBFCFF] py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Gardu Induk
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      172
                    </div>
                  </div>
                  <div className="bg-[#EBFCFF] py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Proteksi
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      31
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-[10px] sm:text-[11px] font-bold text-gray-800 mb-2 sm:mb-3 uppercase">
                  ULTG BEKASI
                </div>
                <div className="space-y-1 sm:space-y-1">
                  <div className="bg-white py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Jaringan
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      228
                    </div>
                  </div>
                  <div className="bg-white py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Gardu Induk
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      119
                    </div>
                  </div>
                  <div className="bg-white py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Proteksi
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      18
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-[10px] sm:text-[11px] font-bold text-gray-800 mb-2 sm:mb-3 uppercase">
                  ULTG CIKARANG
                </div>
                <div className="space-y-1 sm:space-y-1">
                  <div className="bg-white py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Jaringan
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      111
                    </div>
                  </div>
                  <div className="bg-white py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Gardu Induk
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      53
                    </div>
                  </div>
                  <div className="bg-white py-2 sm:py-4 rounded-xl">
                    <div className="text-[9px] sm:text-[11px] text-gray-400 mb-1">
                      Proteksi
                    </div>
                    <div className="text-lg sm:text-2xl lg:text-[32px] font-light text-[#15677B]">
                      15
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns - Pie Charts Grid */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Row 1 - Target Zero Anomali */}
            <CustomPieChart
              data={pieData.jaringan}
              title="TARGET ZERO ANOMALI UPT BEKASI"
            />
            <CustomPieChart
              data={pieData.garduInduk}
              title="TARGET ZERO ANOMALI ULTG BEKASI"
            />
            <CustomPieChart
              data={pieData.proteksi}
              title="TARGET ZERO ANOMALI ULTG CIKARANG"
            />

            {/* Row 2 - More Target Zero Charts */}
            <TargetZeroAnomali
              title="TARGET ZERO ANOMALI JARINGAN"
              data={targetZeroData.uptBekasi}
            />
            <TargetZeroAnomali
              title="TARGET ZERO ANOMALI GARDU INDUK"
              data={targetZeroData.ultgBekasi}
            />
            <TargetZeroAnomali
              title="TARGET ZERO ANOMALI PROTEKSI"
              data={targetZeroData.ultgCikarang}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PersentasiAnomaliPage;
