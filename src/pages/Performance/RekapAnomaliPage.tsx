import { useState, useMemo } from "react";
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
} from "recharts";
import DefaultLayout from "../../layout/DefaultLayout";

const RekapAnomaliPage = () => {
  const [selectedLocation, setSelectedLocation] = useState("JARINGAN");
  const [selectedAnomaly, setSelectedAnomaly] = useState("ALL");

  // Mock data for anomalies
  const anomalyData = [
    // BEKASI Data - More focus on Isolator & Stringset and Besi Siku issues
    {
      id: 1,
      ultg: "BEKASI",
      location: "TOWER SUJT 150kV TMNKR-TRKBW #0013",
      kondisi: "PECAH - 1",
      year: 2024,
      type: "Isolator & Stringset",
      tindakLanjut: "PDKB",
      status: "OPEN",
    },
    {
      id: 2,
      ultg: "BEKASI",
      location: "TOWER SUJT 150kV TMNKR-TRKBW #0013",
      kondisi: "PECAH - 1",
      year: 2024,
      type: "Isolator & Stringset",
      tindakLanjut: "PDKB",
      status: "PROGRESS",
    },
    {
      id: 3,
      ultg: "BEKASI",
      location: "TOWER SUJT 150kV TMNKR-TRKBW #0015",
      kondisi: "PECAH - 2",
      year: 2024,
      type: "Isolator & Stringset",
      tindakLanjut: "PDKB",
      status: "CLOSE",
    },
    {
      id: 4,
      ultg: "BEKASI",
      location: "GI BEKASI BAY 1",
      kondisi: "RUSAK",
      year: 2024,
      type: "Besi Siku",
      tindakLanjut: "PDKB",
      status: "OPEN",
    },
    {
      id: 5,
      ultg: "BEKASI",
      location: "GI BEKASI BAY 2",
      kondisi: "KOROSI",
      year: 2024,
      type: "Besi Siku",
      tindakLanjut: "PDKB",
      status: "PROGRESS",
    },
    {
      id: 6,
      ultg: "BEKASI",
      location: "GI BEKASI BAY 3",
      kondisi: "KOROSI",
      year: 2024,
      type: "Besi Siku",
      tindakLanjut: "PDKB",
      status: "CLOSE",
    },
    {
      id: 7,
      ultg: "BEKASI",
      location: "TOWER #0025",
      kondisi: "LONGGAR",
      year: 2024,
      type: "Konduktor",
      tindakLanjut: "PDKB",
      status: "OPEN",
    },
    {
      id: 8,
      ultg: "BEKASI",
      location: "TOWER #0030",
      kondisi: "RETAK",
      year: 2024,
      type: "Pondasi",
      tindakLanjut: "PDKB",
      status: "PROGRESS",
    },
    {
      id: 9,
      ultg: "BEKASI",
      location: "GI BEKASI",
      kondisi: "HILANG",
      year: 2024,
      type: "Grounding",
      tindakLanjut: "PDKB",
      status: "CLOSE",
    },
    {
      id: 10,
      ultg: "BEKASI",
      location: "TOWER #0040",
      kondisi: "KENDOR",
      year: 2024,
      type: "GSW",
      tindakLanjut: "PDKB",
      status: "OPEN",
    },

    // CIKARANG Data - More focus on Jointing, Pondasi, and Konduktor issues
    {
      id: 11,
      ultg: "CIKARANG",
      location: "TOWER SUJT 150kV CKMR-TRKBW #0020",
      kondisi: "PUTUS",
      year: 2024,
      type: "Jointing",
      tindakLanjut: "PDKB",
      status: "OPEN",
    },
    {
      id: 12,
      ultg: "CIKARANG",
      location: "TOWER SUJT 150kV CKMR-TRKBW #0025",
      kondisi: "PUTUS",
      year: 2024,
      type: "Jointing",
      tindakLanjut: "PDKB",
      status: "PROGRESS",
    },
    {
      id: 13,
      ultg: "CIKARANG",
      location: "GI CIKARANG BAY 1",
      kondisi: "PUTUS",
      year: 2024,
      type: "Jointing",
      tindakLanjut: "PDKB",
      status: "CLOSE",
    },
    {
      id: 14,
      ultg: "CIKARANG",
      location: "TOWER #0030",
      kondisi: "RETAK",
      year: 2024,
      type: "Pondasi",
      tindakLanjut: "PDKB",
      status: "OPEN",
    },
    {
      id: 15,
      ultg: "CIKARANG",
      location: "TOWER #0035",
      kondisi: "RETAK",
      year: 2024,
      type: "Pondasi",
      tindakLanjut: "PDKB",
      status: "PROGRESS",
    },
    {
      id: 16,
      ultg: "CIKARANG",
      location: "TOWER #0040",
      kondisi: "RETAK",
      year: 2024,
      type: "Pondasi",
      tindakLanjut: "PDKB",
      status: "CLOSE",
    },
    {
      id: 17,
      ultg: "CIKARANG",
      location: "TOWER #0045",
      kondisi: "LONGGAR",
      year: 2024,
      type: "Konduktor",
      tindakLanjut: "PDKB",
      status: "OPEN",
    },
    {
      id: 18,
      ultg: "CIKARANG",
      location: "TOWER #0050",
      kondisi: "LONGGAR",
      year: 2024,
      type: "Konduktor",
      tindakLanjut: "PDKB",
      status: "PROGRESS",
    },
    {
      id: 19,
      ultg: "CIKARANG",
      location: "TOWER #0055",
      kondisi: "KENDOR",
      year: 2024,
      type: "GSW",
      tindakLanjut: "PDKB",
      status: "CLOSE",
    },
    {
      id: 20,
      ultg: "CIKARANG",
      location: "GI CIKARANG",
      kondisi: "HILANG",
      year: 2024,
      type: "Grounding",
      tindakLanjut: "PDKB",
      status: "OPEN",
    },
  ];

  const anomalyTypes = [
    { key: "ALL", label: "ALL", icon: "/RekapAnomali/all.svg" },
    { key: "Pondasi", label: "Pondasi", icon: "/RekapAnomali/Pondasi.svg" },
    {
      key: "Konduktor",
      label: "Konduktor",
      icon: "/RekapAnomali/Konduktor.svg",
    },
    {
      key: "Isolator & Stringset",
      label: "Isolator & Stringset",
      icon: "/RekapAnomali/Isolasi.svg",
    },
    {
      key: "Besi Siku",
      label: "Besi Siku",
      icon: "/RekapAnomali/BesiSiku.svg",
    },
    { key: "Jointing", label: "Jointing", icon: "/RekapAnomali/Jointing.svg" },
    {
      key: "Grounding",
      label: "Grounding",
      icon: "/RekapAnomali/Grounding.svg",
    },
    { key: "GSW", label: "GSW", icon: "/RekapAnomali/GSW.svg" },
  ];

  const locationTabs = ["JARINGAN", "GARDU INDUK", "PROTEKSI"];

  // Filter data based on selected anomaly type
  const filteredData = useMemo(() => {
    if (selectedAnomaly === "ALL") {
      return anomalyData;
    }
    return anomalyData.filter((item) => item.type === selectedAnomaly);
  }, [selectedAnomaly]);

  // Calculate pie chart data (percentage breakdown of anomaly types)
  const pieData = useMemo(() => {
    const totalCount = filteredData.length;
    if (totalCount === 0) return [];

    const anomalyTypes = [
      { key: "Isolator & Stringset", color: "#145C72" },
      { key: "Besi Siku", color: "#E78700" },
      { key: "Konduktor", color: "#FF0000" },
      { key: "Jointing", color: "#0066FF" },
      { key: "Pondasi", color: "#1B8B2E" },
      { key: "Grounding", color: "#179FB7" },
      { key: "GSW", color: "#FF00CC" },
    ];

    return anomalyTypes
      .map((type) => {
        const count = filteredData.filter(
          (item) => item.type === type.key
        ).length;
        const percentage =
          totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        return {
          name: type.key,
          value: percentage,
          color: type.color,
          count: count,
        };
      })
      .filter((item) => item.count > 0); // Only show types that have data
  }, [filteredData]);

  // Calculate bar chart data comparing BEKASI vs CIKARANG by anomaly type
  const barChartData = useMemo(() => {
    const anomalyTypes = [
      "Isolator & Stringset",
      "Besi Siku",
      "Konduktor",
      "Jointing",
      "Pondasi",
      "Grounding",
      "GSW",
    ];

    return anomalyTypes.map((type) => {
      const bekasi = filteredData.filter(
        (item) => item.ultg === "BEKASI" && item.type === type
      ).length;
      const cikarang = filteredData.filter(
        (item) => item.ultg === "CIKARANG" && item.type === type
      ).length;

      return {
        name: type.replace(" & ", " & ").substring(0, 12), // Shorten names for display
        BEKASI: bekasi,
        CIKARANG: cikarang,
      };
    });
  }, [filteredData]);

  // Calculate status bar data for BEKASI
  const bekasiStatusBarData = useMemo(() => {
    const types = [
      "Isolator & Stringset",
      "Besi Siku",
      "Konduktor",
      "Jointing",
      "Pondasi",
      "Grounding",
      "GSW",
    ];

    // Filter data for BEKASI only
    const bekasiData = filteredData.filter((item) => item.ultg === "BEKASI");

    return types.map((type) => {
      const typeData = bekasiData.filter((item) => item.type === type);
      const total = typeData.length;
      const closed = typeData.filter((item) => item.status === "CLOSE").length;
      const open = typeData.filter(
        (item) => item.status === "OPEN" || item.status === "PROGRESS"
      ).length;

      const closedPercentage =
        total > 0 ? Math.round((closed / total) * 100) : 0;

      return {
        name: type,
        percentage: closedPercentage,
        closed: closed,
        open: open,
        total: total,
      };
    });
  }, [filteredData]);

  // Calculate status bar data for CIKARANG
  const cikarangStatusBarData = useMemo(() => {
    const types = [
      "Isolator & Stringset",
      "Besi Siku",
      "Konduktor",
      "Jointing",
      "Pondasi",
      "Grounding",
      "GSW",
    ];

    // Filter data for CIKARANG only
    const cikarangData = filteredData.filter(
      (item) => item.ultg === "CIKARANG"
    );

    return types.map((type) => {
      const typeData = cikarangData.filter((item) => item.type === type);
      const total = typeData.length;
      const closed = typeData.filter((item) => item.status === "CLOSE").length;
      const open = typeData.filter(
        (item) => item.status === "OPEN" || item.status === "PROGRESS"
      ).length;

      const closedPercentage =
        total > 0 ? Math.round((closed / total) * 100) : 0;

      return {
        name: type,
        percentage: closedPercentage,
        closed: closed,
        open: open,
        total: total,
      };
    });
  }, [filteredData]);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#145C72] mb-2">
              REKAP ANOMALI UPT
            </h1>
          </div>
          {/* Header with Location Tabs */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-1">
              {locationTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedLocation(tab)}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedLocation === tab
                      ? "bg-[#145C72] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="w-32"></div> {/* Spacer for center alignment */}
          </div>

          <div className="flex gap-3">
            {/* Left Sidebar - Anomaly Types */}
            <div className="w-64 bg-[#F4F4F4] rounded-lg shadow ">
              <div className="mb-4">
                <h3 className="text-[#145C72] font-bold text-sm uppercase mb-3 px-4 pt-4">
                  JENIS ANOMALI
                </h3>
                <div className="space-y-2">
                  {anomalyTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setSelectedAnomaly(type.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors relative ${
                        selectedAnomaly === type.key
                          ? " text-[#145C72] font-bold "
                          : "text-[#145C72] hover:bg-gray-100"
                      }`}
                    >
                      {/* Left indicator bar */}
                      {selectedAnomaly === type.key && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#179FB7] rounded-r"></div>
                      )}

                      <span className="flex items-center">
                        <img
                          src={type.icon}
                          className={
                            selectedAnomaly === type.key
                              ? "filter-[#179FB7]"
                              : ""
                          }
                          style={
                            selectedAnomaly === type.key
                              ? {
                                  filter:
                                    "brightness(0) saturate(100%) invert(64%) sepia(71%) saturate(556%) hue-rotate(166deg) brightness(94%) contrast(88%)",
                                }
                              : {}
                          }
                        />
                      </span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#F4F4F4] p-4 rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Pie Chart */}
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="grid grid-cols-3 items-center ">
                    {/* Pie Chart */}
                    <div className="w-full h-64 justify-center items-center col-span-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, _, props) => [
                              `${value}% (${props.payload.count} Anomali)`,
                              props.payload.name,
                            ]}
                            labelStyle={{ color: "#145C72" }}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend with Percentages */}
                    <div className="flex-1  space-y-2">
                      {pieData.map((entry, index) => (
                        <div
                          style={{
                            backgroundColor: entry.color,
                          }}
                          key={index}
                          className="flex items-center w-full gap-3 rounded-full"
                        >
                          <div className="flex items-center gap-2  flex-1 p-1">
                            <span
                              className={`text-sm  text-[#145C72] min-w-[35px] text-center bg-white rounded-full`}
                            >
                              {entry.value}%
                            </span>
                            <span className="text-sm text-white truncate">
                              {entry.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className=" bg-white rounded-lg p-6 shadow">
                  <div className="text-[#145C72] mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#145C72]"></div>
                        <span className="text-xs">ULTG Bekasi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#179FB7]"></div>
                        <span className="text-xs">ULTG Cikarang</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          angle={0}
                          textAnchor="middle"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} Anomali`,
                            name,
                          ]}
                          labelFormatter={(label) => `Anomaly Type: ${label}`}
                          labelStyle={{ color: "#145C72", fontWeight: "bold" }}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        />
                        <Bar dataKey="BEKASI" fill="#145C72" />
                        <Bar dataKey="CIKARANG" fill="#179FB7" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Status Bars Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* ULTG BEKASI */}
                <div className="bg-white rounded-lg  shadow pb-4">
                  <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                    <div>
                      <img src="/RekapAnomali/ultgAnomali.svg"></img>
                    </div>
                    <h3 className="font-bold">ULTG BEKASI</h3>
                  </div>
                  <div className="space-y-3 ">
                    <div className="grid grid-cols-2 gap-6 text-xs py-2 px-2 bg-[#E4FBFF] font-medium text-[#145C72] mb-2">
                      <div className="flex justify-between">
                        {" "}
                        <span>Anomalies</span>
                        <span className="text-[#009A1A]">%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#009A1A] font-bold">Closed</span>
                        <span className="text-[#FF5050] font-bold">Open</span>
                      </div>
                    </div>
                    {bekasiStatusBarData.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 items-center gap-2 px-2"
                      >
                        <div className="flex justify-between">
                          <div className=" text-xs text-[#145C72]">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#1B8A2E] w-8 bg-[#79FF90] items-center justify-center flex rounded-full">
                            {item.percentage}%
                          </div>
                        </div>

                        <div className="flex-1 flex items-center gap-2">
                          <div className="text-xs text-[#145C72] w-4">
                            {item.closed}
                          </div>
                          <div className="flex-1 h-4 bg-gray-200 rounded flex overflow-hidden">
                            <div
                              className="bg-[#1B8A2E] transition-all"
                              style={{
                                width: `${
                                  item.closed > 0
                                    ? (item.closed / item.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                            <div
                              className="bg-[#DC2626] transition-all"
                              style={{
                                width: `${
                                  item.open > 0
                                    ? (item.open / item.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>

                          <div className="text-xs text-[#145C72] w-4">
                            {item.open}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ULTG CIKARANG */}
                <div className="bg-white rounded-lg  shadow">
                  <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                    <div>
                      <img src="/RekapAnomali/ultgAnomali.svg"></img>
                    </div>
                    <h3 className="font-bold">ULTG CIKARANG</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-6 text-xs py-2 px-2 bg-[#E4FBFF] font-medium text-[#145C72] mb-2">
                      <div className="flex justify-between">
                        {" "}
                        <span>Anomalies</span>
                        <span className="text-[#009A1A]">%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#009A1A] font-bold">Closed</span>
                        <span className="text-[#FF5050] font-bold">Open</span>
                      </div>
                    </div>
                    {cikarangStatusBarData.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 items-center gap-2 px-2"
                      >
                        <div className="flex justify-between">
                          <div className=" text-xs text-[#145C72]">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#1B8A2E] w-8 bg-[#79FF90] items-center justify-center flex rounded-full">
                            {item.percentage}%
                          </div>
                        </div>

                        <div className="flex-1 flex items-center gap-2">
                          <div className="text-xs text-[#145C72] w-4">
                            {item.closed}
                          </div>
                          <div className="flex-1 h-4 bg-gray-200 rounded flex overflow-hidden">
                            <div
                              className="bg-[#1B8A2E] transition-all"
                              style={{
                                width: `${
                                  item.closed > 0
                                    ? (item.closed / item.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                            <div
                              className="bg-[#DC2626] transition-all"
                              style={{
                                width: `${
                                  item.open > 0
                                    ? (item.open / item.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>

                          <div className="text-xs text-[#145C72] w-4">
                            {item.open}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Tables - Show all tables based on filter */}
              <div className="space-y-6">
                {/* Isolator & Stringset Table */}
                {(selectedAnomaly === "ALL" ||
                  selectedAnomaly === "Isolator & Stringset") && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                      <div>
                        <img src="/RekapAnomali/ultgAnomali.svg"></img>
                      </div>
                      <h3 className="font-bold">
                        ANOMALI ISOLATOR & STRINGSET
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-[#145C72]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              ULTG
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Temuan Anomali
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Tindak Lanjut
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                          {filteredData
                            .filter(
                              (item) => item.type === "Isolator & Stringset"
                            )
                            .map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                                }
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.ultg}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.location}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.kondisi}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.year}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.tindakLanjut}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                )}

                {/* Pondasi Tower Table */}
                {(selectedAnomaly === "ALL" ||
                  selectedAnomaly === "Pondasi") && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                      <div>
                        <img src="/RekapAnomali/ultgAnomali.svg"></img>
                      </div>
                      <h3 className="font-bold">ANOMALI PONDASI TOWER</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-[#145C72]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              ULTG
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Temuan Anomali
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Tindak Lanjut
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                          {filteredData
                            .filter((item) => item.type === "Pondasi")
                            .map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                                }
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.ultg}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.location}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.kondisi}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.year}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.tindakLanjut}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                )}

                {/* Besi Siku Table */}
                {(selectedAnomaly === "ALL" ||
                  selectedAnomaly === "Besi Siku") && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                      <div>
                        <img src="/RekapAnomali/ultgAnomali.svg"></img>
                      </div>
                      <h3 className="font-bold">ANOMALI BESI SIKU</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-[#145C72]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              ULTG
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Temuan Anomali
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Tindak Lanjut
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                          {filteredData
                            .filter((item) => item.type === "Besi Siku")
                            .map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                                }
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.ultg}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.location}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.kondisi}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.year}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.tindakLanjut}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                )}

                {/* Konduktor Table */}
                {(selectedAnomaly === "ALL" ||
                  selectedAnomaly === "Konduktor") && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                      <div>
                        <img src="/RekapAnomali/ultgAnomali.svg"></img>
                      </div>
                      <h3 className="font-bold">ANOMALI KONDUKTOR</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-[#145C72]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              ULTG
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Temuan Anomali
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Tindak Lanjut
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                          {filteredData
                            .filter((item) => item.type === "Konduktor")
                            .map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                                }
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.ultg}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.location}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.kondisi}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.year}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.tindakLanjut}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                )}

                {/* Jointing Table */}
                {(selectedAnomaly === "ALL" ||
                  selectedAnomaly === "Jointing") && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                      <div>
                        <img src="/RekapAnomali/ultgAnomali.svg"></img>
                      </div>
                      <h3 className="font-bold">ANOMALI JOINTING</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-[#145C72]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              ULTG
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Temuan Anomali
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Tindak Lanjut
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                          {filteredData
                            .filter((item) => item.type === "Jointing")
                            .map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                                }
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.ultg}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.location}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.kondisi}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.year}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.tindakLanjut}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                )}

                {/* Grounding Table */}
                {(selectedAnomaly === "ALL" ||
                  selectedAnomaly === "Grounding") && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                      <div>
                        <img src="/RekapAnomali/ultgAnomali.svg"></img>
                      </div>
                      <h3 className="font-bold">ANOMALI GROUNDING</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-[#145C72]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              ULTG
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Temuan Anomali
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Tindak Lanjut
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                          {filteredData
                            .filter((item) => item.type === "Grounding")
                            .map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                                }
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.ultg}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.location}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.kondisi}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.year}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.tindakLanjut}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                )}

                {/* GSW Table */}
                {(selectedAnomaly === "ALL" || selectedAnomaly === "GSW") && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="text-[#145C72] mb-4 flex gap-3 p-2 items-center">
                      <div>
                        <img src="/RekapAnomali/ultgAnomali.svg"></img>
                      </div>
                      <h3 className="font-bold">ANOMALI GSW</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-[#145C72]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              ULTG
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Lokasi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Kondisi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Temuan Anomali
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Tindak Lanjut
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                          {filteredData
                            .filter((item) => item.type === "GSW")
                            .map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"
                                }
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.ultg}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.location}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.kondisi}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.year}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  {item.tindakLanjut}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RekapAnomaliPage;
