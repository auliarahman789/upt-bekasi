import React, { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";

type TowerData = {
  id: string;
  unitName: string;
  latitude: number;
  longitude: number;
  towerType: string;
  voltage: number;
  operationYear: number;
  locationName: string;
  substation: string;
  region: string;
  status: string;
};

const PetaTower: React.FC = ({}) => {
  const [towers, setTowers] = useState<TowerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingProgress, setLoadingProgress] = useState("");
  const [selectedTower, setSelectedTower] = useState<TowerData | null>(null);
  const [filteredTowers, setFilteredTowers] = useState<TowerData[]>([]);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletLoadedRef = useRef(false);

  // Filter states
  const [voltageFilter, setVoltageFilter] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get API credentials from environment
  const apiKey = import.meta.env.VITE_API_LINK_KEY || "";
  const folderId = import.meta.env.VITE_API_LINK_ID || "";

  // Initialize Leaflet map
  useEffect(() => {
    const loadLeaflet = async () => {
      if (leafletLoadedRef.current && mapRef.current) {
        return;
      }

      if (!document.querySelector('link[href*="leaflet"]')) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
        document.head.appendChild(cssLink);
      }

      if (!(window as any).L) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
        script.onload = () => {
          leafletLoadedRef.current = true;
          setTimeout(initMap, 100);
        };
        script.onerror = () => {
          setError("Failed to load Leaflet library");
        };
        document.head.appendChild(script);
      } else {
        leafletLoadedRef.current = true;
        initMap();
      }
    };

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || mapRef.current) return;

      try {
        const mapInstance = L.map(mapContainerRef.current, {
          center: [-6.4, 107.17], // Bekasi, Indonesia
          zoom: 11,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(mapInstance);

        mapRef.current = mapInstance;
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize map");
      }
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Helper functions from original code
  const findColumnValue = (row: any, possibleNames: string[]): string => {
    for (const name of possibleNames) {
      if (
        row[name] !== undefined &&
        row[name] !== null &&
        String(row[name]).trim() !== ""
      ) {
        return String(row[name]).trim();
      }
    }

    for (const name of possibleNames) {
      for (const key of Object.keys(row)) {
        if (
          key.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(key.toLowerCase())
        ) {
          if (
            row[key] !== undefined &&
            row[key] !== null &&
            String(row[key]).trim() !== ""
          ) {
            return String(row[key]).trim();
          }
        }
      }
    }
    return "";
  };

  const cleanString = (value: string, maxLength: number = 50): string => {
    if (!value || typeof value !== "string") return "";
    let cleaned = value.replace(/,+/g, ",").replace(/^,|,$/g, "");
    if (cleaned.length > maxLength && cleaned.includes(",")) {
      const parts = cleaned.split(",");
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed && trimmed.length > 3 && trimmed.length < maxLength) {
          return trimmed;
        }
      }
      return parts[0].trim();
    }
    return cleaned.length > maxLength
      ? cleaned.substring(0, maxLength) + "..."
      : cleaned;
  };

  const parseCSVData = (csvText: string): any[] => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const firstLine = lines[0];
    const separator = firstLine.includes("\t") ? "\t" : ",";
    const headers = firstLine
      .split(separator)
      .map((h) => h.trim().replace(/"/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(separator)
        .map((v) => v.trim().replace(/"/g, ""));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      data.push(row);
    }
    return data;
  };

  const processExcelData = (rawData: any[]): TowerData[] => {
    return rawData
      .filter((row) => {
        const lat = findColumnValue(row, [
          "LOCK LAT",
          "Latitude",
          "LAT",
          "Lock Lat",
        ]);
        const lng = findColumnValue(row, [
          "LOCK LONG",
          "LOCK LON",
          "Longitude",
          "LONG",
          "LON",
          "Lock Long",
        ]);
        const location = findColumnValue(row, [
          "Nama Lokasi",
          "NAMA LOKASI",
          "Location",
          "LOKASI",
        ]);
        return lat && lng && location;
      })
      .map((row, index) => {
        const latStr = findColumnValue(row, [
          "LOCK LAT",
          "Latitude",
          "LAT",
          "Lock Lat",
        ]);
        const lngStr = findColumnValue(row, [
          "LOCK LONG",
          "LOCK LON",
          "Longitude",
          "LONG",
          "LON",
          "Lock Long",
        ]);
        const location = findColumnValue(row, [
          "Nama Lokasi",
          "NAMA LOKASI",
          "Location",
          "LOKASI",
          "KOTA/KAB",
        ]);
        const voltage = findColumnValue(row, [
          "Tegangan",
          "TEGANGAN",
          "Voltage",
          "KV",
        ]);
        const towerType = findColumnValue(row, [
          "TIPE",
          "TIPE TOWER",
          "Type",
          "Tower Type",
        ]);
        const unit = findColumnValue(row, ["Unit", "UNIT", "Unit Name", "No"]);
        const substation = findColumnValue(row, [
          "Gardu Induk",
          "GARDU INDUK",
          "Substation",
          "GI",
        ]);
        const region = findColumnValue(row, [
          "KOTA/KAB",
          "KOTA",
          "Region",
          "Wilayah",
          "KAB",
          "KABUPATEN",
        ]);
        const status = findColumnValue(row, [
          "Status Operasi",
          "STATUS",
          "Status",
          "Operasi",
        ]);
        const functloc = findColumnValue(row, [
          "IdFunctloc",
          "FUNCTLOC",
          "ID",
          "Functloc",
        ]);

        const latitude = parseFloat(latStr.replace(",", ".")) || 0;
        const longitude = parseFloat(lngStr.replace(",", ".")) || 0;
        const voltageNum = parseInt(voltage.replace(/[^0-9]/g, "")) || 0;

        return {
          id: functloc || `tower-${index}`,
          unitName: cleanString(unit || "Unknown Unit"),
          latitude,
          longitude,
          towerType: cleanString(towerType || "Unknown"),
          voltage: voltageNum,
          operationYear: 0,
          locationName: cleanString(location || "Unknown Location"),
          substation: cleanString(substation || "Unknown Substation", 80),
          region: cleanString(region || "Unknown Region"),
          status: cleanString(status || "Unknown Status"),
        };
      })
      .filter((tower) => {
        return (
          tower.latitude !== 0 &&
          tower.longitude !== 0 &&
          !isNaN(tower.latitude) &&
          !isNaN(tower.longitude) &&
          Math.abs(tower.latitude) > 0.1 &&
          Math.abs(tower.longitude) > 0.1 &&
          tower.latitude >= -90 &&
          tower.latitude <= 90 &&
          tower.longitude >= -180 &&
          tower.longitude <= 180
        );
      });
  };

  const downloadAndParseExcel = async (fileId: string, fileName: string) => {
    try {
      setLoadingProgress(`Processing ${fileName}...`);
      const csvResponse = await fetch(
        `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv&key=${apiKey}`
      );

      if (!csvResponse.ok) {
        throw new Error(
          `Failed to download ${fileName}: ${csvResponse.status}`
        );
      }

      const csvText = await csvResponse.text();
      const jsonData = parseCSVData(csvText);
      return processExcelData(jsonData);
    } catch (error: any) {
      console.error(`Error processing ${fileName}:`, error);
      throw error;
    }
  };

  const fetchGoogleDriveFiles = async () => {
    if (!apiKey || !folderId) {
      setError(
        "API Key and Folder ID must be configured in environment variables"
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setLoadingProgress("Connecting to Google Drive...");

    try {
      const testResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}?key=${apiKey}&fields=id,name`
      );

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        throw new Error(
          `API Test Failed (${testResponse.status}): ${
            errorData.error?.message || "Invalid API key or folder access"
          }`
        );
      }

      setLoadingProgress("Fetching Excel files list...");
      const query = encodeURIComponent(
        `'${folderId}' in parents and (name contains '.xlsx' or name contains '.xls')`
      );
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&key=${apiKey}&fields=files(id,name,mimeType,size)`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP ${response.status}: ${
            errorData.error?.message || "Request failed"
          }`
        );
      }

      const result = await response.json();
      const excelFiles = result.files || [];

      if (excelFiles.length === 0) {
        setError("No Excel files found in the specified folder");
        setIsLoading(false);
        return;
      }

      setLoadingProgress(
        `Found ${excelFiles.length} Excel files. Processing...`
      );
      let allTowers: TowerData[] = [];

      for (let i = 0; i < excelFiles.length; i++) {
        const file = excelFiles[i];
        setLoadingProgress(
          `Processing ${file.name} (${i + 1}/${excelFiles.length})...`
        );

        try {
          const fileTowers = await downloadAndParseExcel(file.id, file.name);
          allTowers = [...allTowers, ...fileTowers];
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
        }
      }

      setTowers(allTowers);
      setFilteredTowers(allTowers);
      setLoadingProgress("");

      if (allTowers.length === 0) {
        setError("No valid tower data found in Excel files.");
      }
    } catch (error: any) {
      setError(`Error: ${error.message}`);
      setLoadingProgress("");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load data on component mount
  useEffect(() => {
    if (apiKey && folderId && towers.length === 0) {
      fetchGoogleDriveFiles();
    }
  }, [apiKey, folderId]);

  // Apply filters - FIXED VERSION
  useEffect(() => {
    let filtered = [...towers];

    // Search filter - case insensitive and trimmed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((tower) => {
        const searchFields = [
          tower.locationName || "",
          tower.unitName || "",
          tower.substation || "",
          tower.region || "",
          tower.towerType || "",
          tower.status || "",
          tower.id || "",
        ];

        return searchFields.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    // Voltage filter - fixed logic
    if (voltageFilter.trim()) {
      filtered = filtered.filter((tower) => {
        const voltage = tower.voltage || 0;
        switch (voltageFilter) {
          case "500+":
            return voltage >= 500;
          case "150-499":
            return voltage >= 150 && voltage < 500;
          case "70-149":
            return voltage >= 70 && voltage < 150;
          case "<70":
            return voltage > 0 && voltage < 70;
          default:
            return true;
        }
      });
    }

    // Region filter - exact match with case insensitive
    if (regionFilter.trim()) {
      filtered = filtered.filter(
        (tower) =>
          (tower.region || "").toLowerCase() === regionFilter.toLowerCase()
      );
    }

    // Status filter - exact match with case insensitive
    if (statusFilter.trim()) {
      filtered = filtered.filter(
        (tower) =>
          (tower.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredTowers(filtered);
  }, [towers, searchQuery, voltageFilter, regionFilter, statusFilter]);

  // Update markers when filtered towers change
  useEffect(() => {
    if (!mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    try {
      markersRef.current.forEach((marker) => {
        try {
          if (mapRef.current && marker) {
            mapRef.current.removeLayer(marker);
          }
        } catch (e) {
          console.warn("Error removing marker:", e);
        }
      });
      markersRef.current = [];

      if (filteredTowers.length === 0) return;

      const createTowerIcon = (voltage: number) => {
        let color = "#22c55e"; // Green for <70kV
        let size = 20;
        let iconSvg = "/towerunder70kv.svg"; // Default icon

        if (voltage >= 500) {
          color = "#3b82f6"; // Blue for 500kV+
          size = 24;
          iconSvg = "/tower500kv.svg";
        } else if (voltage >= 150) {
          color = "#f59e0b"; // Orange for 150-499kV
          size = 22;
          iconSvg = "/tower150kv.svg";
        } else if (voltage >= 70) {
          color = "#ef4444"; // Red for 70-149kV
          size = 21;
          iconSvg = "/tower70kv.svg";
        } else {
          iconSvg = "/towerunder70kv.svg";
        }

        return L.divIcon({
          html: `
      <div style="
        background-color: white;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid ${color};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
      ">
        <img src="${iconSvg}" style="width: ${size - 8}px; height: ${
            size - 8
          }px; object-fit: contain;" />
      </div>
    `,
          className: "custom-tower-marker",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      };

      const newMarkers: any[] = [];
      filteredTowers.forEach((tower) => {
        try {
          const marker = L.marker([tower.latitude, tower.longitude], {
            icon: createTowerIcon(tower.voltage),
          });

          marker.on("click", () => {
            setSelectedTower(tower);
          });

          marker.bindTooltip(
            `<div style="padding: 8px;">
              <strong>${tower.locationName}</strong><br/>
              ${tower.voltage}kV ${tower.towerType}<br/>
              Substation: ${tower.substation}
            </div>`,
            { direction: "top", offset: [0, -10] }
          );

          marker.addTo(mapRef.current);
          newMarkers.push(marker);
        } catch (e) {
          console.warn("Error creating marker:", e);
        }
      });

      markersRef.current = newMarkers;

      if (filteredTowers.length > 0) {
        try {
          const validTowers = filteredTowers.filter(
            (tower) =>
              tower.latitude &&
              tower.longitude &&
              !isNaN(tower.latitude) &&
              !isNaN(tower.longitude) &&
              Math.abs(tower.latitude) > 0.1 &&
              Math.abs(tower.longitude) > 0.1
          );

          if (validTowers.length > 0) {
            const latLngs = validTowers.map((tower) => [
              tower.latitude,
              tower.longitude,
            ]);
            const bounds = L.latLngBounds(latLngs);
            if (bounds.isValid()) {
              mapRef.current.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 13,
              });
            }
          }
        } catch (e) {
          console.warn("Error fitting bounds:", e);
        }
      }
    } catch (err) {
      console.error("Error updating markers:", err);
    }
  }, [filteredTowers]);

  // Get unique values for filters - FIXED VERSION
  const getUniqueRegions = () => {
    const regions = towers
      .map((t) => t.region)
      .filter((region) => region && region.trim() !== "")
      .filter((region, index, array) => array.indexOf(region) === index)
      .sort();
    return regions;
  };

  const getUniqueStatuses = () => {
    const statuses = towers
      .map((t) => t.status)
      .filter((status) => status && status.trim() !== "")
      .filter((status, index, array) => array.indexOf(status) === index)
      .sort();
    return statuses;
  };

  // Get tower counts by voltage - FIXED VERSION
  const getTowerCounts = () => {
    const counts = {
      total: filteredTowers.length,
      "500+": filteredTowers.filter((t) => t.voltage >= 500).length,
      "150-499": filteredTowers.filter(
        (t) => t.voltage >= 150 && t.voltage < 500
      ).length,
      "70-149": filteredTowers.filter((t) => t.voltage >= 70 && t.voltage < 150)
        .length,
      "<70": filteredTowers.filter((t) => t.voltage > 0 && t.voltage < 70)
        .length,
    };
    return counts;
  };

  const counts = getTowerCounts();

  return (
    <div className="w-full  min-h-screen  p-4">
      <div className=" rounded-lg w-full max-h-[550px]  flex flex-col">
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden space-x-2">
          {/* Sidebar */}
          <div className="w-80 border-1 border-neutral-200 flex flex-col p-1 rounded-2xl">
            {selectedTower ? (
              /* Tower Detail Panel */
              <div className="p-4 h-full">
                <div className="bg-white p-1 h-full flex flex-col">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {selectedTower.locationName}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedTower(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tower ID
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">
                      #{selectedTower.id}
                    </span>
                  </div> */}

                  {/* Detail Fields */}
                  <div className="space-y-2 flex-1">
                    {/* Level Tegangan */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Level Tegangan
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedTower.voltage}kV
                      </div>
                    </div>

                    {/* Jenis Tower */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Jenis Tower
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedTower.towerType}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedTower.status}
                      </div>
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedTower.unitName}
                      </div>
                    </div>

                    {/* Gardu */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Gardu
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedTower.substation}
                      </div>
                    </div>

                    {/* Region */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Wilayah
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedTower.region}
                      </div>
                    </div>

                    {/* Koordinat */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Koordinat
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedTower.latitude.toFixed(6)},{" "}
                        {selectedTower.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps?q=${selectedTower.latitude},${selectedTower.longitude}`;
                        window.open(googleMapsUrl, "_blank");
                      }}
                      style={{
                        background:
                          "linear-gradient(to bottom, #15677B, #179FB7)",
                      }}
                      className="  flex w-full hover:bg-teal-700 text-white py-2 px-4 rounded-full font-medium transition-colors"
                    >
                      BUKA DI GOOGLE MAPS
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Legend and Filter Panel */
              <div className="p-2 space-y-3 flex flex-col h-full">
                {/* Legend Section */}
                <div className="space-y-2">
                  <div
                    style={{
                      background:
                        "linear-gradient(to bottom, #15677B, #179FB7)",
                    }}
                    className="bg-white rounded-full p-1 border items-center grid grid-cols-6 space-x-3"
                  >
                    <div>
                      <img src="/jumlahTower.svg"></img>
                    </div>
                    <span className="text-[12px] font-semibold text-white col-span-4">
                      Jumlah
                    </span>
                    <div className="bg-white rounded-full flex items-center justify-center py-1">
                      <span className="text-sm text-[#145C72] font-medium">
                        {counts.total}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      background:
                        "linear-gradient(to bottom, #15677B, #179FB7)",
                    }}
                    className="bg-white rounded-full p-1 border items-center grid grid-cols-6 space-x-3"
                  >
                    <div>
                      <img src="/tower500kv.svg"></img>
                    </div>
                    <span className="text-[12px] font-semibold text-white col-span-4">
                      TOWER SUTET 500+ kV
                    </span>
                    <div className="bg-white rounded-full flex items-center justify-center py-1">
                      <span className="text-sm text-[#145C72] font-medium">
                        {counts["500+"]}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      background:
                        "linear-gradient(to bottom, #15677B, #179FB7)",
                    }}
                    className="bg-white rounded-full p-1 border items-center grid grid-cols-6 space-x-3"
                  >
                    <div>
                      <img src="/tower150kv.svg"></img>
                    </div>
                    <span className="text-[12px] font-semibold text-white col-span-4">
                      TOWER SUTET 150-499 kV
                    </span>
                    <div className="bg-white rounded-full flex items-center justify-center py-1">
                      <span className="text-sm text-[#145C72] font-medium">
                        {counts["150-499"]}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      background:
                        "linear-gradient(to bottom, #15677B, #179FB7)",
                    }}
                    className="bg-white rounded-full p-1 border items-center grid grid-cols-6 space-x-3"
                  >
                    <div>
                      <img src="/tower70kv.svg"></img>
                    </div>
                    <span className="text-[12px] font-semibold text-white col-span-4">
                      TOWER SUTET 70-149 kV
                    </span>
                    <div className="bg-white rounded-full flex items-center justify-center py-1">
                      <span className="text-sm text-[#145C72] font-medium">
                        {counts["70-149"]}
                      </span>
                    </div>
                  </div>

                  {counts["<70"] > 0 && (
                    <div
                      style={{
                        background:
                          "linear-gradient(to bottom, #15677B, #179FB7)",
                      }}
                      className="bg-white rounded-full p-1 border items-center grid grid-cols-6 space-x-3"
                    >
                      <div>
                        <img src="/towerunder70kv.svg"></img>
                      </div>
                      <span className="text-[12px] font-semibold text-white col-span-4">
                        TOWER &lt;70 kV
                      </span>
                      <div className="bg-white rounded-full flex items-center justify-center py-1">
                        <span className="text-sm text-[#145C72] font-medium">
                          {counts["<70"]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Filter Section */}
                <div className=" py-[28px] space-y-2">
                  <div className="flex items-center space-x-2 mb-3 justify-center">
                    <span className="text-sm font-bold text-[#145C72]">
                      FILTER
                    </span>
                  </div>

                  {/* Voltage Filter */}
                  <div>
                    <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                      Level Voltase
                    </label>
                    <select
                      value={voltageFilter}
                      onChange={(e) => setVoltageFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none bg-[#CDE9ED] focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Semua Voltase</option>
                      <option value="500+">500kV+ (SUTET)</option>
                      <option value="150-499">150-499kV</option>
                      <option value="70-149">70-149kV</option>
                      <option value="<70">Under 70kV</option>
                    </select>
                  </div>

                  {/* Region Filter */}
                  <div>
                    <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                      Wilayah
                    </label>
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none bg-[#CDE9ED] focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Semua Wilayah</option>
                      {getUniqueRegions().map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none bg-[#CDE9ED] focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Semua Status</option>
                      {getUniqueStatuses().map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setVoltageFilter("");
                      setRegionFilter("");
                      setStatusFilter("");
                    }}
                    className="w-full mt-2 bg-white hover:bg-[#179FB7] hover:text-white  text-[#179FB7] py-2 px-4 rounded-full border-2 border-[#179FB7] text-sm font-bold transition-colors"
                  >
                    HAPUS FILTER
                  </button>
                </div>

                {/* Loading/Error States */}
                {isLoading && (
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-blue-600 font-medium">
                      {loadingProgress || "Loading..."}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-sm text-red-600">{error}</div>
                    <button
                      onClick={fetchGoogleDriveFiles}
                      className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}

                {!isLoading && !error && towers.length === 0 && (
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-yellow-600">
                      Tidak ada data tower. Pastikan API key dan folder ID sudah
                      dikonfigurasi.
                    </div>
                    <button
                      onClick={fetchGoogleDriveFiles}
                      className="mt-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors"
                    >
                      Muat Data
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Container with Search */}
          <div className="flex-1 relative rounded-2xl overflow-hidden">
            {/* Map */}
            <div
              ref={mapContainerRef}
              className="w-full h-full bg-gray-100"
              style={{ minHeight: "550px", maxHeight: "550px" }}
            />

            {/* Search Bar - positioned on top right of map */}
            <div className="absolute top-4 right-4 z-[1000]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari Tower..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-lg w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetaTower;
