"use client";

import LoadingView from "@/components/loading-view";
import Keyword from "@/lib/types/Keyword";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import { scaleLog } from "d3";
import { useAsync } from "react-use";
import generateBubbleData from "../api/generate-bubble-data";

const Chart = ({ data }: { data: [string, number][] }) => {
  // Extract all values to determine the min and max for the color scale
  const values = data.map(([, value]) => value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Create a linear color scale that maps the size to a color range.
  // Here, smaller bubbles will be a light color and larger bubbles a darker color.
  const colorScale = scaleLog<string>()
    .domain([minValue, maxValue])
    .range(["#F2DD7890", "#4ECDC4", "#45B7D180", "#96CEB480", "#FFEEAD80"]);

  return (
    <div className="h-[32rem] w-full">
      <ResponsiveCirclePacking
        data={{
          name: "root",
          children: data.map(([name, value]) => ({ name, value })),
        }}
        id="name"
        value="value"
        // Use a custom color function that determines the color based on the bubble's value.
        colors={(node) => colorScale(node.value)}
        padding={4}
        labelTextColor={{ from: "color", modifiers: [["darker", 5]] }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
        leavesOnly
        enableLabels
      />
    </div>
  );
};

export default function BubbleDiagram({ keywords }: { keywords: Keyword[] }) {
  const { value, loading } = useAsync(
    () => generateBubbleData(keywords),
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
