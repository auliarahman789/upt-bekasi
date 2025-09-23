import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import DefaultLayout from "../../../layout/DefaultLayout";

interface LocationData {
  standar_kebutuhan: string;
  jumlah_eksisting: string;
  selisih: string;
}

interface PeralatanItem {
  item: string;
  apbd: string;
  satuan: string;
  presentase_terpenuhi?: string;
  total: LocationData;
  upt_bekasi: LocationData;
  ultg_bekasi: LocationData;
  ultg_cikarang: LocationData;
  gi_cikarang: LocationData;
  gi_cikarang_lippo: LocationData;
  gi_cileungsi_2: LocationData;
  gi_fajar_sw: LocationData;
  gi_gandamekar: LocationData;
  gi_hankook: LocationData;
  gi_jababeka: LocationData;
  gi_juishin: LocationData;
  gi_margakarya: LocationData;
  gi_mekarsari: LocationData;
  gi_panayungan: LocationData;
  gi_poncol_baru: LocationData;
  gi_rajapaksi: LocationData;
  gi_suzuki: LocationData;
  gi_tagalherang: LocationData;
  gi_tambun: LocationData;
  gi_toyogiri: LocationData;
  gi_transheksa: LocationData;
  gis_poncol_baru: LocationData;
  gistet_new_tambun: LocationData;
  gitet_cibatu: LocationData;
  gitet_muara_tawar: LocationData;
}

interface KatalogItem {
  nama_peralatan: string;
  standar: string;
  model_1_brand_relevan: string;
  model_1_gambar: string;
  model_1_spesifikasi: string;
  model_2_brand_relevan?: string;
  model_2_gambar?: string;
  model_2_spesifikasi?: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    data: PeralatanItem[];
    metadata: {
      title: string;
      instruction: string;
      totalRecords: number;
      totalFields: number;
      generatedAt: string;
    };
  };
}

interface KatalogResponse {
  status: string;
  message: string;
  data: KatalogItem[];
}

// Lazy Image Component with proper loading states
const LazyImage: React.FC<{
  src: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  onError?: () => void;
}> = ({ src, alt, className = "", fallbackClassName = "", onError }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isIntersecting) {
            setIsIntersecting(true);
            if (src) {
              setImageSrc(src);
            }
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [src, isIntersecting]);

  const handleLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleError = () => {
    setImageLoading(false);
    setImageError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Loading Skeleton */}
      {imageLoading && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-2"></div>
            <span className="text-xs">Loading...</span>
          </div>
        </div>
      )}

      {/* Image */}
      {imageSrc && !imageError && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-contain transition-opacity duration-500 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Error/No Image Fallback */}
      {(imageError || !src) && !imageLoading && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100 ${fallbackClassName}`}
        >
          <svg
            className="w-12 h-12 mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">No Image</span>
        </div>
      )}
    </div>
  );
};

const PeralatanDanSaranaPage: React.FC = () => {
  const [data, setData] = useState<PeralatanItem[]>([]);
  const [katalogData, setKatalogData] = useState<KatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "catalog">(
    "dashboard"
  );
  const [selectedKatalogItem, setSelectedKatalogItem] =
    useState<KatalogItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Reduced from showing all at once
  const [searchTerm, setSearchTerm] = useState("");

  // Get all location keys
  const locationKeys = [
    "upt_bekasi",
    "ultg_bekasi",
    "ultg_cikarang",
    "gi_cikarang",
    "gi_cikarang_lippo",
    "gi_cileungsi_2",
    "gi_fajar_sw",
    "gi_gandamekar",
    "gi_hankook",
    "gi_jababeka",
    "gi_juishin",
    "gi_margakarya",
    "gi_mekarsari",
    "gi_panayungan",
    "gi_poncol_baru",
    "gi_rajapaksi",
    "gi_suzuki",
    "gi_tagalherang",
    "gi_tambun",
    "gi_toyogiri",
    "gi_transheksa",
    "gis_poncol_baru",
    "gistet_new_tambun",
    "gitet_cibatu",
    "gitet_muara_tawar",
  ];

  const getUniqueCategories = () => {
    const categories = new Set(data.map((item) => item.item));
    return Array.from(categories).filter(
      (cat) => cat && !cat.includes("*") && cat !== "Note"
    );
  };

  useEffect(() => {
    fetchPeralatanData();
    fetchKatalogData();
  }, []);

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const fetchPeralatanData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `${import.meta.env.VITE_API_LINK_BE}/api/monitoring/hsse/peralatan`,
        { withCredentials: true }
      );

      const apiData = response.data.data.data;
      const validData = apiData.filter(
        (item: PeralatanItem) =>
          item &&
          item.item &&
          item.apbd &&
          item.item !== "Note" &&
          !item.item.includes("Belum ada di SPLN") &&
          item.apbd !== "-" &&
          item.apbd !== "tanya" &&
          item.apbd !== "grounding jaringan"
      );

      setData(validData);
      setError(null);
    } catch (err) {
      console.error("Error fetching peralatan data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKatalogData = async () => {
    try {
      const response = await axios.get<KatalogResponse>(
        `${import.meta.env.VITE_API_LINK_BE}/api/monitoring/hsse/katalog`,
        { withCredentials: true }
      );
      setKatalogData(response.data.data);
    } catch (err) {
      console.error("Error fetching katalog data:", err);
    }
  };

  const convertGoogleDriveLink = useCallback((driveLink: string) => {
    if (!driveLink || driveLink === "-" || driveLink.trim() === "") return null;

    let fileId = null;
    const fileIdMatch = driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      fileId = fileIdMatch[1];
    } else {
      const openIdMatch = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (openIdMatch) {
        fileId = openIdMatch[1];
      }
    }

    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    }

    return driveLink;
  }, []);

  const formatLocationName = (key: string) => {
    return key.replace(/_/g, " ").toUpperCase();
  };

  const getDisplayData = () => {
    if (selectedLocation === "all") {
      return data.filter(
        (item) => selectedCategory === "all" || item.item === selectedCategory
      );
    } else {
      return data
        .filter(
          (item) => selectedCategory === "all" || item.item === selectedCategory
        )
        .map((item) => ({
          ...item,
          total: item[selectedLocation as keyof PeralatanItem] as LocationData,
        }));
    }
  };

  // Filter and paginate catalog data
  const getFilteredKatalogData = () => {
    let filtered = katalogData;

    if (searchTerm) {
      filtered = katalogData.filter(
        (item) =>
          item.nama_peralatan
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.model_1_brand_relevan
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (item.model_2_brand_relevan &&
            item.model_2_brand_relevan
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const getPaginatedKatalogData = () => {
    const filtered = getFilteredKatalogData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  const filteredData = getDisplayData();
  const groupedData = filteredData.reduce((acc, item) => {
    const category = item.item;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PeralatanItem[]>);

  const CombinedProgressBar: React.FC<{
    standar: number;
    existing: number;
    selisih: number;
    label: string;
  }> = React.memo(({ standar, existing, selisih, label }) => {
    const maxValue = Math.max(standar, existing + Math.abs(selisih)) || 100;
    const existingWidth = (existing / maxValue) * 100;
    const selisihWidth = (Math.abs(selisih) / maxValue) * 100;

    return (
      <div className="flex items-center py-1 px-4 hover:bg-gray-50">
        <div className="flex-1 min-w-0 pr-4">
          <div
            title={`${label}`}
            className="text-[11px] font-light text-[#273B4A] truncate"
          >
            {label}
          </div>
        </div>

        <div className="flex-shrink-0 mr-3">
          <div
            title={`${standar}`}
            className="bg-[#145C72] text-white px-3 rounded-full text-[11px] font-semibold min-w-[50px] text-center"
          >
            {standar}
          </div>
        </div>

        <div className="flex-shrink-0 mr-3">
          <div
            title={`${existing}`}
            className="text-green-600 text-[11px] font-semibold min-w-[30px] text-center"
          >
            {existing}
          </div>
        </div>

        <div className="flex-1 max-w-[200px] mr-4">
          <div className="flex h-[17px] bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-green-500 flex items-center justify-center"
              style={{
                width: `${existingWidth}%`,
                minWidth: existing > 0 ? "20px" : "0px",
              }}
            />
            <div
              className={`flex items-center justify-center ${
                selisih >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: `${selisihWidth}%`,
                minWidth: selisih !== 0 ? "20px" : "0px",
              }}
            />
          </div>
        </div>

        <div className="flex-shrink-0">
          <span
            className={`text-[11px] font-semibold min-w-[30px] text-center inline-block ${
              selisih >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {selisih}
          </span>
        </div>
      </div>
    );
  });

  // Optimized Catalog Card Component
  const CatalogCard: React.FC<{ item: KatalogItem }> = React.memo(
    ({ item }) => {
      const [currentImageIndex, setCurrentImageIndex] = useState(0);
      const image1Url = convertGoogleDriveLink(item.model_1_gambar);
      const image2Url = convertGoogleDriveLink(item.model_2_gambar || "");

      const availableImages = [image1Url, image2Url].filter(Boolean);
      const currentImageUrl = availableImages[currentImageIndex];

      const handleCardClick = useCallback(() => {
        setSelectedKatalogItem(item);
        setShowDetailModal(true);
      }, [item]);

      const handleImageNavigation = useCallback(
        (index: number, e: React.MouseEvent) => {
          e.stopPropagation();
          setCurrentImageIndex(index);
        },
        []
      );

      return (
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-[#145C72]"
          onClick={handleCardClick}
        >
          {/* Image Container */}
          <div className="h-48 bg-gray-100 relative">
            <LazyImage
              src={currentImageUrl}
              alt={item.nama_peralatan}
              className="w-full h-full"
            />

            {/* Image Navigation */}
            {availableImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {availableImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex
                        ? "bg-blue-500"
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                    onClick={(e) => handleImageNavigation(index, e)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-sm font-bold text-[#273B4A] mb-2 line-clamp-2 leading-tight">
              {item.nama_peralatan}
            </h3>

            {/* Brands */}
            <div className="mb-2 flex flex-wrap gap-1">
              <span className="inline-block bg-[#145C72] text-white text-xs px-2 py-1 rounded-full">
                {item.model_1_brand_relevan || "No Brand"}
              </span>
              {item.model_2_brand_relevan && (
                <span className="inline-block bg-[#179FB7] text-white text-xs px-2 py-1 rounded-full">
                  {item.model_2_brand_relevan}
                </span>
              )}
            </div>

            {/* Standard */}
            {item.standar && item.standar !== "-" && (
              <div className="mb-2">
                <p className="text-xs text-gray-600 font-medium">Standard:</p>
                <p className="text-xs text-gray-800 line-clamp-2">
                  {item.standar.substring(0, 100)}...
                </p>
              </div>
            )}

            {/* Specifications Preview */}
            {item.model_1_spesifikasi && (
              <div>
                <p className="text-xs text-gray-600 font-medium">
                  Spesifikasi:
                </p>
                <p className="text-xs text-gray-800 line-clamp-3">
                  {item.model_1_spesifikasi.substring(0, 100)}...
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
  );

  // Pagination Component
  const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }> = ({ currentPage, totalPages, onPageChange }) => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              page === currentPage
                ? "bg-[#145C72] text-white"
                : page === "..."
                ? "text-gray-400 cursor-default"
                : "bg-white border border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  // Detail Modal Component
  const DetailModal: React.FC = () => {
    if (!selectedKatalogItem || !showDetailModal) return null;

    const [selectedModel, setSelectedModel] = useState<1 | 2>(1);
    const image1Url = convertGoogleDriveLink(
      selectedKatalogItem.model_1_gambar
    );
    const image2Url = convertGoogleDriveLink(
      selectedKatalogItem.model_2_gambar || ""
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#273B4A]">
              {selectedKatalogItem.nama_peralatan}
            </h2>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
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
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Standard */}
            <div>
              <h3 className="text-lg font-semibold text-[#273B4A] mb-3">
                Standard
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-800 whitespace-pre-line">
                  {selectedKatalogItem.standar}
                </p>
              </div>
            </div>

            {/* Models */}
            <div>
              <h3 className="text-lg font-semibold text-[#273B4A] mb-3">
                Models
              </h3>

              {/* Model Tabs */}
              <div className="flex space-x-2 mb-4">
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedModel === 1
                      ? "bg-[#145C72] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setSelectedModel(1)}
                >
                  {selectedKatalogItem.model_1_brand_relevan || "Model 1"}
                </button>
                {selectedKatalogItem.model_2_brand_relevan && (
                  <button
                    className={`px-4 py-2 rounded-lg font-medium ${
                      selectedModel === 2
                        ? "bg-[#145C72] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => setSelectedModel(2)}
                  >
                    {selectedKatalogItem.model_2_brand_relevan}
                  </button>
                )}
              </div>

              {/* Model Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image */}
                <div>
                  <h4 className="font-medium text-[#273B4A] mb-3">Image</h4>
                  <div className="bg-gray-100 rounded-lg h-64">
                    <LazyImage
                      src={selectedModel === 1 ? image1Url : image2Url}
                      alt={`Model ${selectedModel}`}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h4 className="font-medium text-[#273B4A] mb-3">
                    Specifications
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {selectedModel === 1
                        ? selectedKatalogItem.model_1_spesifikasi
                        : selectedKatalogItem.model_2_spesifikasi ||
                          "No specifications available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading peralatan data...</span>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800">
              <h3 className="text-sm font-medium">Error</h3>
              <p className="mt-1 text-sm">{error}</p>
              <button
                onClick={fetchPeralatanData}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const paginatedCatalog = getPaginatedKatalogData();

  return (
    <DefaultLayout>
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="pb-4">
          <div className="mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center flex-1">
                PERALATAN DAN SARANA
              </h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center text-[16px] font-bold bg-white justify-between border-[1px] border-zinc-300 hover:bg-gray-200 px-4 py-2 rounded-full text-[#145C72] transition-colors shadow-2xl"
          >
            <div>FILTER</div>
            <div className="ml-6">
              <img src="/filter.svg" alt="Filter" />
            </div>
          </button>

          <button
            onClick={() =>
              setActiveTab(activeTab === "dashboard" ? "catalog" : "dashboard")
            }
            className="flex items-center text-[16px] font-bold bg-white justify-between border-[1px] border-zinc-300 hover:bg-gray-200 px-4 py-2 rounded-full text-[#145C72] transition-colors shadow-2xl"
          >
            <div>{activeTab === "dashboard" ? "KATALOG" : "DASHBOARD"}</div>
            <div className="ml-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {activeTab === "dashboard" ? (
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                ) : (
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                )}
              </svg>
            </div>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilter && activeTab === "dashboard" && (
          <div className="relative">
            <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-4xl border-2 border-[#179FB7] p-4 w-80 z-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Kategori</option>
                    {getUniqueCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Lokasi (Akumulasi)</option>
                    {locationKeys.map((location) => (
                      <option key={location} value={location}>
                        {formatLocationName(location)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLocation !== "all" && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">
                        Menampilkan data untuk:
                      </span>{" "}
                      {formatLocationName(selectedLocation)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mx-auto py-6 px-4 p-3 bg-gray-100 rounded-2xl">
          {activeTab === "dashboard" ? (
            // Dashboard Content
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(groupedData).map(([category, items]) => (
                <div
                  key={category}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden py-2"
                >
                  {/* Category Header */}
                  <div className="bg-white p-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-[17px] h-[17px] rounded-lg flex items-center justify-center flex-shrink-0">
                        <img
                          src="/HSSE/IconPeralatan.svg"
                          alt="Icon Peralatan"
                        />
                      </div>
                      <h2 className="text-lg font-bold text-[#273B4A] uppercase">
                        {category}
                      </h2>
                    </div>
                  </div>

                  {/* Header Row */}
                  <div className="px-4 py-1">
                    <div className="flex items-center text-[11px] font-semibold text-[#273B4A] uppercase tracking-wide">
                      <div className="flex-1 min-w-0 pr-8">ITEM</div>
                      <div className="flex-shrink-0 mr-3 text-center">
                        STANDAR
                      </div>
                      <div className="flex-shrink-0 mr-3 text-green-600 text-center">
                        EXISTING
                      </div>
                      <div className="flex-1 max-w-[200px] text-center"></div>
                      <div className="flex-shrink-0 text-red-500 text-center">
                        SELISIH
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    {items.map((item, index) => {
                      const standar =
                        parseInt(item.total?.standar_kebutuhan || "0") || 0;
                      const existing =
                        parseInt(item.total?.jumlah_eksisting || "0") || 0;
                      const selisih = parseInt(item.total?.selisih || "0") || 0;

                      return (
                        <CombinedProgressBar
                          key={index}
                          standar={standar}
                          existing={existing}
                          selisih={selisih}
                          label={item.apbd}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {Object.keys(groupedData).length === 0 && (
                <div className="text-center py-12 col-span-full">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No data available</p>
                    <p className="mt-1">
                      No peralatan dan sarana data found for the selected
                      filters.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Catalog Content
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#273B4A] flex items-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                    KATALOG PERALATAN
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Jelajahi katalog peralatan dengan spesifikasi terperinci
                  </p>
                </div>

                {/* Results Info */}
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(
                    currentPage * itemsPerPage,
                    paginatedCatalog.totalItems
                  )}{" "}
                  of {paginatedCatalog.totalItems} items
                </div>
              </div>
              {/* Search Bar for Catalog */}
              {activeTab === "catalog" && (
                <div className="mb-4">
                  <div className="relative max-w-md">
                    <input
                      type="text"
                      placeholder="Cari Peralatan"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-[#145C72] rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                {paginatedCatalog.data.map((item, index) => (
                  <CatalogCard
                    key={`${item.nama_peralatan}-${index}`}
                    item={item}
                  />
                ))}
              </div>

              {/* Pagination */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={paginatedCatalog.totalPages}
                onPageChange={setCurrentPage}
              />

              {paginatedCatalog.totalItems === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                    <p className="text-lg font-medium">
                      {searchTerm
                        ? `No items found for "${searchTerm}"`
                        : "No catalog items available"}
                    </p>
                    <p className="mt-1">
                      {searchTerm
                        ? "Try adjusting your search terms."
                        : "Catalog data is not available at the moment."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-3 px-4 py-2 bg-[#145C72] text-white rounded-lg hover:bg-[#0f4a5c] transition-colors"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <DetailModal />
      </div>
    </DefaultLayout>
  );
};

export default PeralatanDanSaranaPage;
