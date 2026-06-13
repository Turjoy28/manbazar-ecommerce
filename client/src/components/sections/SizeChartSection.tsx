"use client";

export default function SizeChartSection({chart}) {
  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      {/* Label */}
      <div className="flex flex-col items-center mb-6">
        <p className="text-primary text-sm font-medium mb-1">
          {chart?.subTitle}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {chart?.title}
        </h2>
        <p className="text-gray-500 text-sm text-center max-w-lg">
          {chart?.description}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Size table */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="bg-primary text-(--primary-text) px-4 py-3">
            <h3 className="font-semibold text-base">{chart?.tableTitle}</h3>
            <p className="text-xs mt-0.5">{chart?.tableSubTitle}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {chart?.chartTable?.tableTitle.map((item: string) => (
                    <th
                      key={item}
                      className="px-4 py-3 text-left font-semibold text-gray-700"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.chartTable.tableProperties.map(
                  (row: string[], rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className={`border-b border-gray-100 ${
                        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-block bg-primary text-(--primary-text) text-xs font-bold px-2 py-0.5 rounded">
                          {row[0]}
                        </span>
                      </td>

                      <td className="px-4 py-3">{row[1]}</td>

                      <td className="px-4 py-3">{row[2]}</td>

                      <td className="px-4 py-3">{row[3]}</td>

                      <td className="px-4 py-3">{row[4]}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Note:</span> Manual measurement ±
              ০.৫ inch হতে পারে, তাই সন্দেহ হলে একটা বড় সাইজ নেওয়া ভালো।
            </p>
          </div>
        </div>

        {/* How to measure */}
        <div className="lg:w-72 flex flex-col gap-4 bg-white shadow-md p-5 rounded-xl border border-black/5">
          <h3 className="font-semibold text-gray-800 text-base">
            {chart.chartMeta.title}
          </h3>

          {chart.chartMeta.cards.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100"
            >
              <div
                className={`bg-primary text-(--primary-text) rounded p-2 shrink-0 text-xs font-bold`}
              >
                {idx === 0 ? "📏" : idx === 1 ? "📐" : "💡"}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {item?.title}
                </p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                  {item?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
