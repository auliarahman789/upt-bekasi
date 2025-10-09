import React from "react";

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

interface DataAssetContentProps {
  totalData: AssetData;
  totals: {
    totalGI: number;
    totalGIS: number;
    totalTransformers: number;
    totalCapacity: number;
    totalTowers: number;
    totalKms: number;
  };
  selectedData: AssetData | null;
  selectedULTG: "BEKASI" | "CIKARANG";
  setSelectedULTG: (ultg: "BEKASI" | "CIKARANG") => void;
  parseValue: (value: string) => number;
}

const DataAssetContent: React.FC<DataAssetContentProps> = ({
  totalData,
  totals,
  selectedData,
  selectedULTG,
  setSelectedULTG,
  parseValue,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - GITET Section */}
      <LeftColumnGITET
        totalData={totalData}
        totals={totals}
        parseValue={parseValue}
      />

      {/* Middle Column - Tower Section */}
      <MiddleColumnTower
        totalData={totalData}
        totals={totals}
        parseValue={parseValue}
      />

      {/* Right Column - ULTG Detail Section */}
      <RightColumnULTG
        selectedData={selectedData}
        selectedULTG={selectedULTG}
        setSelectedULTG={setSelectedULTG}
        parseValue={parseValue}
      />
    </div>
  );
};

// Left Column Component
const LeftColumnGITET: React.FC<{
  totalData: AssetData;
  totals: any;
  parseValue: (value: string) => number;
}> = ({ totalData, totals, parseValue }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        {/* Jumlah GITET */}
        <GradientCard
          title="Jumlah GITET"
          value={parseValue(totalData.gi_gitet["500_kv"])}
        />

        {/* Jumlah Gardu Induk */}
        <GradientCard
          title="Jumlah Gardu Induk"
          value={totals.totalGI + totals.totalGIS}
        />

        {/* Level Tegangan Gardu Induk (GI) */}
        <SectionWithHeader
          leftHeader="Level Tegangan Gardu Induk (GI)"
          rightHeader="Jumlah Unit"
        >
          {parseValue(totalData.gi_gitet["500_kv"]) > 0 && (
            <VoltageRow
              voltage="500 KV"
              value={totalData.gi_gitet["500_kv"].trim()}
            />
          )}
          {parseValue(totalData.gi_gitet["150_kv"]) > 0 && (
            <VoltageRow
              voltage="150 KV"
              value={totalData.gi_gitet["150_kv"].trim()}
            />
          )}
          {parseValue(totalData.gi_gitet["70_kv"]) > 0 && (
            <VoltageRow
              voltage="70 KV"
              value={totalData.gi_gitet["70_kv"].trim()}
              isLast
            />
          )}
        </SectionWithHeader>

        {/* Level Tegangan GIS/GISTET */}
        <SectionWithHeader
          leftHeader="Level Tegangan GIS/GISTET"
          rightHeader="Jumlah Unit"
        >
          {parseValue(totalData.gis_gistet["500_kv"]) > 0 && (
            <VoltageRow
              voltage="500 KV"
              value={totalData.gis_gistet["500_kv"].trim()}
            />
          )}
          {parseValue(totalData.gis_gistet["150_kv"]) > 0 && (
            <VoltageRow
              voltage="150 KV"
              value={totalData.gis_gistet["150_kv"].trim()}
            />
          )}
          {parseValue(totalData.gis_gistet["70_kv"]) > 0 && (
            <VoltageRow
              voltage="70 KV"
              value={totalData.gis_gistet["70_kv"].trim()}
              isLast
            />
          )}
        </SectionWithHeader>

        {/* Joint SK */}
        <GradientCard
          title="Joint SK (Sambungan Kabel)"
          value={`${totalData.joint_sk.trim()} Unit`}
        />

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
            value1={totals.totalTransformers}
            value2={`${totals.totalCapacity.toLocaleString()} MVA`}
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
            {parseValue(totalData.trafo_500_150_kv.jumlah) > 0 && (
              <TransformerRow
                voltage="500/150 KV"
                unit={totalData.trafo_500_150_kv.jumlah.trim()}
                mva={totalData.trafo_500_150_kv.mva.trim()}
              />
            )}
            {parseValue(totalData.trafo_150_20_kv.jumlah) > 0 && (
              <TransformerRow
                voltage="150/20 KV"
                unit={totalData.trafo_150_20_kv.jumlah.trim()}
                mva={totalData.trafo_150_20_kv.mva.trim()}
              />
            )}
            {parseValue(totalData.trafo_150_70_kv.jumlah) > 0 && (
              <TransformerRow
                voltage="150/70 KV"
                unit={totalData.trafo_150_70_kv.jumlah.trim()}
                mva={totalData.trafo_150_70_kv.mva.trim()}
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
  totalData: AssetData;
  totals: any;
  parseValue: (value: string) => number;
}> = ({ totalData, totals, parseValue }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg">
      {/* Jumlah Tower */}
      <GradientCard title="Jumlah Tower" value={totals.totalTowers} />

      {/* Total KMS Tower */}
      <GradientCard
        title="Total KMS Tower"
        value={`${totals.totalKms.toFixed(1)} KMS`}
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
          {parseValue(totalData.jumlah_tower["500_kv"]) > 0 && (
            <TowerRow
              voltage="500 KV"
              count={totalData.jumlah_tower["500_kv"].trim()}
              kms={(
                parseValue(totalData.kms_500_kv.su) +
                parseValue(totalData.kms_500_kv.sk)
              ).toFixed(1)}
            />
          )}
          {parseValue(totalData.jumlah_tower["150_kv"]) > 0 && (
            <TowerRow
              voltage="150 KV"
              count={totalData.jumlah_tower["150_kv"].trim()}
              kms={(
                parseValue(totalData.kms_150_kv.su) +
                parseValue(totalData.kms_150_kv.sk)
              ).toFixed(1)}
            />
          )}
          {parseValue(totalData.jumlah_tower["70_kv"]) > 0 && (
            <TowerRow
              voltage="70 KV"
              count={totalData.jumlah_tower["70_kv"].trim()}
              kms={(
                parseValue(totalData.kms_70_kv.su) +
                parseValue(totalData.kms_70_kv.sk)
              ).toFixed(1)}
              isLast
            />
          )}
        </div>
      </div>

      {/* Detailed KMS Breakdown - 500 KV */}
      {parseValue(totalData.jumlah_tower["500_kv"]) > 0 && (
        <div className="mb-4">
          <div className="text-gray-500 text-sm mb-2 px-2">
            KMS 500 KV (Rincian)
          </div>
          <div
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(to bottom, #15677B, #179FB7)",
            }}
          >
            <KMSDetailRow
              label="Saluran Udara (SU)"
              value={totalData.kms_500_kv.su.trim()}
            />
            <KMSDetailRow
              label="Saluran Kabel (SK)"
              value={totalData.kms_500_kv.sk.trim()}
              isLast
            />
          </div>
        </div>
      )}

      {/* Detailed KMS Breakdown - 150 KV */}
      {parseValue(totalData.jumlah_tower["150_kv"]) > 0 && (
        <div className="mb-4">
          <div className="text-gray-500 text-sm mb-2 px-2">
            KMS 150 KV (Rincian)
          </div>
          <div
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(to bottom, #15677B, #179FB7)",
            }}
          >
            <KMSDetailRow
              label="Saluran Udara (SU)"
              value={totalData.kms_150_kv.su.trim()}
            />
            <KMSDetailRow
              label="Saluran Kabel (SK)"
              value={totalData.kms_150_kv.sk.trim()}
              isLast
            />
          </div>
        </div>
      )}

      {/* Detailed KMS Breakdown - 70 KV */}
      {parseValue(totalData.jumlah_tower["70_kv"]) > 0 && (
        <div className="mb-4">
          <div className="text-gray-500 text-sm mb-2 px-2">
            KMS 70 KV (Rincian)
          </div>
          <div
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(to bottom, #15677B, #179FB7)",
            }}
          >
            <KMSDetailRow
              label="Saluran Udara (SU)"
              value={totalData.kms_70_kv.su.trim()}
            />
            <KMSDetailRow
              label="Saluran Kabel (SK)"
              value={totalData.kms_70_kv.sk.trim()}
              isLast
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Right Column Component
const RightColumnULTG: React.FC<{
  selectedData: AssetData | null;
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
                {selectedData.ultg}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                UPT: {selectedData.upt}
              </div>
            </div>

            {/* Joint SK for selected ULTG */}
            <GradientCard
              title="Joint SK"
              value={`${selectedData.joint_sk.trim()} Unit`}
            />

            {/* Jumlah Tower */}
            <GradientCard
              title="Jumlah Tower"
              value={
                parseValue(selectedData.jumlah_tower["500_kv"]) +
                parseValue(selectedData.jumlah_tower["150_kv"]) +
                parseValue(selectedData.jumlah_tower["70_kv"])
              }
            />

            {/* Total KMS Tower */}
            <GradientCard
              title="Total KMS Tower"
              value={`${(
                parseValue(selectedData.kms_500_kv.su) +
                parseValue(selectedData.kms_500_kv.sk) +
                parseValue(selectedData.kms_150_kv.su) +
                parseValue(selectedData.kms_150_kv.sk) +
                parseValue(selectedData.kms_70_kv.su) +
                parseValue(selectedData.kms_70_kv.sk)
              ).toFixed(1)} KMS`}
            />

            {/* Level Tegangan GI */}
            <SectionWithHeader
              leftHeader="Level Tegangan GI"
              rightHeader="Jumlah GI"
            >
              {parseValue(selectedData.gi_gitet["500_kv"]) > 0 && (
                <VoltageRow
                  voltage="500 KV"
                  value={selectedData.gi_gitet["500_kv"].trim()}
                />
              )}
              {parseValue(selectedData.gi_gitet["150_kv"]) > 0 && (
                <VoltageRow
                  voltage="150 KV"
                  value={selectedData.gi_gitet["150_kv"].trim()}
                />
              )}
              {parseValue(selectedData.gi_gitet["70_kv"]) > 0 && (
                <VoltageRow
                  voltage="70 KV"
                  value={selectedData.gi_gitet["70_kv"].trim()}
                  isLast
                />
              )}
            </SectionWithHeader>

            {/* Level Tegangan GIS */}
            <SectionWithHeader
              leftHeader="Level Tegangan GIS"
              rightHeader="Jumlah GIS"
            >
              {parseValue(selectedData.gis_gistet["500_kv"]) > 0 && (
                <VoltageRow
                  voltage="500 KV"
                  value={selectedData.gis_gistet["500_kv"].trim()}
                />
              )}
              {parseValue(selectedData.gis_gistet["150_kv"]) > 0 && (
                <VoltageRow
                  voltage="150 KV"
                  value={selectedData.gis_gistet["150_kv"].trim()}
                />
              )}
              {parseValue(selectedData.gis_gistet["70_kv"]) > 0 && (
                <VoltageRow
                  voltage="70 KV"
                  value={selectedData.gis_gistet["70_kv"].trim()}
                  isLast
                />
              )}
            </SectionWithHeader>

            {/* Transformer Details */}
            <div className="mb-4">
              <div className="text-gray-500 text-sm mb-2 px-2">
                Detail Transformer
              </div>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                {parseValue(selectedData.trafo_500_150_kv.jumlah) > 0 && (
                  <TransformerRow
                    voltage="500/150 KV"
                    unit={selectedData.trafo_500_150_kv.jumlah.trim()}
                    mva={selectedData.trafo_500_150_kv.mva.trim()}
                  />
                )}
                {parseValue(selectedData.trafo_150_20_kv.jumlah) > 0 && (
                  <TransformerRow
                    voltage="150/20 KV"
                    unit={selectedData.trafo_150_20_kv.jumlah.trim()}
                    mva={selectedData.trafo_150_20_kv.mva.trim()}
                  />
                )}
                {parseValue(selectedData.trafo_150_70_kv.jumlah) > 0 && (
                  <TransformerRow
                    voltage="150/70 KV"
                    unit={selectedData.trafo_150_70_kv.jumlah.trim()}
                    mva={selectedData.trafo_150_70_kv.mva.trim()}
                    isLast
                  />
                )}
              </div>
            </div>

            {/* Tower Details per Voltage */}
            <div className="mb-4">
              <div className="text-gray-500 text-sm mb-2 px-2">
                Detail Tower per Tegangan
              </div>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                {parseValue(selectedData.jumlah_tower["500_kv"]) > 0 && (
                  <TowerRow
                    voltage="500 KV"
                    count={selectedData.jumlah_tower["500_kv"].trim()}
                    kms={(
                      parseValue(selectedData.kms_500_kv.su) +
                      parseValue(selectedData.kms_500_kv.sk)
                    ).toFixed(1)}
                  />
                )}
                {parseValue(selectedData.jumlah_tower["150_kv"]) > 0 && (
                  <TowerRow
                    voltage="150 KV"
                    count={selectedData.jumlah_tower["150_kv"].trim()}
                    kms={(
                      parseValue(selectedData.kms_150_kv.su) +
                      parseValue(selectedData.kms_150_kv.sk)
                    ).toFixed(1)}
                  />
                )}
                {parseValue(selectedData.jumlah_tower["70_kv"]) > 0 && (
                  <TowerRow
                    voltage="70 KV"
                    count={selectedData.jumlah_tower["70_kv"].trim()}
                    kms={(
                      parseValue(selectedData.kms_70_kv.su) +
                      parseValue(selectedData.kms_70_kv.sk)
                    ).toFixed(1)}
                    isLast
                  />
                )}
              </div>
            </div>

            {/* KMS Breakdown */}
            {parseValue(selectedData.jumlah_tower["500_kv"]) > 0 && (
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2">
                  KMS 500 KV
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <KMSDetailRow
                    label="SU"
                    value={selectedData.kms_500_kv.su.trim()}
                  />
                  <KMSDetailRow
                    label="SK"
                    value={selectedData.kms_500_kv.sk.trim()}
                    isLast
                  />
                </div>
              </div>
            )}

            {parseValue(selectedData.jumlah_tower["150_kv"]) > 0 && (
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2">
                  KMS 150 KV
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <KMSDetailRow
                    label="SU"
                    value={selectedData.kms_150_kv.su.trim()}
                  />
                  <KMSDetailRow
                    label="SK"
                    value={selectedData.kms_150_kv.sk.trim()}
                    isLast
                  />
                </div>
              </div>
            )}

            {parseValue(selectedData.jumlah_tower["70_kv"]) > 0 && (
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2">KMS 70 KV</div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <KMSDetailRow
                    label="SU"
                    value={selectedData.kms_70_kv.su.trim()}
                  />
                  <KMSDetailRow
                    label="SK"
                    value={selectedData.kms_70_kv.sk.trim()}
                    isLast
                  />
                </div>
              </div>
            )}
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
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex-1 text-center">
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

const KMSDetailRow: React.FC<{
  label: string;
  value: string;
  isLast?: boolean;
}> = ({ label, value, isLast = false }) => (
  <div className={isLast ? "mb-1 last:mb-0" : "mb-1"}>
    <div className="grid grid-cols-2 items-center space-x-2">
      <div className="text-white py-2 text-sm font-medium">{label}</div>
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm text-center">
        {value === "-" ? "-" : `${value} KMS`}
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
