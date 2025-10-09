import { useEffect, useState } from "react";
import DefaultLayout from "../../../layout/DefaultLayout";
import PetaTower from "./PetaTower";
import PetaGI from "./PetaGI";
import DataAssetContent from "./DataAssetContent";
import axios from "axios";
interface GIGitet {
  "70_kv": string;
  "150_kv": string;
  "500_kv": string;
}

interface GISGistet {
  "70_kv": string;
  "150_kv": string;
  "500_kv": string;
}

interface JumlahTower {
  "70_kv": string;
  "150_kv": string;
  "500_kv": string;
}

interface KmsData {
  sk: string;
  su: string;
}

interface TrafoData {
  jumlah: string;
  mva: string;
}

interface Trafo150_70 {
  "150_20_kv": string;
  jumlah: string;
  mva: string;
}

interface AssetData {
  gi_gitet: GIGitet;
  gis_gistet: GISGistet;
  joint_sk: string;
  jumlah_tower: JumlahTower;
  kms_70_kv: KmsData;
  kms_150_kv: KmsData;
  kms_500_kv: KmsData;
  trafo_150_20_kv: TrafoData;
  trafo_150_70_kv: Trafo150_70;
  trafo_500_150_kv: TrafoData;
  ultg: string;
  upt: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: AssetData[];
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
      console.log("API Response:", res.data);
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

  // Get data for specific ULTG or total
  const getULTGData = (ultgName: string): AssetData | null => {
    if (!apiData?.data) return null;
    return apiData.data.find((item) => item.ultg === ultgName) || null;
  };

  // Get total data
  const getTotalData = (): AssetData | null => {
    if (!apiData?.data) return null;
    return apiData.data.find((item) => item.ultg === "Total UPT") || null;
  };

  // Calculate totals for display
  const calculateTotals = () => {
    const totalData = getTotalData();
    if (!totalData) return null;

    const totalGI =
      parseValue(totalData.gi_gitet["150_kv"]) +
      parseValue(totalData.gi_gitet["500_kv"]) +
      parseValue(totalData.gi_gitet["70_kv"]);

    const totalGIS =
      parseValue(totalData.gis_gistet["150_kv"]) +
      parseValue(totalData.gis_gistet["500_kv"]) +
      parseValue(totalData.gis_gistet["70_kv"]);

    const totalTransformers =
      parseValue(totalData.trafo_500_150_kv.jumlah) +
      parseValue(totalData.trafo_150_20_kv.jumlah) +
      parseValue(totalData.trafo_150_70_kv.jumlah);

    const totalCapacity =
      parseValue(totalData.trafo_500_150_kv.mva) +
      parseValue(totalData.trafo_150_20_kv.mva) +
      parseValue(totalData.trafo_150_70_kv.mva);

    const totalTowers =
      parseValue(totalData.jumlah_tower["500_kv"]) +
      parseValue(totalData.jumlah_tower["150_kv"]) +
      parseValue(totalData.jumlah_tower["70_kv"]);

    const totalKms =
      parseValue(totalData.kms_500_kv.su) +
      parseValue(totalData.kms_500_kv.sk) +
      parseValue(totalData.kms_150_kv.su) +
      parseValue(totalData.kms_150_kv.sk) +
      parseValue(totalData.kms_70_kv.su) +
      parseValue(totalData.kms_70_kv.sk);

    return {
      totalGI,
      totalGIS,
      totalTransformers,
      totalCapacity,
      totalTowers,
      totalKms,
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

    const totalData = getTotalData();
    const selectedData = getULTGData(selectedULTG);
    const totals = calculateTotals();

    if (!totalData || !totals) {
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
              totalData={totalData}
              totals={totals}
              selectedData={selectedData}
              selectedULTG={selectedULTG}
              setSelectedULTG={setSelectedULTG}
              parseValue={parseValue}
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
