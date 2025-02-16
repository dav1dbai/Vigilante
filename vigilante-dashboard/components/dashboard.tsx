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
      <div className="flex flex-row gap-4">
        <div className="w-1/2">
          <BubbleDiagram data={data.bubbleData} />
        </div>
        <div className="w-1/2">
          <ChordDiagram data={data.chordData} />
        </div>
      </div>

      <StackedBarDiagram data={data.stackedBarData} />
    </div>
  );
}
