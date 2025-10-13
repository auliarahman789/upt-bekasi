import React from "react";

interface WorkItem {
  bidang: string;
  program: string;
  uraian_pekerjaan: string;
  target: string;
  realisasi: string;
  persen_realisasi: string;
}

interface PrintableLMABOProps {
  data: WorkItem[];
  selectedBidang?: string;
}

const PrintableLMABO = React.forwardRef<HTMLDivElement, PrintableLMABOProps>(
  ({ data, selectedBidang }, ref) => {
    // Get unique bidang values
    const availableBidang = [
      ...new Set(data.map((item) => item.bidang)),
    ].filter((bidang) => bidang);

    // Filter bidang if selectedBidang is provided
    const bidangToShow = selectedBidang ? [selectedBidang] : availableBidang;

    // Process data for a specific bidang
    const processDataForBidang = (bidang: string) => {
      const filteredData = data.filter((item) => item.bidang === bidang);

      const grouped: { [program: string]: WorkItem[] } = {
        "LEAD MEASURE": [],
        "ANTI-BLACKOUT": [],
        LAINNYA: [],
      };

      filteredData.forEach((workItem) => {
        let program = workItem.program;

        if (program === "LM") program = "LEAD MEASURE";
        else if (program === "ABO") program = "ANTI-BLACKOUT";
        else if (program === "-") program = "LAINNYA";

        if (grouped[program]) {
          grouped[program].push(workItem);
        }
      });

      return grouped;
    };

    const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
      const numericPercentage = Math.min(Math.max(percentage, 0), 100);

      return (
        <div className="flex-1 bg-red-400 rounded-full h-5">
          <div
            className="bg-green-400 h-5 rounded-full transition-all duration-300"
            style={{ width: `${numericPercentage}%` }}
          />
        </div>
      );
    };

    const WorkItemRow: React.FC<{ item: WorkItem }> = ({ item }) => {
      const percentage =
        parseFloat(item.persen_realisasi.replace("%", "")) || 0;
      const target = parseInt(item.target) || 0;
      const realisasi = parseInt(item.realisasi) || 0;

      return (
        <div className="mb-4 pb-4 border-b border-gray-200 last:border-0">
          <h4 className="text-base font-medium text-gray-700 mb-3">
            {item.uraian_pekerjaan}
          </h4>

          <div className="flex items-center gap-3">
            <ProgressBar percentage={percentage} />
            <div className="flex gap-2 flex-shrink-0">
              <span className="text-sm bg-[#5DADE2] text-white px-3 py-1 rounded font-medium">
                {item.persen_realisasi}
              </span>
              <span className="text-sm bg-[#85C1E9] text-white px-3 py-1 rounded font-medium">
                {realisasi}/{target}
              </span>
            </div>
          </div>
        </div>
      );
    };

    const ProgramSection: React.FC<{
      title: string;
      items: WorkItem[];
      icon: string;
    }> = ({ title, items, icon }) => (
      <div className="mb-8">
        <div className="flex items-center mb-6 bg-gray-100 p-4 rounded-lg">
          <div className="w-12 h-12 bg-white rounded-lg mr-4 flex items-center justify-center shadow-sm">
            <span className="text-3xl">{icon}</span>
          </div>
          <h3 className="font-bold text-[#155C72] text-2xl">{title}</h3>
        </div>

        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          {items && items.length > 0 ? (
            items.map((workItem, itemIndex) => (
              <WorkItemRow key={`${title}-${itemIndex}`} item={workItem} />
            ))
          ) : (
            <div className="text-gray-500 text-base py-8 text-center">
              Tidak ada data
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div ref={ref} className="print-container">
        {bidangToShow.map((bidang) => {
          const processedData = processDataForBidang(bidang);
          const programCategories = [
            "LEAD MEASURE",
            "ANTI-BLACKOUT",
            "LAINNYA",
          ];

          return (
            <div key={bidang} className="print-page">
              <div className="print-header">
                <h1 className="text-4xl font-bold text-[#155C72] text-center mb-4">
                  LEAD MEASURE & ANTI BLACKOUT
                </h1>
                <h2 className="text-3xl font-semibold text-[#179FB7] text-center mb-6">
                  {bidang.toUpperCase()}
                </h2>
                <div className="text-center mb-8">
                  <span className="text-lg text-gray-600">
                    Monitoring Program Lead Measure dan Anti Blackout
                  </span>
                </div>
              </div>

              <div className="print-card">
                {/* Single Column Layout */}
                <div className="space-y-6">
                  {programCategories.map((program) => {
                    const items = processedData[program] || [];
                    const icons = {
                      "LEAD MEASURE": "📊",
                      "ANTI-BLACKOUT": "⚡",
                      LAINNYA: "📋",
                    };

                    return (
                      <ProgramSection
                        key={program}
                        title={program}
                        items={items}
                        icon={icons[program as keyof typeof icons]}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        <style>
          {`
            .print-container {
              background: white;
            }

            .print-page {
              width: 100%;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              padding: 40px;
              page-break-after: always;
              break-after: page;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .print-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }

            .print-header {
              width: 100%;
              margin-bottom: 30px;
            }

            .print-card {
              width: 100%;
              max-width: 1200px;
              background: white;
              border-radius: 20px;
              padding: 40px;
              margin: 0 auto;
            }

            @media print {
              .print-container {
                background: white;
              }

              .print-page {
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                min-height: 100vh;
              }

              .print-page:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }

              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }

              .print-card {
                box-shadow: none;
              }
            }

            @media screen {
              .print-page {
                border: 1px solid #e5e7eb;
                margin-bottom: 20px;
              }
            }
          `}
        </style>
      </div>
    );
  }
);

PrintableLMABO.displayName = "PrintableLMABO";

export default PrintableLMABO;
