import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Shield,
  Users,
  LayoutList,
  ChartColumnBig,
} from "lucide-react";
import DefaultLayout from "../../../layout/DefaultLayout";

interface CriteriaData {
  no: number;
  name: string;
  targetSem1: number;
  targetSem2: number;
  realisasiSem1: number;
  realisasiSem2: number;
}

interface ActionPlanData {
  subNo: string;
  actionPlan: string;
  targetSem1: number;
  targetSem2: number;
  realisasiSem1: number;
  realisasiSem2: number;
}

interface SheetConfig {
  spreadsheetId: string;
  sheetName: string;
  sheetGid: string;
  apiKey: string;
}

const LevelHSSEPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<CriteriaData[]>([]);
  const [detailData, setDetailData] = useState<{
    [key: number]: ActionPlanData[];
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [activeSheet, setActiveSheet] = useState<"k3" | "kam">("k3");
  const [totalAchievement, setTotalAchievement] = useState<{
    sem1: number;
    sem2: number;
  }>({ sem1: 0, sem2: 0 });
  const [pencapaianPercentages, setPencapaianPercentages] = useState<{
    sem1: number;
    sem2: number;
  }>({ sem1: 0, sem2: 0 });
  const apiKey = import.meta.env.VITE_API_LINK_KEY || "";
  const sheetid = import.meta.env.VITE_API_LINK_SHEETID || "";
  const k3SheetGid = import.meta.env.VITE_API_LINK_SHEEGID || "";
  const kamSheetGid = "1230200164";

  // Configuration for sheets
  const SHEET_CONFIGS: Record<"k3" | "kam", SheetConfig> = {
    k3: {
      spreadsheetId: sheetid,
      sheetName: "Target dan Realisasi K3",
      sheetGid: k3SheetGid,
      apiKey: apiKey,
    },
    kam: {
      spreadsheetId: sheetid,
      sheetName: "Target dan Realisasi KAM",
      sheetGid: kamSheetGid,
      apiKey: apiKey,
    },
  };

  const parseNumber = (value: string | number): number => {
    if (!value || value.toString().trim() === "") return 0;
    const parsed = parseFloat(value.toString().replace(",", "."));
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseCSVLine = (line: string): string[] => {
    return line
      .split(",")
      .map((cell) => cell.replace(/^["']|["']$/g, "").trim());
  };

  const fetchSpecificSheetData = async (
    sheetType: "k3" | "kam" = activeSheet
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const config = SHEET_CONFIGS[sheetType];

      // Try CSV export first (this should work without API key)
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/export?format=csv&gid=${config.sheetGid}`;
        const response = await fetch(csvUrl);

        if (response.ok) {
          const csvText = await response.text();
          const lines = csvText.split("\n").filter((line) => line.trim());

          if (lines.length > 0) {
            parseCsvData(lines);
            return;
          }
        }
      } catch (csvError) {
        console.log("CSV method failed:", csvError);
      }

      // Fallback to Google Sheets API
      const range = `'${config.sheetName}'!A1:G50`;
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${
        config.spreadsheetId
      }/values/${encodeURIComponent(range)}?key=${config.apiKey}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Google Sheets API error: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log(data);
      if (!data.values || data.values.length === 0) {
        throw new Error(`No data found in the sheet`);
      }

      parseApiData(data.values);
    } catch (err) {
      console.error("Error fetching sheet data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const parseCsvData = (lines: string[]) => {
    // Parse summary data from RESUME section (based on your sheet image, this starts around row 27)
    const summary: CriteriaData[] = [];
    let pencapaianSem1 = 0;
    let pencapaianSem2 = 0;

    // Look for the row that says "RESUME" and parse the 6 criteria after it
    let resumeRowIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes("resume")) {
        resumeRowIndex = i;
        break;
      }
    }

    if (resumeRowIndex >= 0) {
      // Parse the 6 criteria after the RESUME header (skip header row)
      for (let i = resumeRowIndex + 2; i < resumeRowIndex + 8; i++) {
        if (i < lines.length) {
          const cells = parseCSVLine(lines[i]);
          const no = parseInt(cells[0]);

          if (!isNaN(no) && no >= 1 && no <= 6 && cells.length >= 6) {
            summary.push({
              no,
              name: cells[1] || "",
              targetSem1: parseNumber(cells[2]),
              targetSem2: parseNumber(cells[3]),
              realisasiSem1: parseNumber(cells[4]),
              realisasiSem2: parseNumber(cells[5]),
            });
          }
        }
      }

      // Look for final scores row (Nilai Akhir)
      for (
        let i = resumeRowIndex;
        i < Math.min(resumeRowIndex + 15, lines.length);
        i++
      ) {
        const cells = parseCSVLine(lines[i]);
        if (
          cells[0]?.toLowerCase().includes("nilai akhir") ||
          cells[1]?.toLowerCase().includes("nilai akhir")
        ) {
          setTotalAchievement({
            sem1: parseNumber(cells[4]),
            sem2: parseNumber(cells[5]),
          });
          break;
        }
      }
    }

    // Extract Pencapaian percentages from specific rows based on sheet type
    if (activeSheet === "k3") {
      // For K3: F37 (row 37, column F = index 5) and F38 (row 38, column F = index 5)
      if (lines.length > 36) {
        // Row 37 (index 36)
        const cells37 = parseCSVLine(lines[36]);
        if (cells37.length > 5 && cells37[5].includes("%")) {
          pencapaianSem1 = parseFloat(cells37[5].replace("%", ""));
        }
      }
      if (lines.length > 37) {
        // Row 38 (index 37)
        const cells38 = parseCSVLine(lines[37]);
        if (cells38.length > 5 && cells38[5].includes("%")) {
          pencapaianSem2 = parseFloat(cells38[5].replace("%", ""));
        }
      }
    } else if (activeSheet === "kam") {
      // For KAM: F40 (row 40, column F = index 5) and F41 (row 41, column F = index 5)
      if (lines.length > 39) {
        // Row 40 (index 39)
        const cells40 = parseCSVLine(lines[39]);
        if (cells40.length > 5 && cells40[5].includes("%")) {
          pencapaianSem1 = parseFloat(cells40[5].replace("%", ""));
        }
      }
      if (lines.length > 40) {
        // Row 41 (index 40)
        const cells41 = parseCSVLine(lines[40]);
        if (cells41.length > 5 && cells41[5].includes("%")) {
          pencapaianSem2 = parseFloat(cells41[5].replace("%", ""));
        }
      }
    }

    // Parse action plan details (this should be above the RESUME section)
    const details: { [key: number]: ActionPlanData[] } = {};

    for (
      let i = 5;
      i < Math.min(resumeRowIndex > 0 ? resumeRowIndex : 25, lines.length);
      i++
    ) {
      const cells = parseCSVLine(lines[i]);
      const subNo = cells[0];

      if (subNo && /^\d+\.\d+$/.test(subNo) && cells.length >= 6) {
        const mainNo = parseInt(subNo.split(".")[0]);

        if (!details[mainNo]) {
          details[mainNo] = [];
        }

        details[mainNo].push({
          subNo,
          actionPlan: cells[1] || "",
          targetSem1: parseNumber(cells[2]),
          targetSem2: parseNumber(cells[3]),
          realisasiSem1: parseNumber(cells[4]),
          realisasiSem2: parseNumber(cells[5]),
        });
      }
    }

    setSummaryData(summary);
    setDetailData(details);

    // Set pencapaian percentages
    setPencapaianPercentages({
      sem1: pencapaianSem1,
      sem2: pencapaianSem2,
    });
  };

  const parseApiData = (rows: string[][]) => {
    // Parse summary data from RESUME section
    const summary: CriteriaData[] = [];
    let pencapaianSem1 = 0;
    let pencapaianSem2 = 0;

    // Look for RESUME section
    let resumeRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (
        rows[i] &&
        rows[i][0] &&
        rows[i][0].toString().toLowerCase().includes("resume")
      ) {
        resumeRowIndex = i;
        break;
      }
    }

    if (resumeRowIndex >= 0) {
      // Parse the 6 criteria after the RESUME header
      for (let i = resumeRowIndex + 2; i < resumeRowIndex + 8; i++) {
        if (i < rows.length) {
          const row = rows[i];
          if (row && row.length >= 6) {
            const no = parseInt(row[0]);

            if (!isNaN(no) && no >= 1 && no <= 6) {
              summary.push({
                no,
                name: row[1] || "",
                targetSem1: parseNumber(row[2]),
                targetSem2: parseNumber(row[3]),
                realisasiSem1: parseNumber(row[4]),
                realisasiSem2: parseNumber(row[5]),
              });
            }
          }
        }
      }

      // Look for final scores
      for (
        let i = resumeRowIndex;
        i < Math.min(resumeRowIndex + 15, rows.length);
        i++
      ) {
        const row = rows[i];
        if (
          row &&
          (row[0]?.toString().toLowerCase().includes("nilai akhir") ||
            row[1]?.toString().toLowerCase().includes("nilai akhir"))
        ) {
          setTotalAchievement({
            sem1: parseNumber(row[4]),
            sem2: parseNumber(row[5]),
          });
          break;
        }
      }
    }

    // Extract Pencapaian percentages from specific rows based on sheet type
    if (activeSheet === "k3") {
      // For K3: F37 (row 37, column F = index 5) and F38 (row 38, column F = index 5)
      if (rows.length > 36 && rows[36] && rows[36].length > 5) {
        // Row 37 (index 36)
        const cellF37 = rows[36][5]?.toString();
        if (cellF37 && cellF37.includes("%")) {
          pencapaianSem1 = parseFloat(cellF37.replace("%", ""));
        }
      }
      if (rows.length > 37 && rows[37] && rows[37].length > 5) {
        // Row 38 (index 37)
        const cellF38 = rows[37][5]?.toString();
        if (cellF38 && cellF38.includes("%")) {
          pencapaianSem2 = parseFloat(cellF38.replace("%", ""));
        }
      }
    } else if (activeSheet === "kam") {
      // For KAM: F40 (row 40, column F = index 5) and F41 (row 41, column F = index 5)
      if (rows.length > 39 && rows[39] && rows[39].length > 5) {
        // Row 40 (index 39)
        const cellF40 = rows[39][5]?.toString();
        if (cellF40 && cellF40.includes("%")) {
          pencapaianSem1 = parseFloat(cellF40.replace("%", ""));
        }
      }
      if (rows.length > 40 && rows[40] && rows[40].length > 5) {
        // Row 41 (index 40)
        const cellF41 = rows[40][5]?.toString();
        if (cellF41 && cellF41.includes("%")) {
          pencapaianSem2 = parseFloat(cellF41.replace("%", ""));
        }
      }
    }

    // Parse action plan details
    const details: { [key: number]: ActionPlanData[] } = {};

    for (
      let i = 5;
      i < Math.min(resumeRowIndex > 0 ? resumeRowIndex : 25, rows.length);
      i++
    ) {
      const row = rows[i];
      if (row && row.length >= 6) {
        const subNo = row[0]?.toString();

        if (subNo && /^\d+\.\d+$/.test(subNo)) {
          const mainNo = parseInt(subNo.split(".")[0]);

          if (!details[mainNo]) {
            details[mainNo] = [];
          }

          details[mainNo].push({
            subNo,
            actionPlan: row[1]?.toString() || "",
            targetSem1: parseNumber(row[2]),
            targetSem2: parseNumber(row[3]),
            realisasiSem1: parseNumber(row[4]),
            realisasiSem2: parseNumber(row[5]),
          });
        }
      }
    }

    setSummaryData(summary);
    setDetailData(details);

    // Set pencapaian percentages
    setPencapaianPercentages({
      sem1: pencapaianSem1,
      sem2: pencapaianSem2,
    });
  };
  useEffect(() => {
    fetchSpecificSheetData(activeSheet);
  }, [activeSheet]);

  const handleSheetChange = (sheetType: "k3" | "kam") => {
    setActiveSheet(sheetType);
    setExpandedRows(new Set()); // Reset expanded rows when switching sheets
  };

  const toggleExpanded = (criteriaNo: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(criteriaNo)) {
      newExpanded.delete(criteriaNo);
    } else {
      newExpanded.add(criteriaNo);
    }
    setExpandedRows(newExpanded);
  };

  const chartData = summaryData.map((item) => ({
    name: `Kriteria ${item.no}`,
    fullName: item.name,
    "Target Semester 1": item.targetSem1,
    "Target Semester 2": item.targetSem2,
    "Realisasi Semester 1": item.realisasiSem1,
    "Realisasi Semester 2": item.realisasiSem2,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600 mb-2">{data.fullName}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-red-800">
            Error loading data
          </h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => fetchSpecificSheetData(activeSheet)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DefaultLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Sheet Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSheetChange("k3")}
                className={`px-4 py-2 flex gap-1 items-center text-sm font-medium rounded-full transition-colors ${
                  activeSheet === "k3"
                    ? "bg-[#145C72] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Shield size={16} />
                Target dan Realisasi K3
              </button>
              <button
                onClick={() => handleSheetChange("kam")}
                className={`px-4 py-2 flex gap-1 items-center text-sm font-medium rounded-full transition-colors ${
                  activeSheet === "kam"
                    ? "bg-[#145C72] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Users size={16} />
                Target dan Realisasi KAM
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div
            style={{
              background: "linear-gradient(to bottom, #15677B, #179FB7)",
            }}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white mr-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Total Kriteria</p>
                <p className="text-2xl font-semibold  text-white">
                  {summaryData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#CDE9ED] p-6 rounded-lg shadow-sm border">
            <div className="flex items-center ">
              <div className="p-3 rounded-full bg-white  mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pencapaian Semester 1
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pencapaianPercentages.sem1 > 0
                    ? `${pencapaianPercentages.sem1.toFixed(2)}%`
                    : totalAchievement.sem1.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#145C72]">
                  Pencapaian Semester 2
                </p>
                <p className="text-2xl font-semibold text-[#145C72]">
                  {pencapaianPercentages.sem2 > 0
                    ? `${pencapaianPercentages.sem2.toFixed(2)}%`
                    : totalAchievement.sem2.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-[#145C72] mb-4 flex gap-1 items-center">
            <ChartColumnBig />
            TARGET & REALISASI MATURITY LEVEL
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={0} textAnchor="end" height={80} />
                <YAxis domain={[0, 5]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Realisasi Semester 1" fill="#E78700" />
                <Bar dataKey="Realisasi Semester 2" fill="#1B8B2E" />
                <Bar dataKey="Target Semester 1" fill="#179FB7" />
                <Bar dataKey="Target Semester 2" fill="#FF0000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table - Always Visible Below Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-[#145C72] flex gap-1 items-center">
              {" "}
              <LayoutList size={16} />
              RESUME
            </h2>
            <p className="text-sm text-[#145C72]">
              Klik Row Untuk Melihat Detail Action Plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-[#145C72]">
              <thead className="bg-gray-50 font-bold">
                <tr>
                  <th className="px-6 py-3 text-left text-xs  uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs  uppercase">
                    Kriteria
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Target S1
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Target S2
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Realisasi S1
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Realisasi S2
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                {summaryData.map((item, index) => (
                  <React.Fragment key={item.no}>
                    <tr
                      className={`${
                        index % 2 === 0 ? " bg-[#CDE9ED]" : "bg-white"
                      } hover:bg-blue-50 cursor-pointer`}
                      onClick={() => toggleExpanded(item.no)}
                    >
                      <td className="px-6 py-4 text-sm font-medium ">
                        {item.no}
                      </td>
                      <td className="px-6 py-4 text-sm "> {item.name}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        {item.targetSem1.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        {item.targetSem2.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.realisasiSem1 >= item.targetSem1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.realisasiSem1.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.realisasiSem2 >= item.targetSem2
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.realisasiSem2.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center justify-center gap-2 text-xs text-gray-500 flex">
                        {detailData[item.no]?.length || 0} items
                        {detailData[item.no] &&
                          (expandedRows.has(item.no) ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          ))}
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedRows.has(item.no) && detailData[item.no] && (
                      <tr>
                        <td colSpan={7} className="px-0 py-0">
                          <div className="bg-blue-50 border-l-4 border-blue-200 p-4 m-4 rounded">
                            <h4 className="font-medium text-blue-900 mb-3">
                              Action Plans:
                            </h4>
                            <div className="space-y-2">
                              {detailData[item.no].map((detail) => (
                                <div
                                  key={detail.subNo}
                                  className="bg-white p-3 rounded border"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <span className="font-medium text-blue-900">
                                        {detail.subNo}
                                      </span>
                                      <p className="text-sm text-gray-700 mt-1">
                                        {detail.actionPlan}
                                      </p>
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                      <div className="text-center">
                                        <div className="text-gray-500">T1</div>
                                        <div className="font-medium">
                                          {detail.targetSem1}
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-gray-500">T2</div>
                                        <div className="font-medium">
                                          {detail.targetSem2}
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-gray-500">R1</div>
                                        <div
                                          className={`font-medium ${
                                            detail.realisasiSem1 >=
                                            detail.targetSem1
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {detail.realisasiSem1}
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-gray-500">R2</div>
                                        <div
                                          className={`font-medium ${
                                            detail.realisasiSem2 >=
                                            detail.targetSem2
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {detail.realisasiSem2}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Data */}
        {summaryData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No data found in the sheet</p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure the sheet is publicly accessible and contains the
              expected data structure
            </p>
            <button
              onClick={() => fetchSpecificSheetData(activeSheet)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Reload Data
            </button>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default LevelHSSEPage;
