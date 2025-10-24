import { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";

interface AnomalyData {
  OPEN: number;
  CLOSE: number;
}

interface DetailItem {
  upt?: string;
  ultg?: string;
  gi?: string;
  bay?: string;
  penghantar?: string;
  lokasi?: string;
  komponen?: string;
  alat?: string;
  anomali?: string;
  kategori_anomali?: string;
  status?: string;
  tgl?: string;
  role?: string;
}

interface CategoryDetail {
  status: AnomalyData;
  data: DetailItem[];
}

interface CommonEnemyData {
  data_gi: {
    hotspot: CategoryDetail;
    rembesan: CategoryDetail;
    tekanan_gas: CategoryDetail;
  };
  data_jaringan: {
    pentanahan: CategoryDetail;
    tegakan_tinjut: CategoryDetail;
    thermovisi: CategoryDetail;
  };
  data_proteksi: {
    alarm_relai: CategoryDetail;
    annunciator: CategoryDetail;
    hotspot_sekunder: CategoryDetail;
  };
}

type FilterStatus = "OPEN" | "CLOSE" | "ALL";

const CommonEnemyPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommonEnemyData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{
    title: string;
    data: DetailItem[];
    categoryKey: string;
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("OPEN");

  useEffect(() => {
    fetchCommongEnemy();
  }, []);

  const fetchCommongEnemy = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK_BE}/api/performance/common-enemy`
      );

      setData(response.data);
    } catch (err) {
      console.error("Error fetching Common Enemy data:", err);
      setError("Failed to fetch Common Enemy");
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (closeCount: number, openCount: number) => {
    const total = closeCount + openCount;
    if (total === 0) return 0;
    return Math.round((closeCount / total) * 100);
  };

  const hasData = (closeCount: number, openCount: number) => {
    return closeCount + openCount > 0;
  };

  const getFilteredData = () => {
    if (!selectedCategory) return [];

    if (filterStatus === "ALL") {
      return selectedCategory.data;
    }

    return selectedCategory.data.filter((item) => item.status === filterStatus);
  };

  // Icon components
  const GarduIndukIcon = () => (
    <svg
      className="w-5 h-5 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );

  const JaringanIcon = () => (
    <svg
      className="w-5 h-5 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );

  const ProteksiIcon = () => (
    <svg
      className="w-5 h-5 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );

  const DetailModal = () => {
    if (!selectedCategory) return null;

    const filteredData = getFilteredData();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-[#155C72] text-white p-4 md:p-6 flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold">
              {selectedCategory.title} - Detail
            </h2>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setFilterStatus("OPEN");
              }}
              className="text-white hover:text-gray-200 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Filter */}
          <div className="p-4 bg-gray-50 border-b flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("OPEN")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "OPEN"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              Open (
              {selectedCategory.data.filter((d) => d.status === "OPEN").length})
            </button>
            <button
              onClick={() => setFilterStatus("CLOSE")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "CLOSE"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              Close (
              {selectedCategory.data.filter((d) => d.status === "CLOSE").length}
              )
            </button>
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "ALL"
                  ? "bg-[#155C72] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              All ({selectedCategory.data.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No data available for this filter
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                        No
                      </th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                        UPT
                      </th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                        ULTG
                      </th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                        GI
                      </th>
                      {selectedCategory.categoryKey.includes("proteksi") && (
                        <>
                          <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                            Bay
                          </th>
                          <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                            Alat
                          </th>
                          <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                            Anomali
                          </th>
                        </>
                      )}
                      {selectedCategory.categoryKey.includes("gi") && (
                        <>
                          <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                            Penghantar
                          </th>
                          <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                            Lokasi
                          </th>
                          <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                            Komponen
                          </th>
                        </>
                      )}
                      <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                        Tanggal
                      </th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="border border-gray-300 p-2 text-sm">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {item.upt || "-"}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {item.ultg || "-"}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {item.gi || "-"}
                        </td>
                        {selectedCategory.categoryKey.includes("proteksi") && (
                          <>
                            <td className="border border-gray-300 p-2 text-sm">
                              {item.bay || "-"}
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              {item.alat || "-"}
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              {item.anomali || "-"}
                            </td>
                          </>
                        )}
                        {selectedCategory.categoryKey.includes("gi") && (
                          <>
                            <td className="border border-gray-300 p-2 text-sm">
                              {item.penghantar || "-"}
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              {item.lokasi || "-"}
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              {item.komponen || "-"}
                            </td>
                          </>
                        )}
                        <td className="border border-gray-300 p-2 text-sm">
                          {item.tgl || "-"}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              item.status === "OPEN"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.status || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AnomalyCard = ({
    title,
    items,
    icon,
    categoryPrefix,
  }: {
    title: string;
    items: { name: string; data: CategoryDetail; key: string }[];
    icon: React.ReactNode;
    categoryPrefix: string;
  }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#155C72] rounded-lg flex items-center justify-center shadow-md">
            {icon}
          </div>
          <h2 className="text-base md:text-lg font-bold text-[#155C72] uppercase tracking-wide">
            {title}
          </h2>
        </div>

        <div className="space-y-5">
          {items.map((item, index) => {
            const hasDataAvailable = hasData(
              item.data.status.CLOSE,
              item.data.status.OPEN
            );
            const percentage = calculatePercentage(
              item.data.status.CLOSE,
              item.data.status.OPEN
            );

            return (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-[#155C72]">
                    {item.name}
                  </div>
                  <button
                    onClick={() =>
                      setSelectedCategory({
                        title: item.name,
                        data: item.data.data,
                        categoryKey: `${categoryPrefix}_${item.key}`,
                      })
                    }
                    className="text-xs bg-[#155C72] text-white px-3 py-1 rounded-md hover:bg-[#0f4a5c] transition-colors"
                  >
                    Detail
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {!hasDataAvailable ? (
                    <div className="flex-1 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-inner flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        No Data
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <div
                          className="bg-gradient-to-r from-red-400 to-red-500 h-full transition-all duration-500 ease-out"
                          style={{ width: `${100 - percentage}%` }}
                        ></div>
                      </div>
                      <div className="bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold px-4 py-1.5 rounded-lg min-w-[65px] text-center shadow-md">
                        {percentage}%
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchCommongEnemy}
              className="bg-[#145C72] text-white px-4 py-2 rounded-lg hover:bg-[#0f4a5c]"
            >
              Retry
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!data) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-8">
          <h1 className="text-2xl md:text-[32px] font-bold text-[#155C72] text-center mb-6 md:mb-8">
            COMMON ENEMY
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ANOMALI GARDU INDUK */}
            <AnomalyCard
              title="ANOMALI GARDU INDUK"
              icon={<GarduIndukIcon />}
              categoryPrefix="gi"
              items={[
                {
                  name: "Rembesan / Bocor MTU & TRF",
                  data: data.data_gi.rembesan,
                  key: "rembesan",
                },
                {
                  name: "Hotspot MTU & TRF",
                  data: data.data_gi.hotspot,
                  key: "hotspot",
                },
                {
                  name: "Tekanan Gas SF6 PMT & GIS",
                  data: data.data_gi.tekanan_gas,
                  key: "tekanan_gas",
                },
              ]}
            />

            {/* ANOMALI JARINGAN */}
            <AnomalyCard
              title="ANOMALI JARINGAN"
              icon={<JaringanIcon />}
              categoryPrefix="jaringan"
              items={[
                {
                  name: "Petahanan",
                  data: data.data_jaringan.pentanahan,
                  key: "pentanahan",
                },
                {
                  name: "ROW",
                  data: data.data_jaringan.tegakan_tinjut,
                  key: "tegakan_tinjut",
                },
                {
                  name: "Thermovisi",
                  data: data.data_jaringan.thermovisi,
                  key: "thermovisi",
                },
              ]}
            />

            {/* ANOMALI PROTEKSI */}
            <AnomalyCard
              title="ANOMALI PROTEKSI"
              icon={<ProteksiIcon />}
              categoryPrefix="proteksi"
              items={[
                {
                  name: "Alarm Relay",
                  data: data.data_proteksi.alarm_relai,
                  key: "alarm_relai",
                },
                {
                  name: "Announciator",
                  data: data.data_proteksi.annunciator,
                  key: "annunciator",
                },
                {
                  name: "Hotspot Sekunder",
                  data: data.data_proteksi.hotspot_sekunder,
                  key: "hotspot_sekunder",
                },
              ]}
            />
          </div>
        </div>

        {/* Detail Modal */}
        {selectedCategory && <DetailModal />}
      </div>
    </DefaultLayout>
  );
};

export default CommonEnemyPage;
