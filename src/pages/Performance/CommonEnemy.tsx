import { useEffect, useState } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import axios from "axios";

interface AnomalyData {
  OPEN: number;
  CLOSE: number;
}

interface CommonEnemyData {
  data_gi: {
    hotspot: AnomalyData;
    rembesan: AnomalyData;
    tekanan_gas: AnomalyData;
  };
  data_jaringan: {
    pentanahan: AnomalyData;
    tegakan_tinjut: AnomalyData;
    thermovisi: AnomalyData;
  };
  data_proteksi: {
    alarm_relai: AnomalyData;
    annunciator: AnomalyData;
    hotspot_sekunder: AnomalyData;
  };
}

const CommonEnemyPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommonEnemyData | null>(null);

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

      console.log("Common Enemy data fetched successfully:", response.data);
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

  const AnomalyCard = ({
    title,
    items,
    icon,
  }: {
    title: string;
    items: { name: string; data: AnomalyData }[];
    icon: React.ReactNode;
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
            const percentage = calculatePercentage(
              item.data.CLOSE,
              item.data.OPEN
            );
            return (
              <div key={index}>
                <div className="text-sm font-medium text-[#155C72] mb-2">
                  {item.name}
                </div>
                <div className="flex items-center gap-3">
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
              items={[
                {
                  name: "Rembesan / Bocor MTU & TRF",
                  data: data.data_gi.rembesan,
                },
                { name: "Hotspot MTU & TRF", data: data.data_gi.hotspot },
                {
                  name: "Tekanan Gas SF6 PMT & GIS",
                  data: data.data_gi.tekanan_gas,
                },
              ]}
            />

            {/* ANOMALI JARINGAN */}
            <AnomalyCard
              title="ANOMALI JARINGAN"
              icon={<JaringanIcon />}
              items={[
                { name: "Petahanan", data: data.data_jaringan.pentanahan },
                { name: "ROW", data: data.data_jaringan.tegakan_tinjut },
                { name: "Thermovisi", data: data.data_jaringan.thermovisi },
              ]}
            />

            {/* ANOMALI PROTEKSI */}
            <AnomalyCard
              title="ANOMALI PROTEKSI"
              icon={<ProteksiIcon />}
              items={[
                { name: "Alarm Relay", data: data.data_proteksi.alarm_relai },
                { name: "Announciator", data: data.data_proteksi.annunciator },
                {
                  name: "Hotspot Sekunder",
                  data: data.data_proteksi.hotspot_sekunder,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CommonEnemyPage;
