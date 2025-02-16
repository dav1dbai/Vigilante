"use client";

import type prepareData from "@/app/api/prepare-data";
import BubbleDiagram from "./bubble-diagram";
import ChordDiagram from "./chord-diagram";
import StackedBarDiagram from "./stacked-bar-diagram";

interface DashboardProps {
  data: Awaited<ReturnType<typeof prepareData>>;
}

export default function Dashboard({ data }: DashboardProps) {
  return (
    <div className="text-black">
      <ChordDiagram data={data.chordData} />
      <BubbleDiagram data={data.bubbleData} />
      <StackedBarDiagram data={data.stackedBarData} />
    </div>
  );
  // const [visualizationData, setVisualizationData] = useState<any>(null);
  // useEffect(() => {
  //   // Use the passed data instead of fetching it
  //   setVisualizationData({
  //     heatmapData: data,
  //     bubbleData: data,
  //     timelineData: data.map((item, index) => ({
  //       date: `2023-01-${String(index + 1).padStart(2, "0")}`,
  //       count: item.flaggedTweets,
  //     })),
  //   });
  // }, [data]);
  // if (!visualizationData) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-lg text-gray-400">Loading visualizations...</div>
  //     </div>
  //   );
  // }
  // return (
  //   <div className="space-y-8 p-6 bg-background text-foreground font-poppins">
  //     <div className="grid grid-cols-1 gap-8">
  //       <div className="flex justify-center bg-background text-foreground p-4 rounded-lg font-poppins">
  //         <KeywordHeatmap
  //           data={visualizationData.heatmapData}
  //           colorScheme="light"
  //         />
  //       </div>
  //       {/*<BubbleVisualization data={visualizationData.bubbleData} />*/}
  //     </div>
  //     {/*<MisinformationTimeline data={visualizationData.timelineData} />*/}
  //     <div className="mt-8 bg-background text-black font-poppins">
  //       <h2 className="text-xl font-semibold mb-4 text-white font-poppins">
  //         Detailed Analysis
  //       </h2>
  //       <div className="border border-gray-300 font-poppins">
  //         <DataTable data={visualizationData.bubbleData} />
  //       </div>
  //     </div>
  //   </div>
  // );
}
