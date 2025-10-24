import { useEffect, useState } from "react";
import DefaultLayout from "../../../layout/DefaultLayout";
import PetaTower from "./PetaTower";
import PetaGI from "./PetaGI";
import DataAssetContent from "./DataAssetContent";
import axios from "axios";

interface LevelTegangan {
  jumlah: string;
  mva: string;
}

interface LevelTeganganGI {
  "150_kv": string;
  "500_kv": string;
}

interface LevelTeganganGIGISET {
  "150_kv": string;
  "500_kv": string;
}

interface LevelTeganganTower {
  "150_kv": LevelTegangan;
  "500_kv": LevelTegangan;
}

interface LevelTeganganTransformer {
  "150_20_kv": LevelTegangan;
  "500_150_kv": LevelTegangan;
}

interface ULTGData {
  jumlah_gi: string;
  jumlah_gitet: string;
  jumlah_sk: string;
  jumlah_tower: string;
  jumlah_transformer: string;
  level_tegangan: LevelTeganganTransformer;
  level_tegangan_gi_gitet: LevelTeganganGI;
  level_tegangan_gi_gitset: LevelTeganganGIGISET;
  level_tegangan_tower: LevelTeganganTower;
  total_kapasitas: string;
  total_kms_transmisu: string;
  yotal_unit: string;
}

interface AsetTidakOperasi {
  gi_gitet: {
    "70_kv": string;
    "150_kv": string;
    "500_kv": string;
  };
  tower: {
    "500_kv": string;
    "150_kv": string;
    "70_kv": string;
  };
  trafo: {
    "500_150_kv": string;
    "150_20_kv": string;
    "150_70_kv": string;
  };
}

interface TotalAset {
  title: string;
  jumlah: string;
}

interface AssetData {
  ultg_bekasi: ULTGData;
  ultg_cikarang: ULTGData;
  upt: ULTGData;
  aset_tidak_operasi: AsetTidakOperasi;
  total_aset: TotalAset;
}

interface ApiResponse {
  status: string;
  message: string;
  data: AssetData;
}

const DataAssetPage = () => {
  const [activeTab, setActiveTab] = useState("DATA_ASSET");
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [selectedULTG, setSelectedULTG] = useState<"BEKASI" | "CIKARANG">(
    "BEKASI"
  );

  useEffect(() => {
    fetchDataAsset();
  }, []);

  const fetchDataAsset = async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK_BE}/api/data-asset/asset`;

    try {
      const res = await axios.get<ApiResponse>(url, {
        withCredentials: true,
      });

      setApiData(res.data);
    } catch (error: any) {
      console.log(error);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely parse and trim values
  const parseValue = (value: string): number => {
    const cleaned = value.trim().replace(/,/g, "");
    return cleaned === "-" ? 0 : parseFloat(cleaned) || 0;
  };

  // Get data for specific ULTG
  const getULTGData = (ultgName: "BEKASI" | "CIKARANG"): ULTGData | null => {
    if (!apiData?.data) return null;
    return ultgName === "BEKASI"
      ? apiData.data.ultg_bekasi
      : apiData.data.ultg_cikarang;
  };

  // Get UPT (total) data
  const getUPTData = (): ULTGData | null => {
    if (!apiData?.data) return null;
    return apiData.data.upt;
  };

  // Get non-operational assets
  const getAsetTidakOperasi = (): AsetTidakOperasi | null => {
    if (!apiData?.data) return null;
    return apiData.data.aset_tidak_operasi;
  };

  // Get total asset value
  const getTotalAset = (): TotalAset | null => {
    if (!apiData?.data) return null;
    return apiData.data.total_aset;
  };

  // Calculate totals for display
  const calculateTotals = () => {
    const uptData = getUPTData();
    if (!uptData) return null;

    const totalGI = parseValue(uptData.jumlah_gi);
    const totalGITET = parseValue(uptData.jumlah_gitet);

    const totalGIS =
      parseValue(uptData.level_tegangan_gi_gitset["150_kv"]) +
      parseValue(uptData.level_tegangan_gi_gitset["500_kv"]);

    const totalTransformers =
      parseValue(uptData.level_tegangan["500_150_kv"].jumlah) +
      parseValue(uptData.level_tegangan["150_20_kv"].jumlah);

    const totalCapacity = parseValue(uptData.total_kapasitas);

    const totalTowers = parseValue(uptData.jumlah_tower);

    const totalKms = parseValue(uptData.total_kms_transmisu);

    const totalSK = parseValue(uptData.jumlah_sk);

    const totalUnit = parseValue(uptData.yotal_unit);

    return {
      totalGI,
      totalGITET,
      totalGIS,
      totalTransformers,
      totalCapacity,
      totalTowers,
      totalKms,
      totalSK,
      totalUnit,
    };
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      );
    }

    if (!apiData?.data) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Failed to load data</div>
        </div>
      );
    }

    const uptData = getUPTData();
    const selectedData = getULTGData(selectedULTG);
    const totals = calculateTotals();
    const asetTidakOperasi = getAsetTidakOperasi();
    const totalAset = getTotalAset();

    if (!uptData || !totals) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Invalid data format</div>
        </div>
      );
    }

    switch (activeTab) {
      case "DATA_ASSET":
        return (
          <>
            <DataAssetContent
              uptData={uptData}
              totals={totals}
              selectedData={selectedData}
              selectedULTG={selectedULTG}
              setSelectedULTG={setSelectedULTG}
              parseValue={parseValue}
              asetTidakOperasi={asetTidakOperasi}
              totalAset={totalAset}
            />
          </>
        );
      case "PETA_TOWER":
        return <PetaTower />;
      case "PETA_GARDU_INDUK":
        return <PetaGI />;
      default:
        return null;
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Header Tabs */}
        <div className="flex mb-6 space-x-2 text-sm">
          <button
            onClick={() => setActiveTab("DATA_ASSET")}
            className={`py-2 px-4 rounded-full font-semibold transition-colors ${
              activeTab === "DATA_ASSET"
                ? "text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
            style={
              activeTab === "DATA_ASSET"
                ? { background: "linear-gradient(to bottom, #15677B, #179FB7)" }
                : {}
            }
          >
            DATA ASSET
          </button>
          <button
            onClick={() => setActiveTab("PETA_TOWER")}
            className={`py-2 px-4 rounded-full font-semibold transition-colors ${
              activeTab === "PETA_TOWER"
                ? "text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
            style={
              activeTab === "PETA_TOWER"
                ? { background: "linear-gradient(to bottom, #15677B, #179FB7)" }
                : {}
            }
          >
            PETA TOWER
          </button>
          <button
            onClick={() => setActiveTab("PETA_GARDU_INDUK")}
            className={`py-2 px-4 rounded-full font-semibold transition-colors ${
              activeTab === "PETA_GARDU_INDUK"
                ? "text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
            style={
              activeTab === "PETA_GARDU_INDUK"
                ? { background: "linear-gradient(to bottom, #15677B, #179FB7)" }
                : {}
            }
          >
            PETA GARDU INDUK
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </DefaultLayout>
  );
};

export default DataAssetPage;
