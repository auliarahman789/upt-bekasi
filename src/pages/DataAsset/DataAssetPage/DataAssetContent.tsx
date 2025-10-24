import React from "react";

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

interface DataAssetContentProps {
  uptData: ULTGData;
  totals: {
    totalGI: number;
    totalGITET: number;
    totalGIS: number;
    totalTransformers: number;
    totalCapacity: number;
    totalTowers: number;
    totalKms: number;
    totalSK: number;
    totalUnit: number;
  };
  selectedData: ULTGData | null;
  selectedULTG: "BEKASI" | "CIKARANG";
  setSelectedULTG: (ultg: "BEKASI" | "CIKARANG") => void;
  parseValue: (value: string) => number;
  asetTidakOperasi: AsetTidakOperasi | null;
  totalAset: TotalAset | null;
}

const DataAssetContent: React.FC<DataAssetContentProps> = ({
  uptData,
  totals,
  selectedData,
  selectedULTG,
  setSelectedULTG,
  parseValue,
  asetTidakOperasi,
  totalAset,
}) => {
  return (
    <div className="space-y-6">
      {/* Total Asset Value Banner */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - GITET Section */}
        <LeftColumnGITET
          uptData={uptData}
          totals={totals}
          parseValue={parseValue}
        />

        {/* Middle Column - Tower Section */}
        <MiddleColumnTower
          uptData={uptData}
          totals={totals}
          parseValue={parseValue}
          asetTidakOperasi={asetTidakOperasi}
        />

        {/* Right Column - ULTG Detail Section */}
        <RightColumnULTG
          selectedData={selectedData}
          selectedULTG={selectedULTG}
          setSelectedULTG={setSelectedULTG}
          parseValue={parseValue}
        />
      </div>
      {totalAset && (
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="text-center">
            <div className="text-sm font-medium mb-2 opacity-90">
              {totalAset.title}
            </div>
            <div className="text-3xl font-bold">Rp {totalAset.jumlah}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Left Column Component
const LeftColumnGITET: React.FC<{
  uptData: ULTGData;
  totals: any;
  parseValue: (value: string) => number;
}> = ({ uptData, totals, parseValue }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        {/* Jumlah GITET */}
        <GradientCard title="Jumlah GITET" value={totals.totalGITET} />

        {/* Jumlah Gardu Induk */}
        <GradientCard title="Jumlah Gardu Induk" value={totals.totalGI} />

        {/* Level Tegangan GITET */}
        <SectionWithHeader
          leftHeader="Level Tegangan GITET"
          rightHeader="Jumlah Unit"
        >
          {parseValue(uptData.level_tegangan_gi_gitet["500_kv"]) > 0 && (
            <VoltageRow
              voltage="500 KV"
              value={uptData.level_tegangan_gi_gitet["500_kv"].trim()}
            />
          )}
          {parseValue(uptData.level_tegangan_gi_gitet["150_kv"]) > 0 && (
            <VoltageRow
              voltage="150 KV"
              value={uptData.level_tegangan_gi_gitet["150_kv"].trim()}
              isLast
            />
          )}
        </SectionWithHeader>

        {/* Level Tegangan GIS/GISTET */}
        <SectionWithHeader
          leftHeader="Level Tegangan GIS/GISTET"
          rightHeader="Jumlah Unit"
        >
          {parseValue(uptData.level_tegangan_gi_gitset["500_kv"]) > 0 && (
            <VoltageRow
              voltage="500 KV"
              value={uptData.level_tegangan_gi_gitset["500_kv"].trim()}
            />
          )}
          {parseValue(uptData.level_tegangan_gi_gitset["150_kv"]) > 0 && (
            <VoltageRow
              voltage="150 KV"
              value={uptData.level_tegangan_gi_gitset["150_kv"].trim()}
              isLast
            />
          )}
        </SectionWithHeader>

        {/* Jumlah Transformer */}
        <div className="mb-4">
          <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 space-x-1">
            <div></div>
            <div className="grid grid-cols-2 space-x-1 text-center">
              <span className="text-xs text-gray-600">Total Unit</span>
              <span className="text-xs text-gray-600">Total Kapasitas</span>
            </div>
          </div>
          <GradientCardDouble
            title="Jumlah Transformer"
            value1={totals.totalUnit}
            value2={`${parseValue(
              uptData.total_kapasitas
            ).toLocaleString()} MVA`}
          />
        </div>

        {/* Level Tegangan Trafo */}
        <div className="mb-4">
          <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 space-x-1">
            <div>Level Tegangan Trafo</div>
            <div className="grid grid-cols-2 space-x-1 text-center">
              <span className="float-right">Total Unit</span>
              <span className="float-right">Total Kapasitas</span>
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(to bottom, #15677B, #179FB7)",
            }}
          >
            {parseValue(uptData.level_tegangan["500_150_kv"].jumlah) > 0 && (
              <TransformerRow
                voltage="500/150 KV"
                unit={uptData.level_tegangan["500_150_kv"].jumlah.trim()}
                mva={uptData.level_tegangan["500_150_kv"].mva.trim()}
              />
            )}
            {parseValue(uptData.level_tegangan["150_20_kv"].jumlah) > 0 && (
              <TransformerRow
                voltage="150/20 KV"
                unit={uptData.level_tegangan["150_20_kv"].jumlah.trim()}
                mva={uptData.level_tegangan["150_20_kv"].mva.trim()}
                isLast
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Middle Column Component
const MiddleColumnTower: React.FC<{
  uptData: ULTGData;
  totals: any;
  parseValue: (value: string) => number;
  asetTidakOperasi: AsetTidakOperasi | null;
}> = ({ uptData, totals, parseValue, asetTidakOperasi }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg">
      {/* Jumlah Tower */}
      <GradientCard title="Jumlah Tower" value={totals.totalTowers} />

      {/* Total KMS Tower */}
      <GradientCard
        title="Total KMS Transmisi"
        value={`${parseValue(uptData.total_kms_transmisu).toFixed(1)} KMS`}
      />
      {/* Joint SK */}
      <GradientCard
        title="Joint SK (Sambungan Kabel)"
        value={`${uptData.jumlah_sk.trim()} Unit`}
      />
      {/* Level Tegangan Tower with detailed KMS breakdown */}
      <div className="mb-4">
        <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-3 text-center">
          <div>Level Tegangan Tower</div>
          <span className="float-right">Jumlah (unit)</span>
          <span className="float-right">Total KMS</span>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(to bottom, #15677B, #179FB7)",
          }}
        >
          {parseValue(uptData.level_tegangan_tower["500_kv"].jumlah) > 0 && (
            <TowerRow
              voltage="500 KV"
              count={uptData.level_tegangan_tower["500_kv"].jumlah.trim()}
              kms={uptData.level_tegangan_tower["500_kv"].mva.trim()}
            />
          )}
          {parseValue(uptData.level_tegangan_tower["150_kv"].jumlah) > 0 && (
            <TowerRow
              voltage="150 KV"
              count={uptData.level_tegangan_tower["150_kv"].jumlah.trim()}
              kms={uptData.level_tegangan_tower["150_kv"].mva.trim()}
              isLast
            />
          )}
        </div>
      </div>

      {/* Non-Operational Assets Section */}
      {asetTidakOperasi && (
        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          {/* Non-operational GI/GITET */}
          <SectionWithHeader
            leftHeader="GI/GITET Tidak Operasi"
            rightHeader="Jumlah Unit"
          >
            {parseValue(asetTidakOperasi.gi_gitet["70_kv"]) > 0 && (
              <VoltageRow
                voltage="70 KV"
                value={asetTidakOperasi.gi_gitet["70_kv"].trim()}
              />
            )}
            {parseValue(asetTidakOperasi.gi_gitet["150_kv"]) > 0 && (
              <VoltageRow
                voltage="150 KV"
                value={asetTidakOperasi.gi_gitet["150_kv"].trim()}
              />
            )}
            {parseValue(asetTidakOperasi.gi_gitet["500_kv"]) > 0 && (
              <VoltageRow
                voltage="500 KV"
                value={asetTidakOperasi.gi_gitet["500_kv"].trim()}
                isLast
              />
            )}
          </SectionWithHeader>

          {/* Non-operational Transformers */}
          <div className="mb-4">
            <SectionWithHeader
              leftHeader="  Trafo Tidak Operasi"
              rightHeader="Jumlah Unit"
            >
              {parseValue(asetTidakOperasi.trafo["500_150_kv"]) > 0 && (
                <SimpleRow
                  label="500/150 KV"
                  value={`${asetTidakOperasi.trafo["500_150_kv"].trim()} `}
                />
              )}
              {parseValue(asetTidakOperasi.trafo["150_20_kv"]) > 0 && (
                <SimpleRow
                  label="150/20 KV"
                  value={`${asetTidakOperasi.trafo["150_20_kv"].trim()} `}
                />
              )}
              {parseValue(asetTidakOperasi.trafo["150_70_kv"]) > 0 && (
                <SimpleRow
                  label="150/70 KV"
                  value={`${asetTidakOperasi.trafo["150_70_kv"].trim()} `}
                  isLast
                />
              )}
            </SectionWithHeader>
          </div>

          {/* Non-operational Towers */}
          <SectionWithHeader
            leftHeader="Tower Tidak Operasi"
            rightHeader="Jumlah Unit"
          >
            {parseValue(asetTidakOperasi.tower["500_kv"]) > 0 && (
              <VoltageRow
                voltage="500 KV"
                value={asetTidakOperasi.tower["500_kv"].trim()}
              />
            )}
            {parseValue(asetTidakOperasi.tower["150_kv"]) > 0 && (
              <VoltageRow
                voltage="150 KV"
                value={asetTidakOperasi.tower["150_kv"].trim()}
              />
            )}
            {parseValue(asetTidakOperasi.tower["70_kv"]) > 0 && (
              <VoltageRow
                voltage="70 KV"
                value={asetTidakOperasi.tower["70_kv"].trim()}
                isLast
              />
            )}
          </SectionWithHeader>
        </div>
      )}
    </div>
  );
};

// Right Column Component
const RightColumnULTG: React.FC<{
  selectedData: ULTGData | null;
  selectedULTG: "BEKASI" | "CIKARANG";
  setSelectedULTG: (ultg: "BEKASI" | "CIKARANG") => void;
  parseValue: (value: string) => number;
}> = ({ selectedData, selectedULTG, setSelectedULTG, parseValue }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <div className="text-gray-500 text-sm mb-4 px-2 text-center">
          Detail Aset Per ULTG
        </div>

        {/* ULTG Selector */}
        <div className="flex mb-4">
          <ULTGButton
            label="ULTG BEKASI"
            isActive={selectedULTG === "BEKASI"}
            onClick={() => setSelectedULTG("BEKASI")}
          />
          <ULTGButton
            label="ULTG CIKARANG"
            isActive={selectedULTG === "CIKARANG"}
            onClick={() => setSelectedULTG("CIKARANG")}
          />
        </div>

        {selectedData && (
          <div className="bg-white">
            {/* ULTG Name */}
            <div className="mb-4 bg-gradient-to-b from-teal-50 to-teal-100 p-3 rounded-xl border-2 border-teal-200">
              <div className="text-xs text-gray-600 mb-1">ULTG</div>
              <div className="text-xl font-bold text-teal-800">
                {selectedULTG}
              </div>
            </div>

            {/* Jumlah GI */}
            <GradientCard
              title="Jumlah Gardu Induk"
              value={parseValue(selectedData.jumlah_gi)}
            />

            {/* Jumlah GITET */}
            <GradientCard
              title="Jumlah GITET"
              value={parseValue(selectedData.jumlah_gitet)}
            />

            {/* Joint SK for selected ULTG */}
            <GradientCard
              title="Joint SK"
              value={`${selectedData.jumlah_sk.trim()} Unit`}
            />

            {/* Jumlah Tower */}
            <GradientCard
              title="Jumlah Tower"
              value={parseValue(selectedData.jumlah_tower)}
            />

            {/* Total KMS Transmisi */}
            <GradientCard
              title="Total KMS Transmisi"
              value={`${parseValue(selectedData.total_kms_transmisu).toFixed(
                1
              )} KMS`}
            />

            {/* Total Unit & Kapasitas */}
            <div className="mb-4">
              <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 space-x-1">
                <div></div>
                <div className="grid grid-cols-2 space-x-1 text-center">
                  <span className="text-xs text-gray-600">Total Unit</span>
                  <span className="text-xs text-gray-600">Total Kapasitas</span>
                </div>
              </div>
              <GradientCardDouble
                title="Transformer"
                value1={parseValue(selectedData.yotal_unit)}
                value2={`${parseValue(
                  selectedData.total_kapasitas
                ).toLocaleString()} MVA`}
              />
            </div>

            {/* Level Tegangan GITET */}
            <SectionWithHeader
              leftHeader="Level Tegangan GITET"
              rightHeader="Jumlah"
            >
              {parseValue(selectedData.level_tegangan_gi_gitet["500_kv"]) >
                0 && (
                <VoltageRow
                  voltage="500 KV"
                  value={selectedData.level_tegangan_gi_gitet["500_kv"].trim()}
                />
              )}
              {parseValue(selectedData.level_tegangan_gi_gitet["150_kv"]) >
                0 && (
                <VoltageRow
                  voltage="150 KV"
                  value={selectedData.level_tegangan_gi_gitet["150_kv"].trim()}
                  isLast
                />
              )}
            </SectionWithHeader>

            {/* Level Tegangan GIS/GISTET */}
            <SectionWithHeader
              leftHeader="Level Tegangan GIS/GISTET"
              rightHeader="Jumlah"
            >
              {parseValue(selectedData.level_tegangan_gi_gitset["500_kv"]) >
                0 && (
                <VoltageRow
                  voltage="500 KV"
                  value={selectedData.level_tegangan_gi_gitset["500_kv"].trim()}
                />
              )}
              {parseValue(selectedData.level_tegangan_gi_gitset["150_kv"]) >
                0 && (
                <VoltageRow
                  voltage="150 KV"
                  value={selectedData.level_tegangan_gi_gitset["150_kv"].trim()}
                  isLast
                />
              )}
            </SectionWithHeader>

            {/* Transformer Details */}
            <div className="mb-4">
              <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 space-x-1">
                <div>Level Tegangan Trafo</div>
                <div className="grid grid-cols-2 space-x-1 text-center">
                  <span className="float-right text-xs">Unit</span>
                  <span className="float-right text-xs">Kapasitas</span>
                </div>
              </div>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                {parseValue(selectedData.level_tegangan["500_150_kv"].jumlah) >
                  0 && (
                  <TransformerRow
                    voltage="500/150 KV"
                    unit={selectedData.level_tegangan[
                      "500_150_kv"
                    ].jumlah.trim()}
                    mva={selectedData.level_tegangan["500_150_kv"].mva.trim()}
                  />
                )}
                {parseValue(selectedData.level_tegangan["150_20_kv"].jumlah) >
                  0 && (
                  <TransformerRow
                    voltage="150/20 KV"
                    unit={selectedData.level_tegangan[
                      "150_20_kv"
                    ].jumlah.trim()}
                    mva={selectedData.level_tegangan["150_20_kv"].mva.trim()}
                    isLast
                  />
                )}
              </div>
            </div>

            {/* Tower Details per Voltage */}
            <div className="mb-4">
              <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-3 text-center">
                <div>Level Tegangan Tower</div>
                <span className="float-right">Jumlah</span>
                <span className="float-right">KMS</span>
              </div>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                {parseValue(
                  selectedData.level_tegangan_tower["500_kv"].jumlah
                ) > 0 && (
                  <TowerRow
                    voltage="500 KV"
                    count={selectedData.level_tegangan_tower[
                      "500_kv"
                    ].jumlah.trim()}
                    kms={selectedData.level_tegangan_tower["500_kv"].mva.trim()}
                  />
                )}
                {parseValue(
                  selectedData.level_tegangan_tower["150_kv"].jumlah
                ) > 0 && (
                  <TowerRow
                    voltage="150 KV"
                    count={selectedData.level_tegangan_tower[
                      "150_kv"
                    ].jumlah.trim()}
                    kms={selectedData.level_tegangan_tower["150_kv"].mva.trim()}
                    isLast
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable UI Components
const GradientCard: React.FC<{ title: string; value: string | number }> = ({
  title,
  value,
}) => (
  <div
    className="text-white px-4 py-3 rounded-full mb-4 text-sm font-medium grid grid-cols-2 items-center"
    style={{
      background: "linear-gradient(to bottom, #15677B, #179FB7)",
    }}
  >
    <span>{title}</span>
    <div className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-[16px] text-center">
      {value}
    </div>
  </div>
);

const GradientCardDouble: React.FC<{
  title: string;
  value1: string | number;
  value2: string | number;
}> = ({ title, value1, value2 }) => (
  <div
    className="text-white px-4 py-3 rounded-full text-sm font-medium grid grid-cols-2 space-x-1 items-center"
    style={{
      background: "linear-gradient(to bottom, #15677B, #179FB7)",
    }}
  >
    <span>{title}</span>
    <div className="grid grid-cols-2 space-x-1">
      <div className="bg-white text-gray-800 px-3 py-1 rounded-full font-bold text-sm">
        <div className="font-bold">{value1}</div>
      </div>
      <div className="bg-white text-gray-800 px-3 py-1 rounded-full font-bold text-sm">
        <div className="font-bold">{value2}</div>
      </div>
    </div>
  </div>
);

const SectionWithHeader: React.FC<{
  leftHeader: string;
  rightHeader: string;
  children: React.ReactNode;
}> = ({ leftHeader, rightHeader, children }) => (
  <div className="mb-4">
    <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 text-center">
      <div>{leftHeader}</div>
      <span className="float-right">{rightHeader}</span>
    </div>
    <div
      className="rounded-2xl p-4"
      style={{
        background: "linear-gradient(to bottom, #15677B, #179FB7)",
      }}
    >
      {children}
    </div>
  </div>
);

const VoltageRow: React.FC<{
  voltage: string;
  value: string;
  isLast?: boolean;
}> = ({ voltage, value, isLast = false }) => (
  <div className={isLast ? "mb-2 last:mb-0" : "mb-2"}>
    <div className="grid grid-cols-2 items-center space-x-2">
      <div className="text-white py-2 rounded-full text-sm font-medium flex-1">
        {voltage}
      </div>
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm text-center">
        {value}
      </div>
    </div>
  </div>
);

const SimpleRow: React.FC<{
  label: string;
  value: string;
  isLast?: boolean;
}> = ({ label, value, isLast = false }) => (
  <div className={isLast ? "mb-2 last:mb-0" : "mb-2"}>
    <div className="grid grid-cols-2 items-center space-x-2">
      <div className="text-white py-2 text-sm font-medium">{label}</div>
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm text-center">
        {value}
      </div>
    </div>
  </div>
);

const TransformerRow: React.FC<{
  voltage: string;
  unit: string;
  mva: string;
  isLast?: boolean;
}> = ({ voltage, unit, mva, isLast = false }) => (
  <div
    className={
      isLast ? "mb-2 last:mb-0 grid grid-cols-2" : "mb-2 grid grid-cols-2"
    }
  >
    <div className="text-white py-2 rounded-full text-sm font-medium mb-2">
      {voltage}
    </div>
    <div className="flex justify-between items-center space-x-2">
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex-1 text-center ">
        {unit} Unit
      </div>
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex-1 text-center">
        {mva} MVA
      </div>
    </div>
  </div>
);

const TowerRow: React.FC<{
  voltage: string;
  count: string;
  kms: string;
  isLast?: boolean;
}> = ({ voltage, count, kms, isLast = false }) => (
  <div className={isLast ? "mb-2 last:mb-0" : "mb-2"}>
    <div className="grid grid-cols-3 items-center space-x-2">
      <div className="text-white px-4 py-2 rounded-full text-sm flex-1">
        {voltage}
      </div>
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm justify-center text-center">
        {count}
      </div>
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm justify-center text-center">
        {kms} KMS
      </div>
    </div>
  </div>
);

const ULTGButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-4 py-2 rounded-full text-center text-sm font-medium ${
      isActive ? "text-white mr-2" : "bg-gray-300 text-black ml-2"
    }`}
    style={
      isActive
        ? {
            background: "linear-gradient(to bottom, #15677B, #179FB7)",
          }
        : {}
    }
  >
    {label}
  </button>
);

export default DataAssetContent;
