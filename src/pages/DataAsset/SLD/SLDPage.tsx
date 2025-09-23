import React, { useState, useEffect } from "react";
import axios from "axios";
import DefaultLayout from "../../../layout/DefaultLayout";

interface SLDData {
  desa: string;
  jenis: string;
  link_sld: string;
  nama_gi_gis: string;
  tegangan: string;
  ultg: string;
  upt: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: SLDData[];
}

const SLDPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SLDData[]>([]);
  const [filteredData, setFilteredData] = useState<SLDData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchSLDData();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, activeFilter]);

  const fetchSLDData = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK_BE}/api/data-asset/sld`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });

      setData(res.data.data || []);
    } catch (error: any) {
      console.log(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (activeFilter === "ALL") {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter((item) => item.ultg === activeFilter));
    }
  };

  // Get unique ULTG values for filter buttons
  const getUniqueULTG = () => {
    const uniqueULTG = Array.from(new Set(data.map((item) => item.ultg)));
    return uniqueULTG.sort();
  };

  // Get voltage color based on tegangan
  const getVoltageColor = (tegangan: string) => {
    switch (tegangan) {
      case "500kV":
        return "bg-red-500";
      case "150kV":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Convert Google Drive link to direct PDF URL for embedding
  const convertGoogleDrivePdfLink = (link: string) => {
    if (!link) return "";

    // Extract file ID from various Google Drive URL formats
    let fileId = "";

    if (link.includes("/file/d/")) {
      fileId = link.split("/file/d/")[1].split("/")[0];
    } else if (link.includes("id=")) {
      fileId = link.split("id=")[1].split("&")[0];
    } else if (link.includes("/open?id=")) {
      fileId = link.split("/open?id=")[1].split("&")[0];
    }

    if (fileId) {
      // Use embed URL for PDF preview
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return link;
  };

  const getDisplayName = (nama: string) => {
    if (!nama) return "Unknown Station";

    // Remove only the voltage part (150KV or 500KV) since tegangan field has this info
    let displayName = nama
      .replace(/\s*(150|500)KV\s*/i, " ") // Remove voltage ratings
      .replace(/\s*\(\w+\)/g, "") // Remove (HYBRID) etc.
      .replace(/\s+/g, " ") // Clean up multiple spaces
      .trim();

    return displayName.toUpperCase() || "Unknown Station";
  };

  const handleCardClick = (item: SLDData) => {
    if (item.link_sld) {
      const pdfUrl = convertGoogleDrivePdfLink(item.link_sld);
      setSelectedPdf(pdfUrl);
      setSelectedTitle(
        `${item.jenis || "N/A"} ${item.tegangan || "N/A"} - ${getDisplayName(
          item.nama_gi_gis
        )}`
      );
      setShowPopup(true);
      setPdfLoading(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedPdf("");
    setSelectedTitle("");
    setPdfLoading(false);
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

  return (
    <DefaultLayout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-screen mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-4 md:mb-6">
              SINGLE LINE DIAGRAM
            </h1>
          </div>
          {/* Filter Buttons */}
          <div className="flex flex-wrap  gap-2 md:gap-4 mb-4">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-4 py-2  rounded-full text-sm md:text-base font-medium transition-colors ${
                activeFilter === "ALL"
                  ? "bg-[#145C72] text-white"
                  : "bg-white text-[#145C72] border border-[#145C72] hover:bg-[#145C72] hover:text-white"
              }`}
            >
              ALL
            </button>
            {getUniqueULTG().map((ultg) => (
              <button
                key={ultg}
                onClick={() => setActiveFilter(ultg)}
                className={`px-4 py-2  rounded-full text-sm md:text-base font-medium transition-colors ${
                  activeFilter === ultg
                    ? "bg-[#145C72] text-white"
                    : "bg-white text-[#145C72] border border-[#145C72] hover:bg-[#145C72] hover:text-white"
                }`}
              >
                ULTG {ultg}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
            {filteredData.map((item, index) => (
              <div
                key={index}
                className="relative cursor-pointer group"
                onClick={() => handleCardClick(item)}
              >
                {/* Content overlay */}
                <div
                  className="relative z-10 h-16  items-center grid grid-cols-2"
                  style={{
                    backgroundImage: "url(/Card.png)",
                    backgroundSize: "100% 100%",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: "0.5rem", // 8px - same as rounded-lg
                  }}
                >
                  <div className="flex gap-4 px-4">
                    <span>
                      <div
                        className={`absolute top-6 left-2 w-1 rounded-r-2xl h-4 ${getVoltageColor(
                          item.tegangan
                        )} `}
                      ></div>
                    </span>
                    <span className="text-gray-800 font-bold text-sm truncate block">
                      {item.jenis} {item.tegangan}
                    </span>
                  </div>

                  <div className="flex-shrink-0  text-center justify-center px-2">
                    <span className="text-white text-sm font-medium truncate block">
                      {item.desa}
                    </span>
                  </div>
                </div>
              </div>
              //   </div>
            ))}
          </div>

          {/* No data message */}
          {filteredData.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No data available for the selected filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
            {/* Close button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#145C72]">
                {selectedTitle}
              </h2>
            </div>

            {/* PDF container */}
            <div className="relative h-[calc(100%-140px)]">
              {pdfLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#145C72]"></div>
                  <span className="ml-4 text-[#145C72]">Loading PDF...</span>
                </div>
              )}

              <iframe
                src={selectedPdf}
                className="w-full h-full border-0"
                onLoad={() => setPdfLoading(false)}
                onError={() => {
                  setPdfLoading(false);
                  console.error("Failed to load PDF");
                }}
                style={{ display: pdfLoading ? "none" : "block" }}
                title={selectedTitle}
              />
            </div>

            {/* Footer with actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() =>
                    window.open(
                      selectedPdf.replace("/preview", "/view"),
                      "_blank"
                    )
                  }
                  className="px-4 py-2 bg-[#145C72] text-white rounded hover:bg-[#0f4a5c] transition-colors"
                >
                  Open in New Tab
                </button>
                <button
                  onClick={closePopup}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default SLDPage;
