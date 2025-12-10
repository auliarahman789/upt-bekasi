import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Shield,
  Users,
  LayoutList,
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
  const currentYear = new Date().getFullYear();
  const [totalAchievement, setTotalAchievement] = useState<{
    sem1: number;
    sem2: number;
  }>({ sem1: 0, sem2: 0 });
  const [pencapaianPercentages, setPencapaianPercentages] = useState<{
    sem1: number;
    sem2: number;
  }>({ sem1: 0, sem2: 0 });
  const [targetPlnPusat, setTargetPlnPusat] = useState<{
    sem1: number;
    sem2: number;
  }>({ sem1: 0, sem2: 0 });

  const sheetid = import.meta.env.VITE_API_LINK_SHEETID || "";
  const k3SheetGid = import.meta.env.VITE_API_LINK_SHEEGID || "";
  const kamSheetGid = import.meta.env.VITE_API_LINK_SHEEGID2 || "";

  // ---------------- GOOGLE AUTH HELPERS ----------------
  const getAccessToken = async (): Promise<string> => {
    const clientEmail = import.meta.env.VITE_GOOGLE_CLIENT_EMAIL!;
    const privateKey = import.meta.env.VITE_GOOGLE_PRIVATE_KEY!.replace(
      /\\n/g,
      "\n"
    );

    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: "RS256", typ: "JWT" };
    const jwtClaimSet = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const encode = (obj: any) =>
      btoa(JSON.stringify(obj))
        .replace(/=+$/, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const header = encode(jwtHeader);
    const payload = encode(jwtClaimSet);
    const data = new TextEncoder().encode(`${header}.${payload}`);

    const key = await crypto.subtle.importKey(
      "pkcs8",
      str2ab(privateKey),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, data);
    const signatureBase64 = btoa(
      String.fromCharCode(...new Uint8Array(signature))
    )
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${header}.${payload}.${signatureBase64}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to get access token");
    return json.access_token;
  };

  function str2ab(pem: string): ArrayBuffer {
    const b64 = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s+/g, "");
    const binary = atob(b64);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
    return buf.buffer;
  }
  // -----------------------------------------------------

  const SHEET_CONFIGS: Record<"k3" | "kam", SheetConfig> = {
    k3: {
      spreadsheetId: sheetid,
      sheetName: "Target dan Realisasi K3",
      sheetGid: k3SheetGid,
    },
    kam: {
      spreadsheetId: sheetid,
      sheetName: "Target dan Realisasi KAM",
      sheetGid: kamSheetGid,
    },
  };

  const parseNumber = (value: string | number): number => {
    if (!value || value.toString().trim() === "") return 0;

    // Remove percentage sign if present
    const stringValue = value.toString().replace("%", "").trim();

    // Replace comma with dot for decimal parsing
    const parsed = parseFloat(stringValue.replace(",", "."));

    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchSpecificSheetData = async (
    sheetType: "k3" | "kam" = activeSheet
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const config = SHEET_CONFIGS[sheetType];

      // Try CSV export first
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

      // --- Service Account Auth Flow ---
      const accessToken = await getAccessToken();
      const range = `'${config.sheetName}'!A1:G50`;
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${
        config.spreadsheetId
      }/values/${encodeURIComponent(range)}`;

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Google Sheets API error: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
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

  const parseCSVLine = (line: string): string[] => {
    return line
      .split(",")
      .map((cell) => cell.replace(/^["']|["']$/g, "").trim());
  };

  // Helper function to calculate averages for main criteria based on sub-criteria
  const calculateAveragesForCriteria = (
    summaryData: CriteriaData[],
    detailData: { [key: number]: ActionPlanData[] }
  ): CriteriaData[] => {
    return summaryData.map((criteria) => {
      // Check if this criteria has detail data (sub-criteria)
      const subCriteria = detailData[criteria.no];

      if (subCriteria && subCriteria.length > 0) {
        // Calculate averages from sub-criteria
        const avgTargetSem1 =
          subCriteria.reduce((sum, item) => sum + item.targetSem1, 0) /
          subCriteria.length;
        const avgTargetSem2 =
          subCriteria.reduce((sum, item) => sum + item.targetSem2, 0) /
          subCriteria.length;
        const avgRealisasiSem1 =
          subCriteria.reduce((sum, item) => sum + item.realisasiSem1, 0) /
          subCriteria.length;
        const avgRealisasiSem2 =
          subCriteria.reduce((sum, item) => sum + item.realisasiSem2, 0) /
          subCriteria.length;

        return {
          ...criteria,
          targetSem1: avgTargetSem1,
          targetSem2: avgTargetSem2,
          realisasiSem1: avgRealisasiSem1,
          realisasiSem2: avgRealisasiSem2,
        };
      }

      // Return original criteria if no sub-criteria found
      return criteria;
    });
  };

  const parseCsvData = (lines: string[]) => {
    // Parse summary data from RESUME section
    const summary: CriteriaData[] = [];
    let pencapaianSem1 = 0;
    let pencapaianSem2 = 0;
    let targetPlnSem1 = 0;
    let targetPlnSem2 = 0;
    let nilaiAkhirSem1 = 0;
    let nilaiAkhirSem2 = 0;

    // Look for the row that says "RESUME" and parse criteria after it
    let resumeRowIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes("resume")) {
        resumeRowIndex = i;
        break;
      }
    }

    // Parse action plan details first (this should be above the RESUME section)
    const details: { [key: number]: ActionPlanData[] } = {};

    // Enhanced parsing for action plan details
    for (let i = 1; i < lines.length; i++) {
      // Start from row 1 to skip header
      if (resumeRowIndex > 0 && i >= resumeRowIndex) break; // Stop when we reach RESUME section

      const cells = parseCSVLine(lines[i]);
      let subNo = cells[0]?.trim().replace(",", ".");
      if (subNo && /^\d+\.\d+$/.test(subNo) && cells.length >= 6) {
        const mainNo = parseInt(subNo.split(".")[0]);

        if (!details[mainNo]) {
          details[mainNo] = [];
        }

        // Enhanced action plan parsing - combine multiple columns if needed
        let actionPlan = cells[1] || "";

        // Sometimes action plans are split across multiple columns
        // Check if there are additional text columns that should be part of the action plan
        for (let j = 2; j < cells.length; j++) {
          const cellValue = cells[j]?.trim();
          // If the cell contains non-numeric data and isn't empty, it might be part of action plan
          if (cellValue && isNaN(parseFloat(cellValue.replace(",", ".")))) {
            actionPlan += " " + cellValue;
          } else {
            break; // We've reached numeric data, stop concatenating
          }
        }

        // Find the actual data columns (target and realisasi)
        const numericCells = cells.slice(1).filter((cell) => {
          const val = cell?.trim();
          return val && !isNaN(parseFloat(val.replace(",", ".")));
        });

        // Ensure we have at least 4 numeric values for target and realisasi
        if (numericCells.length >= 4) {
          details[mainNo].push({
            subNo,
            actionPlan: actionPlan.trim(),
            targetSem1: parseNumber(numericCells[0]),
            targetSem2: parseNumber(numericCells[1]),
            realisasiSem1: parseNumber(numericCells[2]),
            realisasiSem2: parseNumber(numericCells[3]),
          });
        }
      }
    }

    if (resumeRowIndex >= 0) {
      // Determine max criteria based on sheet type
      const maxCriteria = activeSheet === "k3" ? 7 : 8;

      // Parse criteria after the RESUME header (skip header row)
      for (
        let i = resumeRowIndex + 2;
        i < resumeRowIndex + 2 + maxCriteria && i < lines.length;
        i++
      ) {
        const cells = parseCSVLine(lines[i]);

        // Check if this is a valid criteria row
        const no = parseInt(cells[0]);
        if (!isNaN(no) && no >= 1 && no <= maxCriteria && cells.length >= 6) {
          const name = cells[1] || "";
          if (name.trim() !== "") {
            summary.push({
              no,
              name,
              targetSem1: parseNumber(cells[2]),
              targetSem2: parseNumber(cells[3]),
              realisasiSem1: parseNumber(cells[4]),
              realisasiSem2: parseNumber(cells[5]),
            });
          }
        }
      }
    }

    // Extract data based on sheet type with correct row indices (0-based)
    if (activeSheet === "k3") {
      // K3 Sheet Structure:
      // Row 34 (index 33): Nilai Akhir - columns C and D (indices 2 and 3)
      // Row 35 (index 34): Target PLN Pusat - columns C and D (indices 2 and 3)
      // Row 37 (index 36): Pencapaian Semester 1 - column F (index 5)
      // Row 38 (index 37): Pencapaian Semester 2 - column F (index 5)

      if (lines.length > 33) {
        const cells34 = parseCSVLine(lines[33]); // Row 34
        if (cells34[1]?.toLowerCase().includes("nilai akhir")) {
          nilaiAkhirSem1 = parseNumber(cells34[2]); // Column C
          nilaiAkhirSem2 = parseNumber(cells34[3]); // Column D
        }
      }

      if (lines.length > 34) {
        const cells35 = parseCSVLine(lines[34]); // Row 35
        if (cells35[1]?.toLowerCase().includes("target pln pusat")) {
          targetPlnSem1 = parseNumber(cells35[2]); // Column C
          targetPlnSem2 = parseNumber(cells35[3]); // Column D
        }
      }

      if (lines.length > 36) {
        const cells37 = parseCSVLine(lines[36]); // Row 37
        if (cells37[4]?.toLowerCase().includes("semester 1")) {
          pencapaianSem1 = parseNumber(cells37[5]); // Column F
        }
      }

      if (lines.length > 37) {
        const cells38 = parseCSVLine(lines[37]); // Row 38
        if (cells38[4]?.toLowerCase().includes("semester 2")) {
          pencapaianSem2 = parseNumber(cells38[5]); // Column F
        }
      }
    } else if (activeSheet === "kam") {
      // KAM Sheet Structure:
      // Row 37 (index 36): Nilai Akhir - columns C and D (indices 2 and 3)
      // Row 38 (index 37): Target PLN Pusat - columns C and D (indices 2 and 3)
      // Row 40 (index 39): Pencapaian Semester 1 - column F (index 5)
      // Row 41 (index 40): Pencapaian Semester 2 - column F (index 5)

      if (lines.length > 36) {
        const cells37 = parseCSVLine(lines[36]); // Row 37
        if (cells37[1]?.toLowerCase().includes("nilai akhir")) {
          nilaiAkhirSem1 = parseNumber(cells37[2]); // Column C
          nilaiAkhirSem2 = parseNumber(cells37[3]); // Column D
        }
      }

      if (lines.length > 37) {
        const cells38 = parseCSVLine(lines[37]); // Row 38
        if (cells38[1]?.toLowerCase().includes("target pln pusat")) {
          targetPlnSem1 = parseNumber(cells38[2]); // Column C
          targetPlnSem2 = parseNumber(cells38[3]); // Column D
        }
      }

      if (lines.length > 39) {
        const cells40 = parseCSVLine(lines[39]); // Row 40
        if (cells40[4]?.toLowerCase().includes("semester 1")) {
          pencapaianSem1 = parseNumber(cells40[5]); // Column F
        }
      }

      if (lines.length > 40) {
        const cells41 = parseCSVLine(lines[40]); // Row 41
        if (cells41[4]?.toLowerCase().includes("semester 2")) {
          pencapaianSem2 = parseNumber(cells41[5]); // Column F
        }
      }
    }

    // Calculate averages for criteria that have sub-criteria
    const updatedSummary = calculateAveragesForCriteria(summary, details);

    setSummaryData(updatedSummary);
    setDetailData(details);

    // Set total achievement (Nilai Akhir)
    setTotalAchievement({
      sem1: nilaiAkhirSem1,
      sem2: nilaiAkhirSem2,
    });

    // Set pencapaian percentages
    setPencapaianPercentages({
      sem1: pencapaianSem1,
      sem2: pencapaianSem2,
    });

    // Set Target PLN Pusat
    setTargetPlnPusat({
      sem1: targetPlnSem1,
      sem2: targetPlnSem2,
    });
  };

  const parseApiData = (rows: string[][]) => {
    // Parse summary data from RESUME section
    const summary: CriteriaData[] = [];
    let pencapaianSem1 = 0;
    let pencapaianSem2 = 0;
    let targetPlnSem1 = 0;
    let targetPlnSem2 = 0;
    let nilaiAkhirSem1 = 0;
    let nilaiAkhirSem2 = 0;

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

    // Parse action plan details first
    const details: { [key: number]: ActionPlanData[] } = {};

    for (let i = 1; i < rows.length; i++) {
      // Start from row 1 to skip header
      if (resumeRowIndex > 0 && i >= resumeRowIndex) break; // Stop when we reach RESUME section

      const row = rows[i];
      if (row && row.length >= 6) {
        let subNo = row[0]?.toString().trim().replace(",", ".");
        if (subNo && /^\d+\.\d+$/.test(subNo)) {
          const mainNo = parseInt(subNo.split(".")[0]);

          if (!details[mainNo]) {
            details[mainNo] = [];
          }

          // Enhanced action plan parsing
          let actionPlan = row[1]?.toString() || "";

          // Check for action plans that might span multiple columns
          for (let j = 2; j < row.length; j++) {
            const cellValue = row[j]?.toString().trim();
            if (cellValue && isNaN(parseFloat(cellValue.replace(",", ".")))) {
              actionPlan += " " + cellValue;
            } else {
              break;
            }
          }

          // Find numeric columns
          const numericCells = row.slice(1).filter((cell) => {
            const val = cell?.toString().trim();
            return val && !isNaN(parseFloat(val.replace(",", ".")));
          });

          if (numericCells.length >= 4) {
            details[mainNo].push({
              subNo,
              actionPlan: actionPlan.trim(),
              targetSem1: parseNumber(numericCells[0]),
              targetSem2: parseNumber(numericCells[1]),
              realisasiSem1: parseNumber(numericCells[2]),
              realisasiSem2: parseNumber(numericCells[3]),
            });
          }
        }
      }
    }

    if (resumeRowIndex >= 0) {
      // Determine max criteria based on sheet type
      const maxCriteria = activeSheet === "k3" ? 7 : 8;

      // Parse criteria after the RESUME header
      for (
        let i = resumeRowIndex + 2;
        i < resumeRowIndex + 2 + maxCriteria && i < rows.length;
        i++
      ) {
        const row = rows[i];
        if (row && row.length >= 6) {
          const no = parseInt(row[0]);

          if (!isNaN(no) && no >= 1 && no <= maxCriteria) {
            const name = row[1]?.toString() || "";
            if (name.trim() !== "") {
              summary.push({
                no,
                name,
                targetSem1: parseNumber(row[2]),
                targetSem2: parseNumber(row[3]),
                realisasiSem1: parseNumber(row[4]),
                realisasiSem2: parseNumber(row[5]),
              });
            }
          }
        }
      }
    }

    // Extract data based on sheet type with correct row indices (0-based)
    if (activeSheet === "k3") {
      // K3 Sheet Structure
      if (rows.length > 33 && rows[33]) {
        if (rows[33][1]?.toString().toLowerCase().includes("nilai akhir")) {
          nilaiAkhirSem1 = parseNumber(rows[33][2]);
          nilaiAkhirSem2 = parseNumber(rows[33][3]);
        }
      }

      if (rows.length > 34 && rows[34]) {
        if (
          rows[34][1]?.toString().toLowerCase().includes("target pln pusat")
        ) {
          targetPlnSem1 = parseNumber(rows[34][2]);
          targetPlnSem2 = parseNumber(rows[34][3]);
        }
      }

      if (rows.length > 36 && rows[36]) {
        if (rows[36][4]?.toString().toLowerCase().includes("semester 1")) {
          pencapaianSem1 = parseNumber(rows[36][5]);
        }
      }

      if (rows.length > 37 && rows[37]) {
        if (rows[37][4]?.toString().toLowerCase().includes("semester 2")) {
          pencapaianSem2 = parseNumber(rows[37][5]);
        }
      }
    } else if (activeSheet === "kam") {
      // KAM Sheet Structure
      if (rows.length > 36 && rows[36]) {
        if (rows[36][1]?.toString().toLowerCase().includes("nilai akhir")) {
          nilaiAkhirSem1 = parseNumber(rows[36][2]);
          nilaiAkhirSem2 = parseNumber(rows[36][3]);
        }
      }

      if (rows.length > 37 && rows[37]) {
        if (
          rows[37][1]?.toString().toLowerCase().includes("target pln pusat")
        ) {
          targetPlnSem1 = parseNumber(rows[37][2]);
          targetPlnSem2 = parseNumber(rows[37][3]);
        }
      }

      if (rows.length > 39 && rows[39]) {
        if (rows[39][4]?.toString().toLowerCase().includes("semester 1")) {
          pencapaianSem1 = parseNumber(rows[39][5]);
        }
      }

      if (rows.length > 40 && rows[40]) {
        if (rows[40][4]?.toString().toLowerCase().includes("semester 2")) {
          pencapaianSem2 = parseNumber(rows[40][5]);
        }
      }
    }

    // Calculate averages for criteria that have sub-criteria
    const updatedSummary = calculateAveragesForCriteria(summary, details);

    setSummaryData(updatedSummary);
    setDetailData(details);

    // Set total achievement (Nilai Akhir)
    setTotalAchievement({
      sem1: nilaiAkhirSem1,
      sem2: nilaiAkhirSem2,
    });

    // Set pencapaian percentages
    setPencapaianPercentages({
      sem1: pencapaianSem1,
      sem2: pencapaianSem2,
    });

    // Set Target PLN Pusat
    setTargetPlnPusat({
      sem1: targetPlnSem1,
      sem2: targetPlnSem2,
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

  // Show loading state
  if (loading) {
    return (
      <DefaultLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-[#145C72]"></div>
            <p className="mt-4 text-[#145C72] text-sm md:text-base">
              Loading data...
            </p>
          </div>
        </div>
      </DefaultLayout>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Semester 1 Card */}
          <div className="bg-[#CDE9ED] p-6 px-10 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div>
              <p className="text-xl font-bold mb-4 text-[#145C72]">
                Semester 1 - {currentYear}
              </p>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-white">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Target PLN Pusat
                    </p>
                    <p className="text-xlfont-semibold text-gray-900">
                      {targetPlnPusat.sem1.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-white">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#145C72]">
                      Pencapaian
                    </p>
                    <p className="text-xl font-semibold text-[#145C72]">
                      {totalAchievement.sem1.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#145C72] transition-all"
                  style={{ width: `${pencapaianPercentages.sem1}%` }}
                ></div>
              </div>
              <p className="text-xl font-medium text-[#145C72] mt-1">
                {pencapaianPercentages.sem1.toFixed(2)}%
              </p>
            </div>
          </div>
          {/* Semester 2 Card */}
          <div className="bg-[#CDE9ED] p-6 px-10 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div>
              <p className="text-xl font-bold mb-4 text-[#145C72]">
                Semester 2 - {currentYear}
              </p>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-white">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Target PLN Pusat
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {targetPlnPusat.sem2.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-white">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#145C72]">
                      Pencapaian
                    </p>
                    <p className="text-xl font-semibold text-[#145C72]">
                      {totalAchievement.sem2.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#145C72] transition-all"
                  style={{ width: `${pencapaianPercentages.sem2}%` }}
                ></div>
              </div>
              <p className="text-xl font-medium text-[#145C72] mt-1">
                {pencapaianPercentages.sem2.toFixed(2)}%
              </p>
            </div>
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
                    Target Semester 1 (Avg)
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Target Semester 2 (Avg)
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Realisasi Semester 1 (Avg)
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Realisasi Semester 2 (Avg)
                  </th>
                  <th className="px-6 py-3 text-center text-xs  uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-[#145C72] ">
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
                      <tr className=" border-1 border-[#145C72]">
                        <td colSpan={7} className="px-0 py-0 ">
                          <table className="min-w-full divide-y divide-gray-200 text-[#145C72] ">
                            <thead className="bg-gray-50 font-bold">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs uppercase">
                                  No Kriteria
                                </th>
                                <th className="px-6 py-3 text-left text-xs uppercase">
                                  Action Plan
                                </th>
                                <th className="px-6 py-3 text-center text-xs uppercase">
                                  Target Semester 1
                                </th>
                                <th className="px-6 py-3 text-center text-xs uppercase">
                                  Target Semester 2
                                </th>
                                <th className="px-6 py-3 text-center text-xs uppercase">
                                  Realisasi Semester 1
                                </th>
                                <th className="px-6 py-3 text-center text-xs uppercase">
                                  Realisasi Semester 2
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-[#145C72]">
                              {detailData[item.no].map((detail, index) => (
                                <tr
                                  key={detail.subNo}
                                  className={`${
                                    index % 2 === 0 ? "bg-white" : "bg-white"
                                  } hover:bg-blue-50`}
                                >
                                  <td className="px-6 py-4 text-sm font-medium">
                                    {detail.subNo}
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    {detail.actionPlan}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm">
                                    {detail.targetSem1.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm">
                                    {detail.targetSem2.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        detail.realisasiSem1 >=
                                        detail.targetSem1
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {detail.realisasiSem1.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        detail.realisasiSem2 >=
                                        detail.targetSem2
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {detail.realisasiSem2.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
