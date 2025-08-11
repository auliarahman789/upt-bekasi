import React, { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";

type SubstationData = {
  id: string;
  namaGI: string;
  upt: string;
  jenis: string;
  tegangan: string;
  photo: string;
  sld: string;
  linkSLD: string;
  rilisSLD: string;
  namaTLJargi: string;
  kontak: string;
  kontakLink: string;
  latitude: number;
  longitude: number;
  content: string;
  pinColor: string;
};

const PetaGI: React.FC = ({}) => {
  const [substations, setSubstations] = useState<SubstationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingProgress, setLoadingProgress] = useState("");
  const [selectedSubstation, setSelectedSubstation] =
    useState<SubstationData | null>(null);
  const [filteredSubstations, setFilteredSubstations] = useState<
    SubstationData[]
  >([]);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletLoadedRef = useRef(false);

  // Filter states
  const [teganganFilter, setTeganganFilter] = useState<string>("");
  const [uptFilter, setUptFilter] = useState<string>("");
  const [jenisFilter, setJenisFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fixed sheet ID and GID
  const SHEET_ID = import.meta.env.VITE_API_LINK_SHEEID_PETA_GI || "";
  const GID = import.meta.env.VITE_API_LINK_SHEEGID_PETA_GI || "";

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

  const parseCSVData = (csvText: string): any[] => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const firstLine = lines[0];
    const separator = firstLine.includes("\t") ? "\t" : ",";

    // Better CSV parsing that handles quoted fields and numbers with commas
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      let i = 0;

      while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            current += '"';
            i += 2;
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === separator && !inQuotes) {
          // Field separator
          result.push(current.trim());
          current = "";
          i++;
        } else {
          current += char;
          i++;
        }
      }

      // Add the last field
      result.push(current.trim());

      return result.map((field) => field.replace(/^"|"$/g, "")); // Remove surrounding quotes
    };

    const headers = parseCsvLine(firstLine);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      data.push(row);
    }

    return data;
  };

  const parseCoordinate = (coordStr: string): number => {
    if (!coordStr) return 0;

    let cleaned = coordStr.toString().trim();

    // Remove spaces and commas
    cleaned = cleaned.replace(/\s+/g, "").replace(/,/g, "");

    let parsed = parseFloat(cleaned);

    if (!isNaN(parsed)) {
      // Handle negative latitude format: -6088845 -> -6.088845
      if (parsed < 0) {
        const absValue = Math.abs(parsed);
        const integerPart = Math.floor(absValue).toString();

        if (integerPart.length >= 6) {
          // Format: 6088845 -> 6.088845
          const lat = parseFloat(
            `-${integerPart.charAt(0)}.${integerPart.substring(1)}`
          );
          // Check if it's in valid Indonesia latitude range (-12 to 8)
          if (lat >= -12 && lat <= 8) {
            return parseFloat(lat.toFixed(6));
          }
        }
      }

      // Handle positive longitude format: 10700097 -> 107.00097
      else if (parsed > 0) {
        const integerPart = Math.floor(parsed).toString();

        if (integerPart.length >= 7) {
          // Format: 10700097 -> 107.00097
          const lng = parseFloat(
            `${integerPart.substring(0, 3)}.${integerPart.substring(3)}`
          );
          // Check if it's in valid Indonesia longitude range (95 to 141)
          if (lng >= 95 && lng <= 141) {
            return parseFloat(lng.toFixed(6));
          }
        }

        // Handle shorter longitude format: 1070009 -> 107.0009
        if (integerPart.length >= 6 && integerPart.length < 7) {
          const lng = parseFloat(
            `${integerPart.substring(0, 3)}.${integerPart.substring(3)}`
          );
          if (lng >= 95 && lng <= 141) {
            return parseFloat(lng.toFixed(6));
          }
        }
      }

      // If already in valid coordinate range, return as is
      if (parsed >= -180 && parsed <= 180) {
        return parsed;
      }
    }

    return 0;
  };
  const processSubstationData = (rawData: any[]): SubstationData[] => {
    // Debug: see what columns we have

    return (
      rawData
        .filter((row) => {
          // Try to find the exact column names from your spreadsheet
          const lat = row["Latitude"] || row["LATITUDE"] || row["Lat"] || "";
          const lng = row["Longitude"] || row["LONGITUDE"] || row["Long"] || "";
          const namaGI = row["Nama GI/GIS"] || "";

          return lat && lng && namaGI;
        })
        .map((row, index) => {
          // Use direct column access instead of findColumnValue
          const latStr = row["Latitude"] || row["LATITUDE"] || row["Lat"] || "";
          const lngStr =
            row["Longitude"] || row["LONGITUDE"] || row["Long"] || "";

          const latitude = parseCoordinate(latStr);
          const longitude = parseCoordinate(lngStr);

          return {
            id: row["No"] || `substation-${index}`,
            namaGI: row["Nama GI/GIS"] || "Unknown GI",
            upt: row["UPT"] || "",
            jenis: row["Jenis"] || "",
            tegangan: row["Tegangan"] || "",
            photo: row["Photo"] || "",
            sld: row["SLD"] || "",
            linkSLD: row["Link SLD"] || "",
            rilisSLD: row["Rilis SLD"] || "",
            namaTLJargi: row["Nama TL Jargi"] || "",
            kontak: row["Kontak"] || "",
            kontakLink: row["Kontak Link"] || "",
            latitude,
            longitude,
            content: row["Content"] || "",
            pinColor: row["Pin Color"] || "#22c55e",
          };
        })
        // ... rest of your filtering code
        .filter((substation) => {
          const isValidLat =
            substation.latitude >= -12 && substation.latitude <= 8;
          const isValidLng =
            substation.longitude >= 95 && substation.longitude <= 141;

          const isValid =
            !isNaN(substation.latitude) &&
            !isNaN(substation.longitude) &&
            isValidLat &&
            isValidLng &&
            substation.latitude !== 0 &&
            substation.longitude !== 0;

          return isValid;
        })
    );
  };

  const fetchGoogleSheetsData = async () => {
    setIsLoading(true);
    setError("");
    setLoadingProgress("Fetching Google Sheets data...");

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const csvText = await response.text();
      setLoadingProgress("Processing data...");

      const jsonData = parseCSVData(csvText);
      const processedData = processSubstationData(jsonData);

      setSubstations(processedData);
      setFilteredSubstations(processedData);
      setLoadingProgress("");

      if (processedData.length === 0) {
        setError("No valid substation data found.");
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
    fetchGoogleSheetsData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...substations];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((substation) => {
        const searchFields = [
          substation.namaGI || "",
          substation.upt || "",
          substation.jenis || "",
          substation.tegangan || "",
          substation.namaTLJargi || "",
          substation.id || "",
        ];

        return searchFields.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    // Tegangan filter
    if (teganganFilter.trim()) {
      filtered = filtered.filter((substation) =>
        (substation.tegangan || "")
          .toLowerCase()
          .includes(teganganFilter.toLowerCase())
      );
    }

    // UPT filter
    if (uptFilter.trim()) {
      filtered = filtered.filter(
        (substation) =>
          (substation.upt || "").toLowerCase() === uptFilter.toLowerCase()
      );
    }

    // Jenis filter
    if (jenisFilter.trim()) {
      filtered = filtered.filter(
        (substation) =>
          (substation.jenis || "").toLowerCase() === jenisFilter.toLowerCase()
      );
    }

    setFilteredSubstations(filtered);
  }, [substations, searchQuery, teganganFilter, uptFilter, jenisFilter]);

  // Update markers when filtered substations change
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

      if (filteredSubstations.length === 0) return;

      // Function to determine icon based on tegangan
      const getIconForTegangan = (tegangan: string) => {
        const teganganLower = tegangan.toLowerCase();
        if (teganganLower.includes("500")) {
          return "/tower500kv.svg";
        } else if (teganganLower.includes("150")) {
          return "/tower150kv.svg";
        } else if (teganganLower.includes("70")) {
          return "/tower70kv.svg";
        } else {
          return "/jumlahTower.svg"; // Default icon
        }
      };

      const createSubstationIcon = (pinColor: string, tegangan: string) => {
        const color = pinColor || "#22c55e";
        const iconPath = getIconForTegangan(tegangan);

        return L.divIcon({
          html: `
            <div style="
              background-color: white;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid ${color};
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <img 
                src="${iconPath}" 
                alt="substation" 
                style="
                  width: 20px; 
                  height: 20px; 
                  object-fit: contain;
                "
                onerror="this.style.display='none'"
              />
            </div>
          `,
          className: "custom-substation-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      const newMarkers: any[] = [];
      filteredSubstations.forEach((substation) => {
        try {
          const marker = L.marker([substation.latitude, substation.longitude], {
            icon: createSubstationIcon(
              substation.pinColor,
              substation.tegangan
            ),
          });

          marker.on("click", () => {
            setSelectedSubstation(substation);
          });

          marker.bindTooltip(
            `<div style="padding: 8px;">
              <strong>${substation.namaGI}</strong><br/>
              ${substation.tegangan}<br/>
              UPT: ${substation.upt}
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

      if (filteredSubstations.length > 0) {
        try {
          const validSubstations = filteredSubstations.filter(
            (substation) =>
              substation.latitude &&
              substation.longitude &&
              !isNaN(substation.latitude) &&
              !isNaN(substation.longitude) &&
              Math.abs(substation.latitude) > 0.1 &&
              Math.abs(substation.longitude) > 0.1
          );

          if (validSubstations.length > 0) {
            const latLngs = validSubstations.map((substation) => [
              substation.latitude,
              substation.longitude,
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
  }, [filteredSubstations]);

  // Get unique values for filters
  const getUniqueUPTs = () => {
    const upts = substations
      .map((s) => s.upt)
      .filter((upt) => upt && upt.trim() !== "")
      .filter((upt, index, array) => array.indexOf(upt) === index)
      .sort();
    return upts;
  };

  const getUniqueJenis = () => {
    const jenis = substations
      .map((s) => s.jenis)
      .filter((j) => j && j.trim() !== "")
      .filter((j, index, array) => array.indexOf(j) === index)
      .sort();
    return jenis;
  };

  const getUniqueTegangan = () => {
    const tegangan = substations
      .map((s) => s.tegangan)
      .filter((t) => t && t.trim() !== "")
      .filter((t, index, array) => array.indexOf(t) === index)
      .sort();
    return tegangan;
  };

  // Get substation counts by all unique tegangan levels
  const getSubstationCounts = () => {
    const uniqueTegangan = getUniqueTegangan();
    const counts: { [key: string]: number } = {
      total: filteredSubstations.length,
    };

    // Count for each unique tegangan
    uniqueTegangan.forEach((tegangan) => {
      counts[tegangan] = filteredSubstations.filter(
        (s) => s.tegangan === tegangan
      ).length;
    });

    return counts;
  };

  // Function to get icon for count display
  const getCountIcon = (tegangan: string) => {
    const teganganLower = tegangan.toLowerCase();
    if (teganganLower.includes("500")) {
      return "/tower500kv.svg";
    } else if (teganganLower.includes("150")) {
      return "/tower150kv.svg";
    } else if (teganganLower.includes("70")) {
      return "/tower70kv.svg";
    } else {
      return "/jumlahTower.svg"; // Default icon
    }
  };

  const counts = getSubstationCounts();
  const uniqueTegangan = getUniqueTegangan();

  return (
    <div className="w-full min-h-screen p-4">
      <div className="rounded-lg w-full min-h-[550px] flex flex-col">
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden space-x-2">
          {/* Sidebar */}
          <div className="w-80 border-1 border-neutral-200 flex flex-col p-1 rounded-2xl">
            {selectedSubstation ? (
              /* Substation Detail Panel */
              <div className="p-4 h-full">
                <div className="bg-white p-1 h-full flex flex-col">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedSubstation.pinColor }}
                      ></div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {selectedSubstation.namaGI}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedSubstation(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4 rounded-full bg-red-500 text-white font-bold" />
                    </button>
                  </div>

                  {/* Detail Fields */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {/* UPT */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        UPT
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className="text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedSubstation.upt || "N/A"}
                      </div>
                    </div>

                    {/* Jenis */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Jenis
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className="text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedSubstation.jenis || "N/A"}
                      </div>
                    </div>

                    {/* Tegangan */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Tegangan
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className="text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedSubstation.tegangan || "N/A"}
                      </div>
                    </div>

                    {/* Nama TL Jargi */}
                    <div>
                      <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                        Nama TL Jargi
                      </label>
                      <div
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className="text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedSubstation.namaTLJargi || "N/A"}
                      </div>
                    </div>

                    {/* Kontak */}
                    {selectedSubstation.kontak && (
                      <div>
                        <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                          Kontak
                        </label>
                        <div
                          style={{
                            background:
                              "linear-gradient(to bottom, #15677B, #179FB7)",
                          }}
                          className="text-white px-3 py-2 rounded-full text-sm font-medium"
                        >
                          {selectedSubstation.kontak}
                        </div>
                      </div>
                    )}

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
                        className="text-white px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {selectedSubstation.latitude.toFixed(6)},{" "}
                        {selectedSubstation.longitude.toFixed(6)}
                      </div>
                    </div>

                    {/* Content */}
                    {selectedSubstation.content && (
                      <div>
                        <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <div
                          style={{
                            background:
                              "linear-gradient(to bottom, #15677B, #179FB7)",
                          }}
                          className="text-white px-3 py-2 rounded-full text-sm font-medium"
                        >
                          {selectedSubstation.content}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Buttons */}
                  <div className="mt-6 space-y-2">
                    {/* Google Maps Button */}
                    <button
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps?q=${selectedSubstation.latitude},${selectedSubstation.longitude}`;
                        window.open(googleMapsUrl, "_blank");
                      }}
                      style={{
                        background:
                          "linear-gradient(to bottom, #15677B, #179FB7)",
                      }}
                      className="flex w-full hover:bg-teal-700 text-white py-2 px-4 rounded-full font-medium transition-colors"
                    >
                      BUKA DI GOOGLE MAPS
                    </button>

                    {/* SLD Link Button */}
                    {selectedSubstation.linkSLD && (
                      <button
                        onClick={() => {
                          window.open(selectedSubstation.linkSLD, "_blank");
                        }}
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className="flex w-full hover:bg-teal-700 text-white py-2 px-4 rounded-full font-medium transition-colors"
                      >
                        LIHAT SLD
                      </button>
                    )}

                    {/* Kontak Link Button */}
                    {selectedSubstation.kontakLink && (
                      <button
                        onClick={() => {
                          window.open(selectedSubstation.kontakLink, "_blank");
                        }}
                        style={{
                          background:
                            "linear-gradient(to bottom, #15677B, #179FB7)",
                        }}
                        className="flex w-full hover:bg-teal-700 text-white py-2 px-4 rounded-full font-medium transition-colors"
                      >
                        HUBUNGI
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Legend and Filter Panel */
              <div className="p-2 space-y-3 flex flex-col h-full">
                {/* Legend Section */}
                <div className="space-y-2">
                  {/* Total Count */}
                  <div
                    style={{
                      background:
                        "linear-gradient(to bottom, #15677B, #179FB7)",
                    }}
                    className="bg-white rounded-full p-1 border items-center grid grid-cols-6 space-x-3"
                  >
                    <div>
                      <img src="/jumlahTower.svg" alt="Total" />
                    </div>
                    <span className="text-[12px] font-semibold text-white col-span-4">
                      Total GI/GIS
                    </span>
                    <div className="bg-white rounded-full flex items-center justify-center py-1">
                      <span className="text-sm text-[#145C72] font-medium">
                        {counts.total}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic count for each unique tegangan */}
                  {uniqueTegangan.map(
                    (tegangan) =>
                      counts[tegangan] > 0 && (
                        <div
                          key={tegangan}
                          style={{
                            background:
                              "linear-gradient(to bottom, #15677B, #179FB7)",
                          }}
                          className="bg-white rounded-full p-1 border items-center grid grid-cols-6 space-x-3"
                        >
                          <div>
                            <img
                              src={getCountIcon(tegangan)}
                              alt={tegangan}
                              style={{ width: "24px", height: "24px" }}
                            />
                          </div>
                          <span className="text-[12px] font-semibold text-white col-span-4">
                            GI/GIS {tegangan}
                          </span>
                          <div className="bg-white rounded-full flex items-center justify-center py-1">
                            <span className="text-sm text-[#145C72] font-medium">
                              {counts[tegangan]}
                            </span>
                          </div>
                        </div>
                      )
                  )}
                </div>

                {/* Filter Section */}
                <div className="py-[28px] space-y-2">
                  <div className="flex items-center space-x-2 mb-3 justify-center">
                    <span className="text-sm font-bold text-[#145C72]">
                      FILTER
                    </span>
                  </div>

                  {/* Tegangan Filter */}
                  <div>
                    <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                      Tegangan
                    </label>
                    <select
                      value={teganganFilter}
                      onChange={(e) => setTeganganFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none bg-[#CDE9ED] focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Semua Tegangan</option>
                      {getUniqueTegangan().map((tegangan) => (
                        <option key={tegangan} value={tegangan}>
                          {tegangan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* UPT Filter */}
                  <div>
                    <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                      UPT
                    </label>
                    <select
                      value={uptFilter}
                      onChange={(e) => setUptFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none bg-[#CDE9ED] focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Semua UPT</option>
                      {getUniqueUPTs().map((upt) => (
                        <option key={upt} value={upt}>
                          {upt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Jenis Filter */}
                  <div>
                    <label className="block text-xs pl-3 font-medium text-gray-700 mb-1">
                      Jenis
                    </label>
                    <select
                      value={jenisFilter}
                      onChange={(e) => setJenisFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none bg-[#CDE9ED] focus:ring-2  focus:ring-teal-500"
                    >
                      <option value="">Semua Jenis</option>
                      {getUniqueJenis().map((jenis) => (
                        <option key={jenis} value={jenis}>
                          {jenis}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setTeganganFilter("");
                      setUptFilter("");
                      setJenisFilter("");
                    }}
                    className="w-full mt-2 bg-white hover:bg-[#179FB7] hover:text-white text-[#179FB7] py-2 px-4 rounded-full border-2 border-[#179FB7] text-sm font-bold transition-colors"
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
                      onClick={fetchGoogleSheetsData}
                      className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}

                {!isLoading && !error && substations.length === 0 && (
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-yellow-600">
                      Tidak ada data GI/GIS ditemukan.
                    </div>
                    <button
                      onClick={fetchGoogleSheetsData}
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
            <div className="absolute top-4 right-4 z-[50]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari GI/GIS..."
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

export default PetaGI;
