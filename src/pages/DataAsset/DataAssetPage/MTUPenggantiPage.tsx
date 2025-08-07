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
} from "recharts";
import { ChevronDown, Filter } from "lucide-react";
import DefaultLayout from "../../../layout/DefaultLayout";

// Mock data for MTU Penggantian
const mockMTUData = [
  {
    id: 1,
    location: "UPT BEKASI",
    ultg: "GITET 500 kV Muara Karang",
    bay: "Bay A1",
    mtu: "MTU-001",
    fase: "R",
    onsite: "Completed",
    rencana: "2024-01-15",
    realisasi: "2024-01-20",
    usulan: "Standard Installation",
    year: 2024,
    category: "Terkontrak",
  },
  {
    id: 2,
    location: "UPT BEKASI",
    ultg: "GITET 500 kV Muara Karang",
    bay: "Bay B2",
    mtu: "MTU-002",
    fase: "S",
    onsite: "In Progress",
    rencana: "2024-02-10",
    realisasi: "2024-02-12",
    usulan: "Upgrade Required",
    year: 2024,
    category: "Onsite",
  },
  {
    id: 3,
    location: "ULTG BEKASI",
    ultg: "GITET 500 kV Cibinong",
    bay: "Bay C1",
    mtu: "MTU-003",
    fase: "T",
    onsite: "Pending",
    rencana: "2023-03-20",
    realisasi: "2023-03-25",
    usulan: "Maintenance Check",
    year: 2023,
    category: "Pariksa",
  },
  {
    id: 4,
    location: "ULTG CIKARANG",
    ultg: "GITET 500 kV Depok",
    bay: "Bay D3",
    mtu: "MTU-004",
    fase: "R",
    onsite: "Completed",
    rencana: "2023-04-08",
    realisasi: "2023-04-10",
    usulan: "Installation Complete",
    year: 2023,
    category: "Terpasang",
  },
  // Generate varied data for 2023 (44 items total for this year)
  ...Array.from({ length: 40 }, (_, i) => {
    const locations = [
      "UPT BEKASI",
      "ULTG BEKASI",
      "ULTG CIKARANG",
      "UPT CIBINONG",
      "ULTG DEPOK",
    ];
    const ultgs = [
      "GITET 500 kV Muara Karang",
      "GITET 500 kV Cibinong",
      "GITET 500 kV Depok",
      "GITET 500 kV Bekasi Timur",
      "GITET 500 kV Cikarang Utara",
    ];
    const categories = ["Terkontrak", "Onsite", "Pariksa", "Terpasang"];
    const phases = ["R", "S", "T"];
    const statuses = ["Completed", "In Progress", "Pending", "On Hold"];
    const proposals = [
      "Standard Installation",
      "Upgrade Required",
      "Maintenance Check",
      "Replacement",
      "New Installation",
    ];

    return {
      id: i + 5,
      location: locations[i % locations.length],
      ultg: ultgs[i % ultgs.length],
      bay: `Bay ${String.fromCharCode(65 + (i % 10))}${Math.floor(i / 10) + 1}`,
      mtu: `MTU-${String(i + 5).padStart(3, "0")}`,
      fase: phases[i % phases.length],
      onsite: statuses[i % statuses.length],
      rencana: `2023-${String(Math.floor(i / 4) + 1).padStart(2, "0")}-${String(
        (i % 28) + 1
      ).padStart(2, "0")}`,
      realisasi: `2023-${String(Math.floor(i / 4) + 1).padStart(
        2,
        "0"
      )}-${String((i % 28) + 3).padStart(2, "0")}`,
      usulan: proposals[i % proposals.length],
      year: 2023,
      category: categories[i % categories.length],
    };
  }),

  // Generate varied data for 2024 (46 items total for this year)
  ...Array.from({ length: 44 }, (_, i) => {
    const locations = [
      "UPT BEKASI",
      "ULTG BEKASI",
      "ULTG CIKARANG",
      "UPT CIBINONG",
      "ULTG DEPOK",
      "UPT TANGERANG",
    ];
    const ultgs = [
      "GITET 500 kV Muara Karang",
      "GITET 500 kV Cibinong",
      "GITET 500 kV Depok",
      "GITET 500 kV Bekasi Timur",
      "GITET 500 kV Cikarang Utara",
      "GITET 500 kV Tangerang Selatan",
    ];
    const categories = ["Terkontrak", "Onsite", "Pariksa", "Terpasang"];
    const phases = ["R", "S", "T"];
    const statuses = [
      "Completed",
      "In Progress",
      "Pending",
      "On Hold",
      "Ready",
    ];
    const proposals = [
      "Standard Installation",
      "Upgrade Required",
      "Maintenance Check",
      "Replacement",
      "New Installation",
      "Emergency Repair",
    ];

    return {
      id: i + 45,
      location: locations[i % locations.length],
      ultg: ultgs[i % ultgs.length],
      bay: `Bay ${String.fromCharCode(65 + (i % 12))}${Math.floor(i / 12) + 1}`,
      mtu: `MTU-${String(i + 45).padStart(3, "0")}`,
      fase: phases[i % phases.length],
      onsite: statuses[i % statuses.length],
      rencana: `2024-${String(Math.floor(i / 4) + 1).padStart(2, "0")}-${String(
        (i % 28) + 1
      ).padStart(2, "0")}`,
      realisasi: `2024-${String(Math.floor(i / 4) + 1).padStart(
        2,
        "0"
      )}-${String((i % 28) + 2).padStart(2, "0")}`,
      usulan: proposals[i % proposals.length],
      year: 2024,
      category: categories[i % categories.length],
    };
  }),

  // Generate varied data for 2025 (46 items total for this year)
  ...Array.from({ length: 46 }, (_, i) => {
    const locations = [
      "UPT BEKASI",
      "ULTG BEKASI",
      "ULTG CIKARANG",
      "UPT CIBINONG",
      "ULTG DEPOK",
      "UPT TANGERANG",
      "ULTG BOGOR",
    ];
    const ultgs = [
      "GITET 500 kV Muara Karang",
      "GITET 500 kV Cibinong",
      "GITET 500 kV Depok",
      "GITET 500 kV Bekasi Timur",
      "GITET 500 kV Cikarang Utara",
      "GITET 500 kV Tangerang Selatan",
      "GITET 500 kV Bogor Tengah",
    ];
    const categories = ["Terkontrak", "Onsite", "Pariksa", "Terpasang"];
    const phases = ["R", "S", "T"];
    const statuses = [
      "Planned",
      "In Progress",
      "Pending",
      "Ready",
      "Scheduled",
    ];
    const proposals = [
      "Standard Installation",
      "Upgrade Required",
      "Preventive Maintenance",
      "Replacement",
      "New Installation",
      "System Enhancement",
    ];

    return {
      id: i + 89,
      location: locations[i % locations.length],
      ultg: ultgs[i % ultgs.length],
      bay: `Bay ${String.fromCharCode(65 + (i % 15))}${Math.floor(i / 15) + 1}`,
      mtu: `MTU-${String(i + 89).padStart(3, "0")}`,
      fase: phases[i % phases.length],
      onsite: statuses[i % statuses.length],
      rencana: `2025-${String(Math.floor(i / 4) + 1).padStart(2, "0")}-${String(
        (i % 28) + 1
      ).padStart(2, "0")}`,
      realisasi:
        i % 3 === 0
          ? ""
          : `2025-${String(Math.floor(i / 4) + 1).padStart(2, "0")}-${String(
              (i % 28) + 3
            ).padStart(2, "0")}`, // Some empty realisasi for future dates
      usulan: proposals[i % proposals.length],
      year: 2025,
      category: categories[i % categories.length],
    };
  }),
];
// Dynamic chart data based on location
const chartDataByLocation = {
  "UPT BEKASI": [
    { name: "CB70", Terkontrak: 1, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CB150", Terkontrak: 9, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CB500", Terkontrak: 15, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CT70", Terkontrak: 3, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CT150", Terkontrak: 11, Onsite: 3, Pariksa: 3, Terpasang: 0 },
    { name: "CT500", Terkontrak: 26, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CVT70", Terkontrak: 3, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CVT150", Terkontrak: 1, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CVT500", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DS70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DS150", Terkontrak: 36, Onsite: 10, Pariksa: 0, Terpasang: 0 },
    { name: "DS500", Terkontrak: 4, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DSE70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DSE150", Terkontrak: 9, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "LA70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "LA150", Terkontrak: 14, Onsite: 14, Pariksa: 14, Terpasang: 0 },
  ],
  "ULTG BEKASI": [
    { name: "CB70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CB150", Terkontrak: 2, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CB500", Terkontrak: 1, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CT70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CT150", Terkontrak: 5, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CT500", Terkontrak: 46, Onsite: 12, Pariksa: 12, Terpasang: 0 },
    { name: "CVT70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CVT150", Terkontrak: 3, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CVT500", Terkontrak: 4, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DS70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DS150", Terkontrak: 16, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DS500", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DSE70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DSE150", Terkontrak: 2, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "LA70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "LA150", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
  ],
  "ULTG CIKARANG": [
    { name: "CB70", Terkontrak: 1, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CB150", Terkontrak: 11, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CB500", Terkontrak: 16, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CT70", Terkontrak: 3, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CT150", Terkontrak: 16, Onsite: 3, Pariksa: 3, Terpasang: 0 },
    { name: "CT500", Terkontrak: 72, Onsite: 12, Pariksa: 12, Terpasang: 0 },
    { name: "CVT70", Terkontrak: 3, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CVT150", Terkontrak: 4, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "CVT500", Terkontrak: 4, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DS70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DS150", Terkontrak: 52, Onsite: 10, Pariksa: 0, Terpasang: 0 },
    { name: "DS500", Terkontrak: 4, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DSE70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "DSE150", Terkontrak: 11, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "LA70", Terkontrak: 0, Onsite: 0, Pariksa: 0, Terpasang: 0 },
    { name: "LA150", Terkontrak: 14, Onsite: 14, Pariksa: 14, Terpasang: 0 },
  ],
};

const donutData = [
  { name: "Completed", value: 65, color: "#145C72" },
  { name: "In Progress", value: 25, color: "#FFF11E" },
];

const MTUPenggantiPage = () => {
  const [activeLocation, setActiveLocation] = useState<
    "UPT BEKASI" | "ULTG BEKASI" | "ULTG CIKARANG"
  >("UPT BEKASI");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const locations = ["UPT BEKASI", "ULTG BEKASI", "ULTG CIKARANG"];
  const availableYears = [
    ...new Set(mockMTUData.map((item) => item.year.toString())),
  ].sort();

  // Filter data based on active location and year
  const filteredData = useMemo(() => {
    return mockMTUData.filter(
      (item) =>
        item.location === activeLocation &&
        item.year.toString() === selectedYear
    );
  }, [activeLocation, selectedYear]);

  // Get chart data based on active location
  const currentChartData = useMemo(() => {
    return (
      chartDataByLocation[activeLocation as keyof typeof chartDataByLocation] ||
      []
    );
  }, [activeLocation]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: any) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Header with Location Tabs and Year Filter */}
          <div className="flex justify-between items-center mb-6">
            {/* Location Tabs */}
            <div className="flex space-x-1">
              {locations.map((location: any) => (
                <button
                  key={location}
                  onClick={() => {
                    setActiveLocation(location);
                    setCurrentPage(1);
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeLocation === location
                      ? "bg-[#145C72] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>

            {/* Year Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full px-4 py-2 text-[#145C72] font-bold hover:bg-gray-50 shadow-lg"
              >
                <Filter size={16} />
                <span>Year: {selectedYear}</span>
                <ChevronDown size={16} />
              </button>

              {isYearDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <div className=" text-[#145C72] p-4 flex gap-3">
                  <div className="w-[22px] h-[22px] bg-[#145C72]"></div>
                  <h3 className="font-bold">TARGET PENGGANTIAN MTU</h3>
                </div>
                <div className=" text-[#145C72] p-4 grid grid-cols-2 gap-3">
                  <h3 className="font-bold"> TOTAL </h3>
                  <div className="bg-[#145C72] text-[#FFF11E] px-6 py-1 rounded-full text-sm font-bold w-full">
                    {filteredData.length}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mb-4 text-sm ml-10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#0CA2BA]"></div>
                  <span>Terkontrak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#E78700]"></div>
                  <span>Onsite</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#1B8A2E]"></div>
                  <span>Pariksa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#0066FF]"></div>
                  <span>Terpasang</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="Terkontrak" fill="#0CA2BA" />
                    <Bar dataKey="Onsite" fill="#E78700" />
                    <Bar dataKey="Pariksa" fill="#1B8A2E" />
                    <Bar dataKey="Terpasang" fill="#0066FF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Charts */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className=" text-[#145C72] p-4 flex gap-3">
                  <div className="w-[22px] h-[22px] bg-[#145C72]"></div>
                  <h3 className="font-bold">POPULASI</h3>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {donutData[0].value}%
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <div className=" text-[#145C72] p-4 flex gap-3">
                  <div className="w-[22px] h-[22px] bg-[#145C72]"></div>
                  <h3 className="font-bold">PROGRESS</h3>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {donutData[1].value}%
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden p-3">
            <div className=" text-[#145C72] p-4 flex gap-3">
              <div className="w-[22px] h-[22px] bg-[#145C72]"></div>
              <h3 className="font-bold">KETERANGAN</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full ">
                <thead className="text-[#145C72] ">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      ULTG
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Gardu Induk
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      BAY
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      MTU
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Fase
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Onsite MTU
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Rencana Pasang
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Realisasi Pasang
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                      Usulan Relokasi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-[#145C72] ">
                  {paginatedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-[#CDE9ED]" : "bg-white"}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.location}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.ultg}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.bay}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.mtu}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.fase}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.onsite}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.rencana}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.realisasi}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs ">
                        {item.usulan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <div className="flex space-x-1">
                  {[10, 25, 50, 100].map((rows) => (
                    <button
                      key={rows}
                      onClick={() => handleRowsPerPageChange(rows)}
                      className={`px-3 py-1 rounded text-sm ${
                        rowsPerPage === rows
                          ? "bg-[#145C72] text-[#FFF11E]"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {rows}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? "bg-[#145C72] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span>...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MTUPenggantiPage;
