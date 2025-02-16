"use client";

import LoadingView from "@/components/loading-view";
import Keyword from "@/lib/types/Keyword";
import { ResponsiveChord } from "@nivo/chord";
import { useAsync } from "react-use";
import generateChordData from "../api/generate-chord-data";

const Chart = ({ data }: { data: { matrix: number[][]; nodes: string[] } }) => {
  return (
    <div className="h-[32rem] w-full p-8">
      <ResponsiveChord
        data={data.matrix}
        keys={data.nodes}
        margin={{ top: 60, right: 60, bottom: 90, left: 60 }}
        padAngle={0.02}
        innerRadiusRatio={0.96}
        arcOpacity={0.9}
        arcBorderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
        ribbonOpacity={0.75}
        ribbonBorderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
        colors={{ scheme: "nivo" }}
        animate={true}
        labelRotation={-45}
      />
    </div>
  );
};

export default function ChordDiagram({ keywords }: { keywords: Keyword[] }) {
  const { value, loading } = useAsync(
    () => generateChordData(keywords),
    [keywords]
  );

  let component = null;

  if (loading) {
    component = <LoadingView text={"Loading visualization..."} />;
  }

  if (value) {
    component = <Chart data={value} />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {component}
    </div>
  );
}
