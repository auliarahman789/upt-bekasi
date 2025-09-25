import React, { useState, useEffect, useRef } from "react";
import { X, Menu } from "lucide-react";

type TowerData = {
  id: string;
  unitName: string;
  latitude: number;
  longitude: number;
  towerType: string;
  voltage: number;
  operationYear: number;
  locationName: string;
  penghantar: string;
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

  // Mobile responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletLoadedRef = useRef(false);

  // Filter states
  const [voltageFilter, setVoltageFilter] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ---------------- GOOGLE AUTH HELPERS ----------------
  const getAccessToken = async (): Promise<string> => {
    const res = await fetch("/api/google-token");
    if (!res.ok) throw new Error("Failed to fetch token");
    const { accessToken } = await res.json();
    return accessToken;
  };

  const fetchSheetData = async (): Promise<TowerData[]> => {
    const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID!;
    const gid = import.meta.env.VITE_GOOGLE_SHEET_GID!;
    const accessToken = await getAccessToken();

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
    const csvText = await res.text();
    const jsonData = parseCSVData(csvText);
    return processExcelData(jsonData);
  };
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show sidebar
      if (!mobile) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // ---------------- CSV HELPERS ----------------
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
        const lat = findColumnValue(row, ["LOCK LAT", "Latitude", "LAT"]);
        const lng = findColumnValue(row, ["LOCK LONG", "Longitude", "LONG"]);
        const location = findColumnValue(row, ["Nama Lokasi", "Location"]);
        return lat && lng && location;
      })
      .map((row, index) => {
        const latStr = findColumnValue(row, ["LOCK LAT", "Latitude", "LAT"]);
        const lngStr = findColumnValue(row, ["LOCK LONG", "Longitude", "LONG"]);
        const location = findColumnValue(row, ["Nama Lokasi", "Location"]);
        const voltage = findColumnValue(row, ["Tegangan", "Voltage", "KV"]);
        const towerType = findColumnValue(row, ["TIPE", "Tower Type"]);
        const unit = findColumnValue(row, ["Unit", "Unit Name", "No"]);
        const substation = findColumnValue(row, ["Gardu Induk", "Substation"]);
        const region = findColumnValue(row, ["KOTA/KAB", "Region", "Wilayah"]);
        const status = findColumnValue(row, ["Status Operasi", "Status"]);
        const functloc = findColumnValue(row, ["IdFunctloc", "FUNCTLOC", "ID"]);
        const penghantar = findColumnValue(row, ["Penghantar"]);

        const latitude = parseFloat(latStr.replace(",", ".")) || 0;
        const longitude = parseFloat(lngStr.replace(",", ".")) || 0;
        const voltageNum = parseInt(voltage.replace(/[^0-9]/g, "")) || 0;

        return {
          id: functloc || `tower-${index}`,
          unitName: cleanString(unit || "Unknown Unit"),
          latitude,
          longitude,
          towerType: cleanString(towerType || "Unknown"),
          penghantar: penghantar,
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

  useEffect(() => {
    const loadTowers = async () => {
      setIsLoading(true);
      setError("");
      setLoadingProgress("Fetching data from Google Sheets...");
      try {
        const towersData = await fetchSheetData();
        setTowers(towersData);
        setFilteredTowers(towersData);
        setLoadingProgress("");
      } catch (err: any) {
        setError(err.message);
        setLoadingProgress("");
      } finally {
        setIsLoading(false);
      }
    };
    if (towers.length === 0) loadTowers();
  }, []);

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
        let color = "#22c55e";
        let size = 20;
        let iconSvg = "/towerunder70kv.svg";

        if (voltage >= 500) {
          color = "#3b82f6";
          size = 24;
          iconSvg = "/tower500kv.svg";
        } else if (voltage >= 150) {
          color = "#f59e0b";
          size = 22;
          iconSvg = "/tower150kv.svg";
        } else if (voltage >= 70) {
          color = "#ef4444";
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
            if (isMobile) {
              setShowSidebar(true);
            }
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
  }, [filteredTowers, isMobile]);

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

  // Filter Component
  const FilterComponent = ({ isInSidebar = false }) => (
    <div className={`space-y-3 ${isInSidebar ? "" : "p-4"}`}>
      {/* Search Input */}
      <div>
        <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
          Cari Tower
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari berdasarkan lokasi, unit, gardu..."
            defaultValue={searchQuery}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchQuery((e.target as HTMLInputElement).value);
              }
            }}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-full text-sm focus:outline-none bg-[#CDE9ED] focus:ring-2 focus:ring-teal-500"
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
        className="w-full mt-2 bg-white hover:bg-[#179FB7] hover:text-white text-[#179FB7] py-2 px-4 rounded-full border-2 border-[#179FB7] text-sm font-bold transition-colors"
      >
        HAPUS FILTER
      </button>
    </div>
  );

  // Sidebar content component
  const SidebarContent = () => (
    <>
      {selectedTower ? (
        /* Tower Detail Panel */
        <div className="p-4 h-full z-9999">
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
                onClick={() => {
                  setSelectedTower(null);
                  if (isMobile) {
                    setShowSidebar(false);
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4 rounded-full bg-red-500 text-white font-bold" />
              </button>
            </div>

            {/* Detail Fields */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {/* Level Tegangan */}
              <div>
                <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                  Level Tegangan
                </label>
                <div
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                  className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                >
                  {selectedTower.unitName}
                </div>
              </div>

              {/* Ruas Penghantar */}
              <div>
                <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                  Ruas Penghantar
                </label>
                <div
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                  className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                >
                  {selectedTower.penghantar}
                </div>
              </div>

              {/* Gardu */}
              <div>
                <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                  Gardu
                </label>
                <div
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                  className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                >
                  {selectedTower.latitude.toFixed(6)},{" "}
                  {selectedTower.longitude.toFixed(6)}
                </div>
              </div>

              {/* No Sertifikat */}
              <div>
                <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                  Nomor Sertifikat Tower
                </label>
                <div
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                  className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                >
                  0329847609348678093
                </div>
              </div>

              {/* Luas Tanah */}
              <div>
                <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                  Luas Tanah (M³)
                </label>
                <div
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                  className=" text-white px-3 py-2 rounded-full text-sm font-medium"
                >
                  500000098
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
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
                className="flex w-full hover:bg-teal-700 text-white py-2 px-4 rounded-full font-medium transition-colors"
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
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
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
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
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

          {/* Filter Section in Sidebar */}
          <div className="py-[28px] space-y-2">
            <div className="flex items-center space-x-2 mb-3 justify-center">
              <span className="text-sm font-bold text-[#145C72]">FILTER</span>
            </div>
            <FilterComponent isInSidebar={true} />
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
                onClick={fetchSheetData}
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
                onClick={fetchSheetData}
                className="mt-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors"
              >
                Muat Data
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="w-full min-h-screen p-4">
      <div className="rounded-lg w-full min-h-[550px] flex flex-col">
        {/* Mobile Filter Bar - Top of map on mobile */}
        {isMobile && (
          <div className="mb-2">
            <div
              className={`bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-300 ${
                showFilters ? "mb-2" : ""
              }`}
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <span className="text-sm font-bold text-[#145C72]">
                  FILTER & PENCARIAN
                </span>
                <div
                  className={`transform transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-[#145C72]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {showFilters && (
                <div className="border-t border-gray-200">
                  <FilterComponent />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`flex flex-1 overflow-hidden ${
            isMobile ? "flex-col" : "flex-row space-x-2"
          }`}
        >
          {/* Desktop Sidebar - Always visible on desktop */}
          {!isMobile && (
            <div className="w-80 border-1 border-neutral-200 flex flex-col p-1 rounded-2xl">
              <SidebarContent />
            </div>
          )}

          {/* Mobile Sidebar - Overlay */}
          {isMobile && showSidebar && (
            <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex">
              <div className="bg-white w-80 h-full overflow-y-auto border-r border-neutral-200 rounded-r-2xl">
                <SidebarContent />
              </div>
              <div className="flex-1" onClick={() => setShowSidebar(false)} />
            </div>
          )}

          {/* Map Container */}
          <div
            className={`${
              isMobile ? "flex-1" : "flex-1"
            } relative rounded-2xl overflow-hidden`}
          >
            {/* Map */}

            <div
              ref={mapContainerRef}
              className={
                isMobile
                  ? selectedTower
                    ? "hidden"
                    : "w-full h-full bg-gray-100"
                  : "w-full h-full bg-gray-100"
              }
              style={{
                minHeight: "550px",
                maxHeight: isMobile ? "calc(100vh - 200px)" : "550px",
              }}
            />

            {/* Mobile Menu Button - Only menu button on mobile now */}
            {isMobile && (
              <div className="absolute top-4 left-4 z-[50]">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg border border-gray-200"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetaTower;
