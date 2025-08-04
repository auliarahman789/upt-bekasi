import DefaultLayout from "../../../layout/DefaultLayout";

// Updated mock data to match the images
const mockData = {
  gitet: {
    jumlahGitet: 3,
    jumlahGarduInduk: 23,
    levelTegangan: [
      { level: "500 KV", jumlah: 21 },
      { level: "150 KV", jumlah: 21 },
      { level: "70 KV", jumlah: 2 },
    ],
    transformer: [
      { tegangan: "500/150 KV", jumlahUnit: 24, totalKapasitas: "4000 MVA" },
      { tegangan: "150/20/22 KV", jumlahUnit: 24, totalKapasitas: "3300 MVA" },
      { tegangan: "150/70 KV", jumlahUnit: 24, totalKapasitas: "100 MVA" },
    ],
    tower: {
      jumlahTower: 762,
      totalKms: "469.147 KMS",
      levelTegangan: [
        { level: "500 KV", jumlah: 1198, totalKms: "101.778 KMS" },
        { level: "150 KV", jumlah: 612, totalKms: "362.872 KMS" },
        { level: "70 KV", jumlah: 31, totalKms: "4.5 KMS" },
        { level: "SKTT 150 KV", jumlah: 0, totalKms: "26.48 KMS" },
      ],
    },
  },
  petaTower: {
    dataRelay: [
      { name: "Line Current Differential", jumlah: 21 },
      { name: "Distance", jumlah: 21 },
      { name: "Differential Trafo", jumlah: 2 },
      { name: "Overcurrent", jumlah: 2 },
      { name: "SBEF", jumlah: 2 },
      { name: "Busbar Protection", jumlah: 2 },
      { name: "CBF/SZP", jumlah: 2 },
      { name: "CCP", jumlah: 2 },
      { name: "Auto Recloser", jumlah: 2 },
      { name: "AVR", jumlah: 2 },
      { name: "Under/Over Voltage", jumlah: 2 },
      { name: "NVDR", jumlah: 2 },
      { name: "SEF", jumlah: 2 },
    ],
    dataAsset: [
      { name: "DFR Qualitrol", jumlah: 21 },
      { name: "DFR Ametek", jumlah: 21 },
      { name: "DFR Siemens", jumlah: 2 },
      { name: "DFR NR", jumlah: 2 },
      { name: "Fault Locator Qualitrol", jumlah: 2 },
      { name: "PQM", jumlah: 2 },
      { name: "DC Clip", jumlah: 2 },
    ],
  },
  petaGarduInduk: {
    ultgSekasi: 2,
    ultgCikarang: 2,
    jumlahTower: 2,
    totalKmsTower: "246.15 KMS",
    levelTegangan: [
      { level: "500 KV", jumlah: 10 },
      { level: "150 KV", jumlah: 2 },
      { level: "70 KV", jumlah: 2 },
    ],
    personalData: [
      { position: "Manager ULTG", jumlah: 10 },
      { position: "Team Leader", jumlah: 2 },
      { position: "SOF/Askin", jumlah: 2 },
      { position: "Staff Har GI", jumlah: 10 },
      { position: "Staff Har Pro", jumlah: 10 },
      { position: "Staff Har Jar", jumlah: 10 },
      { position: "PJ K3", jumlah: 10 },
    ],
  },
  totalAsset: "Rp 6.560.000.003.000",
};

const DataAssetPage = () => {
  const totalTransformers = mockData.gitet.transformer.reduce(
    (acc, curr) => acc + curr.jumlahUnit,
    0
  );
  const totalCapacity = "7400 MVA";

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Tabs */}
        <div className="flex mb-6 space-x-2 text-sm">
          <button
            style={{
              background: "linear-gradient(to bottom, #15677B, #179FB7)",
            }}
            className="text-white py-2 px-4 rounded-full font-semibold"
          >
            DATA ASSET
          </button>
          <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded-full font-semibold">
            PETA TOWER
          </button>
          <button className="bg-gray-300 text-gray-700 py-2 px-4 rounded-full font-semibold">
            PETA GARDU INDUK
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - GITET Section */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              {/* Jumlah GITET */}
              <div
                className="text-white px-4 py-3 rounded-full mb-4 text-sm font-medium grid grid-cols-2 items-center"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                <span>Jumlah GITET</span>
                <div className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-[16px] text-center">
                  {mockData.gitet.jumlahGitet}
                </div>
              </div>

              {/* Jumlah Gardu Induk */}
              <div
                className="text-white px-4 py-3 rounded-full mb-4 text-sm font-medium grid grid-cols-2 items-center"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                <span>Jumlah Gardu Induk</span>
                <div className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-[16px] text-center">
                  {mockData.gitet.jumlahGarduInduk}
                </div>
              </div>

              {/* Level Tegangan Gardu Induk */}
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 text-center">
                  <div>Level Tegangan Gardu Induk</div>
                  <span className="float-right ">Jumlah Unit</span>
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  {mockData.gitet.levelTegangan.map((item, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <div className="grid grid-cols-2 items-center space-x-2">
                        <div className=" text-white  py-2 rounded-full text-sm font-medium flex-1">
                          {item.level}
                        </div>
                        <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm text-center">
                          {item.jumlah}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jumlah Transformer */}
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 space-x-1  ">
                  <div></div>
                  <div className="grid grid-cols-2 space-x-1 text-center">
                    <span className="text-xs text-gray-600">Total Unit</span>
                    <span className="text-xs text-gray-600">
                      Total Kapasitas
                    </span>
                  </div>
                </div>
                <div
                  className="text-white px-4 py-3 rounded-full text-sm font-medium grid grid-cols-2 space-x-1  items-center"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  <span>Jumlah Transformer</span>
                  <div className="grid grid-cols-2 space-x-1">
                    <div className="bg-white text-gray-800 px-3 py-1 rounded-full font-bold text-sm">
                      <div className="font-bold">{totalTransformers}</div>
                    </div>
                    <div className="bg-white text-gray-800 px-3 py-1 rounded-full font-bold text-sm">
                      <div className="font-bold">{totalCapacity}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Tegangan Trafo */}
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 space-x-1  ">
                  <div>Level Tegangan Trafo</div>
                  <div className="grid grid-cols-2 space-x-1 text-center">
                    <span className="float-right ">Total Unit</span>
                    <span className="float-right">Total Kapasitas</span>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  {mockData.gitet.transformer.map((item, index) => (
                    <div
                      key={index}
                      className="mb-2 last:mb-0 grid grid-cols-2"
                    >
                      <div className=" text-white py-2 rounded-full text-sm font-medium mb-2">
                        {item.tegangan}
                      </div>
                      <div className="flex justify-between items-center space-x-2">
                        <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex-1 text-center">
                          {item.jumlahUnit} Unit
                        </div>
                        <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex-1 text-center">
                          {item.totalKapasitas}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tower Section */}
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              {/* Jumlah Tower */}
              <div
                className="text-white px-4 py-3 rounded-full mb-4 text-sm font-medium grid grid-cols-2 items-center"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                <span>Jumlah Tower</span>
                <div className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-[16px] text-center">
                  {mockData.gitet.tower.jumlahTower}
                </div>
              </div>

              {/* Total KMS Tower */}
              <div
                className="text-white px-4 py-3 rounded-full mb-4 text-sm font-medium grid grid-cols-2 items-center"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                <span>Total KMS Tower</span>
                <div className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-[16px] text-center">
                  {mockData.gitet.tower.totalKms}
                </div>
              </div>

              {/* Level Tegangan Tower */}
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-3 space-x-1  ">
                  <div>Level Tegangan Tower</div>
                  <div className="col-span-2 grid grid-cols-2 space-x-1 text-center">
                    <span className="float-right  ">Jumlah (Unit)</span>
                    <span className="float-right">Total KMS</span>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  {mockData.gitet.tower.levelTegangan.map((item, index) => (
                    <div
                      key={index}
                      className="mb-2 last:mb-0 grid grid-cols-3"
                    >
                      <div className=" text-white py-2 rounded-full text-sm font-medium mb-2">
                        {item.level}
                      </div>
                      <div className="flex justify-between items-center space-x-2 col-span-2">
                        <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex-1 text-center">
                          {item.jumlah}
                        </div>
                        <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex-1 text-center">
                          {item.totalKms}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - PETA TOWER Section */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 text-center">
                <div>Data Relay Proteksi</div>
                <span className="float-right ">Jumlah Unit</span>
              </div>
              <div
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                {mockData.petaTower.dataRelay.map((item, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="grid grid-cols-2 items-center space-x-2">
                      <div className=" text-white px-4 py-2 rounded-full text-sm flex-1">
                        {item.name}
                      </div>
                      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm justify-center text-center">
                        {item.jumlah}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 text-center">
                <div>Data Alat Perekam</div>

                <span className="float-right">Jumlah Unit</span>
              </div>
              <div
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                {mockData.petaTower.dataAsset.map((item, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="grid grid-cols-2 items-center space-x-2">
                      <div className=" text-white px-4 py-2 rounded-full text-sm flex-1">
                        {item.name}
                      </div>
                      <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm justify-center text-center">
                        {item.jumlah}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - PETA GARDU INDUK Section */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <div className="text-gray-500 text-sm mb-4 px-2 text-center">
                Detail Aset Per ULTG
              </div>
              <div className="flex mb-4">
                <div
                  className="flex-1 text-white px-4 py-2 rounded-full text-center text-sm font-medium mr-2"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  ULTG BEKASI
                </div>
                <div className="flex-1 bg-gray-300 text-black px-4 py-2 rounded-full text-center text-sm font-medium">
                  ULTG CIKARANG
                </div>
              </div>

              {/* Jumlah Tower */}
              <div
                className="text-white px-4 py-3 rounded-full mb-4 text-sm font-medium  grid grid-cols-2 items-center"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                <span>Jumlah Tower</span>
                <div className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-[16px] text-center">
                  {mockData.petaGarduInduk.jumlahTower}
                </div>
              </div>

              {/* Total KMS Tower */}
              <div
                className="text-white px-4 py-3 rounded-full mb-4 text-sm font-medium grid grid-cols-2 items-center"
                style={{
                  background: "linear-gradient(to bottom, #15677B, #179FB7)",
                }}
              >
                <span>Total KMS Tower</span>
                <div className="bg-white text-gray-800 px-4 py-1 rounded-full font-bold text-[16px] text-center">
                  {mockData.petaGarduInduk.totalKmsTower}
                </div>
              </div>

              {/* Level Tegangan GI */}
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 text-center">
                  <div>Level Tegangan GI</div>

                  <span className="float-right">Jumlah GI</span>
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  {mockData.petaGarduInduk.levelTegangan.map((item, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <div className="grid grid-cols-2 items-center space-x-2">
                        <div className=" text-white px-4 py-2 rounded-full text-sm flex-1">
                          {item.level}
                        </div>
                        <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm justify-center text-center">
                          {item.jumlah}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FTK Pegawai */}
              <div className="mb-4">
                <div className="text-gray-500 text-sm mb-2 px-2 grid grid-cols-2 text-center">
                  <div> FTK Pegawai</div>

                  <span className="float-right">Jumlah Personil</span>
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "linear-gradient(to bottom, #15677B, #179FB7)",
                  }}
                >
                  {mockData.petaGarduInduk.personalData.map((item, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <div className="grid grid-cols-2 items-center space-x-2">
                        <div className=" text-white px-4 py-2 rounded-full text-sm flex-1">
                          {item.position}
                        </div>
                        <div className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm justify-center text-center">
                          {item.jumlah}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Asset */}
            <div
              style={{
                background: "linear-gradient(to bottom, #15677B, #179FB7)",
              }}
              className="text-white p-6 rounded-2xl"
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-teal-600 font-bold text-[16px]">₹</span>
                </div>
                <span className="text-sm font-medium">
                  TOTAL ASSET KESELURUHAN
                </span>
              </div>
              <div className="text-2xl font-bold">{mockData.totalAsset}</div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DataAssetPage;
